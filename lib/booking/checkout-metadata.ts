import type { BookingCartItem } from './calendar'
import { getStudioById } from './catalog'
import {
  SLOT_DURATION_MINUTES,
  addMinutes,
  expandLegacyHourlySlots,
  hasConsecutiveBookingSlots,
  isValidBookingDate,
  slotIsoSetForDate,
} from './time'
import { stripControlChars } from '@/lib/server/sanitize'

export function parseBookingCartItems(metadata: Record<string, string>) {
  const items: BookingCartItem[] = []
  const totalSessions = Number.parseInt(metadata.totalSessions || '0', 10)
  const limit = Number.isFinite(totalSessions) && totalSessions > 0 ? totalSessions : 20

  for (let i = 0; i < Math.min(limit, 20); i++) {
    const raw = metadata[`cart_${i}`]
    if (!raw) break
    try {
      const compact = JSON.parse(raw)
      // Current metadata declares 30-minute units. Metadata without a unit is
      // from the legacy hourly booking flow; expand each old hour into two
      // canonical half-hour slots so already-open checkouts remain valid.
      let slots: string[] = []
      const unitMinutes = compact.u === SLOT_DURATION_MINUTES ? SLOT_DURATION_MINUTES : 60
      if (typeof compact.t0 === 'string' && Array.isArray(compact.off)) {
        const baseMs = Date.parse(compact.t0)
        if (Number.isFinite(baseMs)) {
          slots = compact.off
            .filter((offset: unknown): offset is number => Number.isInteger(offset) && (offset as number) >= 0 && (offset as number) < 96)
            .map((offset: number) => addMinutes(new Date(baseMs), offset * unitMinutes).toISOString())
        }
      } else if (Array.isArray(compact.s ?? compact.slots)) {
        slots = compact.s ?? compact.slots
      }
      if (unitMinutes === 60) slots = expandLegacyHourlySlots(slots)

      const studioId = stripControlChars(compact.id ?? compact.studioId, 80)
      items.push({
        studioId,
        studioName: stripControlChars(compact.n ?? compact.studioName, 120) || getStudioById(studioId)?.name || '',
        date: stripControlChars(compact.d ?? compact.date, 20),
        slots: slots.map((slot: unknown) => stripControlChars(slot, 40)).filter(Boolean),
        hours: Number(compact.h ?? compact.hours ?? slots.length),
        price: Number(compact.p ?? compact.price ?? 0),
      })
    } catch (error) {
      console.error('Failed to parse cart metadata item:', error)
    }
  }

  if (!items.length && metadata.cartJson) {
    try {
      const legacy = JSON.parse(metadata.cartJson)
      if (Array.isArray(legacy)) {
        for (const item of legacy.slice(0, 20)) {
          items.push({
            studioId: stripControlChars(item.studioId, 80),
            studioName: stripControlChars(item.studioName, 120),
            date: stripControlChars(item.date, 20),
            slots: expandLegacyHourlySlots(Array.isArray(item.slots) ? item.slots.map((slot: unknown) => stripControlChars(slot, 40)).filter(Boolean) : []),
            hours: Number(item.hours || item.slots?.length || 1),
            price: Number(item.price || 0),
          })
        }
      }
    } catch (error) {
      console.error('Failed to parse legacy cart metadata:', error)
    }
  }

  return items.filter((item) => item.studioName && item.date && item.slots.length)
}

export function hasCompleteBookingCartMetadata(
  metadata: Record<string, string>,
  cartItems: BookingCartItem[],
) {
  const expectedSessions = Number.parseInt(metadata.totalSessions || '0', 10)
  const managedHold = metadata.bookingHoldVersion === '1'
  const declaredCountMatches = managedHold
    ? metadata.totalSessions === String(expectedSessions)
      && expectedSessions > 0
      && expectedSessions <= 20
      && cartItems.length === expectedSessions
    : !Number.isFinite(expectedSessions)
      || expectedSessions <= 0
      || cartItems.length === expectedSessions

  const managedCartMatches = !managedHold || cartItems.every((item, index) => {
    try {
      const compact = JSON.parse(metadata[`cart_${index}`] || '')
      if (
        !compact
        || typeof compact !== 'object'
        || compact.id !== item.studioId
        || compact.d !== item.date
        || compact.t0 !== item.slots[0]
        || compact.u !== SLOT_DURATION_MINUTES
        || !Array.isArray(compact.off)
        || compact.off.length !== item.slots.length
        || !compact.off.every((offset: unknown, offsetIndex: number) => (
          Number.isInteger(offset) && offset === offsetIndex
        ))
      ) {
        return false
      }
    } catch {
      return false
    }

    return true
  })

  return cartItems.length > 0
    && declaredCountMatches
    && managedCartMatches
    && cartItems.every((item) => {
      const studio = getStudioById(item.studioId)
      if (!studio || !isValidBookingDate(item.date) || !hasConsecutiveBookingSlots(item.slots)) {
        return false
      }

      const canonicalSlots = slotIsoSetForDate(item.date)
      return item.slots.every((slot) => canonicalSlots.has(slot))
    })
}

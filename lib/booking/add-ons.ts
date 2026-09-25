import { bookingHoursForSlotCount } from './time'
import { stripControlChars } from '../server/sanitize'

export const TELEPROMPTER = {
  id: 'teleprompter',
  name: 'Teleprompter',
  hourlyRateCents: 5000,
  description: 'Keep your script at eye level. Optional, for the full session.',
} as const

export const LIVE_SWITCHING = {
  id: 'live-switching',
  name: 'Live switching',
  hourlyRateCents: 7500,
  description: 'Switch between camera angles in real time during your session.',
} as const

export const REMOTE_PODCAST = {
  id: 'remote-podcast',
  name: 'Remote podcast',
  hourlyRateCents: 0,
  description: 'Bring remote guests into your podcast using Riverside, Zoom, or your preferred platform.',
} as const

export const BOOKING_ADD_ONS = [TELEPROMPTER, LIVE_SWITCHING, REMOTE_PODCAST] as const
export type BookingAddOnId = (typeof BOOKING_ADD_ONS)[number]['id']
export const REMOTE_PLATFORM_MAX_LENGTH = 60

export function normalizeRemotePodcastPlatform(value: unknown) {
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') throw new Error('Invalid remote podcast platform')
  return stripControlChars(value, REMOTE_PLATFORM_MAX_LENGTH)
}

export interface BookingAddOn {
  id: BookingAddOnId
  name: string
  hourlyRateCents: number
  amountCents: number
  platform?: string
}

export function priceBookingAddOns(selection: unknown, slotCount: number, remotePodcastPlatform?: unknown): BookingAddOn[] {
  if (selection === undefined || selection === null) return []
  if (!Array.isArray(selection) || selection.some((id) => !BOOKING_ADD_ONS.some((addOn) => addOn.id === id))) {
    throw new Error('Invalid add-on selection')
  }
  if (!selection.length) return []
  if (!Number.isInteger(slotCount) || slotCount < 1) throw new Error('Invalid add-on duration')
  return BOOKING_ADD_ONS.filter((addOn) => selection.includes(addOn.id)).map((addOn) => ({
    id: addOn.id,
    name: addOn.name,
    hourlyRateCents: addOn.hourlyRateCents,
    amountCents: Math.round(addOn.hourlyRateCents * bookingHoursForSlotCount(slotCount)),
    ...(addOn.id === REMOTE_PODCAST.id ? { platform: normalizeRemotePodcastPlatform(remotePodcastPlatform) } : {}),
  }))
}

export function bookingAddOnTotalCents(addOns: BookingAddOn[] = []) {
  return addOns.reduce((total, addOn) => total + addOn.amountCents, 0)
}

export function compactBookingAddOns(addOns: BookingAddOn[] = []) {
  return addOns.map(({ id, hourlyRateCents, amountCents, platform }) => ({
    id, r: hourlyRateCents, p: amountCents,
    ...(id === REMOTE_PODCAST.id && platform ? { f: platform } : {}),
  }))
}

export function hasMatchingBookingAddOnTotal(
  metadata: Record<string, string>,
  cart: Array<{ addOns?: BookingAddOn[] }>,
) {
  const total = cart.reduce((sum, item) => sum + bookingAddOnTotalCents(item.addOns), 0)
  // Older sessions did not write this field and did not sell add-ons.
  return metadata.addOnTotalCents === undefined
    ? total === 0
    : metadata.addOnTotalCents === String(total)
}

// Prices here are snapshots written by our checkout API, never browser prices.
// Missing metadata remains compatible with checkouts created before add-ons.
export function parseBookingAddOns(value: unknown, slotCount: number): BookingAddOn[] {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.length > BOOKING_ADD_ONS.length) throw new Error('Invalid add-on metadata')
  const seen = new Set<BookingAddOnId>()
  return value.map((entry) => {
    const definition = BOOKING_ADD_ONS.find((addOn) => addOn.id === entry?.id)
    if (
      !entry || typeof entry !== 'object'
      || !definition || seen.has(definition.id)
      || !Number.isSafeInteger(entry.r) || entry.r < 0
      || !Number.isSafeInteger(entry.p) || entry.p < 0
      || (definition.id === REMOTE_PODCAST.id ? entry.r !== 0 || entry.p !== 0 : entry.r === 0 || entry.p === 0)
      || entry.p !== Math.round(entry.r * bookingHoursForSlotCount(slotCount))
      || (entry.f !== undefined && (
        definition.id !== REMOTE_PODCAST.id || typeof entry.f !== 'string'
        || entry.f !== normalizeRemotePodcastPlatform(entry.f)
      ))
    ) {
      throw new Error('Invalid add-on metadata')
    }
    seen.add(definition.id)
    return {
      id: definition.id, name: definition.name, hourlyRateCents: entry.r, amountCents: entry.p,
      ...(definition.id === REMOTE_PODCAST.id ? { platform: entry.f || '' } : {}),
    }
  })
}

export function bookingAddOnLabel(addOn: BookingAddOn) {
  return addOn.id === REMOTE_PODCAST.id
    ? `${addOn.name} (${addOn.platform || 'platform to be confirmed'})`
    : addOn.name
}

export function bookingAddOnDescription(addOn: BookingAddOn) {
  if (addOn.id === REMOTE_PODCAST.id) return `${bookingAddOnLabel(addOn)}: No charge`
  return `${bookingAddOnLabel(addOn)}: $${(addOn.hourlyRateCents / 100).toFixed(2)}/hr, $${(addOn.amountCents / 100).toFixed(2)} for the session`
}

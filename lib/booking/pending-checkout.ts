import { priceBookingAddOns } from './add-ons'
import { MAX_BOOKING_SLOTS, MIN_BOOKING_SLOTS, isValidBookingDate } from './time'

export interface PendingCheckoutSlot { time: string; label: string; available: boolean }

export interface PendingCheckoutState {
  version: 1
  clientSecret: string
  publishableKey: string
  sessionId: string
  managementToken: string
  expiresAt: string
  selectedId: string
  durationSlots: number
  date: string
  startSlot: string
  slots: PendingCheckoutSlot[]
  recurring: string | null
  addOnIds?: string[]
  name: string
  email: string
  phone: string
  teamEmails: string[]
}

export function parsePendingCheckout(raw: string | null): PendingCheckoutState | null {
  try {
    const parsed = JSON.parse(raw || '') as Partial<PendingCheckoutState>
    if (!parsed || typeof parsed !== 'object'
      || parsed.version !== 1
      || typeof parsed.clientSecret !== 'string'
      || typeof parsed.publishableKey !== 'string'
      || typeof parsed.sessionId !== 'string'
      || typeof parsed.managementToken !== 'string'
      || typeof parsed.expiresAt !== 'string'
      || typeof parsed.selectedId !== 'string'
      || typeof parsed.durationSlots !== 'number'
      || !Number.isInteger(parsed.durationSlots)
      || parsed.durationSlots < MIN_BOOKING_SLOTS || parsed.durationSlots > MAX_BOOKING_SLOTS
      || typeof parsed.date !== 'string' || !isValidBookingDate(parsed.date)
      || typeof parsed.startSlot !== 'string' || !Number.isFinite(Date.parse(parsed.startSlot))
      || !Array.isArray(parsed.slots)
      || !parsed.slots.every((slot) => (
        slot && typeof slot.time === 'string' && typeof slot.label === 'string' && typeof slot.available === 'boolean'
      ))
      || (parsed.recurring !== null && typeof parsed.recurring !== 'string')
      || typeof parsed.name !== 'string'
      || typeof parsed.email !== 'string'
      || typeof parsed.phone !== 'string'
      || !Array.isArray(parsed.teamEmails)
      || !parsed.teamEmails.every((item) => typeof item === 'string')
    ) return null

    const addOns = priceBookingAddOns(parsed.addOnIds, parsed.durationSlots)
    // Restored drafts keep identifiers only. The server will reprice any revision.
    return { ...parsed, addOnIds: addOns.map((addOn) => addOn.id) } as PendingCheckoutState
  } catch {
    return null
  }
}

import { bookingHoursForSlotCount } from './time'

export const TELEPROMPTER = {
  id: 'teleprompter',
  name: 'Teleprompter',
  hourlyRateCents: 5000,
  description: 'Keep your script at eye level. Optional, for the full session.',
} as const

export interface BookingAddOn {
  id: typeof TELEPROMPTER.id
  name: string
  hourlyRateCents: number
  amountCents: number
}

export function priceBookingAddOns(selection: unknown, slotCount: number): BookingAddOn[] {
  if (selection === undefined || selection === null) return []
  if (!Array.isArray(selection) || selection.some((id) => id !== TELEPROMPTER.id)) {
    throw new Error('Invalid add-on selection')
  }
  if (!selection.length) return []
  if (!Number.isInteger(slotCount) || slotCount < 1) throw new Error('Invalid add-on duration')
  return [{
    id: TELEPROMPTER.id,
    name: TELEPROMPTER.name,
    hourlyRateCents: TELEPROMPTER.hourlyRateCents,
    amountCents: Math.round(TELEPROMPTER.hourlyRateCents * bookingHoursForSlotCount(slotCount)),
  }]
}

export function bookingAddOnTotalCents(addOns: BookingAddOn[] = []) {
  return addOns.reduce((total, addOn) => total + addOn.amountCents, 0)
}

export function compactBookingAddOns(addOns: BookingAddOn[] = []) {
  return addOns.map(({ id, hourlyRateCents, amountCents }) => ({ id, r: hourlyRateCents, p: amountCents }))
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
  if (!Array.isArray(value) || value.length > 1) throw new Error('Invalid add-on metadata')
  return value.map((entry) => {
    if (
      !entry || typeof entry !== 'object'
      || entry.id !== TELEPROMPTER.id
      || !Number.isSafeInteger(entry.r) || entry.r <= 0
      || !Number.isSafeInteger(entry.p) || entry.p <= 0
      || entry.p !== Math.round(entry.r * bookingHoursForSlotCount(slotCount))
    ) {
      throw new Error('Invalid add-on metadata')
    }
    return { id: TELEPROMPTER.id, name: TELEPROMPTER.name, hourlyRateCents: entry.r, amountCents: entry.p }
  })
}

export function bookingAddOnDescription(addOn: BookingAddOn) {
  return `${addOn.name}: $${(addOn.hourlyRateCents / 100).toFixed(2)}/hr, $${(addOn.amountCents / 100).toFixed(2)} for the session`
}

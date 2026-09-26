import { TELEPROMPTER, type BookingAddOn, type BookingAddOnId } from './add-ons'
import { MAX_BOOKING_SLOTS, MIN_BOOKING_SLOTS, getTimeSlotsForDay, isValidBookingDate } from './time'

// Each entry is one physical item shared by every studio. Other add-ons are unlimited.
export const SINGLE_UNIT_ADD_ONS = [TELEPROMPTER] as const
export type AddOnAvailability = Partial<Record<BookingAddOnId, boolean>>
export type AddOnAvailabilityState = 'checking' | 'available' | 'unavailable' | 'unverified'

export function limitedAddOnIds(addOns: Pick<BookingAddOn, 'id'>[] = []) {
  return SINGLE_UNIT_ADD_ONS.filter((definition) => addOns.some(({ id }) => id === definition.id)).map(({ id }) => id)
}

export function addOnResourceGroup(id: string) { return `add-on:${id}` }

export function addOnForResource(resource: string) {
  return SINGLE_UNIT_ADD_ONS.find(({ id }) => addOnResourceGroup(id) === resource)
}

export function addOnConflict(ids: string[]) {
  const names = SINGLE_UNIT_ADD_ONS.filter(({ id }) => ids.includes(id)).map(({ name }) => name)
  return {
    ok: false, status: 409,
    error: `${names.join(', ')} is reserved for part of this session. Remove it or choose another time.`,
    unavailableAddOnIds: ids,
  }
}

export function addOnRequestSlots(date: string, start: string, count: number) {
  if (!isValidBookingDate(date) || !Number.isInteger(count) || count < MIN_BOOKING_SLOTS || count > MAX_BOOKING_SLOTS) return null
  const day = getTimeSlotsForDay(date)
  const index = day.findIndex((slot) => slot.start.toISOString() === start)
  if (index < 0 || index + count > day.length) return null
  return day.slice(index, index + count).map(({ start }) => start.toISOString())
}

export function addOnAvailabilityState(id: string, current: boolean, verified: boolean, availability: AddOnAvailability): AddOnAvailabilityState {
  if (!SINGLE_UNIT_ADD_ONS.some((item) => item.id === id)) return 'available'
  if (!current) return 'checking'
  if (!verified) return 'unverified'
  return availability[id as BookingAddOnId] === true ? 'available' : 'unavailable'
}

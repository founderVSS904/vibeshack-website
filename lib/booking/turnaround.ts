import { SLOT_DURATION_MINUTES, addMinutes, groupConsecutiveSlotIsos } from './time'

export const STUDIO_TURNAROUND_MINUTES = 30

export interface BookingBusyRange {
  start: string
  end: string
  // Shared equipment can block the session without blocking room-only cleanup.
  blocksTurnaround: boolean
}

/** Resource occupancy only. Never use these extra slots for billing or receipts. */
export function slotsWithTurnaround(slots: string[]) {
  return groupConsecutiveSlotIsos(slots).flatMap((group) => {
    const end = addMinutes(new Date(group[group.length - 1]), SLOT_DURATION_MINUTES)
    const turnaroundSlots = Array.from({ length: STUDIO_TURNAROUND_MINUTES / SLOT_DURATION_MINUTES }, (_, index) => (
      addMinutes(end, index * SLOT_DURATION_MINUTES).toISOString()
    ))
    return [...group, ...turnaroundSlots]
  })
}

export function bookingSlotFitsTurnaround(start: Date, end: Date, busyTimes: BookingBusyRange[]) {
  const turnaroundEnd = addMinutes(end, STUDIO_TURNAROUND_MINUTES)
  return !busyTimes.some((busy) => (
    start < new Date(busy.end)
    && (busy.blocksTurnaround ? turnaroundEnd : end) > new Date(busy.start)
  ))
}

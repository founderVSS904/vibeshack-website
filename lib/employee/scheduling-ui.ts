import { BOOKING_TIME_ZONE, bookingDateInPacific, formatTimeForDisplay, getBookingWindowForDay, getTimeSlotsForDay, isValidBookingDate, nextDateString } from '../booking/time'

export type EmployeeSlot = { time: string; label: string; available: boolean }
export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'overnight'
export const EMPLOYEE_TIME_PERIODS: { id: TimePeriod; label: string; range: string }[] = [
  { id: 'overnight', label: 'Night', range: '12 AM–6 AM' },
  { id: 'morning', label: 'Morning', range: '6 AM–12 PM' },
  { id: 'afternoon', label: 'Afternoon', range: '12 PM–6 PM' },
  { id: 'evening', label: 'Evening', range: '6 PM–12 AM' },
]
const pacificHour = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/Los_Angeles' })

export function timePeriod(start: Date): TimePeriod {
  const hour = Number(pacificHour.format(start))
  if (hour < 6) return 'overnight'
  if (hour < 12) return 'morning'
  return hour < 18 ? 'afternoon' : 'evening'
}

// The full window must be verified, including next-day slots for late starts.
export function sessionFits(day: { start: Date }[], available: Set<string>, index: number, count: number) {
  return Number.isInteger(count) && count >= 2 && count <= 16 && index >= 0 && index + count <= day.length &&
    day.slice(index, index + count).every((slot) => available.has(slot.start.toISOString()))
}

export async function loadEmployeeBookingWindow(date: string, load: (day: string) => Promise<{ verified: boolean; slots: EmployeeSlot[] }>) {
  const days = await Promise.all([load(date), load(nextDateString(date))])
  if (days.some((day) => !day.verified)) return { verified: false, slots: [] as EmployeeSlot[] }
  const byTime = new Map(days.flatMap((day) => day.slots).map((slot) => [slot.time, slot]))
  const slots = getBookingWindowForDay(date).map(({ start }) => byTime.get(start.toISOString()))
  if (slots.some((slot) => !slot)) return { verified: false, slots: [] as EmployeeSlot[] }
  return { verified: true, slots: slots as EmployeeSlot[] }
}

export function employeeRequestSlots(date: string, start: string, count: number) {
  if (!isValidBookingDate(date) || !Number.isInteger(count) || count < 2 || count > 16) return null
  const day = getTimeSlotsForDay(date)
  const index = day.findIndex((slot) => slot.start.toISOString() === start)
  if (index < 0) return null
  return getBookingWindowForDay(date).slice(index, index + count).map((slot) => slot.start.toISOString())
}

export function employeeStartSlots(date: string, window: { start: Date }[]) {
  const slots = window.map((slot, index) => ({ ...slot, index, clock: formatTimeForDisplay(slot.start) }))
    .filter((slot) => bookingDateInPacific(slot.start) === date)
  const counts = new Map<string, number>()
  slots.forEach(({ clock }) => counts.set(clock, (counts.get(clock) || 0) + 1))
  return slots.map((slot) => ({
    ...slot,
    // Fall-back repeats 1 AM. Distinguish its two real start times in the UI.
    label: counts.get(slot.clock)! > 1
      ? slot.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: BOOKING_TIME_ZONE, timeZoneName: 'short' })
      : slot.clock,
  }))
}

export async function findNextEmployeeSession(
  dates: string[], count: number, load: (date: string) => Promise<EmployeeSlot[]>, signal: AbortSignal, now = new Date(),
) {
  for (const date of dates) {
    signal.throwIfAborted()
    const slots = await load(date)
    signal.throwIfAborted()
    const day = getBookingWindowForDay(date)
    const available = new Set(slots.filter((slot) => slot.available).map((slot) => slot.time))
    const index = day.findIndex((slot, position) => bookingDateInPacific(slot.start) === date && slot.start > now && sessionFits(day, available, position, count))
    if (index >= 0) return { date, start: day[index].start.toISOString(), slots }
  }
  return null
}

export function employeeResultStatus(phase: string, emailed: boolean, preview: boolean) {
  if (phase === 'cancelled') return { reservation: 'Cancelled', payment: 'Not payable', delivery: preview ? 'Nothing sent' : 'Payment link disabled' }
  return {
    reservation: preview ? 'Reserved in preview' : 'Studio reserved',
    payment: phase === 'paid' ? 'Paid' : preview ? 'Payment pending (sample)' : 'Payment pending',
    delivery: preview ? 'Nothing sent' : emailed ? 'Email request accepted' : 'Email not sent',
  }
}

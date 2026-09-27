import { getTimeSlotsForDay } from '../booking/time'

export type EmployeeSlot = { time: string; label: string; available: boolean }
export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'overnight'
const pacificHour = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/Los_Angeles' })

export function timePeriod(start: Date): TimePeriod {
  const hour = Number(pacificHour.format(start))
  if (hour < 8 || hour >= 22) return 'overnight'
  if (hour < 12) return 'morning'
  return hour < 17 ? 'afternoon' : 'evening'
}

// Use the same consecutive half-hour slots as booking validation. Never fit a
// session across a busy slot or silently extend it into a different date.
export function sessionFits(day: { start: Date }[], available: Set<string>, index: number, count: number) {
  return Number.isInteger(count) && count >= 2 && count <= 16 && index >= 0 && index + count <= day.length &&
    day.slice(index, index + count).every((slot) => available.has(slot.start.toISOString()))
}

export async function findNextEmployeeSession(
  dates: string[], count: number, load: (date: string) => Promise<EmployeeSlot[]>, signal: AbortSignal, now = new Date(),
) {
  for (const date of dates) {
    signal.throwIfAborted()
    const slots = await load(date)
    signal.throwIfAborted()
    const day = getTimeSlotsForDay(date)
    const available = new Set(slots.filter((slot) => slot.available).map((slot) => slot.time))
    const index = day.findIndex((slot, position) => slot.start > now && sessionFits(day, available, position, count))
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

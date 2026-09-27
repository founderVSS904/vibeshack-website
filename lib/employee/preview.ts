import { getBookingWindowForDay, formatTimeForDisplay } from '../booking/time'
import { bookingSlotFitsTurnaround } from '../booking/turnaround'
export type PreviewReservation = { ref: string; studioId: string; start: string; end: string; teleprompter: boolean }
// Synthetic browser-memory reservations only. No API, persistent customer data,
// Google Calendar, Stripe, or email is used by the local review screen.
export function previewSlots(date: string, studioId: string, reservations: PreviewReservation[], now = new Date()) {
  const busy = reservations.filter((item) => item.studioId === studioId).map((item) => ({ start: item.start, end: new Date(Date.parse(item.end) + 30 * 60_000).toISOString(), blocksTurnaround: true }))
  return getBookingWindowForDay(date).map(({ start, end }) => ({ time: start.toISOString(), label: formatTimeForDisplay(start), available: start > now && bookingSlotFitsTurnaround(start, end, busy) }))
}
export function previewTeleprompterAvailable(start: string, end: string, reservations: PreviewReservation[]) {
  return !reservations.some((item) => item.teleprompter && Date.parse(item.start) < Date.parse(end) && Date.parse(item.end) > Date.parse(start))
}

import { getBookingWindowForDay, formatTimeForDisplay } from '../booking/time'
import { bookingSlotFitsTurnaround } from '../booking/turnaround'
import type { EmployeeHistoryPage } from './history'
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
// Fictional Bookings rows, one per payment state, seen as the preview superadmin.
// Actions on them change only this browser page.
export function previewBookingHistory(): EmployeeHistoryPage {
  const row = (digit: string, createdAt: number, fields: Omit<EmployeeHistoryPage['items'][number], 'ref' | 'createdAt' | 'updatedAt'>) => ({ ref: `emp-${digit.repeat(40)}`, createdAt, updatedAt: new Date(createdAt).toISOString(), ...fields })
  return {
    scope: 'team', nextCursor: null, updatedSince: '2026-07-01T00:00:00Z',
    items: [
      row('1', 1790460000000, { clientName: 'Avery Morgan', clientEmail: 'avery@example.invalid', studioName: 'The Executive', start: '2026-09-29T21:00:00Z', end: '2026-09-29T23:00:00Z', total: 60000, phase: 'ready', bookedBy: 'Jordan Lee (jordan@example.invalid)', canCancel: true, payment: 'stripe', paymentLabel: 'Payment link sent', canMarkPaid: true }),
      row('2', 1790430000000, { clientName: 'Morgan Blake', clientEmail: 'morgan@example.invalid', studioName: 'The Wing', start: '2026-10-01T17:00:00Z', end: '2026-10-01T20:00:00Z', total: 90000, phase: 'ready', bookedBy: 'Sam Rivera (sam@example.invalid)', canCancel: true, payment: 'external', paymentLabel: 'Awaiting payment', canMarkPaid: true }),
      row('3', 1790400000000, { clientName: 'Riley Park', clientEmail: 'riley@example.invalid', studioName: 'The Executive', start: '2026-10-02T18:00:00Z', end: '2026-10-02T20:00:00Z', total: 60000, phase: 'paid', bookedBy: 'Jordan Lee (jordan@example.invalid)', canCancel: true, payment: 'prepaid', paymentLabel: 'Paid by Zelle', canMarkPaid: false }),
      row('4', 1790390000000, { clientName: 'Quinn Harper', clientEmail: 'quinn@example.invalid', studioName: 'The Wing', start: '2026-10-03T19:00:00Z', end: '2026-10-03T21:00:00Z', total: 60000, phase: 'paid', bookedBy: 'Studio owner (owner@example.invalid)', canCancel: true, payment: 'none', paymentLabel: 'No charge', canMarkPaid: false }),
      row('5', 1790370000000, { clientName: 'Rowan Ellis', clientEmail: 'rowan@example.invalid', studioName: 'The Wing', start: '2026-09-30T18:00:00Z', end: '2026-09-30T20:00:00Z', total: 60000, phase: 'paid', bookedBy: 'Sam Rivera (sam@example.invalid)', canCancel: false, payment: 'stripe', paymentLabel: 'Paid online', canMarkPaid: false }),
      row('6', 1790280000000, { clientName: 'Casey Chen', clientEmail: 'casey@example.invalid', studioName: 'The Executive', start: '2026-09-28T19:00:00Z', end: '2026-09-28T21:00:00Z', total: 65000, phase: 'cancelled', bookedBy: 'Jordan Lee (jordan@example.invalid)', canCancel: false, payment: 'stripe', paymentLabel: 'Cancelled', canMarkPaid: false }),
    ],
  }
}

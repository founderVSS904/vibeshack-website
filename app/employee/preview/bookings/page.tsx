import { notFound } from 'next/navigation'
import { localEmployeePreview } from '@/lib/employee/auth'
import BookingsPage from '../../bookings/BookingsPage'
import type { EmployeeHistoryPage } from '@/lib/employee/history'

export const dynamic = 'force-dynamic'
export default function PreviewBookings() {
  if (!localEmployeePreview()) notFound()
  const initial: EmployeeHistoryPage = {
    scope: 'team', nextCursor: null, updatedSince: '2026-07-01T00:00:00Z',
    items: [
      { ref: `emp-${'1'.repeat(40)}`, createdAt: 1790460000000, updatedAt: '2026-09-26T20:00:00Z', clientName: 'Avery Morgan', clientEmail: 'avery@example.invalid', studioName: 'The Executive', start: '2026-09-29T21:00:00Z', end: '2026-09-29T23:00:00Z', total: 60000, phase: 'ready', bookedBy: 'Jordan Lee (jordan@example.invalid)', canCancel: true, payment: 'stripe', paymentLabel: 'Payment link sent', canMarkPaid: true },
      { ref: `emp-${'2'.repeat(40)}`, createdAt: 1790370000000, updatedAt: '2026-09-25T20:00:00Z', clientName: 'Rowan Ellis', clientEmail: 'rowan@example.invalid', studioName: 'The Wing', start: '2026-09-30T18:00:00Z', end: '2026-09-30T20:00:00Z', total: 60000, phase: 'paid', bookedBy: 'Sam Rivera (sam@example.invalid)', canCancel: false, payment: 'stripe', paymentLabel: 'Paid online', canMarkPaid: false },
      { ref: `emp-${'3'.repeat(40)}`, createdAt: 1790280000000, updatedAt: '2026-09-24T20:00:00Z', clientName: 'Casey Chen', clientEmail: 'casey@example.invalid', studioName: 'The Executive', start: '2026-09-28T19:00:00Z', end: '2026-09-28T21:00:00Z', total: 65000, phase: 'cancelled', bookedBy: 'Jordan Lee (jordan@example.invalid)', canCancel: false, payment: 'stripe', paymentLabel: 'Cancelled', canMarkPaid: false },
    ],
  }
  return <BookingsPage email="Local preview" role="superadmin" enabled preview initial={initial} />
}

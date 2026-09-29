import { notFound } from 'next/navigation'
import { localEmployeePreview } from '@/lib/employee/auth'
import { previewBookingHistory } from '@/lib/employee/preview'
import BookingsPage from '../../bookings/BookingsPage'

export const dynamic = 'force-dynamic'
export default function PreviewBookings() {
  if (!localEmployeePreview()) notFound()
  return <BookingsPage email="Local preview" role="superadmin" enabled preview initial={previewBookingHistory()} />
}

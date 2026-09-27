import { redirect } from 'next/navigation'
import { currentEmployee } from '@/lib/employee/access'
import BookingsPage from './BookingsPage'

export const dynamic = 'force-dynamic'
export default async function EmployeeBookings() {
  const employee = await currentEmployee({ allowUnverifiedMfa: true })
  if (!employee) redirect('/employee/')
  if (employee.role === 'superadmin' && !employee.mfaVerified) redirect('/employee/security/')
  return <BookingsPage email={employee.email} role={employee.role} enabled={process.env.EMPLOYEE_BOOKING_ENABLED === '1'} />
}

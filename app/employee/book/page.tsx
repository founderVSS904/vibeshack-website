import { redirect } from 'next/navigation'
import { currentEmployee, employeeDestination } from '@/lib/employee/access'
import EmployeeBookingPage from '../EmployeeBookingPage'
export const dynamic = 'force-dynamic'
export default async function EmployeeBook() {
  const session = await currentEmployee({ allowUnverifiedMfa: true })
  if (!session) redirect('/employee/')
  if (employeeDestination(session) !== '/employee/book/') redirect('/employee/security/')
  return <EmployeeBookingPage email={session.email} role={session.role} enabled={process.env.EMPLOYEE_BOOKING_ENABLED === '1'} />
}

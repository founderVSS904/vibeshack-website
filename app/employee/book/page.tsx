import { redirect } from 'next/navigation'
import { currentEmployee } from '@/lib/employee/access'
import EmployeeBookingPage from '../EmployeeBookingPage'
export const dynamic = 'force-dynamic'
export default async function EmployeeBook() {
  const session = await currentEmployee()
  if (!session) redirect('/employee/')
  return <EmployeeBookingPage email={session.email} role={session.role} enabled={process.env.EMPLOYEE_BOOKING_ENABLED === '1'} />
}

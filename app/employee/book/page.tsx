import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { EMPLOYEE_COOKIE, readEmployeeSession } from '@/lib/employee/auth'
import EmployeeBookingPage from '../EmployeeBookingPage'
export const dynamic = 'force-dynamic'
export default async function EmployeeBook() {
  const session = readEmployeeSession((await cookies()).get(EMPLOYEE_COOKIE)?.value)
  if (!session) redirect('/employee/')
  return <EmployeeBookingPage email={session.email} enabled={process.env.EMPLOYEE_BOOKING_ENABLED === '1'} />
}

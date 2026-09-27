import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { EMPLOYEE_COOKIE, employeeAuthConfigured, localEmployeePreview, readEmployeeSession } from '@/lib/employee/auth'
import EmployeeSignIn from './EmployeeSignIn'
export const dynamic = 'force-dynamic'
export default async function EmployeeLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (readEmployeeSession((await cookies()).get(EMPLOYEE_COOKIE)?.value)) redirect('/employee/book/')
  const configured = employeeAuthConfigured()
  const params = await searchParams
  return <EmployeeSignIn preview={localEmployeePreview()} configured={configured} failed={Boolean(params.error)} />
}

import { redirect } from 'next/navigation'
import { localEmployeePreview } from '@/lib/employee/auth'
import { currentEmployee, employeeDestination } from '@/lib/employee/access'
import { employeeSupabaseConfigured } from '@/lib/employee/supabase'
import EmployeeSignIn from './EmployeeSignIn'
export const dynamic = 'force-dynamic'
export default async function EmployeeLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const employee = await currentEmployee({ allowUnverifiedMfa: true })
  if (employee) redirect(employeeDestination(employee))
  const configured = employeeSupabaseConfigured()
  const params = await searchParams
  return <EmployeeSignIn preview={localEmployeePreview()} configured={configured} googleConfigured={process.env.EMPLOYEE_GOOGLE_ENABLED === '1'} failed={Boolean(params.error)} />
}

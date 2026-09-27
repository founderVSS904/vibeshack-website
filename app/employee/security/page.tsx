import { redirect } from 'next/navigation'
import { currentEmployee } from '@/lib/employee/access'
import SecurityPage from '../SecurityPage'
export const dynamic = 'force-dynamic'
export default async function EmployeeSecurity() {
  const employee = await currentEmployee({ allowUnverifiedMfa: true })
  if (!employee) redirect('/employee/')
  if (employee.role !== 'superadmin') redirect('/employee/book/')
  return <SecurityPage email={employee.email} mfaVerified={employee.mfaVerified} />
}

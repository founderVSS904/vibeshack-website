import { redirect } from 'next/navigation'
import { currentEmployee } from '@/lib/employee/access'
import TeamPage from '../TeamPage'
export const dynamic = 'force-dynamic'
export default async function EmployeeTeam() {
  const employee = await currentEmployee()
  if (!employee) redirect('/employee/')
  if (employee.role !== 'superadmin') redirect('/employee/book/')
  return <TeamPage email={employee.email} />
}

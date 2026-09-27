import { notFound } from 'next/navigation'
import { localEmployeePreview } from '@/lib/employee/auth'
import TeamPage from '../../TeamPage'
export const dynamic = 'force-dynamic'
export default function EmployeeTeamPreview() {
  if (!localEmployeePreview()) notFound()
  return <TeamPage email="" preview />
}

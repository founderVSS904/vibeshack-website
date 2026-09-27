import { localEmployeePreview } from '@/lib/employee/auth'
import EmployeePasswordReset from '../EmployeePasswordReset'

export const dynamic = 'force-dynamic'
export default async function EmployeePassword({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return <EmployeePasswordReset preview={localEmployeePreview()} failed={params.error === 'reset'} />
}

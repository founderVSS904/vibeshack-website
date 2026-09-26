import { notFound } from 'next/navigation'
import { localEmployeePreview } from '@/lib/employee/auth'
import EmployeeBookingPage from '../EmployeeBookingPage'
export const dynamic = 'force-dynamic'
export default function EmployeePreview() {
  if (!localEmployeePreview()) notFound()
  return <EmployeeBookingPage email="Local preview" preview enabled />
}

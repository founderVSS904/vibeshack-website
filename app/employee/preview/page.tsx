import { notFound } from 'next/navigation'
import { localEmployeePreview } from '@/lib/employee/auth'
import EmployeeBookingPage from '../EmployeeBookingPage'
export const dynamic = 'force-dynamic'
export default function EmployeePreview() {
  if (!localEmployeePreview()) notFound()
  // The preview workspace already shows superadmin pages, so every payment choice is visible.
  return <EmployeeBookingPage email="Local preview" role="superadmin" preview enabled />
}

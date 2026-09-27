import { NextRequest } from 'next/server'
import { getAvailabilityForDate } from '@/lib/booking/calendar'
import { getStudioById } from '@/lib/booking/catalog'
import { bookingDateRange } from '@/lib/booking/time'
import { employeeGuard, employeeJson } from '@/lib/employee/http'
import { loadEmployeeBookingWindow } from '@/lib/employee/scheduling-ui'
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  const guard = employeeGuard(req)
  if (guard.response) return guard.response
  const date = req.nextUrl.searchParams.get('date') || ''
  const studio = req.nextUrl.searchParams.get('studio') || ''
  if (!getStudioById(studio) || !bookingDateRange(60).includes(date)) return employeeJson({ error: 'Invalid studio or date' }, 400)
  const result = await loadEmployeeBookingWindow(date, (day) => getAvailabilityForDate(day, studio, undefined, false, undefined, true))
  return employeeJson(result, result.verified ? 200 : 503)
}

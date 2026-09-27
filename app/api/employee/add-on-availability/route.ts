import { NextRequest } from 'next/server'
import { getAddOnAvailabilityForSlots } from '@/lib/booking/calendar'
import { bookingDateRange } from '@/lib/booking/time'
import { employeeGuard, employeeJson } from '@/lib/employee/http'
import { employeeRequestSlots } from '@/lib/employee/scheduling-ui'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const guard = employeeGuard(req)
  if (guard.response) return guard.response
  const params = req.nextUrl.searchParams
  const date = params.get('date') || ''
  if (!bookingDateRange(60).includes(date)) return employeeJson({ verified: false, error: 'Invalid date' }, 400)
  const slots = employeeRequestSlots(date, params.get('start') || '', Number(params.get('slots')))
  if (!slots) return employeeJson({ verified: false, error: 'Valid session required' }, 400)
  const result = await getAddOnAvailabilityForSlots(date, slots, undefined, undefined, true)
  return employeeJson(result, result.verified ? 200 : 503)
}

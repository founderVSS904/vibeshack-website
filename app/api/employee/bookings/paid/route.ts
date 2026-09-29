import { NextRequest } from 'next/server'
import { readJsonBody, jsonBodyErrorResponse } from '@/lib/server/request-guards'
import { employeeBookingResult, EmployeeBookingError, markEmployeeBookingPaid } from '@/lib/employee/booking'
import { employeeServices } from '@/lib/employee/providers'
import { employeeGuard, employeeJson } from '@/lib/employee/http'
export const dynamic = 'force-dynamic'
export const maxDuration = 60
export async function POST(req: NextRequest) {
  const guard = await employeeGuard(req, true)
  if (guard.response) return guard.response
  if (process.env.EMPLOYEE_BOOKING_ENABLED !== '1') return employeeJson({ error: 'Employee booking activation is pending' }, 503)
  try {
    const body = await readJsonBody(req, 2000)
    const result = await markEmployeeBookingPaid(typeof body?.ref === 'string' ? body.ref : '', body, employeeServices, guard.employee)
    return employeeJson({ ...employeeBookingResult(result.record), outcome: result.outcome })
  } catch (error) {
    return jsonBodyErrorResponse(error) || employeeJson({ error: error instanceof EmployeeBookingError ? error.message : 'The payment could not be recorded. Please retry; the booking has not been reported as paid.' }, error instanceof EmployeeBookingError ? error.status : 503)
  }
}

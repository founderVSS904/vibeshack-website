import { NextRequest } from 'next/server'
import { readJsonBody, jsonBodyErrorResponse } from '@/lib/server/request-guards'
import { cancelEmployeeBooking, employeeBookingResult, EmployeeBookingError } from '@/lib/employee/booking'
import { employeeServices } from '@/lib/employee/providers'
import { employeeGuard, employeeJson } from '@/lib/employee/http'
export async function POST(req: NextRequest) {
  const guard = await employeeGuard(req, true)
  if (guard.response) return guard.response
  if (process.env.EMPLOYEE_BOOKING_ENABLED !== '1') return employeeJson({ error: 'Employee booking activation is pending' }, 503)
  try {
    const body = await readJsonBody(req, 1000)
    return employeeJson(employeeBookingResult(await cancelEmployeeBooking(typeof body.ref === 'string' ? body.ref : '', employeeServices, guard.employee)))
  } catch (error) {
    return jsonBodyErrorResponse(error) || employeeJson({ error: error instanceof EmployeeBookingError ? error.message : 'Cancellation could not finish. Please retry; the booking has not been reported as cancelled.' }, error instanceof EmployeeBookingError ? error.status : 503)
  }
}

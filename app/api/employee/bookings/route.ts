import { NextRequest } from 'next/server'
import { readJsonBody, jsonBodyErrorResponse } from '@/lib/server/request-guards'
import { createEmployeeBooking, employeeBookingInput, employeeBookingResult, EmployeeBookingError } from '@/lib/employee/booking'
import { employeeServices } from '@/lib/employee/providers'
import { employeeGuard, employeeJson } from '@/lib/employee/http'
import { employeeBookingHistory } from '@/lib/employee/history'
export const dynamic = 'force-dynamic'
export const maxDuration = 60
export async function POST(req: NextRequest) {
  const guard = await employeeGuard(req, true)
  if (guard.response) return guard.response
  if (process.env.EMPLOYEE_BOOKING_ENABLED !== '1') return employeeJson({ error: 'Employee booking activation is pending. No reservation has been made.' }, 503)
  try {
    const input = employeeBookingInput(await readJsonBody(req, 12_000), guard.employee)
    return employeeJson(employeeBookingResult(await createEmployeeBooking(input, employeeServices)))
  } catch (error) {
    return jsonBodyErrorResponse(error) || employeeJson({ error: error instanceof EmployeeBookingError ? error.message : 'The booking could not finish. Keep this page open and retry the same booking. A room hold may already exist; do not start a duplicate booking.' }, error instanceof EmployeeBookingError ? error.status : 503)
  }
}
export async function GET(req: NextRequest) {
  const guard = await employeeGuard(req)
  if (guard.response) return guard.response
  try {
    return employeeJson(await employeeBookingHistory(guard.employee, req.nextUrl.searchParams.get('cursor') ?? undefined))
  } catch (error) {
    return employeeJson({ error: error instanceof EmployeeBookingError ? error.message : 'Booking history could not load. Please try again.' }, error instanceof EmployeeBookingError ? error.status : 503)
  }
}

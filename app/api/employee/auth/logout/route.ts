import { NextRequest, NextResponse } from 'next/server'
import { EMPLOYEE_COOKIE, employeeCookieOptions, employeeOrigin } from '@/lib/employee/auth'
import { employeeGuard } from '@/lib/employee/http'
export async function POST(req: NextRequest) {
  const guard = employeeGuard(req, true)
  if (guard.response) return guard.response
  const response = NextResponse.redirect(`${employeeOrigin()}/employee/`, 303)
  response.cookies.set(EMPLOYEE_COOKIE, '', employeeCookieOptions(0))
  return response
}

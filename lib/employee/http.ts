import { NextRequest, NextResponse } from 'next/server'
import { EMPLOYEE_COOKIE, employeeOrigin, readEmployeeSession } from './auth'
import { rateLimit } from '../server/request-guards'

export function employeeGuard(req: NextRequest, write = false) {
  const employee = readEmployeeSession(req.cookies.get(EMPLOYEE_COOKIE)?.value)
  if (!employee) return { response: NextResponse.json({ error: 'Employee sign-in required' }, { status: 401 }) }
  if (write && req.headers.get('origin') !== employeeOrigin()) return { response: NextResponse.json({ error: 'Invalid request origin' }, { status: 403 }) }
  const limited = rateLimit(req, { key: `employee:${employee.email}:${write ? 'write' : 'read'}`, max: write ? 20 : 120, windowMs: 60_000 })
  if (limited) return { response: limited }
  return { employee }
}
export function employeeJson(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' } })
}

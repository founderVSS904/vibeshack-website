import { NextRequest, NextResponse } from 'next/server'
import { employeeOrigin } from './auth'
import { currentEmployee } from './access'
import { rateLimit } from '../server/request-guards'

export async function employeeGuard(req: NextRequest, write = false, options: { superadmin?: boolean; allowUnverifiedMfa?: boolean } = {}) {
  if (write && req.headers.get('origin') !== employeeOrigin()) return { response: employeeJson({ error: 'Invalid request origin' }, 403) }
  const employee = await currentEmployee({ allowUnverifiedMfa: true })
  if (!employee) return { response: employeeJson({ error: 'Employee sign-in required' }, 401) }
  if (options.superadmin && employee.role !== 'superadmin') return { response: employeeJson({ error: 'Superadmin access required' }, 403) }
  if (employee.role === 'superadmin' && !employee.mfaVerified && !options.allowUnverifiedMfa) return { response: employeeJson({ error: 'Complete two-step verification to continue.', code: 'MFA_REQUIRED', redirect: '/employee/security/' }, 403) }
  const limited = rateLimit(req, { key: `employee:${employee.email}:${write ? 'write' : 'read'}`, max: write ? 20 : 120, windowMs: 60_000 })
  if (limited) return { response: limited }
  return { employee }
}
export function employeeJson(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' } })
}

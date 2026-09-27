import { NextRequest } from 'next/server'
import { employeeSupabase } from '@/lib/employee/supabase'
import { currentEmployee } from '@/lib/employee/access'
import { employeeGuard, employeeJson } from '@/lib/employee/http'
import { jsonBodyErrorResponse, readJsonBody, rateLimit } from '@/lib/server/request-guards'
export async function POST(req: NextRequest) {
  const guard = await employeeGuard(req, true, { allowUnverifiedMfa: true })
  if (guard.response) return guard.response
  const limited = rateLimit(req, { key: `employee-mfa:${guard.employee.id}`, max: 6, windowMs: 300_000 })
  if (limited) return limited
  try {
    const body = await readJsonBody(req, 1000)
    if (typeof body?.factorId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.factorId) || typeof body?.challengeId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.challengeId) || typeof body?.code !== 'string' || !/^\d{6}$/.test(body.code)) return employeeJson({ error: 'Enter the six-digit code from your authenticator.' }, 400)
    const supabase = await employeeSupabase()
    const factors = await supabase.auth.mfa.listFactors()
    if (factors.error || !factors.data.all.some((factor) => factor.id === body.factorId && factor.factor_type === 'totp')) return employeeJson({ error: 'Authenticator not available.' }, 400)
    const { error } = await supabase.auth.mfa.verify({ factorId: body.factorId, challengeId: body.challengeId, code: body.code })
    if (error) return employeeJson({ error: 'That code could not be verified. Try a new code.' }, 400)
    const employee = await currentEmployee()
    if (!employee?.mfaVerified) return employeeJson({ error: 'Verification could not finish. Please sign in again.' }, 403)
    return employeeJson({ ok: true, redirect: '/employee/book/' })
  } catch (error) { return jsonBodyErrorResponse(error) || employeeJson({ error: 'Verification is temporarily unavailable. Please retry.' }, 503) }
}

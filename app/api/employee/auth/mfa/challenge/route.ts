import { NextRequest } from 'next/server'
import { employeeSupabase } from '@/lib/employee/supabase'
import { employeeGuard, employeeJson } from '@/lib/employee/http'
import { jsonBodyErrorResponse, readJsonBody } from '@/lib/server/request-guards'
export async function POST(req: NextRequest) {
  const guard = await employeeGuard(req, true, { allowUnverifiedMfa: true })
  if (guard.response) return guard.response
  try {
    const body = await readJsonBody(req, 1000)
    if (typeof body?.factorId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.factorId)) return employeeJson({ error: 'Choose an authenticator.' }, 400)
    const supabase = await employeeSupabase()
    const factors = await supabase.auth.mfa.listFactors()
    if (factors.error || !factors.data.all.some((factor) => factor.id === body.factorId && factor.factor_type === 'totp')) return employeeJson({ error: 'Authenticator not available.' }, 400)
    const { data, error } = await supabase.auth.mfa.challenge({ factorId: body.factorId })
    if (error) throw new Error('Challenge failed')
    return employeeJson({ challengeId: data.id })
  } catch (error) { return jsonBodyErrorResponse(error) || employeeJson({ error: 'Verification could not start. Please retry.' }, 503) }
}

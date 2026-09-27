import { NextRequest } from 'next/server'
import { employeeSupabase } from '@/lib/employee/supabase'
import { employeeGuard, employeeJson } from '@/lib/employee/http'
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  const guard = await employeeGuard(req, false, { allowUnverifiedMfa: true })
  if (guard.response) return guard.response
  try {
    const { data, error } = await (await employeeSupabase()).auth.mfa.listFactors()
    if (error) throw new Error('Factors unavailable')
    return employeeJson({ factors: data.totp.map((factor) => ({ id: factor.id, friendlyName: factor.friendly_name || 'Authenticator app' })), mfaVerified: guard.employee.mfaVerified })
  } catch { return employeeJson({ error: 'Two-step verification could not load. Please retry.' }, 503) }
}

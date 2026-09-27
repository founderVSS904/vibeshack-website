import { NextRequest } from 'next/server'
import { employeeSupabase } from '@/lib/employee/supabase'
import { employeeGuard, employeeJson } from '@/lib/employee/http'
export async function POST(req: NextRequest) {
  const guard = await employeeGuard(req, true, { allowUnverifiedMfa: true })
  if (guard.response) return guard.response
  try {
    const supabase = await employeeSupabase()
    const factors = await supabase.auth.mfa.listFactors()
    if (factors.error) throw new Error('Factors unavailable')
    if (factors.data.totp.length && !guard.employee.mfaVerified) return employeeJson({ error: 'Verify your existing authenticator before adding another.' }, 403)
    for (const factor of factors.data.all.filter((item) => item.factor_type === 'totp' && item.status === 'unverified')) {
      const removed = await supabase.auth.mfa.unenroll({ factorId: factor.id })
      if (removed.error) throw new Error('Authenticator setup could not restart')
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'VibeShack Studios' })
    if (error) throw new Error('Enrollment failed')
    const qrCode = data.totp.qr_code.startsWith('data:image/') ? data.totp.qr_code : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.totp.qr_code)}`
    return employeeJson({ factorId: data.id, qrCode, secret: data.totp.secret })
  } catch { return employeeJson({ error: 'Authenticator setup could not finish. Please retry.' }, 503) }
}

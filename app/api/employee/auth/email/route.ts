import { NextRequest } from 'next/server'
import { employeeOrigin } from '@/lib/employee/auth'
import { employeeAdmin } from '@/lib/employee/supabase'
import { employeeJson } from '@/lib/employee/http'
import { sendEmployeeAccessLink } from '@/lib/employee/invitations'
import { isEmail, stripControlChars } from '@/lib/server/sanitize'
import { jsonBodyErrorResponse, rateLimit, readJsonBody } from '@/lib/server/request-guards'
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== employeeOrigin()) return employeeJson({ error: 'Invalid request origin' }, 403)
  const limited = rateLimit(req, { key: 'employee-email-login', max: 5, windowMs: 600_000 })
  if (limited) return limited
  let email = ''
  try {
    const body = await readJsonBody(req, 1000)
    email = stripControlChars(body?.email, 254).toLowerCase()
  } catch (error) { return jsonBodyErrorResponse(error) || employeeJson({ error: 'Invalid request' }, 400) }
  if (isEmail(email)) {
    try {
      const admin = employeeAdmin()
      const { data: member, error } = await admin.from('employee_members').select('email,name,status').eq('email', email).maybeSingle()
      if (!error && member && ['invited', 'active'].includes(member.status)) {
        const claim = await admin.rpc('employee_claim_signin_email', { p_email: email })
        if (!claim.error && claim.data === true) await sendEmployeeAccessLink(email, member.name || '', 'magiclink')
      }
    } catch { /* Unknown, disabled and temporarily unavailable accounts receive the same response. */ }
  }
  return employeeJson({ ok: true, message: 'If this email has team access, a sign-in link is on its way. Check your inbox.' })
}

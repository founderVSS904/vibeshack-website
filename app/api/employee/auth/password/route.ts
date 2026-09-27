import { NextRequest } from 'next/server'
import { employeeOrigin } from '@/lib/employee/auth'
import { employeeSupabase } from '@/lib/employee/supabase'
import { acceptEmployeeIdentity, employeeDestination } from '@/lib/employee/access'
import { employeeJson } from '@/lib/employee/http'
import { isEmail, stripControlChars } from '@/lib/server/sanitize'
import { jsonBodyErrorResponse, readJsonBody } from '@/lib/server/request-guards'
import { distributedRateLimit } from '@/lib/server/distributed-rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== employeeOrigin()) return employeeJson({ error: 'Invalid request origin' }, 403)
  const limited = await distributedRateLimit(req, { key: 'employee-password-login', max: 10, windowMs: 600_000 })
  if (limited) return limited
  let email = ''
  let password = ''
  try {
    const body = await readJsonBody(req, 2048)
    email = stripControlChars(body?.email, 254).trim().toLowerCase()
    password = typeof body?.password === 'string' ? body.password : ''
    if (!isEmail(email) || !password || password.length > 128) return employeeJson({ error: 'Enter your email and password.' }, 400)
  } catch (error) { return jsonBodyErrorResponse(error) || employeeJson({ error: 'Invalid request' }, 400) }
  const accountLimited = await distributedRateLimit(req, { key: 'employee-password-account', max: 20, windowMs: 60_000, subject: email })
  if (accountLimited) return accountLimited
  try {
    const supabase = await employeeSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return employeeJson({ error: 'We couldn’t sign you in. Check your email and password.' }, 401)
    try {
      const employee = await acceptEmployeeIdentity()
      return employeeJson({ ok: true, redirect: employeeDestination(employee) })
    } catch {
      await supabase.auth.signOut({ scope: 'local' })
    }
  } catch { /* Keep credentials, provider errors and membership private. */ }
  return employeeJson({ error: 'We couldn’t sign you in. Check your email and password.' }, 401)
}

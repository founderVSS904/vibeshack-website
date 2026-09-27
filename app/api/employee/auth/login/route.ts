import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { OAUTH_COOKIE, employeeCookieOptions, employeeOAuthClient, newOAuthAttempt, signEmployeeToken } from '@/lib/employee/auth'
import { rateLimit } from '@/lib/server/request-guards'
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { key: 'employee-login', max: 15, windowMs: 600_000 })
  if (limited) return limited
  try {
    const attempt = newOAuthAttempt()
    const url = new URL(employeeOAuthClient().generateAuthUrl({ scope: ['openid', 'email', 'profile'], state: attempt.state, nonce: attempt.nonce, prompt: 'select_account' }))
    url.searchParams.set('code_challenge', createHash('sha256').update(attempt.verifier).digest('base64url'))
    url.searchParams.set('code_challenge_method', 'S256')
    const response = NextResponse.redirect(url)
    response.cookies.set(OAUTH_COOKIE, signEmployeeToken(attempt), employeeCookieOptions(600))
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch { return NextResponse.json({ error: 'Employee sign-in needs administrator setup.' }, { status: 503 }) }
}

import { NextRequest, NextResponse } from 'next/server'
import { EMPLOYEE_COOKIE, OAUTH_COOKIE, SESSION_SECONDS, allowedEmployee, employeeCookieOptions, employeeOAuthClient, employeeOrigin, newOAuthAttempt, readEmployeeToken, signEmployeeToken } from '@/lib/employee/auth'
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  let email: string | undefined
  try {
    const attempt = readEmployeeToken<ReturnType<typeof newOAuthAttempt>>(req.cookies.get(OAUTH_COOKIE)?.value, 'employee-oauth')
    const code = req.nextUrl.searchParams.get('code')
    if (!attempt || !code || req.nextUrl.searchParams.get('state') !== attempt.state) throw new Error('Invalid sign-in attempt')
    const client = employeeOAuthClient()
    const { tokens } = await client.getToken({ code, codeVerifier: attempt.verifier })
    if (!tokens.id_token) throw new Error('Missing identity')
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.EMPLOYEE_GOOGLE_CLIENT_ID })
    const identity = ticket.getPayload()
    if (!identity?.email_verified || !identity.email || (identity as { nonce?: string }).nonce !== attempt.nonce || !allowedEmployee(identity.email)) throw new Error('Not authorized')
    email = identity.email.toLowerCase()
  } catch { /* Never disclose provider errors, tokens, or account membership. */ }
  const response = NextResponse.redirect(`${employeeOrigin()}/employee/${email ? 'book/' : '?error=signin'}`)
  response.cookies.set(OAUTH_COOKIE, '', employeeCookieOptions(0))
  if (email) response.cookies.set(EMPLOYEE_COOKIE, signEmployeeToken({ purpose: 'employee-session', email, exp: Date.now() + SESSION_SECONDS * 1000 }), employeeCookieOptions())
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}

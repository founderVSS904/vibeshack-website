import { NextRequest, NextResponse } from 'next/server'
import { employeeOrigin } from '@/lib/employee/auth'
import { employeeSupabase } from '@/lib/employee/supabase'
import { acceptEmployeeIdentity, employeeDestination } from '@/lib/employee/access'
import { employeeJson } from '@/lib/employee/http'
import { escapeHtml } from '@/lib/server/sanitize'
import { readTextBody } from '@/lib/server/request-guards'
import { distributedRateLimit } from '@/lib/server/distributed-rate-limit'

export const dynamic = 'force-dynamic'

function validToken(token: unknown, type: unknown): token is string {
  return typeof token === 'string' && /^[a-zA-Z0-9_-]{20,256}$/.test(token) && ['invite', 'recovery', 'magiclink', 'email', 'signup'].includes(String(type))
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token_hash')
  const type = req.nextUrl.searchParams.get('type')
  const valid = validToken(token, type)
  const passwordSetup = type === 'invite' || type === 'recovery'
  const action = `${employeeOrigin()}/api/employee/auth/confirm`
  const title = passwordSetup ? 'Set your password' : 'Employee sign in'
  const passwordError = passwordSetup && req.nextUrl.searchParams.get('password_error') === '1' ? '<p role="alert">Use at least 8 characters and make sure both passwords match.</p>' : ''
  const fields = passwordSetup ? '<label for="new-password">New password<input id="new-password" name="password" type="password" autocomplete="new-password" minlength="8" maxlength="128" required aria-describedby="password-help"></label><p id="password-help" class="hint">Use at least 8 characters.</p><label for="confirm-password">Confirm password<input id="confirm-password" name="confirm_password" type="password" autocomplete="new-password" minlength="8" maxlength="128" required></label>' : ''
  const content = valid
    ? `<p>${passwordSetup ? 'Choose a password for your VibeShack team account.' : 'Continue to securely sign in to the VibeShack team workspace.'}</p>${passwordError}<form action="${escapeHtml(action)}" method="post"><input type="hidden" name="token_hash" value="${escapeHtml(token)}"><input type="hidden" name="type" value="${escapeHtml(type)}">${fields}<button type="submit">${passwordSetup ? 'Save password and sign in' : 'Continue'}</button></form>`
    : '<p>This link is not valid. Request a new password setup link to continue.</p><a href="/employee/password/">Request a new link</a>'
  return new NextResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | VibeShack</title><style>body{margin:0;background:#000;color:#f5f5f7;font:16px system-ui,sans-serif;min-height:100svh;display:grid;place-items:center}main{width:min(360px,calc(100% - 48px));padding:32px 0;text-align:center}img{width:118px;height:auto;margin-bottom:24px}h1{font-size:28px;font-weight:500;letter-spacing:-.025em}p{color:#a1a1aa;line-height:1.6;margin:16px 0 28px}label{display:block;text-align:left;font-size:14px;margin-top:20px;color:#c9c9d0}input[type=password]{display:block;box-sizing:border-box;width:100%;margin-top:10px;min-height:52px;border:1px solid #34343a;border-radius:12px;padding:12px 16px;background:#141416;color:#f5f5f7;font:16px system-ui}.hint{font-size:12px;text-align:left;margin:8px 0 0}button,a{display:block;box-sizing:border-box;border:0;border-radius:12px;padding:16px;width:100%;margin-top:24px;background:#0866f5;color:#fff;font:500 16px system-ui;text-decoration:none;cursor:pointer}input:focus-visible,button:focus-visible,a:focus-visible{outline:2px solid #d5d9e2;outline-offset:4px}</style></head><body><main><img src="/brand/vibeshack/monogram-red-transparent.png" alt="VibeShack Studios"><h1>${title}</h1>${content}</main></body></html>`, {
    status: valid ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'strict-origin', 'X-Robots-Tag': 'noindex, nofollow', 'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" },
  })
}

export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== employeeOrigin()) return employeeJson({ error: 'Invalid request origin' }, 403)
  const limited = await distributedRateLimit(req, { key: 'employee-email-confirm', max: 15, windowMs: 600_000 })
  if (limited) return limited
  let destination = '/employee/?error=signin'
  let supabase: Awaited<ReturnType<typeof employeeSupabase>> | undefined
  let authenticated = false
  try {
    const raw = await readTextBody(req, 4096)
    const form = new URLSearchParams(raw)
    const token = form.get('token_hash')
    const type = form.get('type')
    const passwordSetup = type === 'invite' || type === 'recovery'
    if (passwordSetup) destination = '/employee/password/?error=reset'
    if (!validToken(token, type)) throw new Error('Invalid confirmation')
    const password = form.get('password') || ''
    // Validate before consuming the one-use token. Keep the password unchanged.
    if (passwordSetup && (password.length < 8 || password.length > 128 || password !== form.get('confirm_password'))) {
      const retry = new URL('/api/employee/auth/confirm', employeeOrigin())
      retry.searchParams.set('token_hash', token)
      retry.searchParams.set('type', type!)
      retry.searchParams.set('password_error', '1')
      return GET(new NextRequest(retry))
    }
    supabase = await employeeSupabase()
    const { error } = await supabase.auth.verifyOtp({ token_hash: token, type: type as 'invite' | 'recovery' | 'magiclink' | 'email' | 'signup' })
    if (error) throw new Error('Sign-in failed')
    authenticated = true
    const employee = await acceptEmployeeIdentity()
    if (passwordSetup) {
      const updated = await supabase.auth.updateUser({ password })
      if (updated.error) throw new Error('Password could not be saved')
    }
    destination = employeeDestination(employee)
  } catch {
    // Do not retain a session after failed membership or password setup.
    if (authenticated && supabase) {
      try { await supabase.auth.signOut({ scope: 'local' }) } catch { /* Access remains registry-gated. */ }
    }
  }
  const response = NextResponse.redirect(`${employeeOrigin()}${destination}`, 303)
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('Referrer-Policy', 'strict-origin')
  return response
}

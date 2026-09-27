import { NextRequest, NextResponse } from 'next/server'
import { employeeOrigin } from '@/lib/employee/auth'
import { employeeSupabase } from '@/lib/employee/supabase'
import { acceptEmployeeIdentity, employeeDestination } from '@/lib/employee/access'
import { employeeJson } from '@/lib/employee/http'
import { escapeHtml } from '@/lib/server/sanitize'
import { rateLimit } from '@/lib/server/request-guards'
export const dynamic = 'force-dynamic'
function validToken(token: unknown, type: unknown): token is string {
  return typeof token === 'string' && /^[a-zA-Z0-9_-]{20,256}$/.test(token) && ['invite', 'magiclink', 'email', 'signup'].includes(String(type))
}
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token_hash')
  const type = req.nextUrl.searchParams.get('type')
  const valid = validToken(token, type)
  const action = `${employeeOrigin()}/api/employee/auth/confirm`
  const content = valid ? `<p>Continue to securely sign in to the VibeShack team workspace.</p><form action="${escapeHtml(action)}" method="post"><input type="hidden" name="token_hash" value="${escapeHtml(token)}"><input type="hidden" name="type" value="${escapeHtml(type)}"><button type="submit">Continue</button></form>` : '<p>This sign-in link is not valid. Request a new link to continue.</p><a href="/employee/">Employee sign in</a>'
  return new NextResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VibeShack team sign in</title><style>body{margin:0;background:#000;color:#f5f5f7;font:16px system-ui,sans-serif;min-height:100vh;display:grid;place-items:center}main{width:min(360px,calc(100% - 48px));text-align:center}img{width:118px;height:auto;margin-bottom:36px}h1{font-size:28px;letter-spacing:-.025em}p{color:#a1a1aa;line-height:1.6;margin:20px 0 28px}button,a{display:block;box-sizing:border-box;border:0;border-radius:12px;padding:16px;width:100%;background:#fff;color:#000;font:600 16px system-ui;text-decoration:none;cursor:pointer}button:focus-visible,a:focus-visible{outline:3px solid #929292;outline-offset:5px}</style></head><body><main><img src="/brand/vibeshack/monogram-red-transparent.png" alt="VibeShack Studios"><h1>Employee sign in</h1>${content}</main></body></html>`, {
    status: valid ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'strict-origin', 'X-Robots-Tag': 'noindex, nofollow', 'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" },
  })
}
export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== employeeOrigin()) return employeeJson({ error: 'Invalid request origin' }, 403)
  const limited = rateLimit(req, { key: 'employee-email-confirm', max: 15, windowMs: 600_000 })
  if (limited) return limited
  let destination = '/employee/?error=signin'
  try {
    if (Number(req.headers.get('content-length') || 0) > 2048) throw new Error('Invalid confirmation')
    const raw = await req.text()
    if (Buffer.byteLength(raw, 'utf8') > 2048) throw new Error('Invalid confirmation')
    const form = new URLSearchParams(raw)
    const token = form.get('token_hash')
    const type = form.get('type')
    if (!validToken(token, type)) throw new Error('Invalid confirmation')
    const supabase = await employeeSupabase()
    const { error } = await supabase.auth.verifyOtp({ token_hash: token, type: type as 'invite' | 'magiclink' | 'email' | 'signup' })
    if (error) throw new Error('Sign-in failed')
    try { destination = employeeDestination(await acceptEmployeeIdentity()) }
    catch { await supabase.auth.signOut({ scope: 'local' }) }
  } catch { /* Token details and membership never leave the server. */ }
  const response = NextResponse.redirect(`${employeeOrigin()}${destination}`, 303)
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('Referrer-Policy', 'strict-origin')
  return response
}

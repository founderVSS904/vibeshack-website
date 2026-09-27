import { NextRequest, NextResponse } from 'next/server'
import { employeeOrigin } from '@/lib/employee/auth'
import { employeeSupabase } from '@/lib/employee/supabase'
import { employeeJson } from '@/lib/employee/http'
import { rateLimit } from '@/lib/server/request-guards'
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { key: 'employee-login', max: 15, windowMs: 600_000 })
  if (limited) return limited
  try {
    const supabase = await employeeSupabase()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${employeeOrigin()}/api/employee/auth/callback`, scopes: 'openid email profile', queryParams: { prompt: 'select_account' }, skipBrowserRedirect: true },
    })
    if (error || !data.url) throw new Error('Sign-in unavailable')
    const response = NextResponse.redirect(data.url)
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Referrer-Policy', 'strict-origin')
    return response
  } catch { return employeeJson({ error: 'Employee sign-in needs administrator setup.' }, 503) }
}

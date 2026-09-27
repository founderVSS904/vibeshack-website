import { NextRequest, NextResponse } from 'next/server'
import { employeeOrigin } from '@/lib/employee/auth'
import { employeeSupabase } from '@/lib/employee/supabase'
import { acceptEmployeeIdentity, employeeDestination } from '@/lib/employee/access'
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  let destination = '/employee/?error=signin'
  try {
    const code = req.nextUrl.searchParams.get('code')
    if (!code || code.length > 2048) throw new Error('Invalid sign-in attempt')
    const supabase = await employeeSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw new Error('Sign-in failed')
    try { destination = employeeDestination(await acceptEmployeeIdentity()) }
    catch { await supabase.auth.signOut({ scope: 'local' }) }
  } catch { /* Never disclose provider errors, tokens, or account membership. */ }
  const response = NextResponse.redirect(`${employeeOrigin()}${destination}`)
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('Referrer-Policy', 'strict-origin')
  return response
}

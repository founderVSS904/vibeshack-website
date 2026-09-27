import { NextRequest, NextResponse } from 'next/server'
import { EMPLOYEE_COOKIE, employeeCookieOptions, employeeOrigin } from '@/lib/employee/auth'
import { employeeSupabase } from '@/lib/employee/supabase'
import { employeeJson } from '@/lib/employee/http'
export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== employeeOrigin()) return employeeJson({ error: 'Invalid request origin' }, 403)
  try {
    const { error } = await (await employeeSupabase()).auth.signOut({ scope: 'local' })
    if (error) throw new Error('Sign out failed')
  }
  catch { return employeeJson({ error: 'Sign out could not finish. Please retry.' }, 503) }
  const response = NextResponse.redirect(`${employeeOrigin()}/employee/`, 303)
  response.cookies.set(EMPLOYEE_COOKIE, '', employeeCookieOptions(0))
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

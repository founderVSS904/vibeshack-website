import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { employeeOrigin } from './auth'

export function employeeSupabaseConfigured() {
  try {
    const url = new URL(process.env.SUPABASE_URL || '')
    const local = process.env.NODE_ENV === 'development' && ['localhost', '127.0.0.1'].includes(url.hostname)
    return Boolean((url.protocol === 'https:' || (url.protocol === 'http:' && local)) && process.env.SUPABASE_PUBLISHABLE_KEY && process.env.SUPABASE_SECRET_KEY)
  } catch { return false }
}

export async function employeeSupabase() {
  if (!employeeSupabaseConfigured()) throw new Error('Employee access is not configured')
  const cookieStore = await cookies()
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookieOptions: { httpOnly: true, secure: employeeOrigin().startsWith('https:'), sameSite: 'lax', path: '/' },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
        catch { /* Server components cannot write cookies. Middleware refreshes them. */ }
      },
    },
  })
}

export function employeeAdmin() {
  if (!employeeSupabaseConfigured()) throw new Error('Employee access is not configured')
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

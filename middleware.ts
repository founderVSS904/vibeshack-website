import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function shouldSkipSlashRedirect(pathname: string) {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    pathname === '/'
  )
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!shouldSkipSlashRedirect(pathname) && !pathname.endsWith('/')) return NextResponse.redirect(new URL(`${pathname}/${req.nextUrl.search}`, req.url), 308)
  let response = NextResponse.next({ request: req })
  if (pathname === '/employee/' || pathname.startsWith('/employee/') || pathname.startsWith('/api/employee/')) {
    response.headers.set('Cache-Control', 'private, no-store')
    // Preserve Origin on native POSTs without exposing sign-in token paths or queries.
    response.headers.set('Referrer-Policy', 'strict-origin')
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_PUBLISHABLE_KEY
    if (url && key) {
      try {
        const supabase = createServerClient(url, key, {
          cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === 'production' || req.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/' },
          cookies: {
            getAll: () => req.cookies.getAll(),
            setAll: (values, headers) => {
              values.forEach(({ name, value }) => req.cookies.set(name, value))
              response = NextResponse.next({ request: req })
              values.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
              Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value))
              response.headers.set('Cache-Control', 'private, no-store')
              response.headers.set('Referrer-Policy', 'strict-origin')
            },
          },
        })
        await supabase.auth.getClaims()
      } catch { /* Protected routes independently deny unavailable or invalid sessions. */ }
    }
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}

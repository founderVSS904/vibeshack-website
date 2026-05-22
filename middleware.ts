import { NextRequest, NextResponse } from 'next/server'

function shouldSkipSlashRedirect(pathname: string) {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    pathname === '/'
  )
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (shouldSkipSlashRedirect(pathname) || pathname.endsWith('/')) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL(`${pathname}/${req.nextUrl.search}`, req.url), 308)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}

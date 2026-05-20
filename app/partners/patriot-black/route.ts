import { NextRequest, NextResponse } from 'next/server'
import { getReferralPartner, REFERRAL_COOKIE, REFERRAL_MAX_AGE_SECONDS } from '@/lib/booking/referrals'

export function GET(req: NextRequest) {
  const partner = getReferralPartner('patriot-black')
  const url = new URL('/', req.url)

  if (partner) {
    url.searchParams.set('ref', partner.id)
    url.searchParams.set('utm_source', partner.id)
    url.searchParams.set('utm_medium', 'partner')
    url.searchParams.set('utm_campaign', 'studio_booking')
    url.searchParams.set('utm_content', 'partner_directory')
  }

  const response = NextResponse.redirect(url)
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')

  if (partner) {
    response.cookies.set(REFERRAL_COOKIE, partner.id, {
      httpOnly: false,
      maxAge: REFERRAL_MAX_AGE_SECONDS,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  return response
}

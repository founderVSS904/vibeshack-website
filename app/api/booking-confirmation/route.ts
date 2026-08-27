import { NextRequest, NextResponse } from 'next/server'
import { getBookingConfirmation } from '@/lib/booking/confirmation'
import { verifyCheckoutManagementToken } from '@/lib/booking/checkout-management'
import { getStripeClient } from '@/lib/booking/stripe'
import { rateLimit } from '@/lib/server/request-guards'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { key: 'booking-confirmation', max: 40, windowMs: 60_000 })
  if (limited) {
    limited.headers.set('Cache-Control', 'no-store, max-age=0')
    return limited
  }
  const values = req.nextUrl.searchParams.getAll('session_id')
  const result = values.length > 1 ? { status: 'unverified' } : await getBookingConfirmation(
    values[0] || null,
    (req.headers.get('x-checkout-management-token') || '').slice(0, 257),
    {
      retrieveSession: (sessionId) => getStripeClient().checkout.sessions.retrieve(sessionId, {}, { timeout: 10_000, maxNetworkRetries: 0 }),
      verifyManagementToken: verifyCheckoutManagementToken,
    },
  )
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store, max-age=0' } })
}

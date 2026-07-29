import { NextRequest, NextResponse } from 'next/server'
import { releaseBookingHolds } from '@/lib/booking/calendar'
import { verifyCheckoutManagementToken } from '@/lib/booking/checkout-management'
import {
  hasCompleteBookingCartMetadata,
  parseBookingCartItems,
} from '@/lib/booking/checkout-metadata'
import { getStripeClient } from '@/lib/booking/stripe'
import { jsonBodyErrorResponse, rateLimit, readJsonBody } from '@/lib/server/request-guards'
import { stripControlChars } from '@/lib/server/sanitize'

const CANCEL_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const CANCEL_RATE_LIMIT_MAX = 20
const MAX_BODY_BYTES = 4 * 1024

function completedResponse(sessionId: string) {
  return NextResponse.json({
    error: 'Payment has already completed. Your booking is being confirmed.',
    code: 'booking_completed',
    confirmationUrl: `/book/confirmation?session_id=${encodeURIComponent(sessionId)}`,
  }, { status: 409 })
}

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, {
      key: 'cancel-checkout-session',
      max: CANCEL_RATE_LIMIT_MAX,
      windowMs: CANCEL_RATE_LIMIT_WINDOW_MS,
    })
    if (limited) return limited

    const body = await readJsonBody(req, MAX_BODY_BYTES)
    const sessionId = stripControlChars(body.sessionId, 256)
    const managementToken = stripControlChars(body.managementToken, 256)

    if (!/^cs_(?:live|test)_[A-Za-z0-9]+$/.test(sessionId) || !managementToken) {
      return NextResponse.json({ error: 'Invalid checkout session' }, { status: 400 })
    }

    const stripe = getStripeClient()
    let session = await stripe.checkout.sessions.retrieve(sessionId)
    const metadata = (session.metadata || {}) as Record<string, string>
    const bookingRef = metadata.bookingRef || ''

    if (
      metadata.bookingHoldVersion !== '1'
      || !bookingRef
      || !verifyCheckoutManagementToken(managementToken, sessionId, bookingRef)
    ) {
      return NextResponse.json({ error: 'Checkout session could not be managed' }, { status: 403 })
    }

    const cartItems = parseBookingCartItems(metadata)
    if (!hasCompleteBookingCartMetadata(metadata, cartItems)) {
      console.error('Checkout cancellation has incomplete cart metadata', {
        sessionId,
        bookingRef,
        parsedItems: cartItems.length,
        expectedSessions: metadata.totalSessions,
      })
      return NextResponse.json({ error: 'Checkout details could not be verified' }, { status: 500 })
    }

    if (session.payment_status === 'paid' || session.status === 'complete') {
      return completedResponse(sessionId)
    }

    if (session.status === 'open') {
      try {
        session = await stripe.checkout.sessions.expire(sessionId)
      } catch (error) {
        // Payment and cancellation can race. Re-read Stripe before deciding
        // whether the hold may be released.
        session = await stripe.checkout.sessions.retrieve(sessionId)
        if (session.payment_status === 'paid' || session.status === 'complete') {
          return completedResponse(sessionId)
        }
        if (session.status !== 'expired') throw error
      }
    }

    if (session.status !== 'expired' || session.payment_status === 'paid') {
      return NextResponse.json({
        error: 'Checkout is still active. Please wait a moment and try again.',
      }, { status: 409 })
    }

    await releaseBookingHolds(cartItems, bookingRef)

    try {
      const releasedAt = new Date().toISOString()
      await stripe.checkout.sessions.update(sessionId, {
        metadata: {
          vbsCheckoutCancelledAt: releasedAt,
          vbsBookingHoldReleasedAt: releasedAt,
        },
      })
    } catch (error) {
      console.error('Released checkout hold could not be marked in Stripe:', error)
    }

    return NextResponse.json({ released: true })
  } catch (error) {
    const bodyError = jsonBodyErrorResponse(error)
    if (bodyError) return bodyError

    console.error('Checkout cancellation failed:', error)
    return NextResponse.json({
      error: 'We could not reopen this time yet. Please try again.',
    }, { status: 500 })
  }
}

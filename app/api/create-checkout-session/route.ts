import { NextRequest, NextResponse } from 'next/server'
import { acquireBookingHolds, assertCartSlotsAvailable, releaseBookingHolds } from '@/lib/booking/calendar'
import { getRecurringOptionById } from '@/lib/booking/catalog'
import { buildBookingCheckoutLineItems, buildCanonicalBookingCart, calculateBookingCheckoutPricing } from '@/lib/booking/checkout-pricing'
import { buildBookingCartMetadata, withBookingAttributionMetadata } from '@/lib/booking/checkout-metadata'
import { bookingCheckoutExpirations } from '@/lib/booking/checkout-lifecycle'
import { createCheckoutManagementToken } from '@/lib/booking/checkout-management'
import { buildReferralInfo, REFERRAL_COOKIE } from '@/lib/booking/referrals'
import { getStripeClient } from '@/lib/booking/stripe'
import { jsonBodyErrorResponse, rateLimit, readJsonBody } from '@/lib/server/request-guards'
import { isEmail, parseEmailList, stripControlChars } from '@/lib/server/sanitize'
import { siteUrl } from '@/lib/seo/site'

const ATTRIBUTION_COOKIE = 'vbs_attribution'
const CHECKOUT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const CHECKOUT_RATE_LIMIT_MAX = 12
const MAX_BODY_BYTES = 32 * 1024

function getStripePublishableKey() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) throw new Error('STRIPE_PUBLISHABLE_KEY is not configured')
  return publishableKey
}

function getBaseUrl(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL
  if (configured) return configured.replace(/\/$/, '')

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}`

  return new URL(req.url).origin
}

function parseJsonCookie(raw: string) {
  const candidates = [raw]
  try {
    candidates.push(decodeURIComponent(raw))
  } catch {}

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {}
  }

  return null
}

function readAttributionMetadata(req: NextRequest) {
  const raw = req.cookies.get(ATTRIBUTION_COOKIE)?.value
  if (!raw) return {}

  const parsed = parseJsonCookie(raw)
  if (!parsed) return {}

  const params = parsed.params && typeof parsed.params === 'object' && !Array.isArray(parsed.params)
    ? parsed.params as Record<string, unknown>
    : {}

  const clickId = params.gclid || params.gbraid || params.wbraid || params.fbclid || params.msclkid
  const metadata: Record<string, string> = {
    trackingLandingPath: stripControlChars(parsed.landingPath, 240),
    trackingReferrer: stripControlChars(parsed.referrer, 240),
    trackingCapturedAt: stripControlChars(parsed.capturedAt, 80),
    trackingSource: stripControlChars(params.utm_source, 80),
    trackingMedium: stripControlChars(params.utm_medium, 80),
    trackingCampaign: stripControlChars(params.utm_campaign, 120),
    trackingContent: stripControlChars(params.utm_content, 120),
    trackingTerm: stripControlChars(params.utm_term, 120),
    trackingClickId: stripControlChars(clickId, 160),
  }

  return Object.fromEntries(Object.entries(metadata).filter(([, value]) => value))
}

function checkoutAvailabilityError(status: number, error: string) {
  if (status !== 409) return error
  if (error.startsWith('Selected sessions overlap')) {
    return 'Those rooms share the same studio resources at that time. Please choose a different room group or another open slot.'
  }
  return 'This slot is not available. Please choose another open time.'
}

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, {
      key: 'checkout-session',
      max: CHECKOUT_RATE_LIMIT_MAX,
      windowMs: CHECKOUT_RATE_LIMIT_WINDOW_MS,
    })
    if (limited) return limited

    const body = await readJsonBody(req, MAX_BODY_BYTES)
    const name = stripControlChars(body.name, 120)
    const email = stripControlChars(body.email, 254).toLowerCase()
    const phone = stripControlChars(body.phone, 40)
    const recurring = stripControlChars(body.recurring, 40) || null
    const recurringOption = getRecurringOptionById(recurring)
    const teamEmails = parseEmailList(body.teamEmails, 10)
    const referralSource = stripControlChars(
      body.referralSource || req.cookies.get(REFERRAL_COOKIE)?.value || '',
      80,
    )

    if (!name || !isEmail(email)) {
      return NextResponse.json({ error: 'Name and valid email are required' }, { status: 400 })
    }

    const cart = buildCanonicalBookingCart(body.cart)
    if (!cart.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const availability = await assertCartSlotsAvailable(cart)
    if (!availability.ok) {
      const error = checkoutAvailabilityError(availability.status, availability.error)
      return NextResponse.json({ error }, { status: availability.status })
    }

    const pricing = calculateBookingCheckoutPricing(cart, recurringOption?.id)
    const { discountCents, addOnTotalCents, computedTotalCents } = pricing
    const referralInfo = buildReferralInfo(referralSource, computedTotalCents)

    const lineItems = buildBookingCheckoutLineItems(cart, pricing, `${siteUrl}/og-image.jpg`)

    const bookingRef = crypto.randomUUID()
    const { checkoutExpiresAt, holdExpiresAt } = bookingCheckoutExpirations()
    const attributionMetadata = readAttributionMetadata(req)
    const cartMetadata = buildBookingCartMetadata(cart)
    const checkoutMetadata = withBookingAttributionMetadata({
      bookingRef,
      customerName: name.slice(0, 500),
      customerEmail: email.slice(0, 500),
      customerPhone: phone.slice(0, 500),
      studioName: cart[0].studioName.slice(0, 500),
      totalSessions: String(cart.length),
      computedTotalCents: String(computedTotalCents),
      recurring: recurringOption?.id || '',
      recurringDiscountCents: String(discountCents),
      addOnTotalCents: String(addOnTotalCents),
      teamEmails: JSON.stringify(teamEmails).slice(0, 500),
      referralSource: referralInfo?.source || '',
      referralPartner: referralInfo?.partnerName || '',
      referralCommissionRate: referralInfo ? String(referralInfo.commissionRate) : '',
      referralCommissionCents: referralInfo ? String(referralInfo.commissionCents) : '0',
      bookingHoldVersion: '1',
      bookingHoldExpiresAt: holdExpiresAt.toISOString(),
      ...cartMetadata,
    }, attributionMetadata)

    const baseUrl = getBaseUrl(req)
    const publishableKey = getStripePublishableKey()
    const hold = await acquireBookingHolds(cart, bookingRef, holdExpiresAt)
    if (!hold.ok) {
      return NextResponse.json({ error: hold.error }, { status: hold.status })
    }

    try {
      const finalAvailability = await assertCartSlotsAvailable(cart, bookingRef)
      if (!finalAvailability.ok) {
        await releaseBookingHolds(cart, bookingRef)
        const error = checkoutAvailabilityError(finalAvailability.status, finalAvailability.error)
        return NextResponse.json({ error }, { status: finalAvailability.status })
      }

      const session = await getStripeClient().checkout.sessions.create({
        ui_mode: 'embedded',
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: email,
        expires_at: checkoutExpiresAt,
        payment_intent_data: {
          receipt_email: email,
          metadata: {
            bookingRef,
            customerEmail: email.slice(0, 500),
            customerName: name.slice(0, 500),
          },
        },
        metadata: checkoutMetadata,
        return_url: `${baseUrl}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      })

      if (!session.client_secret) {
        throw new Error('Stripe embedded checkout did not return a client secret')
      }

      return NextResponse.json({
        clientSecret: session.client_secret,
        publishableKey,
        sessionId: session.id,
        managementToken: createCheckoutManagementToken(session.id, bookingRef),
        expiresAt: new Date(checkoutExpiresAt * 1000).toISOString(),
      })
    } catch (error) {
      try {
        await releaseBookingHolds(cart, bookingRef)
      } catch (cleanupError) {
        console.error('Booking hold cleanup failed after checkout error:', cleanupError)
      }
      throw error
    }
  } catch (err) {
    const bodyError = jsonBodyErrorResponse(err)
    if (bodyError) return bodyError

    if (err instanceof Error && ['Invalid cart item', 'Invalid add-on selection', 'Invalid add-on duration'].includes(err.message)) {
      return NextResponse.json({ error: 'Invalid booking selection' }, { status: 400 })
    }

    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Payment session failed' }, { status: 500 })
  }
}

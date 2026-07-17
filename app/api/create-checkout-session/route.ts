import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { assertCartSlotsAvailable, type BookingCartItem } from '@/lib/booking/calendar'
import { calculateRecurringDiscountCents, getAddOnById, getRecurringOptionById, getStudioById } from '@/lib/booking/catalog'
import { buildReferralInfo, REFERRAL_COOKIE } from '@/lib/booking/referrals'
import { describeSlotRanges, formatDateForDisplay, isValidBookingDate } from '@/lib/booking/time'
import { jsonBodyErrorResponse, rateLimit, readJsonBody } from '@/lib/server/request-guards'
import { isEmail, parseEmailList, stripControlChars } from '@/lib/server/sanitize'
import { siteUrl } from '@/lib/seo/site'

const ATTRIBUTION_COOKIE = 'vbs_attribution'
const CHECKOUT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const CHECKOUT_RATE_LIMIT_MAX = 12
const MAX_BODY_BYTES = 32 * 1024

function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(secret, { apiVersion: '2026-02-25.clover' })
}

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

function toArray(value: unknown) {
  return Array.isArray(value) ? value : []
}

function normalizeSlots(value: unknown) {
  return toArray(value)
    .filter((slot): slot is string => typeof slot === 'string')
    .filter((slot) => !Number.isNaN(Date.parse(slot)))
    .sort((a, b) => Date.parse(a) - Date.parse(b))
}

function buildCanonicalCart(rawCart: unknown): BookingCartItem[] {
  const cart: BookingCartItem[] = []

  for (const rawItem of toArray(rawCart)) {
    if (!rawItem || typeof rawItem !== 'object') continue
    const item = rawItem as Record<string, unknown>
    const studioId = stripControlChars(item.studioId, 80)
    const studio = getStudioById(studioId)
    const date = stripControlChars(item.date, 20)
    const slots = normalizeSlots(item.slots)

    if (!studio || !isValidBookingDate(date) || slots.length === 0 || slots.length > 24) {
      throw new Error('Invalid cart item')
    }

    cart.push({
      studioId: studio.id,
      studioName: studio.name,
      date,
      slots,
      hours: slots.length,
      price: studio.price * slots.length,
    })
  }

  return cart
}

function buildCanonicalAddons(rawAddons: unknown) {
  const ids = new Set<string>()
  for (const rawAddon of toArray(rawAddons)) {
    const id = typeof rawAddon === 'string'
      ? stripControlChars(rawAddon, 80)
      : stripControlChars((rawAddon as Record<string, unknown> | null)?.id, 80)
    if (id) ids.add(id)
  }
  return Array.from(ids).map(getAddOnById).filter(Boolean) as NonNullable<ReturnType<typeof getAddOnById>>[]
}

function applyDiscountToSessionAmounts(amounts: number[], discountCents: number) {
  if (discountCents <= 0) return amounts

  const total = amounts.reduce((sum, amount) => sum + amount, 0)
  let remaining = Math.min(discountCents, total - amounts.length)

  return amounts.map((amount, index) => {
    const isLast = index === amounts.length - 1
    const share = isLast ? remaining : Math.round((discountCents * amount) / total)
    const discount = Math.min(Math.max(share, 0), amount - 1, remaining)
    remaining -= discount
    return amount - discount
  })
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

    const cart = buildCanonicalCart(body.cart)
    if (!cart.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const availability = await assertCartSlotsAvailable(cart)
    if (!availability.ok) {
      const error = availability.status === 409
        ? availability.error.startsWith('Selected sessions overlap')
          ? 'Those rooms share the same studio resources at that time. Please choose a different room group or another open slot.'
          : 'This slot is not available. Please choose another open time.'
        : availability.error
      return NextResponse.json({ error }, { status: availability.status })
    }

    const addons = buildCanonicalAddons(body.addons)
    const baseSessionTotalCents = cart.reduce((sum, item) => sum + item.price * 100, 0)
    const addonTotalCents = addons.reduce((sum, addon) => sum + addon.price * 100, 0)
    const discountCents = calculateRecurringDiscountCents(baseSessionTotalCents, recurringOption?.id)
    const discountedSessionAmounts = applyDiscountToSessionAmounts(cart.map((item) => item.price * 100), discountCents)
    const computedTotalCents = discountedSessionAmounts.reduce((sum, amount) => sum + amount, 0) + addonTotalCents
    const referralInfo = buildReferralInfo(referralSource, computedTotalCents)

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.map((item, index) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.studioName} - VibeShack Studios`,
          description: `${formatDateForDisplay(item.date)} - ${describeSlotRanges(item.slots)} - ${item.hours}hr${discountCents ? ' - recurring discount applied' : ''}`,
          images: [`${siteUrl}/og-image.jpg`],
        },
        unit_amount: discountedSessionAmounts[index],
      },
      quantity: 1,
    }))

    for (const addon of addons) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Add-on: ${addon.name}`,
            description: addon.description || 'Optional add-on service',
            images: [`${siteUrl}/og-image.jpg`],
          },
          unit_amount: addon.price * 100,
        },
        quantity: 1,
      })
    }

    const bookingRef = crypto.randomUUID()
    const attributionMetadata = readAttributionMetadata(req)
    const cartMetadata: Record<string, string> = {}
    cart.forEach((item, index) => {
      // Stripe caps metadata values at 500 chars. Full ISO slot arrays overflow
      // that for 16+ hour sessions and truncate into unparseable JSON, so slots
      // are stored as the first slot plus hour offsets (slots arrive sorted from
      // normalizeSlots). The webhook reconstructs and re-validates every slot,
      // and derives name/hours/price from the catalog.
      const firstSlotMs = Date.parse(item.slots[0])
      cartMetadata[`cart_${index}`] = JSON.stringify({
        id: item.studioId,
        d: item.date,
        t0: item.slots[0],
        off: item.slots.map((slot) => Math.round((Date.parse(slot) - firstSlotMs) / 3600000)),
      })
    })

    const baseUrl = getBaseUrl(req)
    const session = await getStripe().checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      payment_intent_data: {
        receipt_email: email,
        metadata: {
          bookingRef,
          customerEmail: email.slice(0, 500),
          customerName: name.slice(0, 500),
        },
      },
      metadata: {
        bookingRef,
        customerName: name.slice(0, 500),
        customerEmail: email.slice(0, 500),
        customerPhone: phone.slice(0, 500),
        studioName: cart[0].studioName.slice(0, 500),
        totalSessions: String(cart.length),
        totalAmount: String(computedTotalCents / 100),
        computedTotalCents: String(computedTotalCents),
        recurring: recurringOption?.id || '',
        recurringDiscountCents: String(discountCents),
        addons: addons.map((addon) => addon.id).join(',').slice(0, 500),
        teamEmails: JSON.stringify(teamEmails).slice(0, 500),
        referralSource: referralInfo?.source || '',
        referralPartner: referralInfo?.partnerName || '',
        referralCommissionRate: referralInfo ? String(referralInfo.commissionRate) : '',
        referralCommissionCents: referralInfo ? String(referralInfo.commissionCents) : '0',
        ...attributionMetadata,
        ...cartMetadata,
      },
      return_url: `${baseUrl}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    })

    if (!session.client_secret) {
      throw new Error('Stripe embedded checkout did not return a client secret')
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
      publishableKey: getStripePublishableKey(),
    })
  } catch (err) {
    const bodyError = jsonBodyErrorResponse(err)
    if (bodyError) return bodyError

    if (err instanceof Error && err.message === 'Invalid cart item') {
      return NextResponse.json({ error: 'Invalid booking selection' }, { status: 400 })
    }

    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Payment session failed' }, { status: 500 })
  }
}

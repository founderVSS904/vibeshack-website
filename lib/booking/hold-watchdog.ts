import type Stripe from 'stripe'
import type { BookingCartItem } from './calendar'
import { checkoutHoldWatchdogAction, type CheckoutHoldWatchdogAction } from './checkout-lifecycle'

export type CheckoutHoldReconcileOutcome =
  | 'released'
  | 'already-released'
  | 'protected'
  | 'active'
  | 'ignored'

export type CheckoutHoldReconcileDependencies = {
  retrieveSession: (sessionId: string) => Promise<Stripe.Checkout.Session>
  expireSession: (sessionId: string) => Promise<Stripe.Checkout.Session>
  parseCart: (metadata: Record<string, string>) => BookingCartItem[]
  hasCompleteCart: (
    metadata: Record<string, string>,
    cartItems: BookingCartItem[],
  ) => boolean
  releaseHolds: (cartItems: BookingCartItem[], bookingRef: string) => Promise<void>
  markReleased: (sessionId: string, reconciledAt: string) => Promise<void>
  now?: () => Date
}

export function isManagedCheckoutHold(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {}
  return metadata.bookingHoldVersion === '1' && Boolean(metadata.bookingRef)
}

export function checkoutHoldWasReleased(session: Stripe.Checkout.Session) {
  return Boolean(session.metadata?.vbsBookingHoldReleasedAt)
}

export function watchdogAlertIsDue(
  metadata: {
    vbsWatchdogAlertedAt?: string
    vbsWatchdogAlertReservedAt?: string
  } | null,
  nowMs: number,
  deliveredCooldownMs: number,
  reservationCooldownMs = deliveredCooldownMs,
) {
  const alertedAt = Date.parse(metadata?.vbsWatchdogAlertedAt || '')
  if (Number.isFinite(alertedAt) && nowMs - alertedAt < deliveredCooldownMs) {
    return false
  }

  const reservedAt = Date.parse(metadata?.vbsWatchdogAlertReservedAt || '')
  if (Number.isFinite(reservedAt) && nowMs - reservedAt < reservationCooldownMs) {
    return false
  }

  return true
}

export function watchdogAction(
  session: Stripe.Checkout.Session,
  nowSeconds = Math.floor(Date.now() / 1000),
): CheckoutHoldWatchdogAction {
  return checkoutHoldWatchdogAction({
    payment_status: session.payment_status,
    status: session.status,
    expires_at: session.expires_at,
    managed: isManagedCheckoutHold(session),
    released: checkoutHoldWasReleased(session),
  }, nowSeconds)
}

export async function reconcileCheckoutHold(
  sessionId: string,
  dependencies: CheckoutHoldReconcileDependencies,
): Promise<CheckoutHoldReconcileOutcome> {
  const now = dependencies.now || (() => new Date())
  let session = await dependencies.retrieveSession(sessionId)
  let action = watchdogAction(session, Math.floor(now().getTime() / 1000))

  if (action === 'protect') return 'protected'
  if (action === 'ignore') {
    return checkoutHoldWasReleased(session) ? 'already-released' : 'ignored'
  }

  let expirationError: unknown
  if (action === 'expire') {
    try {
      session = await dependencies.expireSession(session.id)
    } catch (error) {
      expirationError = error
      // Payment and expiration can race. The fresh read below is the safety
      // boundary before any Calendar hold is released.
      session = await dependencies.retrieveSession(session.id)
    }
  }

  action = watchdogAction(session, Math.floor(now().getTime() / 1000))
  if (action === 'protect') return 'protected'
  if (action === 'ignore') {
    return checkoutHoldWasReleased(session) ? 'already-released' : 'ignored'
  }
  if (action === 'expire') {
    if (expirationError) throw expirationError
    throw new Error('Stripe checkout remained open after its expiration attempt')
  }
  if (action !== 'release') return 'active'

  const metadata = (session.metadata || {}) as Record<string, string>
  const bookingRef = metadata.bookingRef || ''
  const cartItems = dependencies.parseCart(metadata)
  if (!dependencies.hasCompleteCart(metadata, cartItems)) {
    throw new Error('Expired checkout has incomplete cart metadata; hold was not released')
  }

  await dependencies.releaseHolds(cartItems, bookingRef)
  const reconciledAt = now().toISOString()
  await dependencies.markReleased(session.id, reconciledAt)
  return 'released'
}

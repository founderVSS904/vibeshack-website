export const CHECKOUT_SESSION_MINUTES = 35
export const CHECKOUT_HOLD_GRACE_MINUTES = 15

export function bookingCheckoutExpirations(nowMs = Date.now()) {
  const checkoutExpiresAt = Math.floor(nowMs / 1000) + CHECKOUT_SESSION_MINUTES * 60
  const holdExpiresAt = new Date(
    (checkoutExpiresAt + CHECKOUT_HOLD_GRACE_MINUTES * 60) * 1000,
  )

  return { checkoutExpiresAt, holdExpiresAt }
}

export function bookingHoldIsActive(
  expiresAt: string | null | undefined,
  nowMs = Date.now(),
) {
  const expirationMs = Date.parse(expiresAt || '')
  return Number.isFinite(expirationMs) && expirationMs > nowMs
}

export type CheckoutHoldReleaseAction = 'completed' | 'expire' | 'release' | 'wait'

export function checkoutHoldReleaseAction(session: {
  payment_status: string
  status: string | null
}): CheckoutHoldReleaseAction {
  if (session.payment_status === 'paid' || session.status === 'complete') {
    return 'completed'
  }
  if (session.status === 'open') return 'expire'
  if (session.status === 'expired') return 'release'
  return 'wait'
}

export type CheckoutHoldWatchdogAction = 'ignore' | 'protect' | 'expire' | 'release' | 'wait'

export function checkoutHoldWatchdogAction(
  session: {
    payment_status: string
    status: string | null
    expires_at: number
    managed: boolean
    released: boolean
  },
  nowSeconds = Math.floor(Date.now() / 1000),
): CheckoutHoldWatchdogAction {
  if (!session.managed || session.released) return 'ignore'

  const releaseAction = checkoutHoldReleaseAction(session)
  if (releaseAction === 'completed') return 'protect'
  if (releaseAction === 'release') return 'release'
  if (releaseAction === 'expire') {
    return session.expires_at <= nowSeconds ? 'expire' : 'wait'
  }
  return 'wait'
}

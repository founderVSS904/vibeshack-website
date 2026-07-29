import { createHmac, timingSafeEqual } from 'node:crypto'

function checkoutManagementSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_SECRET_KEY
  if (!secret) throw new Error('Stripe checkout management secret is not configured')
  return secret
}

function checkoutManagementDigest(sessionId: string, bookingRef: string) {
  return createHmac('sha256', checkoutManagementSecret())
    .update(`${sessionId}|${bookingRef}`)
    .digest()
}

export function createCheckoutManagementToken(sessionId: string, bookingRef: string) {
  return checkoutManagementDigest(sessionId, bookingRef).toString('base64url')
}

export function verifyCheckoutManagementToken(
  token: string,
  sessionId: string,
  bookingRef: string,
) {
  if (!token || !sessionId || !bookingRef) return false

  let provided: Buffer
  try {
    provided = Buffer.from(token, 'base64url')
  } catch {
    return false
  }

  const expected = checkoutManagementDigest(sessionId, bookingRef)
  return provided.length === expected.length && timingSafeEqual(provided, expected)
}

import Stripe from 'stripe'

export function getStripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(secret, { apiVersion: '2026-02-25.clover' })
}

'use client'

import { useMemo } from 'react'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

type StripeEmbeddedCheckoutProps = {
  publishableKey: string
  clientSecret: string
}

export default function StripeEmbeddedCheckout({
  publishableKey,
  clientSecret,
}: StripeEmbeddedCheckoutProps) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey])

  return (
    <EmbeddedCheckoutProvider
      key={clientSecret}
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  )
}

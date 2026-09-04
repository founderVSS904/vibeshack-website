'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { trackVerifiedPurchase } from '@/lib/analytics'
import { CONFIRMATION_STATUSES, PENDING_CHECKOUT_STORAGE_KEY, clearConfirmedPendingCheckout, pendingConfirmationToken, type BookingConfirmation, type BookingConfirmationStatus } from '@/lib/booking/confirmation-state'

const messages: Record<BookingConfirmationStatus, { title: string; body: string }> = {
  missing: { title: 'Check your booking', body: 'Open the confirmation link from your checkout, or check your booking email. This page alone does not confirm a reservation.' },
  unverified: { title: 'We could not verify this booking', body: 'This link could not be verified. If you recently paid, do not pay again. Check your email or contact the studio for help.' },
  not_paid: { title: 'Payment is not confirmed', body: 'This checkout has not completed payment. Your studio session is not confirmed yet. Return to booking to review your checkout.' },
  expired: { title: 'This checkout has expired', body: 'An expired checkout does not confirm a booking. Return to booking to choose an available time. If you believe payment completed, contact us before paying again.' },
  processing: { title: 'Payment received', body: 'We verified your payment and are still confirming the studio reservation. Please do not pay again. Check again shortly or contact the studio if this does not update.' },
  confirmed: { title: "You’re booked.", body: 'Your studio time is confirmed.' },
  attention: { title: 'Payment received. We are checking your session.', body: 'Your payment is verified, but the studio team needs to check the reservation details. Please contact us and do not pay again.' },
  error: { title: 'We cannot check your booking right now', body: 'We have not verified the booking status. Please try again, check your email, or contact the studio. If you recently paid, do not pay again.' },
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') || ''
  const ambiguous = searchParams.getAll('session_id').length > 1
  const [result, setResult] = useState<BookingConfirmation | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!sessionId || ambiguous) {
      setResult({ status: ambiguous ? 'unverified' : 'missing' })
      return
    }
    setResult(null)
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    let attempts = 0
    let token = ''
    try { token = pendingConfirmationToken(window.sessionStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY), sessionId) } catch {}
    const check = async () => {
      attempts += 1
      try {
        const response = await fetch(`/api/booking-confirmation/?session_id=${encodeURIComponent(sessionId)}`, {
          cache: 'no-store', signal: controller.signal,
          headers: token ? { 'x-checkout-management-token': token } : {},
        })
        if (!response.ok) throw new Error('Verification unavailable')
        const data = await response.json() as BookingConfirmation
        if (!CONFIRMATION_STATUSES.includes(data?.status)) throw new Error('Invalid verification response')
        if (controller.signal.aborted) return
        setResult(data)
        trackVerifiedPurchase(data)
        try { clearConfirmedPendingCheckout(window.sessionStorage, sessionId, data.status) } catch {}
        if (attempts < 8 && (data.status === 'processing' || (data.status === 'confirmed' && !data.emailSent))) {
          timer = setTimeout(() => { void check() }, 3000)
        }
      } catch {
        if (!controller.signal.aborted) setResult({ status: 'error' })
      }
    }
    void check()
    return () => { controller.abort(); if (timer) clearTimeout(timer) }
  }, [sessionId, ambiguous, retry])

  const message = result ? messages[result.status] : { title: 'Checking your booking', body: 'We are verifying your payment and reservation with the studio.' }
  const isPaid = result && ['processing', 'confirmed', 'attention'].includes(result.status)
  return (
    <div className="min-h-screen bg-black px-6 pb-24 pt-32 sm:pt-40">
      <div className="mx-auto w-full max-w-xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">VibeShack Studios · Booking status</p>
        <div aria-live="polite" aria-atomic="true">
          <h1 className="mb-6 text-4xl text-white sm:text-5xl">{message.title}</h1>
          <p className="text-base leading-relaxed text-zinc-300">{message.body}</p>
          {result?.status === 'confirmed' && <p className="mt-4 text-sm text-zinc-300">{result.emailSent ? 'Your booking confirmation has been sent. Check spam if you do not see it.' : 'We have not yet verified that your confirmation email was sent. Your studio time is already confirmed.'}</p>}
        </div>
        {result?.summary && (
          <div className="my-8 divide-y divide-white/10 rounded-lg border border-white/15 px-5">
            {result.summary.sessions.map((session, index) => (
              <div key={index} className="py-5">
                <h2 className="text-xl text-white">{session.studioName}</h2>
                {session.setupDescription && <p className="mt-3 text-sm font-semibold text-white">{session.setupDescription}</p>}
                <p className="mt-3 text-sm text-zinc-300">{session.date}<br />{session.time}<br />{session.duration}</p>
                {session.addOns.map((addOn) => <p key={addOn.name} className="mt-3 text-sm text-zinc-300">{addOn.name}: ${addOn.hourlyRate}/hr · ${addOn.amount.toFixed(2)}</p>)}
              </div>
            ))}
            <p className="flex justify-between py-5 font-semibold text-white"><span>Total paid</span><span>${result.summary.totalPaid.toFixed(2)}</span></p>
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-5">
          {sessionId && result?.status !== 'confirmed' && <button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-lg bg-brand-red px-6 py-3 text-sm font-bold text-white">Check again</button>}
          {!isPaid && <Link href="/book/" prefetch={false} className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white">Return to booking</Link>}
          <a href="mailto:founder@vibeshackstudios.com" className="text-sm text-zinc-300 underline">Contact the studio</a>
        </div>
        {result?.status === 'confirmed' && <p className="mt-8 text-sm leading-relaxed text-zinc-300">950 Battery St, San Francisco, CA 94111. See your booking email for arrival details. Free cancellation up to 48 hours before your session.</p>}
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return <Suspense fallback={<div className="min-h-screen px-6 pt-32 text-zinc-300" role="status">Checking your booking…</div>}><ConfirmationContent /></Suspense>
}

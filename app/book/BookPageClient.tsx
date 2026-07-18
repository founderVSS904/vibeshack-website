'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  RECURRING_OPTIONS,
  STUDIOS as DEFAULT_STUDIOS,
  calculateRecurringDiscountCents,
  type Studio,
} from '@/lib/booking/catalog'
import {
  getReferralPartner,
  REFERRAL_COOKIE,
  REFERRAL_MAX_AGE_SECONDS,
  REFERRAL_STORAGE_KEY,
} from '@/lib/booking/referrals'
import { GAEventType, sendGAEvent, trackBookingStep } from '@/lib/analytics'

const StripeEmbeddedCheckout = dynamic(() => import('@/components/StripeEmbeddedCheckout'), {
  ssr: false,
  loading: () => (
    <div className="py-16 text-center">
      <p className="text-sm text-zinc-500 animate-pulse">Preparing secure checkout…</p>
    </div>
  ),
})

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'room' | 'datetime' | 'extras' | 'review' | 'payment'
type Filter = 'podcast' | 'photo' | 'rental' | 'all'

interface Slot { time: string; label: string; available: boolean }

const STEP_ORDER: Exclude<Step, 'payment'>[] = ['room', 'datetime', 'extras', 'review']
const STEP_LABELS: Record<Exclude<Step, 'payment'>, string> = {
  room: 'Studio',
  datetime: 'Date & Time',
  extras: 'Extras',
  review: 'Review',
}
const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 8]
const SLOT_MS = 60 * 60 * 1000

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'podcast', label: 'Podcast' },
  { id: 'photo', label: 'Photo' },
  { id: 'rental', label: 'Rental' },
  { id: 'all', label: 'All Studios' },
]

function matchesFilter(studio: Studio, filter: Filter) {
  if (filter === 'all') return true
  if (filter === 'podcast') return studio.type === 'podcast'
  if (filter === 'photo') return studio.type === 'photo'
  return studio.id === 'green-screen' || studio.id === 'canvas-rental'
}

function filterForStudio(studio: Studio): Filter {
  if (studio.type === 'podcast') return 'podcast'
  return 'rental'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNext60Days() {
  return Array.from({ length: 60 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1); return d
  })
}

function padDatePart(value: number) { return String(value).padStart(2, '0') }

function formatDate(d: Date) {
  return `${d.getFullYear()}-${padDatePart(d.getMonth() + 1)}-${padDatePart(d.getDate())}`
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' })
}
function fmtEnd(iso: string, hrs: number) {
  const d = new Date(Date.parse(iso) + hrs * SLOT_MS)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' })
}
function fmtDateFull(ds: string) {
  return new Date(ds + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
function fmtDateShort(ds: string) {
  return new Date(ds + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function metaLine(studio: Studio) {
  return studio.description.split('. ').map((part) => part.replace(/\.$/, '')).filter(Boolean).join(' · ')
}

function checkoutErrorMessage(message: unknown) {
  if (typeof message !== 'string' || !message) return 'Payment could not be started. Please try again.'
  if (message.includes('no longer available') || message.includes('not available')) {
    return 'This slot is not available. Please choose another open time.'
  }
  return message
}

function readCookie(name: string) {
  if (typeof document === 'undefined') return ''
  const match = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : ''
}

function persistReferralSource(source: string) {
  if (typeof window === 'undefined') return
  const partner = getReferralPartner(source)
  if (!partner) return

  try {
    window.localStorage.setItem(REFERRAL_STORAGE_KEY, partner.id)
  } catch {}

  document.cookie = [
    `${REFERRAL_COOKIE}=${encodeURIComponent(partner.id)}`,
    'Path=/',
    `Max-Age=${REFERRAL_MAX_AGE_SECONDS}`,
    'SameSite=Lax',
    window.location.protocol === 'https:' ? 'Secure' : '',
  ].filter(Boolean).join('; ')
}

function readReferralSourceFromBrowser() {
  if (typeof window === 'undefined') return ''

  const params = new URLSearchParams(window.location.search)
  const candidates = [
    params.get('ref'),
    params.get('partner'),
    params.get('utm_source'),
    (() => {
      try {
        return window.localStorage.getItem(REFERRAL_STORAGE_KEY)
      } catch {
        return ''
      }
    })(),
    readCookie(REFERRAL_COOKIE),
  ]

  for (const candidate of candidates) {
    const partner = getReferralPartner(candidate)
    if (partner) return partner.id
  }

  return ''
}

function studioFromQuery(studios: Studio[]) {
  if (typeof window === 'undefined') return null
  const id = new URLSearchParams(window.location.search).get('studio')
  return id ? studios.find((s) => s.id === id) ?? null : null
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const iconProps = {
  className: 'h-4 w-4 shrink-0',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

const RoomIcon = () => (
  <svg {...iconProps}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M10 20v-10" /></svg>
)
const RateIcon = () => (
  <svg {...iconProps}><path d="M12 2v20M17 6.5H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6" /></svg>
)
const DateIcon = () => (
  <svg {...iconProps}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>
)
const TimeIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)
const DurationIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="13" r="8" /><path d="M12 9v4M10 2h4M12 2v3" /></svg>
)
const CheckCircleIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5.5" /></svg>
)

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ step, onJump }: { step: Step; onJump: (s: Exclude<Step, 'payment'>) => void }) {
  const activeIndex = step === 'payment' ? 3 : STEP_ORDER.indexOf(step)

  return (
    <div className="flex items-center">
      {STEP_ORDER.map((s, i) => {
        const done = i < activeIndex
        const active = i === activeIndex
        const clickable = done && step !== 'payment'
        return (
          <div key={s} className={`flex items-center ${i > 0 ? 'flex-1' : ''}`}>
            {i > 0 && (
              <div className="relative mx-4 h-px flex-1 bg-white/[0.12] sm:mx-6">
                <span
                  className="absolute inset-0 origin-left bg-brand-red transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `scaleX(${i <= activeIndex ? 1 : i === activeIndex + 1 ? 0.45 : 0})` }}
                />
              </div>
            )}
            <button
              type="button"
              onClick={clickable ? () => onJump(s) : undefined}
              disabled={!clickable}
              aria-current={active ? 'step' : undefined}
              className={`group flex items-center gap-3 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className="sr-only">{`Step ${i + 1}: ${STEP_LABELS[s]}${done ? ', completed' : ''}`}</span>
              <span
                aria-hidden="true"
                className={`flex h-9 w-9 items-center justify-center rounded-full border font-mono text-[11px] font-bold transition-colors ${
                  done
                    ? 'border-brand-red bg-brand-red text-white'
                    : active
                      ? 'border-brand-red text-brand-red'
                      : 'border-white/20 text-zinc-500'
                }`}
              >
                {done ? (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                ) : (
                  `0${i + 1}`
                )}
              </span>
              <span
                aria-hidden="true"
                className={`font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  active ? 'text-brand-red' : done ? `text-white ${clickable ? 'group-hover:text-brand-red' : ''}` : 'text-zinc-500'
                } ${active ? '' : 'hidden md:inline'}`}
              >
                {STEP_LABELS[s]}
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BookPageInnerProps {
  studios: Studio[]
}

function BookPageInner({ studios }: BookPageInnerProps) {
  // Room selection
  const [step, setStep] = useState<Step>(() => (studioFromQuery(studios) ? 'datetime' : 'room'))
  const [filter, setFilter] = useState<Filter>(() => {
    const linked = studioFromQuery(studios)
    return linked ? filterForStudio(linked) : 'podcast'
  })
  const [previewId, setPreviewId] = useState(() => {
    const linked = studioFromQuery(studios)
    if (linked) return linked.id
    return studios.find((s) => s.type === 'podcast')?.id ?? studios[0]?.id ?? ''
  })
  const [selectedId, setSelectedId] = useState(() => studioFromQuery(studios)?.id ?? '')
  const [photoIndex, setPhotoIndex] = useState(0)

  // Date & time
  const [duration, setDuration] = useState(1)
  const [date, setDate] = useState('')
  const [startSlot, setStartSlot] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [availabilityVerified, setAvailabilityVerified] = useState(true)
  const [monthOffset, setMonthOffset] = useState(0)

  // Extras
  const [recurring, setRecurring] = useState<string | null>(null)

  // Contact
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [teamEmails, setTeamEmails] = useState<string[]>([])
  const [teamInput, setTeamInput] = useState('')
  const [teamError, setTeamError] = useState('')

  // Checkout
  const [referralSource, setReferralSource] = useState(() => readReferralSourceFromBrowser())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [checkoutPublishableKey, setCheckoutPublishableKey] = useState('')
  const [checkoutClientSecret, setCheckoutClientSecret] = useState('')

  const railRef = useRef<HTMLDivElement>(null)
  const availabilityReqRef = useRef(0)

  useEffect(() => {
    const source = readReferralSourceFromBrowser()
    if (!source) return
    setReferralSource(source)
    persistReferralSource(source)
  }, [])

  // The global html/body overflow-x:hidden kills position:sticky; clip keeps
  // the same clipping without breaking the session sidebar.
  useEffect(() => {
    document.documentElement.classList.add('booking-flow')
    return () => document.documentElement.classList.remove('booking-flow')
  }, [])

  // ── Derived ──
  const previewStudio = studios.find((s) => s.id === previewId) ?? studios[0]
  const selectedStudio = selectedId ? studios.find((s) => s.id === selectedId) ?? null : null
  const filteredStudios = studios.filter((s) => matchesFilter(s, filter))

  const days = getNext60Days()
  const daysByMonth: Record<string, Date[]> = {}
  days.forEach((d) => {
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!daysByMonth[key]) daysByMonth[key] = []
    daysByMonth[key].push(d)
  })

  const startIndex = startSlot ? slots.findIndex((s) => s.time === startSlot) : -1
  const blockSlots = startIndex >= 0 ? slots.slice(startIndex, startIndex + duration).map((s) => s.time) : []
  const timeRange = blockSlots.length === duration && duration > 0
    ? `${fmtTime(blockSlots[0])} to ${fmtEnd(blockSlots[blockSlots.length - 1], 1)}`
    : ''

  const sessionSubtotal = selectedStudio ? selectedStudio.price * duration : 0
  const discountAmount = calculateRecurringDiscountCents(sessionSubtotal * 100, recurring) / 100
  const recurringDiscount = recurring ? RECURRING_OPTIONS.find((r) => r.id === recurring)?.discount || 0 : 0
  const grandTotal = sessionSubtotal - discountAmount

  const durationLocked = step === 'extras' || step === 'review' || step === 'payment'

  // A start slot works when every hour in the block is open and consecutive.
  const blockFits = (fromIndex: number, hours: number) => {
    for (let k = 0; k < hours; k++) {
      const slot = slots[fromIndex + k]
      if (!slot || !slot.available) return false
      if (k > 0 && Date.parse(slot.time) - Date.parse(slots[fromIndex + k - 1].time) !== SLOT_MS) return false
    }
    return true
  }

  const blockValid = startIndex >= 0 && blockSlots.length === duration && blockFits(startIndex, duration)
  const anyAvailable = slots.some((s) => s.available)
  const anyStartable = slots.some((_, i) => blockFits(i, duration))

  const continueReady =
    step === 'room' ? Boolean(selectedId)
      : step === 'datetime' ? Boolean(date && startSlot && blockValid)
        : step === 'extras' ? true
          : !submitting

  const continueLabel =
    step === 'room' ? 'Continue to Date & Time'
      : step === 'datetime' ? 'Continue to Extras'
        : step === 'extras' ? 'Continue to Review'
          : submitting ? 'Processing…' : `Lock In Session · $${grandTotal}`

  // ── Actions ──
  function previewRoom(id: string) {
    if (id === previewId) return
    setPreviewId(id)
    setPhotoIndex(0)
  }

  function changeFilter(next: Filter) {
    setFilter(next)
    const visible = studios.filter((s) => matchesFilter(s, next))
    if (visible.length && !visible.some((s) => s.id === previewId)) previewRoom(visible[0].id)
  }

  function selectRoom() {
    if (!previewStudio) return
    if (selectedId !== previewStudio.id) {
      availabilityReqRef.current++
      setSelectedId(previewStudio.id)
      setDate(''); setStartSlot(''); setSlots([]); setSlotsLoading(false); setError('')
      trackBookingStep('studio_select', { studio_id: previewStudio.id, studio_name: previewStudio.name, value: previewStudio.price, currency: 'USD' })
    }
  }

  async function selectDate(ds: string) {
    if (!selectedId) return
    // Only the latest request may write state; stale responses are dropped.
    const reqId = ++availabilityReqRef.current
    setDate(ds); setStartSlot(''); setSlotsLoading(true); setSlots([]); setAvailabilityVerified(true); setError('')
    trackBookingStep('date_select', { studio_id: selectedId, booking_date: ds })
    try {
      const res = await fetch(`/api/availability/?date=${ds}&studio=${selectedId}`)
      const data = await res.json()
      if (reqId !== availabilityReqRef.current) return
      setSlots(data.slots || [])
      // Any failure shows the availability banner; no separate error text needed here.
      setAvailabilityVerified(res.ok && data.verified !== false)
    } catch {
      if (reqId !== availabilityReqRef.current) return
      setSlots([])
      setAvailabilityVerified(false)
    }
    setSlotsLoading(false)
  }

  function pickStart(index: number) {
    const slot = slots[index]
    if (!slot || !blockFits(index, duration)) return
    setStartSlot(slot.time)
    trackBookingStep('time_select', { studio_id: selectedId, booking_date: date, slot_time: slot.time, hours: duration })
  }

  function changeDuration(next: number) {
    setDuration(next)
    if (startSlot) {
      const idx = slots.findIndex((s) => s.time === startSlot)
      if (idx < 0 || !blockFits(idx, next)) setStartSlot('')
    }
  }

  function goToStep(next: Exclude<Step, 'payment'>) {
    setError('')
    setStep(next)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      requestAnimationFrame(() => {
        document.getElementById('booking-step-headline')?.focus({ preventScroll: true })
      })
    }
  }

  function continueFlow() {
    if (!continueReady) return
    if (step === 'room') {
      goToStep('datetime')
    } else if (step === 'datetime' && selectedStudio) {
      sendGAEvent(GAEventType.ADD_TO_CART, {
        studio_id: selectedStudio.id,
        studio_name: selectedStudio.name,
        booking_date: date,
        hours: duration,
        value: sessionSubtotal,
        currency: 'USD',
      })
      goToStep('extras')
    } else if (step === 'extras') {
      trackBookingStep('cart_view', { studio_id: selectedId, value: grandTotal, currency: 'USD' })
      goToStep('review')
    } else if (step === 'review') {
      const form = document.getElementById('review-form') as HTMLFormElement | null
      form?.requestSubmit()
    }
  }

  // Mirrors the server's parseEmailList rules: valid format, lowercase, max 10.
  function addTeamEmail(raw: string) {
    const val = raw.trim().replace(/,$/, '').toLowerCase()
    if (!val) return true
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setTeamError('That does not look like an email address.')
      return false
    }
    if (teamEmails.length >= 10 && !teamEmails.includes(val)) {
      setTeamError('Up to 10 people can be copied on the confirmation.')
      return false
    }
    if (!teamEmails.includes(val)) setTeamEmails((prev) => [...prev, val])
    setTeamError('')
    return true
  }


  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStudio || !blockValid) {
      setError('Pick a studio, date, and start time first.')
      return
    }
    if (!name || !email) { setError('Name and email are required.'); return }
    setError(''); setSubmitting(true); setCheckoutClientSecret(''); setCheckoutPublishableKey('')
    trackBookingStep('checkout_start', {
      sessions: 1,
      value: grandTotal,
      currency: 'USD',
      studios: selectedStudio.id,
      referral_source: referralSource,
    })
    try {
      const res = await fetch('/api/create-checkout-session/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: [{
            studioId: selectedStudio.id,
            studioName: selectedStudio.name,
            date,
            slots: blockSlots,
            hours: duration,
            price: sessionSubtotal,
          }],
          recurring,
          recurringDiscount: discountAmount,
          totalAmount: grandTotal,
          name, email, phone,
          teamEmails,
          referralSource,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409 && date) {
          // The slot was taken while they reviewed. Send them back to the
          // calendar and refetch, so the stale opening cannot be re-picked.
          // selectDate clears error state, so the message is set after it.
          goToStep('datetime')
          void selectDate(date)
        }
        setError(checkoutErrorMessage(data.error))
        setSubmitting(false)
        return
      }
      if (data.clientSecret && data.publishableKey) {
        setCheckoutPublishableKey(data.publishableKey)
        setCheckoutClientSecret(data.clientSecret)
        trackBookingStep('payment_attempt', {
          sessions: 1,
          value: grandTotal,
          currency: 'USD',
          referral_source: referralSource,
        })
        setStep('payment')
        setSubmitting(false)
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      else { setError('Payment could not be started. Please try again.'); setSubmitting(false) }
    } catch { setError('Connection error. Try again.'); setSubmitting(false) }
  }

  const headline =
    step === 'room' ? 'Build your session'
      : step === 'datetime' ? 'Pick your time'
        : step === 'extras' ? 'Make it yours'
          : step === 'review' ? 'Lock it in'
            : 'Secure payment'

  const subline =
    step === 'room' ? 'Choose a studio, then select a date and time.'
      : step === 'datetime' ? 'All times Pacific. Availability is checked live.'
        : step === 'extras' ? 'Add what the session needs. Skip what it does not.'
          : step === 'review' ? 'Check the details, add your info, and lock it in.'
            : 'Card details are handled by Stripe. We never see them.'

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black pb-32 pt-24 lg:pb-24">
      <div className="mx-auto max-w-[1680px] px-6 sm:px-10 lg:px-16">

        <Stepper step={step} onJump={goToStep} />

        {/* Headline + filters */}
        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="booking-step-headline" tabIndex={-1} className="text-white outline-none" style={{ fontSize: 'clamp(2.75rem, 4vw, 4rem)' }}>
              {headline}<span className="text-brand-red">.</span>
            </h2>
            <p className="mt-3 text-sm text-zinc-400">{subline}</p>
          </div>
          {step === 'room' && (
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => changeFilter(f.id)}
                  className={`rounded-sm border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                    filter === f.id
                      ? 'border-brand-red text-brand-red'
                      : 'border-white/15 text-zinc-400 hover:border-white/35 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 2xl:grid-cols-[minmax(0,1fr)_400px] 2xl:gap-14">

          {/* ══════════════════ MAIN ══════════════════ */}
          <div key={step} className="booking-step-enter min-w-0">

            {/* ── STEP 1: ROOM ── */}
            {step === 'room' && previewStudio && (
              <div>
                <div className="flex flex-col gap-8 xl:flex-row 2xl:gap-12">
                  {/* Hero */}
                  <div className="relative h-[320px] min-w-0 overflow-hidden rounded-lg border border-white/[0.08] sm:h-[420px] xl:flex-1 2xl:h-[520px]">
                    <Image
                      key={previewStudio.photos[photoIndex] ?? previewStudio.heroImage}
                      src={previewStudio.photos[photoIndex] ?? previewStudio.heroImage}
                      alt={previewStudio.name}
                      fill
                      priority
                      quality={85}
                      sizes="(min-width: 1280px) 60vw, 100vw"
                      className="booking-media-enter object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 35%)' }} />
                    {previewStudio.photos.length > 1 && (
                      <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-white/70">
                          {photoIndex + 1}/{previewStudio.photos.length}
                        </span>
                        {[-1, 1].map((dir) => (
                          <button
                            key={dir}
                            type="button"
                            aria-label={dir < 0 ? 'Previous photo' : 'Next photo'}
                            onClick={() => setPhotoIndex((p) => (p + dir + previewStudio.photos.length) % previewStudio.photos.length)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition-colors hover:border-white/50"
                          >
                            <svg className={`h-4 w-4 ${dir < 0 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                              <path d="m9 6 6 6-6 6" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Room details */}
                  <div className="flex w-full shrink-0 flex-col justify-center xl:w-[300px] 2xl:w-[340px]">
                    <h3 className="text-white" style={{ fontSize: 'clamp(2.25rem, 2.6vw, 3rem)' }}>{previewStudio.name}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-zinc-400">{metaLine(previewStudio)}</p>
                    <p className="mt-6 flex items-baseline gap-2">
                      <span className="font-black text-white" style={{ fontSize: '2.25rem' }}>${previewStudio.price}</span>
                      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">/ Hour</span>
                    </p>
                    {selectedId === previewStudio.id ? (
                      <button
                        type="button"
                        onClick={() => goToStep('datetime')}
                        className="mt-7 inline-flex w-fit items-center gap-2.5 rounded-lg border border-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-brand-red transition-colors hover:bg-brand-red hover:text-white"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                          <path d="m5 12.5 4.5 4.5L19 7.5" />
                        </svg>
                        Studio selected
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={selectRoom}
                        className="mt-7 inline-flex w-fit items-center gap-2.5 rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700"
                      >
                        Select this studio <span aria-hidden>→</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Room rail */}
                <div className="relative mt-8">
                  <div ref={railRef} className="scrollbar-hide flex snap-x gap-4 overflow-x-auto pb-1">
                    {filteredStudios.map((s) => {
                      const isSelected = selectedId === s.id
                      const isPreview = previewId === s.id
                      return (
                        <button
                          key={s.id}
                          id={`room-card-${s.id}`}
                          type="button"
                          aria-pressed={isPreview}
                          onClick={() => previewRoom(s.id)}
                          className={`group w-[220px] shrink-0 snap-start overflow-hidden rounded-lg border text-left transition-colors ${
                            isSelected
                              ? 'border-brand-red ring-1 ring-brand-red'
                              : isPreview
                                ? 'border-white/40'
                                : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="relative h-[124px] overflow-hidden">
                            <Image src={s.heroImage} alt={s.name} fill quality={75} sizes="440px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" />
                            {isSelected && (
                              <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-red">
                                <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-3 bg-[#0d0d0d] px-4 py-3">
                            <span className="truncate font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-white">{s.name}</span>
                            <span className="shrink-0 font-mono text-[11px] text-zinc-500">${s.price}<span className="text-[9px]">/hr</span></span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  {filteredStudios.length > 5 && (
                    <button
                      type="button"
                      aria-label="Scroll studios"
                      onClick={() => railRef.current?.scrollBy({ left: 480, behavior: 'smooth' })}
                      className="absolute -right-3 top-[62px] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/80 text-white backdrop-blur transition-colors hover:border-white/40 lg:flex"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </button>
                  )}
                  {filteredStudios.length > 1 && (
                    <div className="mt-2 flex justify-center">
                      {filteredStudios.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          aria-label={`Show ${s.name}`}
                          aria-pressed={previewId === s.id}
                          onClick={() => {
                            previewRoom(s.id)
                            document.getElementById(`room-card-${s.id}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
                          }}
                          className="group/dot flex h-6 w-6 items-center justify-center"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full transition-colors ${previewId === s.id ? 'bg-brand-red' : 'bg-white/20 group-hover/dot:bg-white/40'}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 2: DATE & TIME ── */}
            {step === 'datetime' && selectedStudio && (
              <div>
                {error && <p className="mb-6 text-sm text-brand-red" role="alert">{error}</p>}
                <div className="mb-8 flex items-center justify-between border-b border-white/[0.08] pb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image src={selectedStudio.heroImage} alt={selectedStudio.name} fill sizes="128px" className="object-cover" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-white">{selectedStudio.name}</p>
                      <p className="font-mono text-xs text-zinc-500">${selectedStudio.price}/hr</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep('room')}
                    className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-white"
                  >
                    Change studio
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-10 md:grid-cols-[4fr_3fr] 2xl:gap-14">
                  {/* Calendar */}
                  <div>
                    <p className="mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white">Select a date</p>
                    {(() => {
                      const months = Object.entries(daysByMonth)
                      const currentIdx = Math.max(0, Math.min(monthOffset, months.length - 1))
                      const [month, monthDays] = months[currentIdx] || ['', []]
                      const anchor = monthDays[0]
                      const bookable = new Set(monthDays.map(formatDate))
                      const year = anchor?.getFullYear() ?? 0
                      const monthIndex = anchor?.getMonth() ?? 0
                      const daysInMonth = anchor ? new Date(year, monthIndex + 1, 0).getDate() : 0
                      const leadingBlanks = anchor ? new Date(year, monthIndex, 1).getDay() : 0
                      return (
                        <div>
                          <div className="mb-6 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}
                              disabled={monthOffset === 0}
                              className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              ← Prev
                            </button>
                            <p className="font-mono text-[13px] font-bold uppercase tracking-[0.26em] text-white">{month}</p>
                            <button
                              type="button"
                              onClick={() => setMonthOffset((m) => Math.min(months.length - 1, m + 1))}
                              disabled={monthOffset >= months.length - 1}
                              className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              Next →
                            </button>
                          </div>
                          <div className="mb-2 grid grid-cols-7 gap-1.5">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd) => (
                              <span key={wd} className="py-1 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                                {wd}
                              </span>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1.5">
                            {Array.from({ length: leadingBlanks }, (_, i) => (
                              <span key={`blank-${i}`} aria-hidden="true" />
                            ))}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                              const d = new Date(year, monthIndex, i + 1)
                              const ds = formatDate(d)
                              const inWindow = bookable.has(ds)
                              const sel = date === ds
                              return (
                                <button
                                  key={ds}
                                  type="button"
                                  disabled={!inWindow}
                                  aria-pressed={sel}
                                  aria-label={d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                  onClick={() => selectDate(ds)}
                                  className={`flex h-11 items-center justify-center rounded-lg text-[15px] transition-colors sm:h-12 2xl:h-14 ${
                                    sel
                                      ? 'bg-brand-red font-bold text-white'
                                      : inWindow
                                        ? 'font-medium text-zinc-300 hover:bg-white/[0.07] hover:text-white'
                                        : 'cursor-default font-medium text-zinc-700'
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Start times */}
                  <div>
                    <div className="mb-5 flex items-baseline justify-between">
                      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                        Start time{date ? ` · ${fmtDateShort(date)}` : ''}
                      </p>
                      <span className="relative lg:hidden">
                        <select
                          value={duration}
                          onChange={(e) => changeDuration(Number(e.target.value))}
                          aria-label="Session duration"
                          className="cursor-pointer appearance-none bg-transparent pr-4 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-white focus:outline-none [&>option]:bg-black"
                        >
                          {DURATION_OPTIONS.map((n) => (
                            <option key={n} value={n}>{n} hour{n > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                        <svg className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                      <p className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 lg:block">
                        {duration} hour{duration > 1 ? 's' : ''}
                      </p>
                    </div>
                    {!date && (
                      <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-white/10">
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Select a date first</p>
                      </div>
                    )}
                    {date && slotsLoading && (
                      <div className="flex h-44 items-center justify-center">
                        <p className="animate-pulse text-sm text-zinc-500">Checking availability…</p>
                      </div>
                    )}
                    {date && !slotsLoading && (
                      <>
                        {!availabilityVerified && (
                          <div className="mb-4 rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3" role="alert">
                            <p className="text-xs font-semibold leading-relaxed text-zinc-300">
                              Live availability is temporarily unavailable. Refresh, or contact us and we will book you in.
                            </p>
                          </div>
                        )}
                        {availabilityVerified && slots.length > 0 && !anyAvailable && (
                          <p className="mb-4 text-xs text-zinc-400" role="status">This day is fully booked. Try another date.</p>
                        )}
                        {availabilityVerified && anyAvailable && !anyStartable && (
                          <p className="mb-4 text-xs text-zinc-400" role="status">
                            No {duration}-hour openings on this day. Shorten the session or try another date.
                          </p>
                        )}
                        {anyStartable && (
                          <p className="mb-4 text-xs text-zinc-500">
                            Pick when you want to start. Your {duration}-hour block is held from there.
                          </p>
                        )}
                        <div className="max-h-[300px] overflow-y-auto pr-1">
                          <div className="grid grid-cols-3 gap-1.5">
                            {slots.map((slot, i) => {
                              const inBlock = startIndex >= 0 && i >= startIndex && i < startIndex + duration
                              const isStart = slot.time === startSlot
                              const fits = slot.available && blockFits(i, duration)
                              return (
                                <button
                                  key={slot.time}
                                  type="button"
                                  disabled={!fits}
                                  aria-pressed={isStart}
                                  aria-label={`${slot.label}${!slot.available ? ', booked' : !fits ? `, does not fit a ${duration}-hour block` : ''}`}
                                  onClick={() => pickStart(i)}
                                  className={`rounded-lg border py-3 font-mono text-xs transition-colors ${
                                    isStart
                                      ? 'border-brand-red bg-brand-red font-bold text-white'
                                      : inBlock
                                        ? 'border-brand-red/40 bg-brand-red/10 text-white'
                                        : !slot.available
                                          ? 'cursor-not-allowed border-white/5 text-zinc-600 line-through'
                                          : !fits
                                            ? 'cursor-not-allowed border-transparent text-zinc-600'
                                            : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
                                  }`}
                                >
                                  {slot.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {timeRange && (
                  <div className="mt-8 flex items-center justify-between border-t border-white/[0.08] pt-6">
                    <div>
                      <p className="text-lg font-bold text-white">{timeRange}</p>
                      <p className="mt-1 text-sm text-zinc-500">{fmtDateFull(date)} · {duration} hour{duration > 1 ? 's' : ''}</p>
                    </div>
                    <p className="font-black text-white" style={{ fontSize: '1.75rem' }}>${sessionSubtotal}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: EXTRAS ── */}
            {step === 'extras' && (
              <div className="max-w-2xl">
                <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white">Make it a standing booking</p>
                <p className="mb-5 text-sm text-zinc-500">Lock in this slot on a recurring schedule and save.</p>
                <div className="space-y-2">
                  {RECURRING_OPTIONS.map((opt) => {
                    const active = recurring === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setRecurring(active ? null : opt.id)}
                        className={`flex w-full items-center justify-between rounded-lg border px-5 py-4 text-left transition-colors ${
                          active ? 'border-brand-red bg-brand-red/5' : 'border-white/10 hover:border-white/25'
                        }`}
                      >
                        <span className="flex items-center gap-4">
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${active ? 'border-brand-red bg-brand-red' : 'border-white/30'}`}>
                            {active && <span className="h-2 w-2 rounded-full bg-white" />}
                          </span>
                          <span className="text-sm font-semibold text-white">{opt.label}</span>
                        </span>
                        <span className="font-mono text-xs font-bold text-brand-red">{opt.discount}% off</span>
                      </button>
                    )
                  })}
                </div>
                {recurring && (
                  <p className="mt-4 text-xs text-zinc-500">
                    You save ${discountAmount} on this order. Our team will reach out to confirm your recurring schedule.
                  </p>
                )}
              </div>
            )}

            {/* ── STEP 4: REVIEW ── */}
            {step === 'review' && selectedStudio && (
              <div className="max-w-2xl">
                <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white">Your session</p>
                <div className="flex items-center gap-5 border-b border-white/[0.08] pb-5">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                    <Image src={selectedStudio.heroImage} alt={selectedStudio.name} fill sizes="192px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-white">{selectedStudio.name}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">{fmtDateFull(date)}</p>
                    <p className="text-sm text-zinc-400">{timeRange} · {duration} hour{duration > 1 ? 's' : ''}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-bold text-white">${sessionSubtotal}</p>
                    <button
                      type="button"
                      onClick={() => goToStep('datetime')}
                      className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 transition-colors hover:text-white"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {recurring && (
                  <div className="border-b border-white/[0.08] py-5">
                    <div className="flex items-center justify-between py-1">
                      <p className="text-sm text-zinc-300">Recurring · {RECURRING_OPTIONS.find((r) => r.id === recurring)?.label}</p>
                      <p className="font-mono text-sm font-semibold text-brand-red">−${discountAmount}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToStep('extras')}
                      className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 transition-colors hover:text-white"
                    >
                      Edit extras
                    </button>
                  </div>
                )}

                <div className="flex items-baseline justify-between py-5">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">Total</p>
                  <p className="font-black text-white" style={{ fontSize: '2rem' }}>${grandTotal}</p>
                </div>

                <form id="review-form" onSubmit={handlePay} className="mt-4 space-y-8">
                  <div className="space-y-6">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white">Your details</p>
                    {[
                      { label: 'Full Name', type: 'text', val: name, set: setName, ph: 'Your name', req: true },
                      { label: 'Email', type: 'email', val: email, set: setEmail, ph: 'you@example.com', req: true },
                      { label: 'Phone', type: 'tel', val: phone, set: setPhone, ph: '+1 (415) 000-0000', req: false },
                    ].map(({ label, type, val, set, ph, req }) => {
                      const fieldId = `detail-${label.toLowerCase().replace(/\s+/g, '-')}`
                      return (
                        <div key={label}>
                          <label htmlFor={fieldId} className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                            {label}{!req && <span className="ml-2 normal-case tracking-normal text-zinc-500">optional</span>}
                          </label>
                          <input
                            id={fieldId}
                            type={type}
                            required={req}
                            value={val}
                            onChange={(e) => set(e.target.value)}
                            placeholder={ph}
                            className="w-full border-b border-white/20 bg-transparent pb-3 text-base text-white placeholder-zinc-500 transition-colors focus:border-white/50 focus:outline-none"
                          />
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t border-white/[0.08] pt-6">
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Who else needs to know?</p>
                    <p className="mb-5 text-xs text-zinc-500">Guests, co-hosts, crew, clients. Everyone gets a copy of the confirmation.</p>
                    <div className="flex min-h-[44px] flex-wrap items-center gap-2 border-b border-white/20 pb-3">
                      {teamEmails.map((em, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 rounded-sm bg-white/10 px-3 py-1.5 text-xs text-white">
                          {em}
                          <button
                            type="button"
                            aria-label={`Remove ${em}`}
                            onClick={() => setTeamEmails((p) => p.filter((_, j) => j !== i))}
                            className="-m-1 p-1 leading-none text-zinc-400 transition-colors hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="email"
                        value={teamInput}
                        aria-label="Add a team email"
                        onChange={(e) => { setTeamInput(e.target.value); if (teamError) setTeamError('') }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (addTeamEmail(teamInput)) setTeamInput('')
                            return
                          }
                          if ((e.key === ',' || e.key === ' ') && teamInput.trim()) {
                            e.preventDefault()
                            if (addTeamEmail(teamInput)) setTeamInput('')
                          }
                          if (e.key === 'Backspace' && !teamInput && teamEmails.length) {
                            setTeamEmails((p) => p.slice(0, -1))
                          }
                        }}
                        onBlur={() => {
                          if (addTeamEmail(teamInput)) setTeamInput('')
                        }}
                        placeholder={teamEmails.length === 0 ? 'their@email.com, press Enter to add more' : 'Add another…'}
                        className="min-w-[180px] flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    {teamError && <p className="mt-2 text-xs text-brand-red" role="alert">{teamError}</p>}
                    {!teamError && teamEmails.length > 0 && (
                      <p className="mt-2 text-xs text-zinc-500">{teamEmails.length} person{teamEmails.length > 1 ? 's' : ''} will receive the confirmation</p>
                    )}
                  </div>

                  <div className="border-t border-white/[0.08] pt-6">
                    <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Before you arrive</p>
                    <div className="space-y-3">
                      {selectedStudio.prep.map((tip, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <span className="mt-0.5 w-5 shrink-0 font-mono text-[11px] font-bold text-zinc-500">0{i + 1}</span>
                          <p className="text-sm leading-relaxed text-zinc-400">{tip}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-5 text-xs text-zinc-500">950 Battery St, SF 94111 · Northern Waterfront · Street parking on Battery St</p>
                  </div>

                  {error && <p className="text-sm text-brand-red" role="alert">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-brand-red py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
                  >
                    {submitting ? 'Processing…' : `Lock In Session · $${grandTotal}`}
                  </button>
                </form>
              </div>
            )}

            {/* ── PAYMENT ── */}
            {step === 'payment' && (
              <div className="max-w-2xl">
                <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                  Complete payment here on VibeShack. Your booking lands on the studio calendar only after payment succeeds.
                </p>
                {checkoutPublishableKey && checkoutClientSecret ? (
                  <div className="rounded-lg bg-white p-2 sm:p-4">
                    <StripeEmbeddedCheckout
                      publishableKey={checkoutPublishableKey}
                      clientSecret={checkoutClientSecret}
                    />
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <p className="animate-pulse text-sm text-zinc-500" role="status">Preparing secure checkout…</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutClientSecret('')
                    setCheckoutPublishableKey('')
                    goToStep('review')
                  }}
                  className="mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-white"
                >
                  ← Back to review
                </button>
              </div>
            )}
          </div>

          {/* ══════════════════ YOUR SESSION ══════════════════ */}
          <div className="hidden lg:block">
            <div className="sticky top-24 rounded-lg border border-white/10 bg-[#0b0b0b] p-6">
              <p className="text-[15px] font-bold uppercase tracking-[0.12em] text-white">Your Session</p>

              {selectedStudio ? (
                <div className="relative mt-5 h-40 overflow-hidden rounded-lg 2xl:h-44">
                  <Image src={selectedStudio.heroImage} alt={selectedStudio.name} fill quality={80} sizes="800px" className="object-cover" />
                </div>
              ) : (
                <div className="mt-5 flex h-40 items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] 2xl:h-44">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Pick a studio to start</p>
                </div>
              )}

              <div className="mt-2 divide-y divide-white/[0.06]">
                <div className="flex items-center gap-3 py-3.5 text-zinc-500">
                  <RoomIcon />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">Studio</span>
                  <span className={`ml-auto text-right text-[13px] ${selectedStudio ? 'text-white' : 'text-zinc-500'}`}>
                    {selectedStudio ? selectedStudio.name : 'Not selected'}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-3.5 text-zinc-500">
                  <RateIcon />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">Rate</span>
                  <span className={`ml-auto text-right text-[13px] ${selectedStudio ? 'text-white' : 'text-zinc-500'}`}>
                    {selectedStudio ? `$${selectedStudio.price}/hr` : 'Not selected'}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-3.5 text-zinc-500">
                  <DateIcon />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">Date</span>
                  <span className={`ml-auto text-right text-[13px] ${date ? 'text-white' : 'text-zinc-500'}`}>
                    {date ? fmtDateShort(date) : 'Not selected'}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-3.5 text-zinc-500">
                  <TimeIcon />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">Time</span>
                  <span className={`ml-auto text-right text-[13px] ${timeRange ? 'text-white' : 'text-zinc-500'}`}>
                    {timeRange || 'Not selected'}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-3.5 text-zinc-500">
                  <DurationIcon />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">Duration</span>
                  {durationLocked ? (
                    <span className="ml-auto text-right text-[13px] text-white">{duration} hour{duration > 1 ? 's' : ''}</span>
                  ) : (
                    <span className="relative ml-auto">
                      <select
                        value={duration}
                        onChange={(e) => changeDuration(Number(e.target.value))}
                        aria-label="Session duration"
                        className="cursor-pointer appearance-none bg-transparent pr-5 text-right text-[13px] text-white focus:outline-none [&>option]:bg-black"
                      >
                        {DURATION_OPTIONS.map((n) => (
                          <option key={n} value={n}>{n} hour{n > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="space-y-1 border-t border-white/[0.06] py-3">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Session</span><span>${sessionSubtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Recurring ({recurringDiscount}%)</span>
                      <span className="font-semibold text-brand-red">−${discountAmount}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-baseline justify-between border-t border-white/[0.06] pt-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Estimated total</p>
                <p className="font-black text-white" style={{ fontSize: '2rem' }}>
                  ${selectedStudio ? grandTotal : 0}
                </p>
              </div>

              {step !== 'payment' && (
                <button
                  type="button"
                  onClick={continueFlow}
                  disabled={!continueReady}
                  className={`mt-5 w-full rounded-lg py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] transition-colors ${
                    continueReady
                      ? 'bg-brand-red text-white hover:bg-red-700'
                      : 'cursor-not-allowed bg-white/[0.04] text-zinc-600'
                  }`}
                >
                  {continueLabel} {continueReady && step !== 'review' ? <span aria-hidden>→</span> : null}
                </button>
              )}

              <div className="mt-4 flex items-start gap-2.5 text-zinc-500">
                <CheckCircleIcon />
                <p className="text-xs leading-relaxed">Free cancellation up to 48 hours before the session.</p>
              </div>

              <div className="mt-5 border-t border-white/[0.06] pt-5 text-center">
                <p className="text-xs text-zinc-500">Need help choosing?</p>
                <Link
                  href="/find-your-studio/"
                  className="mt-1 inline-block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red transition-colors hover:text-red-400"
                >
                  Match me to a studio <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════ MOBILE BAR ══════════════════ */}
      {step !== 'payment' && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95 px-5 pt-3.5 backdrop-blur lg:hidden"
          style={{ paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-black text-white" style={{ fontSize: '1.4rem' }}>
                ${selectedStudio ? grandTotal : 0}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
                {STEP_LABELS[step as Exclude<Step, 'payment'>]}
              </p>
            </div>
            <button
              type="button"
              onClick={continueFlow}
              disabled={!continueReady}
              className={`rounded-lg px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-[0.16em] transition-colors ${
                continueReady
                  ? 'bg-brand-red text-white hover:bg-red-700'
                  : 'cursor-not-allowed bg-white/[0.06] text-zinc-600'
              }`}
            >
              {step === 'review' ? (submitting ? 'Processing…' : 'Lock In Session') : continueLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function BookingSkeleton() {
  return (
    <div className="mx-auto min-h-screen max-w-[1680px] px-6 pb-32 pt-28 sm:px-10 lg:px-16" aria-busy="true" aria-label="Loading booking">
      <div className="h-4 w-40 rounded bg-white/[0.06]" />
      <div className="mt-6 h-12 w-72 max-w-full rounded bg-white/[0.08]" />
      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <div className="space-y-6">
          <div className="h-8 w-full max-w-md rounded bg-white/[0.05]" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="aspect-[4/3] rounded-lg bg-white/[0.04]" />
            ))}
          </div>
        </div>
        <div className="hidden h-80 rounded-lg border border-white/[0.08] bg-white/[0.02] lg:block" />
      </div>
    </div>
  )
}

const BookPageClient = dynamic(() => Promise.resolve(BookPageInner), {
  ssr: false,
  loading: () => <BookingSkeleton />,
})

export default function BookPage() {
  return <BookPageClient studios={DEFAULT_STUDIOS} />
}

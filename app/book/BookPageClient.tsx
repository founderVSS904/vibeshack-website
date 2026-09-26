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
import {
  MAX_BOOKING_SLOTS,
  MIN_BOOKING_SLOTS,
  SLOT_DURATION_MS,
  bookingDateRange,
  bookingHoursForSlotCount,
  bookingPriceCents,
  formatBookingDuration,
} from '@/lib/booking/time'
import { GAEventType, sendGAEvent, trackBookingStep } from '@/lib/analytics'
import { bookingAddOnLabel, bookingAddOnTotalCents, priceBookingAddOns } from '@/lib/booking/add-ons'
import { PENDING_CHECKOUT_STORAGE_KEY } from '@/lib/booking/confirmation-state'
import { STUDIO_TURNAROUND_MINUTES } from '@/lib/booking/turnaround'
import { parsePendingCheckout, pendingCheckoutMatchesSelection, type PendingCheckoutState } from '@/lib/booking/pending-checkout'
import {
  EDITABLE_BOOKING_STEPS,
  bookingStepIsReady,
  stepAfterPrimarySelection,
  type BookingStep as Step,
  type EditableBookingStep,
} from '@/lib/booking/step-flow'
import StudioSetupPicker from '@/components/StudioSetupPicker'
import BookingAddOnPicker from '@/components/BookingAddOnPicker'
import BookingReviewCard, { bookingDisplayPrice } from '@/components/BookingReviewCard'
import BookingContactFields from '@/components/BookingContactFields'
import BookingPodcastNote from '@/components/BookingPodcastNote'
import styles from './Checkout.module.css'
import { getStudioSetup, getStudioSetups, type StudioSetupId } from '@/lib/booking/studio-setups'

const StripeEmbeddedCheckout = dynamic(() => import('@/components/StripeEmbeddedCheckout'), {
  ssr: false,
  loading: () => (
    <div className="py-16 text-center">
      <p className="text-sm text-zinc-500 animate-pulse">Preparing secure checkout…</p>
    </div>
  ),
})

// ─── Types ────────────────────────────────────────────────────────────────────

type Filter = 'podcast' | 'photo' | 'rental' | 'all'

interface Slot { time: string; label: string; available: boolean }

const STEP_LABELS: Record<EditableBookingStep, string> = {
  room: 'Studio',
  datetime: 'Date & Time',
  extras: 'Extras',
  review: 'Review',
}
const DURATION_SLOT_OPTIONS = Array.from(
  { length: MAX_BOOKING_SLOTS - MIN_BOOKING_SLOTS + 1 },
  (_, index) => MIN_BOOKING_SLOTS + index,
)

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
  return bookingDateRange(60).map((date) => new Date(`${date}T12:00:00`))
}

function padDatePart(value: number) { return String(value).padStart(2, '0') }

function formatDate(d: Date) {
  return `${d.getFullYear()}-${padDatePart(d.getMonth() + 1)}-${padDatePart(d.getDate())}`
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' })
}
function fmtEnd(iso: string) {
  const d = new Date(Date.parse(iso) + SLOT_DURATION_MS)
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

function readPendingCheckout() {
  if (typeof window === 'undefined') return null

  try {
    return parsePendingCheckout(window.sessionStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY))
  } catch {
    return null
  }
}

function writePendingCheckout(checkout: PendingCheckoutState) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(PENDING_CHECKOUT_STORAGE_KEY, JSON.stringify(checkout))
  } catch {}
}

function clearPendingCheckout() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY)
  } catch {}
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
const CheckCircleIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5.5" /></svg>
)

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ step, onJump, locked = false }: { step: Step; onJump: (s: EditableBookingStep) => void; locked?: boolean }) {
  const activeIndex = step === 'payment' ? 3 : EDITABLE_BOOKING_STEPS.indexOf(step)

  return (
    <div className="flex items-center">
      {EDITABLE_BOOKING_STEPS.map((s, i) => {
        const done = i < activeIndex
        const active = i === activeIndex
        const clickable = done && step !== 'payment' && !locked
        return (
          <div key={s} className={`flex min-w-0 items-center ${i > 0 ? 'flex-1' : ''}`}>
            {i > 0 && (
              <div className="relative mx-2 h-px flex-1 bg-white/[0.12] sm:mx-6">
                <span
                  className="absolute inset-0 origin-left bg-white/60 motion-safe:transition-transform motion-safe:duration-500"
                  style={{ transform: `scaleX(${i <= activeIndex ? 1 : i === activeIndex + 1 ? 0.45 : 0})` }}
                />
              </div>
            )}
            <button
              type="button"
              onClick={clickable ? () => onJump(s) : undefined}
              disabled={!clickable}
              aria-current={active ? 'step' : undefined}
              className={`group flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:gap-3 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className="sr-only">{`Step ${i + 1}: ${STEP_LABELS[s]}${done ? ', completed' : ''}`}</span>
              <span
                aria-hidden="true"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-bold transition-colors ${
                  done
                    ? 'border-white/25 bg-white/10 text-white'
                    : active
                      ? 'border-white bg-white text-black'
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
                  active ? 'text-white' : done ? `text-zinc-300 ${clickable ? 'group-hover:text-white' : ''}` : 'text-zinc-500'
                } ${active ? 'hidden min-[400px]:inline' : 'hidden md:inline'}`}
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

interface InitialBookingSelection {
  initialStudioId?: string
  initialSetupId?: StudioSetupId
  hasSetupRequest?: boolean
}

interface BookPageInnerProps extends InitialBookingSelection {
  studios: Studio[]
}

function BookPageInner({ studios, initialStudioId = '', initialSetupId, hasSetupRequest = false }: BookPageInnerProps) {
  const linkedStudio = studios.find((studio) => studio.id === initialStudioId) || null
  // Room selection
  const [step, setStep] = useState<Step>(() => (linkedStudio ? 'datetime' : 'room'))
  const [filter, setFilter] = useState<Filter>(() => {
    return linkedStudio ? filterForStudio(linkedStudio) : 'podcast'
  })
  const [previewId, setPreviewId] = useState(() => {
    if (linkedStudio) return linkedStudio.id
    return studios.find((s) => s.type === 'podcast')?.id ?? studios[0]?.id ?? ''
  })
  const [selectedId, setSelectedId] = useState(() => linkedStudio?.id ?? '')
  const [setupId, setSetupId] = useState(() => getStudioSetup(initialStudioId, initialSetupId)?.id || '')
  const [photoIndex, setPhotoIndex] = useState(0)

  // Date & time
  const [durationSlots, setDurationSlots] = useState(MIN_BOOKING_SLOTS)
  const [date, setDate] = useState('')
  const [startSlot, setStartSlot] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [availabilityVerified, setAvailabilityVerified] = useState(true)
  const [monthOffset, setMonthOffset] = useState(0)

  // Extras
  const [recurring, setRecurring] = useState<string | null>(null)
  const [addOnIds, setAddOnIds] = useState<string[]>([])
  const [remotePodcastPlatform, setRemotePodcastPlatform] = useState('')

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
  const [checkoutSessionId, setCheckoutSessionId] = useState('')
  const [checkoutManagementToken, setCheckoutManagementToken] = useState('')
  const [checkoutCancelling, setCheckoutCancelling] = useState(false)
  const [checkoutSelectionConflict, setCheckoutSelectionConflict] = useState(false)

  const railRef = useRef<HTMLDivElement>(null)
  const availabilityReqRef = useRef(0)
  const checkoutCreatingRef = useRef(false)
  const requestedSelectionRef = useRef<{ studioId: string; setupId?: StudioSetupId } | null>(null)

  useEffect(() => {
    const source = readReferralSourceFromBrowser()
    if (!source) return
    setReferralSource(source)
    persistReferralSource(source)
  }, [])

  useEffect(() => {
    const pending = readPendingCheckout()
    if (!pending) return

    const studio = studios.find((item) => item.id === pending.selectedId)
    if (!studio) {
      clearPendingCheckout()
      return
    }

    const requestedStudio = studios.find((item) => item.id === initialStudioId)
    if (requestedStudio && !pendingCheckoutMatchesSelection(pending, {
      studioId: requestedStudio.id,
      setupId: hasSetupRequest ? initialSetupId || '' : undefined,
    })) {
      requestedSelectionRef.current = {
        studioId: requestedStudio.id,
        setupId: initialSetupId,
      }
      setCheckoutSelectionConflict(true)
    }

    setSelectedId(studio.id)
    setSetupId(getStudioSetup(studio.id, pending.setupId)?.id || '')
    setPreviewId(studio.id)
    setFilter(filterForStudio(studio))
    setDurationSlots(pending.durationSlots)
    setDate(pending.date)
    setStartSlot(pending.startSlot)
    setSlots(pending.slots)
    setRecurring(pending.recurring)
    setAddOnIds(pending.addOnIds || [])
    setRemotePodcastPlatform(pending.remotePodcastPlatform || '')
    setName(pending.name)
    setEmail(pending.email)
    setPhone(pending.phone)
    setTeamEmails(pending.teamEmails)
    setCheckoutPublishableKey(pending.publishableKey)
    setCheckoutClientSecret(pending.clientSecret)
    setCheckoutSessionId(pending.sessionId)
    setCheckoutManagementToken(pending.managementToken)
    setStep('payment')
  }, [studios, initialStudioId, initialSetupId, hasSetupRequest])

  // The global html/body overflow-x:hidden kills position:sticky; clip keeps
  // the same clipping without breaking the session sidebar.
  useEffect(() => {
    document.documentElement.classList.add('booking-flow')
    return () => document.documentElement.classList.remove('booking-flow')
  }, [])

  // ── Derived ──
  const previewStudio = studios.find((s) => s.id === previewId) ?? studios[0]
  const selectedStudio = selectedId ? studios.find((s) => s.id === selectedId) ?? null : null
  const selectedSetup = getStudioSetup(selectedId, setupId)
  const requiresSetup = getStudioSetups(selectedId).length > 0
  const setupReady = !requiresSetup || Boolean(selectedSetup)
  const filteredStudios = studios.filter((s) => matchesFilter(s, filter))

  const days = getNext60Days()
  const daysByMonth: Record<string, Date[]> = {}
  days.forEach((d) => {
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!daysByMonth[key]) daysByMonth[key] = []
    daysByMonth[key].push(d)
  })

  const startIndex = startSlot ? slots.findIndex((s) => s.time === startSlot) : -1
  const durationHours = bookingHoursForSlotCount(durationSlots)
  const durationLabel = formatBookingDuration(durationSlots)
  const blockSlots = startIndex >= 0 ? slots.slice(startIndex, startIndex + durationSlots).map((s) => s.time) : []
  const timeRange = blockSlots.length === durationSlots
    ? `${fmtTime(blockSlots[0])} to ${fmtEnd(blockSlots[blockSlots.length - 1])}`
    : ''

  const sessionSubtotal = selectedStudio ? bookingPriceCents(selectedStudio.price, durationSlots) / 100 : 0
  const discountAmount = calculateRecurringDiscountCents(sessionSubtotal * 100, recurring) / 100
  const recurringDiscount = recurring ? RECURRING_OPTIONS.find((r) => r.id === recurring)?.discount || 0 : 0
  const selectedAddOns = priceBookingAddOns(addOnIds, durationSlots, remotePodcastPlatform)
  const addOnTotal = bookingAddOnTotalCents(selectedAddOns) / 100
  const grandTotal = sessionSubtotal - discountAmount + addOnTotal

  // A start slot works when every half-hour in the block is open and consecutive.
  const blockFits = (fromIndex: number, slotCount: number) => {
    for (let k = 0; k < slotCount; k++) {
      const slot = slots[fromIndex + k]
      if (!slot || !slot.available) return false
      if (k > 0 && Date.parse(slot.time) - Date.parse(slots[fromIndex + k - 1].time) !== SLOT_DURATION_MS) return false
    }
    return true
  }

  const durationOptionsForStart = (fromIndex: number) =>
    DURATION_SLOT_OPTIONS.filter((slotCount) => blockFits(fromIndex, slotCount))

  const blockValid = startIndex >= 0 && blockSlots.length === durationSlots && blockFits(startIndex, durationSlots)
  const anyAvailable = slots.some((s) => s.available)
  const anyStartable = slots.some((_, i) => durationOptionsForStart(i).length > 0)
  const selectedStartDurations = startIndex >= 0 ? durationOptionsForStart(startIndex) : []

  const continueReady = bookingStepIsReady({
    step,
    hasStudio: Boolean(selectedId),
    hasValidTime: Boolean(date && startSlot && blockValid),
    setupReady,
    submitting,
  })

  const continueLabel =
    step === 'room' ? 'Continue to Date & Time'
      : step === 'datetime' ? 'Continue to Extras'
        : step === 'extras' ? 'Continue to Review'
          : submitting ? 'Preparing payment…' : 'Continue to payment'

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
      setSetupId('')
      setDate(''); setStartSlot(''); setSlots([]); setSlotsLoading(false); setError('')
      trackBookingStep('studio_select', { studio_id: previewStudio.id, studio_name: previewStudio.name, value: previewStudio.price, currency: 'USD' })
    }
    goToStep(stepAfterPrimarySelection('room'))
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
    const options = slot ? durationOptionsForStart(index) : []
    if (!slot || !slot.available || options.length === 0) return
    setStartSlot(slot.time)
    if (!options.includes(durationSlots)) setDurationSlots(options[0])
  }

  function pickDuration(next: number) {
    if (startIndex < 0 || !blockFits(startIndex, next)) return
    setDurationSlots(next)
    trackBookingStep('time_select', {
      studio_id: selectedId,
      booking_date: date,
      slot_time: startSlot,
      hours: bookingHoursForSlotCount(next),
    })
    advanceToExtras(next)
  }

  function goToStep(next: EditableBookingStep) {
    if (checkoutCreatingRef.current) return
    setError('')
    setStep(next)
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' })
        document.getElementById('booking-step-headline')?.focus({ preventScroll: true })
      })
    }
  }

  function advanceToExtras(nextDurationSlots = durationSlots) {
    if (!selectedStudio || !date) return
    const nextDurationHours = bookingHoursForSlotCount(nextDurationSlots)
    const nextSessionSubtotal = bookingPriceCents(selectedStudio.price, nextDurationSlots) / 100
    sendGAEvent(GAEventType.ADD_TO_CART, {
      studio_id: selectedStudio.id,
      studio_name: selectedStudio.name,
      booking_date: date,
      hours: nextDurationHours,
      value: nextSessionSubtotal,
      currency: 'USD',
    })
    goToStep(stepAfterPrimarySelection('datetime'))
  }

  function continueFlow() {
    if (!continueReady) return
    if (step === 'room') {
      goToStep('datetime')
    } else if (step === 'datetime' && selectedStudio) {
      advanceToExtras()
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
    if (checkoutCreatingRef.current) return
    if (!setupReady) {
      goToStep('extras')
      setError(`Choose a setup for ${selectedStudio?.name || 'this studio'} before continuing.`)
      return
    }
    if (!selectedStudio || !blockValid) {
      setError('Pick a studio, date, and start time first.')
      return
    }
    if (!name || !email) { setError('Name and email are required.'); return }
    setError('')
    checkoutCreatingRef.current = true
    setSubmitting(true)
    setCheckoutClientSecret('')
    setCheckoutPublishableKey('')
    setCheckoutSessionId('')
    setCheckoutManagementToken('')
    clearPendingCheckout()
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
            hours: durationHours,
            price: sessionSubtotal,
            addOnIds,
            remotePodcastPlatform,
            setupId: selectedSetup?.id,
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
        checkoutCreatingRef.current = false
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
      if (data.clientSecret && data.publishableKey && data.sessionId && data.managementToken && data.expiresAt) {
        setCheckoutPublishableKey(data.publishableKey)
        setCheckoutClientSecret(data.clientSecret)
        setCheckoutSessionId(data.sessionId)
        setCheckoutManagementToken(data.managementToken)
        writePendingCheckout({
          version: 1,
          clientSecret: data.clientSecret,
          publishableKey: data.publishableKey,
          sessionId: data.sessionId,
          managementToken: data.managementToken,
          expiresAt: data.expiresAt,
          selectedId: selectedStudio.id,
          setupId: selectedSetup?.id,
          durationSlots,
          date,
          startSlot,
          slots,
          recurring,
          addOnIds,
          remotePodcastPlatform,
          name,
          email,
          phone,
          teamEmails,
        })
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
    } catch { setError('Connection error. Try again.') }
    finally { checkoutCreatingRef.current = false; setSubmitting(false) }
  }

  async function changeCheckoutDetails() {
    if (!checkoutSessionId || !checkoutManagementToken || checkoutCancelling) return

    setCheckoutCancelling(true)
    setError('')

    try {
      const res = await fetch('/api/cancel-checkout-session/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: checkoutSessionId,
          managementToken: checkoutManagementToken,
        }),
      })
      const data = await res.json()

      if (data.code === 'booking_completed' && data.confirmationUrl) {
        // Verification decides when to clear the draft, including unpaid-complete sessions.
        window.location.assign(data.confirmationUrl)
        return
      }

      if (!res.ok || !data.released) {
        setError(data.error || 'We could not reopen this time yet. Please try again.')
        return
      }

      setCheckoutClientSecret('')
      setCheckoutPublishableKey('')
      setCheckoutSessionId('')
      setCheckoutManagementToken('')
      clearPendingCheckout()
      const requested = requestedSelectionRef.current
      requestedSelectionRef.current = null
      setCheckoutSelectionConflict(false)
      if (requested) {
        const nextStudio = studios.find((studio) => studio.id === requested.studioId)
        if (nextStudio) {
          setSelectedId(nextStudio.id)
          setPreviewId(nextStudio.id)
          setPhotoIndex(0)
          setSetupId(requested.setupId || '')
          setFilter(filterForStudio(nextStudio))
        }
      }
      goToStep('datetime')
      if (requested && requested.studioId !== selectedId) {
        availabilityReqRef.current++
        setDate(''); setStartSlot(''); setSlots([]); setSlotsLoading(false)
      } else if (date) await selectDate(date)
    } catch {
      setError('Connection error. Your current checkout is still protected. Please try again.')
    } finally {
      setCheckoutCancelling(false)
    }
  }

  const headline =
    step === 'room' ? 'Build your session'
      : step === 'datetime' ? 'Pick your time'
        : step === 'extras' ? 'Make it yours'
          : step === 'review' ? 'Review your session'
            : 'Secure payment'

  const subline =
    step === 'room' ? 'Choose a studio, then select a date and time.'
      : step === 'datetime' ? 'Choose a date and available start time. All times Pacific.'
      : step === 'extras' ? (requiresSetup ? 'Choose your setup, then add optional equipment or recurring savings.' : 'Optional equipment and recurring savings. Studio-only is always an option.')
          : step === 'review' ? 'Check your session and add your details. You’ll confirm and pay in the next step.'
            : 'Card details are handled by Stripe. We never see them.'

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`${styles.checkout} min-h-screen bg-black pb-32 pt-24 lg:pb-24`}>
      <div className="mx-auto max-w-[1680px] px-6 sm:px-10 lg:px-16">

        <Stepper step={step} onJump={goToStep} locked={submitting || checkoutCancelling} />

        {/* Headline + filters */}
        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="booking-step-headline" tabIndex={-1} className="brand-sans font-semibold leading-[1.1] !tracking-[-0.045em] text-white outline-none" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              {headline}
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
                  className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium motion-safe:transition-colors ${
                    filter === f.id
                      ? 'border-white bg-white text-black'
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
                    className="min-h-11 rounded-lg px-2 text-sm font-medium text-zinc-300 underline underline-offset-4 transition-colors hover:text-white"
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
                              className="min-h-11 rounded-lg text-sm text-zinc-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              ← Prev
                            </button>
                            <p className="font-mono text-[13px] font-bold uppercase tracking-[0.26em] text-white">{month}</p>
                            <button
                              type="button"
                              onClick={() => setMonthOffset((m) => Math.min(months.length - 1, m + 1))}
                              disabled={monthOffset >= months.length - 1}
                              className="min-h-11 rounded-lg text-sm text-zinc-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
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
                                      ? 'bg-white font-semibold text-black'
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
                    <div className="mb-5">
                      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                        Start time{date ? ` · ${fmtDateShort(date)}` : ''}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                        Pick a start time, then choose how long you want to book from that time.
                      </p>
                    </div>
                    {selectedStudio.type === 'podcast' && <BookingPodcastNote />}
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
                          <p className="mb-4 text-xs text-zinc-400" role="status">No times remain available on this day. Try another date.</p>
                        )}
                        {availabilityVerified && anyAvailable && !anyStartable && (
                          <p className="mb-4 text-xs text-zinc-400" role="status">
                            No available start times remain on this day. Try another date.
                          </p>
                        )}
                        {anyStartable && (
                          <div className="mb-4 space-y-2">
                            <p className="text-xs text-zinc-500">
                              Available start times are shown below. Session length options appear after you choose a start.
                            </p>
                            <p className="text-sm leading-relaxed text-zinc-400">
                              We reserve {STUDIO_TURNAROUND_MINUTES} minutes after your session for studio turnaround, at no extra charge.
                            </p>
                          </div>
                        )}
                        <div className="max-h-[300px] overflow-y-auto pr-1">
                          <div className="grid grid-cols-3 gap-1.5">
                            {slots.map((slot, i) => {
                              const inBlock = startIndex >= 0 && i >= startIndex && i < startIndex + durationSlots
                              const isStart = slot.time === startSlot
                              const startDurations = slot.available ? durationOptionsForStart(i) : []
                              const fits = startDurations.length > 0
                              return (
                                <button
                                  key={slot.time}
                                  type="button"
                                  disabled={!fits}
                                  aria-pressed={isStart}
                                  aria-label={`${slot.label}${!slot.available ? ', unavailable' : !fits ? ', no session length fits' : isStart ? ', selected, choose a session length below' : ', available'}`}
                                  onClick={() => pickStart(i)}
                                  className={`min-h-11 rounded-xl border py-3 text-[13px] motion-safe:transition-colors ${
                                    isStart
                                      ? 'border-white bg-white font-semibold text-black'
                                      : inBlock
                                        ? 'border-white/30 bg-white/10 text-white'
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
                        {startSlot && selectedStartDurations.length > 0 && (
                          <div className="mt-4 rounded-[20px] border border-white/15 bg-[#141416] p-4" aria-label={`Session length options for ${fmtTime(startSlot)}`}>
                            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                              How long from {fmtTime(startSlot)}?
                            </p>
                            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                              Choose the number of hours you need. The booking will start at the time above.
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                              {selectedStartDurations.map((slotCount) => {
                                const selected = durationSlots === slotCount
                                return (
                                  <button
                                    key={slotCount}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => pickDuration(slotCount)}
                                    className={`min-h-11 rounded-xl border px-3 py-2.5 text-left text-sm motion-safe:transition-colors ${
                                      selected
                                        ? 'border-white bg-white font-semibold text-black'
                                        : 'border-white/15 text-zinc-300 hover:border-white/40 hover:text-white'
                                    }`}
                                  >
                                    {formatBookingDuration(slotCount)}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {timeRange && (
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
                    <div>
                      <p className="text-lg font-bold text-white">{timeRange}</p>
                      <p className="mt-1 text-sm text-zinc-500">{fmtDateFull(date)} · {durationLabel}</p>
                    </div>
                    <p className="text-2xl font-semibold tracking-tight text-white">{bookingDisplayPrice(sessionSubtotal)}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: EXTRAS ── */}
            {step === 'extras' && (
              <div className="max-w-2xl">
                {error && <p className="mb-6 text-sm text-brand-red" role="alert">{error}</p>}
                {requiresSetup && selectedStudio && (
                  <div className="mb-10">
                    <StudioSetupPicker
                      id="booking"
                      studioId={selectedId}
                      value={setupId}
                      onChange={(nextSetupId) => { setSetupId(nextSetupId); setError('') }}
                      wide
                    />
                  </div>
                )}
                <div className={`mb-10 ${requiresSetup ? 'border-t border-white/[0.08] pt-8' : ''}`}>
                  <BookingAddOnPicker
                    selectedIds={addOnIds}
                    durationSlots={durationSlots}
                    remotePlatform={remotePodcastPlatform}
                    onToggle={(id) => setAddOnIds((current) => current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id])}
                    onPlatformChange={setRemotePodcastPlatform}
                  />
                </div>
                <h3 className="brand-sans mb-2 text-[22px] font-semibold leading-snug !tracking-[-0.035em] text-white">Make it a standing booking</h3>
                <p className="mb-5 text-sm text-zinc-300">Request a recurring schedule and save on studio time. Add-ons are not discounted.</p>
                <div className="space-y-2">
                  {RECURRING_OPTIONS.map((opt) => {
                    const active = recurring === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setRecurring(active ? null : opt.id)}
                        className={`flex min-h-[72px] w-full items-center justify-between gap-4 rounded-[20px] border px-5 py-4 text-left motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                          active ? 'border-white/45 bg-[#1c1c1e]' : 'border-white/10 bg-[#141416] hover:border-white/25'
                        }`}
                      >
                        <span className="flex items-center gap-4">
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${active ? 'border-white bg-white' : 'border-white/30'}`}>
                            {active && <span className="h-2 w-2 rounded-full bg-black" />}
                          </span>
                          <span className="text-sm font-semibold text-white">{opt.label}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-zinc-200">{opt.discount}% off</span>
                      </button>
                    )
                  })}
                </div>
                {recurring && (
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                    You save ${discountAmount} on this session. Today&apos;s payment covers this session only. Our team will confirm future dates with you separately.
                  </p>
                )}
              </div>
            )}

            {/* ── STEP 4: REVIEW ── */}
            {step === 'review' && selectedStudio && (
              <div className="max-w-2xl">
                <BookingReviewCard
                  studioName={selectedStudio.name}
                  image={selectedSetup?.image || selectedStudio.heroImage}
                  imageAlt={selectedSetup?.alt || selectedStudio.name}
                  dateLabel={fmtDateFull(date)}
                  timeRange={timeRange}
                  durationLabel={durationLabel}
                  hourlyRate={selectedStudio.price}
                  sessionSubtotal={sessionSubtotal}
                  addOns={selectedAddOns}
                  recurringLabel={RECURRING_OPTIONS.find((option) => option.id === recurring)?.label}
                  discountAmount={discountAmount}
                  total={grandTotal}
                  requiresSetup={requiresSetup}
                  setupLabel={selectedSetup?.label}
                  disabled={submitting}
                  onEditTime={() => goToStep('datetime')}
                  onEditExtras={() => goToStep('extras')}
                />

                <form id="review-form" onSubmit={handlePay} className="mt-6 space-y-6">
                  <BookingContactFields
                    name={name} email={email} phone={phone} disabled={submitting}
                    onNameChange={setName} onEmailChange={setEmail} onPhoneChange={setPhone}
                  />

                  <section aria-labelledby="guest-details-heading" className="rounded-[20px] border border-white/10 bg-[#141416] p-5 sm:p-6">
                    <h3 id="guest-details-heading" className="brand-sans text-xl font-semibold leading-snug !tracking-[-0.025em] text-white">Keep your team in the loop</h3>
                    <p id="team-email-help" className="mb-5 mt-2 text-sm leading-relaxed text-zinc-400">Optional. Add guests or crew to receive a copy of the confirmation. Press Enter after each address.</p>
                    <label htmlFor="team-email" className="mb-2 block text-sm font-medium text-zinc-200">Guest or crew email</label>
                    <div className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-xl border border-white/20 bg-[#0b0b0d] p-3 focus-within:border-white/60 focus-within:ring-2 focus-within:ring-white/20">
                      {teamEmails.map((em, i) => (
                        <span key={i} className="inline-flex max-w-full items-center gap-1 rounded-lg bg-white/10 pl-3 text-sm text-white">
                          <span className="min-w-0 break-all">{em}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${em}`}
                            disabled={submitting}
                            onClick={() => setTeamEmails((p) => p.filter((_, j) => j !== i))}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl text-zinc-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        id="team-email"
                        name="team-email"
                        type="email"
                        inputMode="email"
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        aria-describedby={teamError ? 'team-email-help team-email-error' : 'team-email-help'}
                        aria-invalid={Boolean(teamError)}
                        value={teamInput}
                        aria-label="Add a team email"
                        disabled={submitting}
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
                        placeholder={teamEmails.length === 0 ? 'guest@example.com' : 'Add another email'}
                        className="min-h-7 min-w-0 basis-full bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none"
                      />
                    </div>
                    {teamError && <p id="team-email-error" className="mt-2 text-sm text-red-400" role="alert">{teamError}</p>}
                    {!teamError && teamEmails.length > 0 && (
                      <p className="mt-2 text-sm text-zinc-400">{teamEmails.length} person{teamEmails.length > 1 ? 's' : ''} will receive the confirmation</p>
                    )}
                  </section>

                  <details className="rounded-[20px] border border-white/10 bg-[#141416] p-5 sm:p-6">
                    <summary className="cursor-pointer rounded-lg py-1 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">Before you arrive</summary>
                    <div className="mt-5 space-y-3">
                      {selectedStudio.prep.map((tip, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <span className="mt-0.5 w-5 shrink-0 font-mono text-[11px] font-bold text-zinc-500">0{i + 1}</span>
                          <p className="text-sm leading-relaxed text-zinc-400">{tip}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-5 text-sm leading-relaxed text-zinc-400">950 Battery St, SF 94111 · Northern Waterfront · Street parking on Battery St</p>
                  </details>

                  {error && <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300" role="alert">{error}</p>}

                  <p className="text-sm leading-relaxed text-zinc-400">Your booking is confirmed after payment. Free cancellation up to 48 hours before your session.</p>
                  <button
                    type="submit"
                    disabled={submitting || !setupReady}
                    className="min-h-[52px] w-full rounded-xl bg-brand-red px-4 py-3.5 text-[15px] font-semibold text-white motion-safe:transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
                  >
                    {continueLabel}
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
                {checkoutSelectionConflict ? (
                  <div className="rounded-lg border border-white/20 p-5 text-sm leading-relaxed text-zinc-300" role="status">
                    <h3 className="text-lg font-semibold text-white">A checkout is already in progress.</h3>
                    <p className="mt-3">It is for {selectedStudio?.name}{selectedSetup ? ` with ${selectedSetup.label}` : ''}, which differs from your new selection. Your new photo choice has not changed that checkout.</p>
                    <div className="mt-5 flex flex-wrap gap-4">
                      <button type="button" disabled={checkoutCancelling} onClick={() => void changeCheckoutDetails()} className="rounded-lg bg-brand-red px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50">{checkoutCancelling ? 'Releasing checkout…' : 'Use my new selection'}</button>
                      {setupReady && <button type="button" disabled={checkoutCancelling} onClick={() => { requestedSelectionRef.current = null; setCheckoutSelectionConflict(false) }} className="px-2 py-3 text-white underline underline-offset-4 disabled:opacity-50">Resume existing checkout</button>}
                    </div>
                    <p className="mt-4 text-xs">Using your new selection safely releases the existing checkout first. You will review the updated booking before payment.</p>
                  </div>
                ) : !setupReady ? (
                  <p className="rounded-lg border border-white/15 p-5 text-sm leading-relaxed text-zinc-300" role="status">
                    This checkout was started without a setup choice. Use “Change booking details” below to safely release it, reconfirm the time, and choose a setup for {selectedStudio?.name} before payment.
                  </p>
                ) : checkoutPublishableKey && checkoutClientSecret ? (
                  <div className="overflow-hidden rounded-[20px] bg-white p-2 sm:p-4">
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
                <p className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-500">
                  Need a different room, setup, or time? Release this checkout first, then update your booking.
                </p>
                {error && (
                  <p className="mt-3 text-sm text-brand-red" role="alert">{error}</p>
                )}
                <button
                  type="button"
                  onClick={() => void changeCheckoutDetails()}
                  disabled={checkoutCancelling || !checkoutSessionId || !checkoutManagementToken}
                  className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:text-white disabled:cursor-wait disabled:opacity-50"
                >
                  {checkoutCancelling ? 'Releasing checkout…' : '← Change booking details'}
                </button>
              </div>
            )}
          </div>

          {/* ══════════════════ YOUR SESSION ══════════════════ */}
          <div className="hidden lg:block">
            <div className="sticky top-24 rounded-[20px] border border-white/10 bg-[#141416] p-6">
              <p className="text-lg font-semibold tracking-tight text-white">Your session</p>

              {selectedStudio ? (
                <div className="relative mt-5 h-40 overflow-hidden rounded-lg 2xl:h-44">
                  <Image src={selectedSetup?.image || selectedStudio.heroImage} alt={selectedSetup?.alt || selectedStudio.name} fill quality={80} sizes="800px" className={selectedSetup ? 'object-contain' : 'object-cover'} />
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
                {requiresSetup && (
                  <div className="flex items-start justify-between gap-3 py-3.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Setup</span>
                    <div className="text-right">
                      <p className="text-[13px] text-white">{selectedSetup?.label || 'Not selected'}</p>
                      {selectedSetup && step === 'review' && (
                        <button type="button" disabled={submitting} onClick={() => goToStep('extras')} className="mt-1 text-xs text-zinc-300 underline underline-offset-4 hover:text-white disabled:opacity-50">Change setup</button>
                      )}
                    </div>
                  </div>
                )}
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
              </div>

              {(discountAmount > 0 || selectedAddOns.length > 0) && (
                <div className="space-y-1 border-t border-white/[0.06] py-3">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Session</span><span>${sessionSubtotal}</span>
                  </div>
                  {selectedAddOns.map((addOn) => (
                    <div key={addOn.id} className="flex justify-between gap-3 text-xs text-zinc-300">
                      <span className="min-w-0 break-words">{bookingAddOnLabel(addOn)}{addOn.hourlyRateCents > 0 ? ` ($${addOn.hourlyRateCents / 100}/hr)` : ''}</span><span className="shrink-0">{addOn.amountCents === 0 ? 'No charge' : `$${addOn.amountCents / 100}`}</span>
                    </div>
                  ))}
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
                <p className="text-3xl font-semibold tracking-tight tabular-nums text-white">
                  {bookingDisplayPrice(selectedStudio ? grandTotal : 0)}
                </p>
              </div>

              {step !== 'payment' && (
                <button
                  type="button"
                  onClick={continueFlow}
                  disabled={!continueReady}
                  className={`mt-5 min-h-[52px] w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
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
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
            <div className="shrink-0">
              <p className="text-xl font-semibold tracking-tight tabular-nums text-white">
                {bookingDisplayPrice(selectedStudio ? grandTotal : 0)}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
                {STEP_LABELS[step as EditableBookingStep]}
              </p>
            </div>
            <button
              type="button"
              onClick={continueFlow}
              disabled={!continueReady}
              className={`min-h-[52px] min-w-0 max-w-[240px] flex-1 rounded-xl px-4 py-3 text-sm font-semibold leading-snug motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                continueReady
                  ? 'bg-brand-red text-white hover:bg-red-700'
                  : 'cursor-not-allowed bg-white/[0.06] text-zinc-600'
              }`}
            >
              {continueLabel}
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

export default function BookPage({ initialStudioId = '', initialSetupId, hasSetupRequest = false }: InitialBookingSelection) {
  return (
    <BookPageClient
      key={`${initialStudioId}:${initialSetupId || ''}:${hasSetupRequest}`}
      studios={DEFAULT_STUDIOS}
      initialStudioId={initialStudioId}
      initialSetupId={initialSetupId}
      hasSetupRequest={hasSetupRequest}
    />
  )
}

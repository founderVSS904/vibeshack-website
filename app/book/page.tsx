'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import {
  ADDONS as DEFAULT_ADDONS,
  RECURRING_OPTIONS,
  STUDIOS as DEFAULT_STUDIOS,
  calculateRecurringDiscountCents,
  getStudioById,
  type AddOn,
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
      <p className="text-gray-600 text-sm animate-pulse">Preparing secure checkout...</p>
    </div>
  ),
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem { cartId: string; studioId: string; date: string; slots: string[] }

type CheckoutStep = 'builder' | 'info' | 'extras' | 'review' | 'payment'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2) }

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
  const d = new Date(Date.parse(iso) + hrs * 60 * 60 * 1000)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' })
}
function fmtDateFull(ds: string) {
  return new Date(ds + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
function fmtDateShort(ds: string) {
  return new Date(ds + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
function groupConsecutive(sorted: string[]): string[][] {
  if (!sorted.length) return []
  const groups: string[][] = []; let cur = [sorted[0]]
  for (let i = 1; i < sorted.length; i++) {
    Date.parse(sorted[i]) - Date.parse(sorted[i - 1]) === 60 * 60 * 1000
      ? cur.push(sorted[i]) : (groups.push(cur), cur = [sorted[i]])
  }
  groups.push(cur); return groups
}

function checkoutErrorMessage(message: unknown) {
  if (typeof message !== 'string' || !message) return 'Payment could not be started. Please try again.'
  if (message.includes('no longer available')) {
    return 'Sorry, that time was just booked or is no longer available. Please choose another open slot.'
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

// Removed studioById and cartItemPrice — they are now defined in BookPageInner
// to access the studios prop

// ─── Component ────────────────────────────────────────────────────────────────

interface BookPageInnerProps {
  studios: Studio[]
  addons: AddOn[]
}

function BookPageInner({ studios, addons }: BookPageInnerProps) {
  // Helper functions with access to studios prop
  const studioById = (id: string) => {
    const studio = studios.find(s => s.id === id) || getStudioById(id)
    if (!studio) throw new Error(`Unknown studio: ${id}`)
    return studio
  }
  const cartItemPrice = (item: CartItem) => studioById(item.studioId).price * item.slots.length

  // Builder
  const [builderStudio, setBuilderStudio] = useState(() => {
    if (typeof window === 'undefined') return ''
    return new URLSearchParams(window.location.search).get('studio') || ''
  })
  const [builderDate, setBuilderDate]     = useState('')
  const [builderSlots, setBuilderSlots]   = useState<string[]>([])
  const [builderStep, setBuilderStep]     = useState<'studio' | 'datetime'>(() => {
    if (typeof window === 'undefined') return 'studio'
    const studioParam = new URLSearchParams(window.location.search).get('studio')
    return studioParam ? 'datetime' : 'studio'
  })
  const [monthOffset, setMonthOffset]     = useState(0)
  const [slots, setSlots] = useState<{ time: string; label: string; available: boolean }[]>([])
  const [slotsLoading, setSlotsLoading]   = useState(false)
  const [availabilityVerified, setAvailabilityVerified] = useState(true)

  // Cart
  const [cart, setCart] = useState<CartItem[]>([])

  // Checkout
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('builder')
  const [referralSource, setReferralSource] = useState(() => readReferralSourceFromBrowser())

  // Info
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [teamEmails, setTeamEmails] = useState<string[]>([])
  const [teamInput, setTeamInput]   = useState('')

  // Extras
  const [selectedAddons, setSelectedAddons] = useState<AddOn[]>([])
  const [recurring, setRecurring]           = useState<string | null>(null)

  // Clear cart confirm
  const [confirmClear, setConfirmClear] = useState(false)

  // Submit
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [checkoutPublishableKey, setCheckoutPublishableKey] = useState('')
  const [checkoutClientSecret, setCheckoutClientSecret] = useState('')

  useEffect(() => {
    const source = readReferralSourceFromBrowser()
    if (!source) return
    setReferralSource(source)
    persistReferralSource(source)
  }, [])

  // ── Derived ──
  const days = getNext60Days()
  const daysByMonth: Record<string, Date[]> = {}
  days.forEach(d => {
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!daysByMonth[key]) daysByMonth[key] = []
    daysByMonth[key].push(d)
  })

  const cartSubtotal   = cart.reduce((s, i) => s + cartItemPrice(i), 0)
  const addonTotal     = selectedAddons.reduce((s, a) => s + a.price, 0)
  const recurringDiscount = recurring ? RECURRING_OPTIONS.find(r => r.id === recurring)?.discount || 0 : 0
  const discountAmount = calculateRecurringDiscountCents(cartSubtotal * 100, recurring) / 100
  const grandTotal     = cartSubtotal + addonTotal - discountAmount

  const avail      = slots.filter(s => s.available).length
  const bBlocks    = groupConsecutive([...builderSlots].sort())
  const curStudio  = builderStudio ? (studios.find(s => s.id === builderStudio) || null) : null

  // Primary studios in cart (for prep tips — use first one)
  const primaryStudio = cart.length > 0 ? studioById(cart[0].studioId) : null

  useEffect(() => {
    if (builderStudio && !studios.some((studio) => studio.id === builderStudio)) {
      setBuilderStudio('')
      setBuilderStep('studio')
      setBuilderDate('')
      setBuilderSlots([])
      setSlots([])
    }
  }, [builderStudio, studios])

  // ── Actions ──
  async function selectDate(ds: string) {
    setBuilderDate(ds); setBuilderSlots([]); setSlotsLoading(true); setSlots([]); setAvailabilityVerified(true)
    trackBookingStep('date_select', { studio_id: builderStudio, booking_date: ds })
    try {
      const res = await fetch(`/api/availability/?date=${ds}&studio=${builderStudio}`)
      const data = await res.json()
      setSlots(data.slots || [])
      setAvailabilityVerified(data.verified !== false)
      if (!res.ok) {
        setError(data.error || 'Availability could not be verified. Please try again.')
      }
    } catch {
      setSlots([])
      setAvailabilityVerified(false)
      setError('Availability could not be verified. Please try again.')
    }
    setSlotsLoading(false)
  }

  function toggleSlot(t: string) {
    setBuilderSlots(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])
    sendGAEvent(GAEventType.SELECT_TIME_SLOT, {
      studio_id: builderStudio,
      booking_date: builderDate,
      slot_time: t,
      selected: !builderSlots.includes(t),
    })
  }

  function addToCart() {
    if (!builderStudio || !builderDate || !builderSlots.length) return
    const studio = studioById(builderStudio)
    sendGAEvent(GAEventType.ADD_TO_CART, {
      studio_id: builderStudio,
      studio_name: studio.name,
      booking_date: builderDate,
      hours: builderSlots.length,
      value: studio.price * builderSlots.length,
      currency: 'USD',
    })
    setCart(p => [...p, { cartId: uid(), studioId: builderStudio, date: builderDate, slots: [...builderSlots].sort() }])
    setBuilderStudio(''); setBuilderDate(''); setBuilderSlots([]); setSlots([]); setBuilderStep('studio')
  }

  function removeFromCart(id: string) { setCart(p => p.filter(i => i.cartId !== id)) }

  function editCartItem(item: CartItem) {
    removeFromCart(item.cartId)
    setBuilderStudio(item.studioId); setBuilderDate(item.date); setBuilderSlots(item.slots)
    setCheckoutStep('builder'); setBuilderStep('datetime'); selectDate(item.date)
  }

  function toggleAddon(addon: AddOn) {
    setSelectedAddons(p =>
      p.find(a => a.id === addon.id) ? p.filter(a => a.id !== addon.id) : [...p, addon]
    )
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email) { setError('Name and email are required.'); return }
    setError(''); setSubmitting(true); setCheckoutClientSecret(''); setCheckoutPublishableKey('')
    trackBookingStep('checkout_start', {
      sessions: cart.length,
      value: grandTotal,
      currency: 'USD',
      studios: cart.map((item) => item.studioId).join(','),
      referral_source: referralSource,
    })
    try {
      const res = await fetch('/api/create-checkout-session/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map(item => ({
            studioId: item.studioId, studioName: studioById(item.studioId).name,
            date: item.date, slots: item.slots, hours: item.slots.length, price: cartItemPrice(item),
          })),
          addons: selectedAddons,
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
        setError(checkoutErrorMessage(data.error))
        setSubmitting(false)
        return
      }
      if (data.clientSecret && data.publishableKey) {
        setCheckoutPublishableKey(data.publishableKey)
        setCheckoutClientSecret(data.clientSecret)
        trackBookingStep('payment_attempt', {
          sessions: cart.length,
          value: grandTotal,
          currency: 'USD',
          referral_source: referralSource,
        })
        setCheckoutStep('payment')
        setSubmitting(false)
      }
      else { setError('Payment could not be started. Please try again.'); setSubmitting(false) }
    } catch { setError('Connection error. Try again.'); setSubmitting(false) }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black pt-24 pb-28">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">

        {/* Header */}
        <div className="mb-14">
          <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mb-3">VibeShack Studios · SF</p>
          <h1 className="text-white font-black leading-none" style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.05em'}}>
            {checkoutStep === 'builder' ? 'Book a Session'
              : checkoutStep === 'info' ? 'Your Info'
              : checkoutStep === 'extras' ? 'Prepare & Customize'
              : checkoutStep === 'review' ? 'Review Order'
              : 'Secure Payment'}
          </h1>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-12">

          {/* ══════════════════ MAIN ══════════════════ */}
          <div>

            {/* ── BUILDER ── */}
            {checkoutStep === 'builder' && (
              <>
                {builderStep === 'studio' && (
                  <div>
                    {cart.length > 0 && (
                      <div className="flex items-center justify-between mb-8">
                        <p className="text-gray-500 text-sm">Add another studio</p>
                        <button onClick={() => setCheckoutStep('info')} className="text-white text-sm font-semibold hover:opacity-70 transition-opacity">
                          Done — Checkout →
                        </button>
                      </div>
                    )}
                    <div className="mb-7 flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-gray-600 text-xs tracking-[0.22em] uppercase mb-2">01 · Choose studio</p>
                        <h2 className="text-white font-black leading-none" style={{fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.05em'}}>Select the room.</h2>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed max-w-sm sm:text-right">
                        Pick the room that matches the look. Availability is checked live before payment.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {studios.map(s => (
                        <button key={s.id} onClick={() => { setBuilderStudio(s.id); setBuilderStep('datetime'); trackBookingStep('studio_select', { studio_id: s.id, studio_name: s.name, value: s.price, currency: 'USD' }) }}
                          className={`min-w-0 w-full text-left rounded-[1.35rem] overflow-hidden group border bg-white/[0.025] transition-all duration-300 studio-card cursor-pointer ${
                            builderStudio === s.id
                              ? 'border-brand-red shadow-[0_0_0_1px_#E50000,0_20px_40px_rgba(229,0,0,0.12)] scale-[1.01]'
                              : 'border-white/10 hover:border-white/25 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-black/50 hover:scale-[1.01]'
                          }`} data-tilt>
                          <div className="relative overflow-hidden" style={{height: '236px'}}>
                            <Image
                              src={s.heroImage}
                              alt={s.name}
                              fill
                              className="object-cover group-hover:scale-[1.035] transition-transform duration-[900ms] ease-out"
                              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                            />
                            <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.56) 34%, rgba(0,0,0,0.12) 72%, transparent 100%)'}} />
                            <div className="absolute top-5 right-5 text-right" style={{textShadow: '0 2px 16px rgba(0,0,0,0.9)'}}>
                              <span className="text-white font-black text-xl" style={{letterSpacing: '-0.04em'}}>${s.price}</span>
                              <span className="text-gray-300 text-xs">/hr</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                              <div className="flex items-end justify-between gap-5">
                                <div className="min-w-0">
                                  <p className="text-white font-black text-2xl leading-none" style={{letterSpacing: '-0.04em'}}>{s.name}</p>
                                  <p
                                    className="text-gray-400 text-xs leading-snug mt-2 max-w-[16rem]"
                                    style={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {s.description}
                                  </p>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 text-white/80 flex-shrink-0 text-xs font-semibold tracking-wide opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                  Select
                                  <span aria-hidden>→</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {builderStep === 'datetime' && curStudio && (
                  <div>
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
                          <Image src={curStudio.heroImage} alt={curStudio.name} fill className="object-cover" sizes="48px" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-base">{curStudio.name}</p>
                          <p className="text-gray-500 text-xs">${curStudio.price}/hr</p>
                        </div>
                      </div>
                      <button onClick={() => { setBuilderStep('studio'); setBuilderSlots([]); setBuilderDate('') }}
                        className="text-gray-600 hover:text-white text-sm transition-colors">Change</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      {/* Calendar */}
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <p className="text-white font-bold text-base">Date</p>
                        </div>
                        <div>
                          {(() => {
                            const months = Object.entries(daysByMonth);
                            const currentIdx = Math.max(0, Math.min(monthOffset, months.length - 1));
                            const [month, monthDays] = months[currentIdx] || ['', []];
                            return (
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <button onClick={() => setMonthOffset(m => Math.max(0, m - 1))} disabled={monthOffset === 0}
                                    className="text-gray-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    ← Prev
                                  </button>
                                  <p className="text-gray-600 text-xs uppercase tracking-widest">{month}</p>
                                  <button onClick={() => setMonthOffset(m => Math.min(months.length - 1, m + 1))} disabled={monthOffset >= months.length - 1}
                                    className="text-gray-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    Next →
                                  </button>
                                </div>
                                <div className="grid grid-cols-5 gap-1">
                                  {monthDays.map(d => {
                                    const ds = formatDate(d); const sel = builderDate === ds
                                    return (
                                      <button key={ds} onClick={() => selectDate(ds)}
                                        className={`flex flex-col items-center py-2.5 rounded-xl transition-all ${sel ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-white/8'}`}>
                                        <span className="text-xs leading-none mb-1 opacity-60">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span className="text-sm font-black leading-none">{d.getDate()}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Times */}
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <p className="text-white font-bold text-base">{builderDate ? fmtDateFull(builderDate).split(',')[0] : 'Time'}</p>
                          {!slotsLoading && avail > 0 && avail <= 4 && <p className="text-yellow-500 text-xs font-semibold">{avail} slots left</p>}
                        </div>
                        {!builderDate && <div className="flex items-center justify-center h-48"><p className="text-gray-700 text-sm">Select a date</p></div>}
                        {builderDate && slotsLoading && <div className="flex items-center justify-center h-48"><p className="text-gray-600 text-sm animate-pulse">Checking availability…</p></div>}
                        {builderDate && !slotsLoading && (
                          <>
                            {!availabilityVerified && (
                              <div className="mb-4 rounded-xl border border-yellow-900/60 bg-yellow-950/30 px-4 py-3">
                                <p className="text-yellow-300 text-xs font-semibold">Calendar verification is unavailable. Booking is paused until live availability is confirmed.</p>
                              </div>
                            )}
                            <p className="text-gray-600 text-xs mb-4">Tap to select · multiple for longer or split sessions</p>
                            <div className="overflow-y-auto" style={{maxHeight: '300px'}}>
                              <div className="grid grid-cols-2 gap-1.5">
                                {slots.map(slot => {
                                  const sel = builderSlots.includes(slot.time)
                                  return (
                                    <button key={slot.time} disabled={!slot.available} onClick={() => slot.available && toggleSlot(slot.time)}
                                      className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                                        !slot.available ? 'text-gray-800 cursor-not-allowed line-through'
                                        : sel ? 'bg-brand-red text-white' : 'text-gray-400 hover:text-white hover:bg-white/8'}`}>
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

                    {builderSlots.length > 0 && (
                      <div className="border-t border-white/8 pt-6">
                        <div className="flex items-start justify-between mb-5">
                          <div>
                            {bBlocks.map((block, i) => (
                              <p key={i} className="text-white font-bold text-lg leading-tight" style={{letterSpacing: '-0.02em'}}>
                                {fmtTime(block[0])} → {fmtEnd(block[block.length - 1], 1)}
                                <span className="text-gray-500 font-normal text-sm ml-2">{block.length}hr</span>
                              </p>
                            ))}
                            <p className="text-gray-500 text-sm mt-1">{fmtDateShort(builderDate)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-black text-2xl" style={{letterSpacing: '-0.03em'}}>${curStudio.price * builderSlots.length}</p>
                            {confirmClear ? (
                            <span className="flex flex-col items-end gap-1 mt-1">
                              <span className="text-gray-400 text-xs">Clear slots?</span>
                              <span className="flex gap-2">
                                <button onClick={() => setConfirmClear(false)} className="text-gray-600 hover:text-white text-xs transition-colors">Cancel</button>
                                <button onClick={() => { setBuilderSlots([]); setConfirmClear(false) }} className="text-brand-red hover:text-red-400 text-xs font-semibold transition-colors">Confirm</button>
                              </span>
                            </span>
                          ) : (
                            <button onClick={() => setConfirmClear(true)} className="text-gray-600 hover:text-white text-xs transition-colors mt-1">Clear</button>
                          )}
                          </div>
                        </div>
                        <button onClick={addToCart} className="w-full py-4 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-100 transition-colors">
                          Add to Booking
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {cart.length > 0 && builderStep === 'studio' && (
                  <div className="mt-6">
                    <button onClick={() => setCheckoutStep('info')} className="w-full py-4 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-100 transition-colors">
                      Checkout ({cart.length} session{cart.length > 1 ? 's' : ''}) — ${cartSubtotal}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── INFO ── */}
            {checkoutStep === 'info' && (
              <div className="max-w-md">
                <form onSubmit={e => { e.preventDefault(); setCheckoutStep('extras') }} className="space-y-8">

                  {/* Primary contact */}
                  <div className="space-y-6">
                    <p className="text-gray-600 text-xs uppercase tracking-widest">Your Details</p>
                    {[
                      { label: 'Full Name', type: 'text', val: name, set: setName, ph: 'Your name', req: true },
                      { label: 'Email', type: 'email', val: email, set: setEmail, ph: 'you@example.com', req: true },
                      { label: 'Phone', type: 'tel', val: phone, set: setPhone, ph: '+1 (415) 000-0000', req: false },
                    ].map(({ label, type, val, set, ph, req }) => (
                      <div key={label}>
                        <label className="block text-gray-500 text-xs uppercase tracking-widest mb-3">
                          {label}{!req && <span className="text-gray-700 ml-2 normal-case tracking-normal">optional</span>}
                        </label>
                        <input type={type} required={req} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                          className="w-full bg-transparent border-b border-white/20 pb-3 text-white placeholder-gray-700 text-base focus:outline-none focus:border-white/50 transition-colors" />
                      </div>
                    ))}
                  </div>

                  {/* Team / guests */}
                  <div className="pt-4 border-t border-white/8">
                    <p className="text-gray-600 text-xs uppercase tracking-widest mb-1">Who else needs to know?</p>
                    <p className="text-gray-700 text-xs mb-5">Guests, co-hosts, crew, clients — add as many as you need. Everyone gets a copy of the confirmation.</p>

                    {/* Tag input */}
                    <div className="border-b border-white/20 pb-3 flex flex-wrap gap-2 items-center min-h-[44px]">
                      {teamEmails.map((em, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs px-3 py-1.5 rounded-full">
                          {em}
                          <button type="button" onClick={() => setTeamEmails(p => p.filter((_, j) => j !== i))}
                            className="text-gray-400 hover:text-white transition-colors leading-none">×</button>
                        </span>
                      ))}
                      <input
                        type="email"
                        value={teamInput}
                        onChange={e => setTeamInput(e.target.value)}
                        onKeyDown={e => {
                          if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && teamInput.trim()) {
                            e.preventDefault()
                            const val = teamInput.trim().replace(/,$/, '')
                            if (val && !teamEmails.includes(val)) setTeamEmails(p => [...p, val])
                            setTeamInput('')
                          }
                          if (e.key === 'Backspace' && !teamInput && teamEmails.length) {
                            setTeamEmails(p => p.slice(0, -1))
                          }
                        }}
                        onBlur={() => {
                          const val = teamInput.trim().replace(/,$/, '')
                          if (val && !teamEmails.includes(val)) setTeamEmails(p => [...p, val])
                          setTeamInput('')
                        }}
                        placeholder={teamEmails.length === 0 ? 'their@email.com — press Enter or comma to add more' : 'Add another…'}
                        className="flex-1 min-w-[180px] bg-transparent text-white placeholder-gray-700 text-sm focus:outline-none"
                      />
                    </div>
                    {teamEmails.length > 0 && (
                      <p className="text-gray-600 text-xs mt-2">{teamEmails.length} person{teamEmails.length > 1 ? 's' : ''} will receive the confirmation</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="w-full py-4 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-100 transition-colors">
                      Continue →
                    </button>
                    <button type="button" onClick={() => setCheckoutStep('builder')} className="w-full py-3 text-gray-600 hover:text-white text-sm transition-colors mt-2">
                      ← Add more sessions
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── EXTRAS: Prep tips + Add-ons + Recurring ── */}
            {checkoutStep === 'extras' && (
              <div className="max-w-xl">

                {/* Prep tips */}
                {primaryStudio && (
                  <div className="mb-12">
                    <p className="text-gray-600 text-xs uppercase tracking-widest mb-2">Before You Arrive</p>
                    <p className="text-white font-black text-2xl mb-6" style={{letterSpacing: '-0.03em'}}>Here&apos;s how to prepare.</p>
                    <div className="space-y-4">
                      {primaryStudio.prep.map((tip, i) => (
                        <div key={i} className="flex items-start gap-4 py-4 border-b border-white/8">
                          <span className="text-gray-700 font-black text-sm w-5 flex-shrink-0 mt-0.5">0{i + 1}</span>
                          <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 p-4 rounded-xl" style={{background: 'rgba(255,255,255,0.03)'}}>
                      <p className="text-gray-500 text-xs">📍 950 Battery St, SF 94111 · Northern Waterfront<br />Street parking on Battery St · 10 min walk from Ferry Building</p>
                    </div>
                  </div>
                )}

                {/* Add-ons */}
                <div className="mb-12">
                  <p className="text-gray-600 text-xs uppercase tracking-widest mb-2">Enhance Your Session</p>
                  <p className="text-white font-black text-2xl mb-6" style={{letterSpacing: '-0.03em'}}>Want to add anything?</p>
                  <div className="space-y-2">
                    {addons.map(addon => {
                      const selected = !!selectedAddons.find(a => a.id === addon.id)
                      return (
                        <button key={addon.id} onClick={() => toggleAddon(addon)}
                          className={`w-full text-left flex items-start justify-between gap-6 px-5 py-5 rounded-2xl border transition-all ${
                            selected ? 'border-brand-red bg-brand-red/5' : 'border-white/10 hover:border-white/25'}`}>
                          <div className="flex items-start gap-4">
                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${selected ? 'border-brand-red bg-brand-red' : 'border-white/30'}`}>
                              {selected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">{addon.name}</p>
                              <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{addon.description}</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-white font-black">+${addon.price}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Recurring */}
                <div className="mb-12">
                  <p className="text-gray-600 text-xs uppercase tracking-widest mb-2">Make It a Standing Booking</p>
                  <p className="text-white font-black text-2xl mb-2" style={{letterSpacing: '-0.03em'}}>Book this regularly?</p>
                  <p className="text-gray-500 text-sm mb-6">Lock in this slot on a recurring schedule and save.</p>
                  <div className="space-y-2">
                    {RECURRING_OPTIONS.map(opt => {
                      const sel = recurring === opt.id
                      return (
                        <button key={opt.id} onClick={() => setRecurring(sel ? null : opt.id)}
                          className={`w-full text-left flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${sel ? 'border-brand-red bg-brand-red/5' : 'border-white/10 hover:border-white/25'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${sel ? 'border-brand-red bg-brand-red' : 'border-white/30'}`}>
                              {sel && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <p className="text-white font-semibold text-sm">{opt.label}</p>
                          </div>
                          <p className="text-brand-red font-bold text-sm">{opt.discount}% off</p>
                        </button>
                      )
                    })}
                  </div>
                  {recurring && (
                    <p className="text-gray-500 text-xs mt-4">
                      You save ${discountAmount} on this order. Our team will reach out to confirm your recurring schedule.
                    </p>
                  )}
                </div>

                <button onClick={() => setCheckoutStep('review')} className="w-full py-4 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-100 transition-colors">
                  Review Order →
                </button>
                <button onClick={() => setCheckoutStep('info')} className="w-full py-3 text-gray-600 hover:text-white text-sm transition-colors mt-2">
                  ← Back
                </button>
              </div>
            )}

            {/* ── REVIEW ── */}
            {checkoutStep === 'review' && (
              <div className="max-w-xl">

                {/* Sessions */}
                <p className="text-gray-600 text-xs uppercase tracking-widest mb-5">Sessions</p>
                <div className="space-y-4 mb-8">
                  {cart.map((item, idx) => {
                    const s = studioById(item.studioId)
                    const blocks = groupConsecutive([...item.slots].sort())
                    return (
                      <div key={item.cartId} className="flex items-center gap-5 py-5 border-b border-white/8">
                        <span className="text-gray-700 text-xs font-black w-5 text-center">{idx + 1}</span>
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative">
                          <Image src={s.heroImage} alt={s.name} fill className="object-cover" sizes="56px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm">{s.name}</p>
                          <p className="text-gray-500 text-xs">{fmtDateFull(item.date)}</p>
                          {blocks.map((b, i) => (
                            <p key={i} className="text-gray-400 text-xs">{fmtTime(b[0])} → {fmtEnd(b[b.length - 1], 1)} · {b.length}hr</p>
                          ))}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white font-black">${cartItemPrice(item)}</p>
                          <button onClick={() => editCartItem(item)} className="text-gray-600 hover:text-white text-xs transition-colors block mt-1">Edit</button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Add-ons */}
                {selectedAddons.length > 0 && (
                  <>
                    <p className="text-gray-600 text-xs uppercase tracking-widest mb-4">Add-Ons</p>
                    <div className="space-y-2 mb-8">
                      {selectedAddons.map(a => (
                        <div key={a.id} className="flex justify-between py-3 border-b border-white/8">
                          <p className="text-gray-300 text-sm">{a.name}</p>
                          <p className="text-white font-bold text-sm">+${a.price}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Price breakdown */}
                <div className="space-y-2 mb-8 py-5 border-t border-b border-white/8">
                  <div className="flex justify-between">
                    <p className="text-gray-500 text-sm">Sessions ({cart.length})</p>
                    <p className="text-white text-sm">${cartSubtotal}</p>
                  </div>
                  {addonTotal > 0 && (
                    <div className="flex justify-between">
                      <p className="text-gray-500 text-sm">Add-ons</p>
                      <p className="text-white text-sm">+${addonTotal}</p>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <p className="text-gray-500 text-sm">Recurring discount ({recurringDiscount}%)</p>
                      <p className="text-brand-red text-sm font-semibold">−${discountAmount}</p>
                    </div>
                  )}
                  <div className="flex justify-between pt-2">
                    <p className="text-white font-bold">Total</p>
                    <p className="text-white font-black" style={{fontSize: '1.75rem', letterSpacing: '-0.04em'}}>${grandTotal}</p>
                  </div>
                </div>

                {/* Contact summary */}
                <div className="mb-8">
                  <p className="text-gray-500 text-sm">{name} · {email}</p>
                  {teamEmails.length > 0 && <p className="text-gray-600 text-sm">+{teamEmails.length} confirmation{teamEmails.length > 1 ? 's' : ''} will be sent to your team</p>}
                  {recurring && <p className="text-gray-600 text-sm">Recurring: {RECURRING_OPTIONS.find(r => r.id === recurring)?.label}</p>}
                </div>

                <p className="text-gray-600 text-xs mb-6 flex items-center gap-2">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  Secure payment via Stripe · Free cancellation 48hrs before each session
                </p>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form onSubmit={handlePay}>
                  <button type="submit" disabled={submitting}
                    className="w-full py-4 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-100 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                    {submitting
                      ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Processing…</>
                      : `Lock In ${cart.length} Session${cart.length > 1 ? 's' : ''} — $${grandTotal}`}
                  </button>
                  <button type="button" onClick={() => setCheckoutStep('extras')} className="w-full py-3 text-gray-600 hover:text-white text-sm transition-colors duration-200 mt-2 cursor-pointer">← Back</button>
                </form>
              </div>
            )}

            {/* ── EMBEDDED PAYMENT ── */}
            {checkoutStep === 'payment' && (
              <div className="max-w-xl">
                <div className="mb-8">
                  <p className="text-gray-600 text-xs uppercase tracking-widest mb-2">Stripe Secure Checkout</p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Complete payment here on VibeShack. Your booking is only added to the studio calendar after payment succeeds.
                  </p>
                </div>

                {checkoutPublishableKey && checkoutClientSecret ? (
                  <div className="rounded-3xl bg-white p-2 sm:p-4">
                    <StripeEmbeddedCheckout
                      publishableKey={checkoutPublishableKey}
                      clientSecret={checkoutClientSecret}
                    />
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-gray-600 text-sm animate-pulse">Preparing secure checkout…</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setCheckoutClientSecret('')
                    setCheckoutPublishableKey('')
                    setCheckoutStep('review')
                  }}
                  className="w-full py-3 text-gray-600 hover:text-white text-sm transition-colors duration-200 mt-4 cursor-pointer"
                >
                  ← Back to review
                </button>
              </div>
            )}
          </div>

          {/* ══════════════════ SIDEBAR ══════════════════ */}
          <div className="hidden lg:block">
            <div className="sticky top-28 space-y-6">

              {/* Cart */}
              <div>
                <p className="text-gray-600 text-xs uppercase tracking-widest mb-4">
                  {cart.length === 0 ? 'Your Booking' : `${cart.length} Session${cart.length > 1 ? 's' : ''}`}
                </p>
                {cart.length === 0 && <p className="text-gray-700 text-sm">Nothing added yet.</p>}
                <div className="space-y-4">
                  {cart.map(item => {
                    const s = studioById(item.studioId)
                    const blocks = groupConsecutive([...item.slots].sort())
                    return (
                      <div key={item.cartId} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                          <Image src={s.heroImage} alt={s.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-bold">{s.name}</p>
                          <p className="text-gray-600 text-xs">{fmtDateShort(item.date)}</p>
                          {blocks.map((b, i) => <p key={i} className="text-gray-500 text-xs">{fmtTime(b[0])} → {fmtEnd(b[b.length - 1], 1)}</p>)}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-white text-xs font-bold">${cartItemPrice(item)}</p>
                          <button onClick={() => removeFromCart(item.cartId)} className="text-gray-700 hover:text-white text-xs transition-colors">✕</button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Add-ons in sidebar */}
                {selectedAddons.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/8 space-y-1">
                    {selectedAddons.map(a => (
                      <div key={a.id} className="flex justify-between">
                        <p className="text-gray-600 text-xs">{a.name}</p>
                        <p className="text-gray-500 text-xs">+${a.price}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                {cart.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/8 flex justify-between items-baseline">
                    <p className="text-gray-600 text-xs">
                      {discountAmount > 0 && <span className="text-brand-red">−${discountAmount} discount · </span>}
                      Total
                    </p>
                    <p className="text-white font-black text-xl" style={{letterSpacing: '-0.03em'}}>${grandTotal}</p>
                  </div>
                )}

                {/* Checkout buttons */}
                {cart.length > 0 && checkoutStep === 'builder' && (
                  <div className="mt-5 space-y-2">
                    <button onClick={() => { setBuilderStep('studio'); setBuilderStudio(''); setBuilderDate(''); setBuilderSlots([]) }}
                      className="w-full py-2.5 border border-white/15 text-white text-xs font-semibold rounded-xl hover:border-white/30 transition-colors">
                      + Add another session
                    </button>
                    <button onClick={() => setCheckoutStep('info')} className="w-full py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors">
                      Checkout →
                    </button>
                  </div>
                )}
              </div>

              {/* Studio hero image — during datetime step */}
              {curStudio && builderStep === 'datetime' && (
                <div className="border-t border-white/8 pt-6">
                  <div className="rounded-2xl overflow-hidden mb-4 relative" style={{height: '180px'}}>
                    <Image src={curStudio.heroImage} alt={curStudio.name} fill className="object-cover" sizes="320px" />
                    <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)'}} />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-black text-base leading-tight" style={{letterSpacing: '-0.02em'}}>{curStudio.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">${curStudio.price}/hr</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs uppercase tracking-widest mb-3">What&apos;s included</p>
                  <ul className="space-y-2.5">
                    {curStudio.includes.map(inc => (
                      <li key={inc} className="flex items-center gap-3 text-xs text-gray-400">
                        <svg className="w-3 h-3 text-brand-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Studio images during info/extras/review */}
              {checkoutStep !== 'builder' && cart.length > 0 && (
                <div className="border-t border-white/8 pt-6 space-y-3">
                  {cart.map(item => {
                    const s = studioById(item.studioId)
                    return (
                      <div key={item.cartId} className="rounded-2xl overflow-hidden relative" style={{height: '140px'}}>
                        <Image src={s.heroImage} alt={s.name} fill className="object-cover" sizes="320px" />
                        <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 55%)'}} />
                        <div className="absolute bottom-3 left-4 right-4">
                          <p className="text-white font-bold text-sm leading-tight">{s.name}</p>
                          <p className="text-gray-400 text-xs">{fmtDateShort(item.date)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <p className="text-gray-700 text-xs">Free cancellation · 48hrs notice per session</p>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════ MOBILE CART BAR ══════════════════ */}
      {cart.length > 0 && checkoutStep === 'builder' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-black border-t border-white/10 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white text-sm font-bold">{cart.length} session{cart.length > 1 ? 's' : ''}</p>
              <p className="text-gray-400 text-xs">${grandTotal} total</p>
            </div>
          </div>
          <button
            onClick={() => setCheckoutStep('info')}
            className="w-full py-3.5 bg-brand-red text-white font-bold text-sm rounded-full hover:bg-red-700 transition-colors"
          >
            Proceed to Checkout →
          </button>
        </div>
      )}
    </div>
  )
}

const BookPageClient = dynamic(() => Promise.resolve(BookPageInner), { ssr: false })

export default function BookPage() {
  return <BookPageClient studios={DEFAULT_STUDIOS} addons={DEFAULT_ADDONS} />
}

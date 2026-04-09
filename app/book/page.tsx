'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// ─── Types (before data loading) ──────────────────────────────────────────────

interface Studio {
  id: string
  name: string
  price: number
  tag: string | null
  description: string
  heroImage: string
  photos: string[]
  includes: string[]
  type: string
  prep: string[]
}

interface AddOn {
  id: string
  name: string
  description: string
  price: number
}

// ─── Default data (fallback) ──────────────────────────────────────────────────

const DEFAULT_STUDIOS: Studio[] = [
  {
    id: 'the-executive', name: 'The Executive', price: 300, tag: 'Walnut Series',
    description: 'Wood slat walls. Leather seating. Three cameras. Cameraman included.',
    heroImage: '/studio-images/the-executive-hero.jpg',
    photos: ['/studio-images/the-executive-hero.jpg', '/studio-images/the-executive-4.jpg'],
    includes: ['3-camera 4K setup', 'Broadcast microphones', 'Cameraman included', 'Walnut Series design', 'Hair & Makeup room', '6–12hr footage turnaround'],
    type: 'podcast',
    prep: [
      'Have your talking points or outline ready.',
      'Hair & Makeup room on-site.',
      'Wear what you\'d wear on camera. Avoid busy patterns, fine stripes, or logos — solid colors film best.',
      'Everything is set up and ready when you arrive.',
    ],
  },
  {
    id: 'the-wing', name: 'The Wing', price: 300, tag: 'Walnut Series',
    description: 'Wood slat walls. Leather seating. Three cameras. Cameraman included.',
    heroImage: '/studio-images/the-wing-hero.jpg',
    photos: ['/studio-images/the-wing-hero.jpg', '/studio-images/the-wing-2.jpg', '/studio-images/the-wing-3.jpg'],
    includes: ['3-camera 4K setup', 'Broadcast microphones', 'Cameraman included', 'Walnut Series design', 'Intimate layout', '6–12hr footage turnaround'],
    type: 'podcast',
    prep: [
      'Great for interviews and co-hosted formats.',
      'Have your guest\'s name ready — we\'ll label their mic.',
      'Hair & Makeup room on-site for both host and guest.',
      'Arrive together or separately — we\'ll have both seats ready.',
    ],
  },
  {
    id: 'encore', name: 'Encore', price: 300, tag: 'Vault Series',
    description: 'Three cameras. Broadcast audio. Cameraman included.',
    heroImage: '/studio-images/encore-wide.jpg',
    photos: ['/studio-images/encore-wide.jpg'],
    includes: ['3-camera 4K setup', 'Broadcast microphones', 'Cameraman included', 'Hair & Makeup room', '6–12hr footage turnaround'],
    type: 'podcast',
    prep: [
      'Have your talking points or outline ready.',
      'Hair & Makeup room on-site.',
      'Wear what you\'d wear on camera. Avoid busy patterns, fine stripes, or logos — solid colors film best.',
      'Everything is set up and ready when you arrive.',
    ],
  },
  {
    id: 'sunset', name: 'Sunset', price: 300, tag: 'Creative Series',
    description: 'Programmable color backdrop. Pick your mood. Cameraman included.',
    heroImage: '/studio-images/sunset-red.jpg',
    photos: ['/studio-images/sunset-red.jpg'],
    includes: ['3-camera 4K setup', 'Broadcast microphones', 'Cameraman included', 'Programmable color backdrop', 'Two leather sofas', '6–12hr footage turnaround'],
    type: 'podcast',
    prep: [
      'Pick your backdrop color before you arrive — we\'ll have it set.',
      'Wear what you\'d wear on camera. Avoid busy patterns, fine stripes, or logos — solid colors film best.',
      'Have your talking points ready.',
      'Everything is set up when you walk in.',
    ],
  },
  {
    id: 'green-screen', name: 'Green Screen Studio', price: 100, tag: null,
    description: '750 square feet. Floor-to-ceiling. Lighting grid.',
    heroImage: '/studio-images/greenscreen-wide.jpg',
    photos: ['/studio-images/greenscreen-wide.jpg'],
    includes: ['750 sqft green screen', 'Full lighting grid', 'RED Komodo X available', 'Professional lighting', 'Floor-to-ceiling setup'],
    type: 'greenscreen',
    prep: [
      'Avoid wearing green or bright lime — it will blend with the screen.',
      'Solid colors work best. Avoid fine patterns or stripes.',
      'Bring your shot list or storyboard if you have one.',
      'Lighting is pre-rigged. Walk in and start shooting.',
    ],
  },
  {
    id: 'photography', name: 'Photography Studio', price: 100, tag: null,
    description: 'Professional lighting. White backdrop. Hair & Makeup room.',
    heroImage: '/studio-images/photography-hero.jpg',
    photos: ['/studio-images/photography-hero.jpg'],
    includes: ['Professional lighting', 'White seamless backdrop', 'Hair & Makeup room', 'Kino Flo + ARRI lighting', 'Full vanity station'],
    type: 'photo',
    prep: [
      'Hair & Makeup room on-site — arrive as you are.',
      'Bring 2–3 outfit options. More variety, more content.',
      'Bring any props, products, or branded items you want in frame.',
      'Lighting is set and calibrated before you walk in.',
    ],
  },

  {
    id: 'premier', name: 'Premier', price: 300, tag: 'Premium',
    description: 'Premium studio suite. Top-tier production quality.',
    heroImage: '/studio-images/premier-hero-v1775084326.jpg',
    photos: ['/studio-images/premier-hero-v1775084326.jpg', '/studio-images/premier-wide-v1775084326.jpg', '/studio-images/premier-setup-v1775084326.jpg'],
    includes: ['Custom setup', 'Full 4K production', 'Cameraman + producer', 'Premium sound design', '6–12hr footage turnaround'],
    type: 'podcast',
    prep: [
      'Schedule a strategy call before your session.',
      'Bring any visuals, slides, or graphics you want on screen.',
      'Have your guest confirmed and briefed.',
      'Everything else is on us.',
    ],
  },
  {
    id: 'parlor',
    name: 'Parlor',
    price: 300,
    tag: 'Premium',
    description: 'Premium interview setup. Chesterfield seating. Full crew included.',
    heroImage: '/studio-images/parlor-hero.jpg',
    photos: ['/studio-images/parlor-hero.jpg'],
    includes: ['Custom setup', 'Full 4K production', 'Cameraman + producer', 'Chesterfield seating', '6–12hr footage turnaround'],
    type: 'podcast',
    prep: [
      'Schedule a strategy call before your session.',
      'Bring any visuals, slides, or graphics you want on screen.',
      'Have your guest confirmed and briefed.',
      'Everything else is on us.',
    ],
  },
  {
    id: 'horizon',
    name: 'Horizon',
    price: 300,
    tag: 'Premium',
    description: 'Immersive setup. Sunset LED wall. Full crew included.',
    heroImage: '/studio-images/horizon-hero.jpg',
    photos: ['/studio-images/horizon-hero.jpg'],
    includes: ['Custom setup', 'Full 4K production', 'Cameraman + producer', 'LED sunset wall', '6–12hr footage turnaround'],
    type: 'podcast',
    prep: [
      'Schedule a strategy call before your session.',
      'Bring any visuals, slides, or graphics you want on screen.',
      'Have your guest confirmed and briefed.',
      'Everything else is on us.',
    ],
  },
  {
    id: 'canvas-rental', name: 'Canvas Rental', price: 100, tag: 'Creative Series',
    description: 'Seamless white cyc wall. Overhead lighting grid.',
    heroImage: '/studio-images/canvas-rental-thumbnail.jpg',
    photos: ['/studio-images/canvas-rental-thumbnail.jpg', '/studio-images/canvas-rental-space-v1775094755.jpg', '/studio-images/canvas-rental-hero-v1775094073.jpg'],
    includes: ['White cyc wall', 'Overhead lighting grid', 'Black floor mats', 'All equipment included'],
    type: 'photo',
    prep: [
      'White backdrop works with almost any outfit — avoid all-white.',
      'Great for headshots, product shots, and clean video content.',
      'Bring any products or props you want featured.',
      'Setup is ready when you walk in.',
    ],
  },
]

const DEFAULT_ADDONS: AddOn[] = [
  { id: 'teleprompter', name: 'Teleprompter', description: 'Scroll your script hands-free, eye-level with the lens.', price: 25 },
]

const RECURRING_OPTIONS = [
  { id: 'weekly', label: 'Every week', discount: 10 },
  { id: 'biweekly', label: 'Every 2 weeks', discount: 7 },
  { id: 'monthly', label: 'Every month', discount: 5 },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem { cartId: string; studioId: string; date: string; slots: string[] }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2) }

function getNext60Days() {
  return Array.from({ length: 60 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1); return d
  })
}

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' })
}
function fmtEnd(iso: string, hrs: number) {
  const d = new Date(iso); d.setHours(d.getHours() + hrs)
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
    new Date(sorted[i]).getHours() === new Date(sorted[i - 1]).getHours() + 1
      ? cur.push(sorted[i]) : (groups.push(cur), cur = [sorted[i]])
  }
  groups.push(cur); return groups
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
  const studioById = (id: string) => studios.find(s => s.id === id)!
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

  // Cart
  const [cart, setCart] = useState<CartItem[]>([])

  // Checkout
  const [checkoutStep, setCheckoutStep] = useState<'builder' | 'info' | 'extras' | 'review'>('builder')

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
  const discountAmount = Math.round((cartSubtotal + addonTotal) * recurringDiscount / 100)
  const grandTotal     = cartSubtotal + addonTotal - discountAmount

  const avail      = slots.filter(s => s.available).length
  const bBlocks    = groupConsecutive([...builderSlots].sort())
  const curStudio  = builderStudio ? studioById(builderStudio) : null

  // Primary studios in cart (for prep tips — use first one)
  const primaryStudio = cart.length > 0 ? studioById(cart[0].studioId) : null

  // ── Actions ──
  async function selectDate(ds: string) {
    setBuilderDate(ds); setBuilderSlots([]); setSlotsLoading(true); setSlots([])
    try {
      const res = await fetch(`/api/availability?date=${ds}&studio=${builderStudio}`)
      setSlots((await res.json()).slots || [])
    } catch { setSlots([]) }
    setSlotsLoading(false)
  }

  function toggleSlot(t: string) {
    setBuilderSlots(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])
  }

  function addToCart() {
    if (!builderStudio || !builderDate || !builderSlots.length) return
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

  const [redirecting, setRedirecting] = useState(false)

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email) { setError('Name and email are required.'); return }
    setError(''); setSubmitting(true)
    try {
      const res = await fetch('/api/create-checkout-session', {
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
        }),
      })
      const data = await res.json()
      if (data.url) {
        setRedirecting(true)
        window.location.href = data.url
      }
      else { setError(data.error || 'Something went wrong.'); setSubmitting(false) }
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
              : 'Review Order'}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {studios.map(s => (
                        <button key={s.id} onClick={() => { setBuilderStudio(s.id); setBuilderStep('datetime') }}
                          className={`text-left rounded-2xl overflow-hidden group border transition-all duration-300 studio-card cursor-pointer ${
                            builderStudio === s.id
                              ? 'border-brand-red shadow-[0_0_0_1px_#E50000,0_20px_40px_rgba(229,0,0,0.12)] scale-[1.01]'
                              : 'border-transparent hover:border-white/20 hover:shadow-lg hover:shadow-black/40 hover:scale-[1.02]'
                          }`} data-tilt>
                          <div className="relative overflow-hidden aspect-square md:aspect-video">
                            <Image src={s.heroImage} alt={s.name} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
                            <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 45%, transparent 75%)'}} />
                            {s.tag && <div className="absolute top-4 left-4"><span className={`text-xs px-2.5 py-1 rounded-full font-bold tracking-wide ${
  s.tag === 'Walnut Series' ? 'bg-amber-700 text-amber-100' :
  s.tag === 'Creative Series' ? 'bg-teal-800 text-teal-100' :
  s.tag === 'Vault Series' ? 'bg-purple-900 text-purple-200' :
  'bg-brand-red text-white'
}`}>{s.tag}</span></div>}
                            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
                              <div className="flex items-end justify-between">
                                <div>
                                  <p className="text-white font-black text-lg leading-tight" style={{letterSpacing: '-0.03em'}}>{s.name}</p>
                                  <p className="text-gray-400 text-xs mt-0.5">{s.description}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                  <span className="text-white font-black text-xl" style={{letterSpacing: '-0.03em'}}>${s.price}</span>
                                  <span className="text-gray-500 text-xs">/hr</span>
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
                          <Image src={curStudio.heroImage} alt={curStudio.name} fill className="object-cover" />
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
                          <Image src={s.heroImage} alt={s.name} fill className="object-cover" />
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
                  <button type="submit" disabled={submitting || redirecting}
                    className="w-full py-4 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-100 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                    {redirecting
                      ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Redirecting to checkout…</>
                      : submitting
                      ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Processing…</>
                      : `Lock In ${cart.length} Session${cart.length > 1 ? 's' : ''} — $${grandTotal}`}
                  </button>
                  <button type="button" onClick={() => setCheckoutStep('extras')} className="w-full py-3 text-gray-600 hover:text-white text-sm transition-colors duration-200 mt-2 cursor-pointer">← Back</button>
                </form>
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
                          <Image src={s.heroImage} alt={s.name} fill className="object-cover" />
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
                  <div className="rounded-2xl overflow-hidden mb-4 relative aspect-square md:aspect-video">
                    <Image src={curStudio.heroImage} alt={curStudio.name} fill className="object-cover" />
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
                      <div key={item.cartId} className="rounded-2xl overflow-hidden relative aspect-square md:aspect-video">
                        <Image src={s.heroImage} alt={s.name} fill className="object-cover" />
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

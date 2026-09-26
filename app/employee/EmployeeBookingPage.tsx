'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { STUDIOS } from '@/lib/booking/catalog'
import { getStudioSetup, getStudioSetups } from '@/lib/booking/studio-setups'
import { BOOKING_ADD_ONS, bookingAddOnRateLabel, bookingAddOnTotalCents, priceBookingAddOns, type BookingAddOnId } from '@/lib/booking/add-ons'
import { addMinutes, bookingDateRange, formatBookingDuration, formatDateForDisplay, formatTimeForDisplay, getTimeSlotsForDay } from '@/lib/booking/time'
import { previewSlots, previewTeleprompterAvailable, type PreviewReservation } from '@/lib/employee/preview'

type Slot = { time: string; label: string; available: boolean }
type Result = { ref: string; phase: string; paymentUrl?: string; emailed: boolean; total: number }
const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100)
function moveMonth(month: string, amount: number) {
  const [year, number] = month.split('-').map(Number)
  return new Date(Date.UTC(year, number - 1 + amount, 1)).toISOString().slice(0, 7)
}
function monthDays(month: string) {
  const [year, number] = month.split('-').map(Number)
  const offset = new Date(Date.UTC(year, number - 1, 1)).getUTCDay()
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate()
  return [...Array.from({ length: offset }, () => ''), ...Array.from({ length: count }, (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`)]
}
export default function EmployeeBookingPage({ email, preview = false, enabled }: { email: string; preview?: boolean; enabled: boolean }) {
  const [dates] = useState(() => bookingDateRange(60))
  const [studioId, setStudioId] = useState(STUDIOS[0].id)
  const studio = STUDIOS.find((item) => item.id === studioId)!
  const [date, setDate] = useState(dates[1])
  const [month, setMonth] = useState(dates[1].slice(0, 7))
  const [setupId, setSetupId] = useState('')
  const setup = getStudioSetup(studioId, setupId)
  const setups = getStudioSetups(studioId)
  const [start, setStart] = useState('')
  const [count, setCount] = useState(4)
  const [overnight, setOvernight] = useState(false)
  const [addOnIds, setAddOnIds] = useState<BookingAddOnId[]>([])
  const [platform, setPlatform] = useState('')
  const [name, setName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [reservations, setReservations] = useState<PreviewReservation[]>([])
  const [availability, setAvailability] = useState<{ key: string; slots: Slot[]; error?: string }>({ key: '', slots: [] })
  const [inventory, setInventory] = useState<{ key: string; available: boolean }>({ key: '', available: false })
  const [busy, setBusy] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [cancelPrompt, setCancelPrompt] = useState(false)
  const [copied, setCopied] = useState(false)
  const requestId = useRef('')
  const submitLock = useRef(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const availabilityKey = `${studioId}:${date}`
  const inventoryKey = `${date}:${start}:${count}`
  const daySlots = useMemo(() => getTimeSlotsForDay(date), [date])
  const startIndex = daySlots.findIndex((slot) => slot.start.toISOString() === start)
  const selectedSlots = startIndex < 0 ? [] : daySlots.slice(startIndex, startIndex + count).map((slot) => slot.start.toISOString())
  const end = start ? addMinutes(new Date(start), count * 30) : null
  const addOns = priceBookingAddOns(addOnIds, count, platform)
  const total = Math.round(studio.price * count / 2 * 100) + bookingAddOnTotalCents(addOns)
  const currentAvailability = availability.key === availabilityKey
  const availableSet = new Set(currentAvailability ? availability.slots.filter((slot) => slot.available).map((slot) => slot.time) : [])
  const canFit = (index: number, duration = count) => index >= 0 && index + duration <= daySlots.length && daySlots.slice(index, index + duration).every((slot) => availableSet.has(slot.start.toISOString()))
  const sessionReady = currentAvailability && canFit(startIndex) && (!setups.length || Boolean(setup))
  const teleprompterReady = inventory.key === inventoryKey && inventory.available
  const locked = busy || attempted || Boolean(result)
  const ready = sessionReady && (!addOnIds.includes('teleprompter') || teleprompterReady) && name.trim() && clientEmail.trim() && enabled

  useEffect(() => {
    const refreshAvailability = () => setRefresh((value) => value + 1)
    const timer = window.setInterval(refreshAvailability, 30_000)
    window.addEventListener('focus', refreshAvailability)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refreshAvailability) }
  }, [])
  useEffect(() => {
    if (preview) { setAvailability({ key: availabilityKey, slots: previewSlots(date, studioId, reservations) }); return }
    let active = true
    const controller = new AbortController()
    fetch(`/api/employee/availability?${new URLSearchParams({ date, studio: studioId })}`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (!response.ok || !data.verified) throw new Error(response.status === 401 ? 'Your sign-in has expired. Please sign in again.' : 'Availability could not be verified. Please retry.'); return data })
      .then((data) => { if (active) setAvailability({ key: availabilityKey, slots: data.slots }) })
      .catch((failure) => { if (active) setAvailability({ key: availabilityKey, slots: [], error: failure.message }) })
    return () => { active = false; controller.abort() }
  }, [availabilityKey, date, studioId, preview, reservations, refresh])
  useEffect(() => {
    if (!start || !end) return
    if (preview) { setInventory({ key: inventoryKey, available: previewTeleprompterAvailable(start, end.toISOString(), reservations) }); return }
    let active = true
    const controller = new AbortController()
    fetch(`/api/add-on-availability?${new URLSearchParams({ date, start, slots: String(count) })}`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (active) setInventory({ key: inventoryKey, available: response.ok && data.verified && data.availability?.teleprompter === true }) })
      .catch(() => { if (active) setInventory({ key: inventoryKey, available: false }) })
    return () => { active = false; controller.abort() }
    // end is derived from start and count; avoid a new Date dependency each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, start, count, inventoryKey, preview, reservations, refresh])
  useEffect(() => { if (result) resultRef.current?.focus() }, [result])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitLock.current || (!ready && !attempted) || result) return
    submitLock.current = true; setBusy(true); setAttempted(true); setError('')
    if (!requestId.current) requestId.current = crypto.randomUUID()
    try {
      if (preview) {
        const ref = `preview-${requestId.current}`
        setReservations((items) => [...items, { ref, studioId, start, end: end!.toISOString(), teleprompter: addOnIds.includes('teleprompter') }])
        setResult({ ref, phase: 'ready', total, emailed: false })
      } else {
        const response = await fetch('/api/employee/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: requestId.current, session: { studioId, date, slots: selectedSlots, setupId: setupId || undefined, addOnIds, remotePodcastPlatform: platform }, customer: { name, email: clientEmail, phone }, notes }) })
        const data = await response.json()
        if (!response.ok) { if (response.status === 400) { setAttempted(false); requestId.current = '' }; throw new Error(data.error || 'Booking could not finish. Retry the same request.') }
        setResult(data)
      }
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Please retry the same booking.') }
    finally { submitLock.current = false; setBusy(false) }
  }
  async function cancel() {
    if (!result || submitLock.current) return
    submitLock.current = true; setBusy(true); setError('')
    try {
      if (preview) { setReservations((items) => items.filter((item) => item.ref !== result.ref)); setResult({ ...result, phase: 'cancelled' }) }
      else {
        const response = await fetch('/api/employee/bookings/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: result.ref }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Cancellation could not finish. Please retry.')
        setResult(data)
      }
      setCancelPrompt(false)
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Cancellation could not finish.') }
    finally { submitLock.current = false; setBusy(false) }
  }
  function newBooking() {
    setResult(null); setAttempted(false); setStart(''); setName(''); setClientEmail(''); setPhone(''); setNotes(''); setAddOnIds([]); setPlatform(''); setError(''); setCopied(false); setCancelPrompt(false); requestId.current = ''; setRefresh((value) => value + 1)
  }
  return <>
    <header className="employee-topbar">
      <div className="employee-brand-group"><Link href="/" className="employee-wordmark">VibeShack<span>STUDIOS</span></Link><span className="employee-badge">Employee booking</span></div>
      <div className="employee-account"><Link href="/">Back to website ↗</Link><span className="employee-avatar" aria-hidden="true">{preview ? 'VS' : email.slice(0, 2).toUpperCase()}</span>{!preview && <form action="/api/employee/auth/logout" method="post"><button type="submit" title={email}>Sign out</button></form>}</div>
    </header>
    <div className="employee-workspace">
      {preview && <div className="employee-preview-note"><span>LOCAL PREVIEW</span> Sample availability. No real bookings, payments, or emails. Reservations reset when you reload.</div>}
      {!enabled && <p className="employee-notice">Employee booking is not activated yet. You can review availability, but cannot create a reservation.</p>}
      <div className="employee-page-heading"><div><span className="employee-eyebrow">VIBESHACK TEAM</span><h1>Book for a client.</h1><p>Reserve their studio now. Send a payment link for later.</p></div><span className="employee-timezone">◷ All times Pacific</span></div>
      <form onSubmit={submit} className="employee-booking-grid">
        <fieldset disabled={locked} className="employee-main-fields">
          <div className="employee-card employee-studio-strip">
            <div className="employee-room-thumb"><Image src={studio.heroImage} alt={studio.name} fill sizes="76px" /></div>
            <label className="employee-studio-label"><span>Studio</span><select aria-label="Studio" value={studioId} onChange={(event) => { setStudioId(event.target.value); setSetupId(''); setStart('') }}>{STUDIOS.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
            <div className="employee-studio-rate"><strong>{money(studio.price * 100)}<small>/hr</small></strong><span>{studio.type === 'podcast' ? 'Podcast studio' : 'Studio rental'}</span></div>
          </div>
          <section className="employee-card employee-schedule" aria-label="Choose session date and time">
            <div className="employee-calendar"><h2>Select a date</h2><div className="employee-month"><button type="button" aria-label="Previous month" disabled={month <= dates[0].slice(0, 7)} onClick={() => setMonth(moveMonth(month, -1))}>‹</button><strong>{new Date(`${month}-15T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</strong><button type="button" aria-label="Next month" disabled={month >= dates.at(-1)!.slice(0, 7)} onClick={() => setMonth(moveMonth(month, 1))}>›</button></div>
              <div className="employee-weekdays" aria-hidden="true">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => <span key={index}>{label}</span>)}</div>
              <div className="employee-days">{monthDays(month).map((day, index) => day ? <button type="button" key={day} aria-label={formatDateForDisplay(day)} aria-pressed={date === day} className={date === day ? 'selected' : ''} disabled={!dates.includes(day)} onClick={() => { setDate(day); setStart('') }}>{Number(day.slice(-2))}{day === dates[0] && <i />}</button> : <span key={`blank-${index}`} />)}</div>
              <p className="employee-calendar-note"><span /> Today <span className="employee-legend-square" /> Selected date</p>
            </div>
            <div className="employee-time-panel"><h2>Start time <span>{new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span></h2>
              <label className="employee-duration">Session length<select aria-label="Session length" value={count} onChange={(event) => { setCount(Number(event.target.value)); setStart('') }}>{Array.from({ length: 15 }, (_, index) => index + 2).map((slots) => <option key={slots} value={slots}>{formatBookingDuration(slots)}</option>)}</select></label>
              <div className="employee-times" aria-label="Available start times" aria-busy={!currentAvailability}>{daySlots.map((slot, index) => {
                const hour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/Los_Angeles' }).format(slot.start))
                if (!overnight && (hour < 8 || hour >= 22)) return null
                const iso = slot.start.toISOString()
                return <button type="button" key={iso} disabled={!canFit(index)} aria-pressed={start === iso} className={start === iso ? 'selected' : ''} onClick={() => setStart(iso)}>{formatTimeForDisplay(slot.start)}</button>
              })}</div>
              <div className="employee-time-help" aria-live="polite">{!currentAvailability ? 'Checking availability…' : availability.error ? <><span>{availability.error}</span><button type="button" onClick={() => setRefresh((value) => value + 1)}>Retry</button></> : 'Unavailable times include booked sessions and turnaround.'}</div>
              <button type="button" className="employee-text-button" onClick={() => setOvernight(!overnight)}>{overnight ? 'Show daytime hours' : 'Show overnight hours'} <span aria-hidden="true">↗</span></button>
            </div>
            <div className="employee-turnaround"><span aria-hidden="true">◷</span><p><strong>Room to reset.</strong> We reserve 30 minutes after the session for studio turnaround, at no extra charge.</p></div>
          </section>
          <section className="employee-card employee-details"><div className="employee-section-heading"><h2>Session details</h2><span>Make it their own</span></div>
            {setups.length > 0 && <label>Studio setup<select required value={setupId} onChange={(event) => setSetupId(event.target.value)}><option value="">Choose a setup</option>{setups.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}</select></label>}
            <div className="employee-addons">{BOOKING_ADD_ONS.map((addon) => {
              const selected = addOnIds.includes(addon.id)
              const unavailable = addon.id === 'teleprompter' && !teleprompterReady
              return <label key={addon.id} className={selected ? 'employee-addon is-selected' : 'employee-addon'}><input type="checkbox" checked={selected} disabled={unavailable && !selected} onChange={() => setAddOnIds((ids) => selected ? ids.filter((id) => id !== addon.id) : [...ids, addon.id])} /><span><strong>{addon.name}</strong><small>{unavailable ? start ? 'Unavailable or not yet verified' : 'Choose a time to check' : bookingAddOnRateLabel(addon)}</small></span></label>
            })}</div>
            {addOnIds.includes('remote-podcast') && <label>Remote platform <span className="employee-optional">Optional</span><input value={platform} onChange={(event) => setPlatform(event.target.value)} placeholder="Riverside, Zoom, or another platform" maxLength={60} /></label>}
            <p className="employee-quiet-note">Only this studio is reserved. Coordinate operators and cameras separately for overlapping employee bookings.</p>
          </section>
          <section className="employee-card employee-details"><div className="employee-section-heading"><h2>Client details</h2><span>Who’s coming in?</span></div>
            <div className="employee-client-grid"><label>Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Client’s full name" maxLength={120} /></label><label>Email address<input required type="email" autoComplete="email" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} placeholder="client@example.com" maxLength={254} /></label><label>Phone number <span className="employee-optional">Optional</span><input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(415) 555-0123" maxLength={40} /></label><label>Internal note <span className="employee-optional">Optional</span><input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anything the team should know" maxLength={1000} /></label></div>
            <div className="employee-payment-note"><span aria-hidden="true">↗</span><div><strong>Payment link sent automatically</strong><p>The client receives a secure Stripe invoice. No card or upfront payment needed here.</p></div></div>
          </section>
        </fieldset>
        <aside className="employee-summary-column">
          <section className="employee-card employee-summary"><div className="employee-section-heading"><h2>Your session</h2><span className="employee-small-badge">{result?.phase === 'cancelled' ? 'Cancelled' : result ? 'Reserved' : 'New booking'}</span></div>
            <div className="employee-session-photo"><Image src={setup?.image || studio.heroImage} alt={setup?.alt || studio.name} fill sizes="(max-width: 960px) 90vw, 360px" priority /></div>
            <h3>{studio.name}</h3><p className="employee-summary-subtitle">{studio.type === 'podcast' ? 'Podcast session' : 'Studio rental'}</p>
            <dl><div><dt>Date</dt><dd>{new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}</dd></div><div><dt>Time</dt><dd>{start && end ? `${formatTimeForDisplay(new Date(start))} – ${formatTimeForDisplay(end)}` : 'Choose a start time'}</dd></div><div><dt>Duration</dt><dd>{formatBookingDuration(count)}</dd></div><div><dt>Setup</dt><dd>{setup?.label || (setups.length ? 'Choose a setup' : 'Standard studio setup')}</dd></div><div><dt>Studio rate</dt><dd>{money(studio.price * 100)}/hr</dd></div>{addOns.map((addon) => <div key={addon.id}><dt>{addon.name}</dt><dd>{addon.amountCents ? money(addon.amountCents) : 'Included'}</dd></div>)}</dl>
            <div className="employee-total"><span>Session total</span><strong>{money(result?.total || total)}</strong></div>
            {!result && <><button className="employee-primary" type="submit" disabled={busy || (!ready && !attempted)}>{busy ? 'Creating reservation…' : attempted ? 'Retry this booking' : preview ? 'Try creating a booking' : 'Create booking & send link'}<span aria-hidden="true">→</span></button><p className="employee-summary-help">{!start ? 'Choose a start time to continue.' : !sessionReady ? 'Complete your setup and select an available session.' : !name.trim() || !clientEmail.trim() ? 'Add the client’s name and email to continue.' : 'No payment is collected now.'}</p></>}
            {error && <p className="employee-notice" role="alert">{error}</p>}
            {result && <div className="employee-result" ref={resultRef} tabIndex={-1} role="status"><span className="employee-result-check" aria-hidden="true">✓</span><h3>{result.phase === 'cancelled' ? 'Reservation cancelled.' : preview ? 'Preview booking created.' : 'Studio reserved.'}</h3><p>{result.phase === 'cancelled' ? 'The room and selected equipment are available again. The payment link is no longer payable.' : preview ? 'Nothing was sent or charged. This room is now reserved in this preview only.' : `The payment request was sent to ${clientEmail}.`}</p>
              {result.paymentUrl && result.phase !== 'cancelled' && <button type="button" className="employee-secondary" onClick={async () => { try { await navigator.clipboard.writeText(result.paymentUrl!); setCopied(true) } catch { setError('Could not copy the link. Please use the invoice in Stripe.') } }}>{copied ? 'Payment link copied ✓' : 'Copy payment link'}</button>}
              <button type="button" className="employee-primary" onClick={newBooking} disabled={busy}>Create another booking →</button>
              {result.phase !== 'cancelled' && <button type="button" className="employee-text-button" disabled={busy} onClick={() => setCancelPrompt(!cancelPrompt)}>Cancel unpaid reservation</button>}
              {cancelPrompt && <div className="employee-notice"><p>Release this studio and disable the payment link?</p><button type="button" className="employee-secondary" onClick={cancel} disabled={busy}>{busy ? 'Cancelling…' : 'Yes, cancel reservation'}</button></div>}
            </div>}
          </section>
          <div className="employee-reservation-note"><span aria-hidden="true">◇</span><p><strong>Reserved, not paid.</strong> The room stays reserved until a team member cancels. {end && <>Turnaround ends at {formatTimeForDisplay(addMinutes(end, 30))}.</>}</p></div>
        </aside>
      </form>
      <footer className="employee-footer"><span>VibeShack Studios · Team workspace</span><Link href="/employee/">Employee access</Link></footer>
    </div>
  </>
}

'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { STUDIOS } from '@/lib/booking/catalog'
import { getStudioSetup, getStudioSetups } from '@/lib/booking/studio-setups'
import { BOOKING_ADD_ONS, bookingAddOnRateLabel, bookingAddOnTotalCents, priceBookingAddOns, type BookingAddOnId } from '@/lib/booking/add-ons'
import { addMinutes, bookingDateRange, formatBookingDuration, formatDateForDisplay, formatTimeForDisplay, formatTimeRelativeToDate, getBookingWindowForDay } from '@/lib/booking/time'
import { previewSlots, previewTeleprompterAvailable, type PreviewReservation } from '@/lib/employee/preview'
import { EMPLOYEE_TIME_PERIODS, employeeResultStatus, employeeStartSlots, findNextEmployeeSession, sessionFits, timePeriod, type TimePeriod } from '@/lib/employee/scheduling-ui'
import { canContinueEmployeeStep, canVisitEmployeeStep, EMPLOYEE_BOOKING_STEPS, type EmployeeBookingStep } from '@/lib/employee/booking-flow'
import { EmployeeBookingIcon, EmployeeBookingProgress, EmployeeBookingSubmit, EmployeeSelect, EmployeeSessionDetails, EmployeeSessionRecap, EmployeeSetupPicker, EmployeeStepPanel } from './EmployeeBookingUI'

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
  const [step, setStep] = useState<EmployeeBookingStep>(1)
  const [reachedStep, setReachedStep] = useState<EmployeeBookingStep>(1)
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
  const [period, setPeriod] = useState<TimePeriod>('morning')
  const [showUnavailable, setShowUnavailable] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')
  const searchController = useRef<AbortController | null>(null)
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
  const clientRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const mounted = useRef(false)
  const availabilityKey = `${studioId}:${date}`
  const inventoryKey = `${date}:${start}:${count}`
  const daySlots = useMemo(() => getBookingWindowForDay(date), [date])
  const startIndex = daySlots.findIndex((slot) => slot.start.toISOString() === start)
  const selectedSlots = startIndex < 0 ? [] : daySlots.slice(startIndex, startIndex + count).map((slot) => slot.start.toISOString())
  const end = start ? addMinutes(new Date(start), count * 30) : null
  const addOns = priceBookingAddOns(addOnIds, count, platform)
  const total = Math.round(studio.price * count / 2 * 100) + bookingAddOnTotalCents(addOns)
  const currentAvailability = availability.key === availabilityKey
  const availableSet = new Set(currentAvailability ? availability.slots.filter((slot) => slot.available).map((slot) => slot.time) : [])
  const canFit = (index: number, duration = count) => sessionFits(daySlots, availableSet, index, duration)
  const slotReady = currentAvailability && canFit(startIndex) && !searching
  const sessionReady = slotReady && (!setups.length || Boolean(setup))
  const teleprompterReady = inventory.key === inventoryKey && inventory.available
  const locked = busy || attempted || Boolean(result)
  const extrasReady = (!setups.length || Boolean(setup)) && (!addOnIds.includes('teleprompter') || teleprompterReady)
  const ready = sessionReady && !searching && (!addOnIds.includes('teleprompter') || teleprompterReady) && name.trim() && clientEmail.trim() && enabled
  const dateLabel = new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
  const timeLabel = start && end ? `${formatTimeForDisplay(new Date(start))} – ${formatTimeRelativeToDate(end, date)}` : 'Choose a start time'
  const startSlots = useMemo(() => employeeStartSlots(date, daySlots), [date, daySlots])
  const periodSlots = startSlots.filter((slot) => timePeriod(slot.start) === period)
  const visibleSlots = periodSlots.filter((slot) => showUnavailable || canFit(slot.index))
  const nextAction = !enabled ? 'Employee booking is not activated yet.' : searching ? 'Finding your next opening…' : !currentAvailability ? 'Checking studio availability…' : availability.error ? availability.error : !start ? 'Choose a start time to continue.' : !canFit(startIndex) ? 'This time is no longer available. Choose another start time.' : !sessionReady ? 'Choose a studio setup to continue.' : addOnIds.includes('teleprompter') && !teleprompterReady ? 'The teleprompter is unavailable or still being checked. Choose another time or remove it.' : !name.trim() || !clientEmail.trim() ? 'Add the client’s name and email to continue.' : preview ? 'Preview only. No reservation, email, or payment will be created outside this page.' : 'No payment is collected now.'
  const status = result ? employeeResultStatus(result.phase, result.emailed, preview) : null
  const stepCopy = EMPLOYEE_BOOKING_STEPS[step - 1]
  const sessionHelp = searching ? 'Finding your next opening…' : !currentAvailability ? 'Checking availability…' : availability.error || (!start ? 'Choose a start time to continue.' : !canFit(startIndex) ? 'This time is no longer available. Choose another start time.' : 'Your selections carry through to the next step.')
  const extrasHelp = !slotReady ? 'Your session needs an available time. Return to Session to check it.' : setups.length && !setup ? 'Choose a studio setup to continue.' : !extrasReady ? 'The teleprompter is unavailable or still being checked. Remove it or choose another time.' : 'Extras are optional. Nothing is reserved until the final step.'
  const canVisit = (target: EmployeeBookingStep) => canVisitEmployeeStep(step, target, reachedStep, slotReady, extrasReady, locked)

  function visitStep(target: EmployeeBookingStep) {
    if (canVisit(target)) { stopSearch(); setStep(target) }
  }
  function continueStep() {
    if (!canContinueEmployeeStep(step, slotReady, extrasReady, locked)) return
    const next = (step + 1) as EmployeeBookingStep
    setReachedStep((previous) => Math.max(previous, next) as EmployeeBookingStep)
    setStep(next)
  }

  function focusSection(section: HTMLElement | null) {
    section?.focus({ preventScroll: true })
    section?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  }
  function stopSearch() {
    searchController.current?.abort()
    searchController.current = null
    setSearching(false); setSearchMessage('')
  }
  function chooseDate(value: string) {
    stopSearch(); setDate(value); setMonth(value.slice(0, 7)); setStart('')
  }
  async function nextAvailable() {
    if (searchController.current) { stopSearch(); return }
    const controller = new AbortController()
    searchController.current = controller
    setSearching(true); setSearchMessage('Checking the next 7 days, including overnight hours…')
    try {
      const found = await findNextEmployeeSession(dates.slice(0, 7), count, async (day) => {
        if (preview) return previewSlots(day, studioId, reservations)
        const response = await fetch(`/api/employee/availability?${new URLSearchParams({ date: day, studio: studioId })}`, { cache: 'no-store', signal: controller.signal })
        const data = await response.json()
        if (!response.ok || !data.verified) throw new Error(response.status === 401 ? 'Your sign-in has expired. Please sign in again.' : 'Could not verify the next opening. Please try again.')
        return data.slots
      }, controller.signal)
      if (controller.signal.aborted) return
      if (!found) { setSearchMessage('No opening for this session length in the next 7 days. Choose a later date or a shorter session.'); return }
      setDate(found.date); setMonth(found.date.slice(0, 7)); setStart(found.start); setPeriod(timePeriod(new Date(found.start)))
      setAvailability({ key: `${studioId}:${found.date}`, slots: found.slots })
      setSearchMessage('Next available session selected. All times Pacific.')
    } catch (failure) {
      if (!controller.signal.aborted) setSearchMessage(failure instanceof Error ? failure.message : 'Could not find an opening. Please try again.')
    } finally {
      if (searchController.current === controller) { searchController.current = null; setSearching(false) }
    }
  }

  useEffect(() => () => searchController.current?.abort(), [])
  useEffect(() => {
    if (mounted.current) focusSection(headingRef.current)
    else mounted.current = true
  }, [step])

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
    fetch(`/api/employee/add-on-availability?${new URLSearchParams({ date, start, slots: String(count) })}`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (active) setInventory({ key: inventoryKey, available: response.ok && data.verified && data.availability?.teleprompter === true }) })
      .catch(() => { if (active) setInventory({ key: inventoryKey, available: false }) })
    return () => { active = false; controller.abort() }
    // end is derived from start and count; avoid a new Date dependency each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, start, count, inventoryKey, preview, reservations, refresh])
  useEffect(() => { if (result) resultRef.current?.focus() }, [result])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (step !== 3 || submitLock.current || (!ready && !attempted) || result) return
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
    stopSearch()
    setResult(null); setAttempted(false); setStart(''); setName(''); setClientEmail(''); setPhone(''); setNotes(''); setAddOnIds([]); setPlatform(''); setError(''); setCopied(false); setCancelPrompt(false); requestId.current = ''; setRefresh((value) => value + 1)
    setStep(1); setReachedStep(1)
  }
  return <>
    <div className={`employee-workspace employee-workspace--step-${step}`}>
      {!enabled && <p className="employee-notice">Employee booking is not activated yet. You can review availability, but cannot create a reservation.</p>}
      {!result && <EmployeeBookingProgress step={step} canVisit={canVisit} onVisit={visitStep} />}
      <div className="employee-page-heading"><div><span className="employee-eyebrow">VIBESHACK TEAM · BOOK A CLIENT</span><h1 ref={headingRef} tabIndex={-1}>{result ? 'Reservation details.' : stepCopy.title}</h1><p>{result ? 'Your session and payment status, in one place.' : stepCopy.description}</p></div></div>
      {step > 1 && !result && <EmployeeSessionRecap studio={studio.name} date={dateLabel} time={timeLabel} duration={formatBookingDuration(count)} onEdit={() => visitStep(1)} locked={locked} />}
      <form onSubmit={submit} className={`employee-booking-grid employee-booking-grid--step-${step}${result ? ' employee-booking-grid--complete' : ''}`}>
        {!result && <>
        <fieldset disabled={locked} className="employee-main-fields">
          <EmployeeStepPanel step={1} active={step}>
          <div className="employee-card employee-studio-strip">
            <div className="employee-room-thumb"><Image src={studio.heroImage} alt={studio.name} fill sizes="76px" /></div>
            <label className="employee-studio-label"><span>Studio</span><EmployeeSelect variant="studio" aria-label="Studio" value={studioId} onChange={(event) => { stopSearch(); setStudioId(event.target.value); setSetupId(''); setStart('') }}>{STUDIOS.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</EmployeeSelect></label>
            <div className="employee-studio-rate"><strong>{money(studio.price * 100)}<small>/hr</small></strong><span>{studio.type === 'podcast' ? 'Podcast studio' : 'Studio rental'}</span></div>
          </div>
          <section className="employee-card employee-schedule" aria-label="Choose session date and time">
            <div className="employee-schedule-shortcuts" role="group" aria-label="Quick date selection">
              <button type="button" aria-pressed={date === dates[0]} onClick={() => chooseDate(dates[0])}>Today</button>
              <button type="button" aria-pressed={date === dates[1]} onClick={() => chooseDate(dates[1])}>Tomorrow</button>
              <button type="button" onClick={nextAvailable} aria-describedby="employee-search-message">{searching ? 'Cancel search' : 'Next available'} <span aria-hidden="true">↗</span></button>
              <span>Open 24 hours · Pacific time</span>
              <p id="employee-search-message" role="status">{searchMessage}</p>
            </div>
            <div className="employee-calendar"><h2>Select a date</h2><p className="employee-start-date-note">Choose the date your session starts.</p><div className="employee-month"><button type="button" aria-label="Previous month" disabled={month <= dates[0].slice(0, 7)} onClick={() => setMonth(moveMonth(month, -1))}><span aria-hidden="true">←</span> Prev</button><strong>{new Date(`${month}-15T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</strong><button type="button" aria-label="Next month" disabled={month >= dates.at(-1)!.slice(0, 7)} onClick={() => setMonth(moveMonth(month, 1))}>Next <span aria-hidden="true">→</span></button></div>
              <div className="employee-weekdays" aria-hidden="true">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => <span key={label}>{label}</span>)}</div>
              <div className="employee-days">{monthDays(month).map((day, index) => day ? <button type="button" key={day} aria-label={formatDateForDisplay(day)} aria-current={day === dates[0] ? 'date' : undefined} aria-pressed={date === day} className={date === day ? 'selected' : ''} disabled={!dates.includes(day)} onClick={() => chooseDate(day)}>{Number(day.slice(-2))}{day === dates[0] && <i />}</button> : <span key={`blank-${index}`} />)}</div>
              <p className="employee-calendar-note"><span /> Today <span className="employee-legend-square" /> Selected date</p>
            </div>
            <div className="employee-time-panel"><h2>Start time <span>{dateLabel}</span></h2>
              <label className="employee-duration">Session length<EmployeeSelect aria-label="Session length" value={count} onChange={(event) => { stopSearch(); setCount(Number(event.target.value)); setStart('') }}>{Array.from({ length: 15 }, (_, index) => index + 2).map((slots) => <option key={slots} value={slots}>{formatBookingDuration(slots)}</option>)}</EmployeeSelect></label>
              <div className="employee-periods" role="group" aria-label="Time of day">{EMPLOYEE_TIME_PERIODS.map(({ id, label, range }) => <button type="button" key={id} aria-pressed={period === id} onClick={() => setPeriod(id)}><strong>{label}</strong><span>{range}</span></button>)}</div>
              <div className="employee-times" role="group" aria-label="Available start times" aria-busy={!currentAvailability || searching}>{visibleSlots.map((slot) => {
                const iso = slot.start.toISOString()
                return <button type="button" key={iso} disabled={!canFit(slot.index) || searching} aria-pressed={start === iso} className={start === iso ? 'selected' : ''} onClick={() => { setStart(iso); setSearchMessage('') }}>{slot.label}{slot.clock === '12:00 AM' && <small>Midnight</small>}</button>
              })}</div>
              <div className="employee-time-help" aria-live="polite">{!currentAvailability ? 'Checking availability…' : availability.error ? <><span>{availability.error}</span><button type="button" onClick={() => setRefresh((value) => value + 1)}>Retry</button></> : !periodSlots.some((slot) => canFit(slot.index)) ? `No ${period} start times fit ${formatBookingDuration(count)}. Try another time of day or date.` : 'Available times include room turnaround.'}</div>
              <div className="employee-time-options"><button type="button" className="employee-text-button" aria-pressed={showUnavailable} onClick={() => setShowUnavailable(!showUnavailable)}>{showUnavailable ? 'Hide unavailable' : 'Show unavailable'}</button></div>
            </div>
            <div className="employee-turnaround" role="status"><EmployeeBookingIcon name="clock" />{start && end ? <div><strong>{dateLabel} · {timeLabel}</strong><p>{currentAvailability && canFit(startIndex) ? <>Turnaround ends at {formatTimeRelativeToDate(addMinutes(end, 30), date)}. The extra 30 minutes are included.</> : 'Checking this time. It may no longer be available.'}</p></div> : <p><strong>Room to reset.</strong> We reserve 30 minutes after the session for studio turnaround, at no extra charge.</p>}</div>
          </section>
          </EmployeeStepPanel>
          <EmployeeStepPanel step={2} active={step}>
          <section className="employee-card employee-details employee-extras-step" aria-label="Setup and extras">
            {setups.length > 0 && <EmployeeSetupPicker options={setups} value={setupId} onChange={setSetupId} />}
            {!setups.length && <div className="employee-standard-setup"><h2>Standard studio setup</h2><p>Your studio’s standard arrangement is included.</p></div>}
            <div className="employee-extras-heading"><h2>Optional extras</h2><p>Add only what your client needs.</p></div>
            <div className="employee-addons">{BOOKING_ADD_ONS.map((addon) => {
              const selected = addOnIds.includes(addon.id)
              const unavailable = addon.id === 'teleprompter' && !teleprompterReady
              return <label key={addon.id} className={selected ? 'employee-addon is-selected' : 'employee-addon'}><input type="checkbox" checked={selected} disabled={unavailable && !selected} onChange={() => setAddOnIds((ids) => selected ? ids.filter((id) => id !== addon.id) : [...ids, addon.id])} /><span><strong>{addon.name}</strong><small>{bookingAddOnRateLabel(addon)}</small>{unavailable && <small className="employee-addon-availability">{start ? 'Unavailable or not yet verified' : 'Choose a time to check'}</small>}</span></label>
            })}</div>
            {addOnIds.includes('remote-podcast') && <label>Remote platform <span className="employee-optional">Optional</span><input value={platform} onChange={(event) => setPlatform(event.target.value)} placeholder="Riverside, Zoom, or another platform" maxLength={60} /></label>}
            <p className="employee-quiet-note">Only this studio is reserved. Coordinate operators and cameras separately for overlapping employee bookings.</p>
          </section>
          <div className="employee-step-actions"><button type="button" className="employee-text-button" onClick={() => visitStep(1)}>← Back to session</button><div><p className="employee-step-total">Session total<strong>{money(total)}</strong></p><button type="button" className="employee-primary" disabled={!canContinueEmployeeStep(step, slotReady, extrasReady, locked)} onClick={continueStep} aria-describedby="employee-extras-help">Continue to client <span aria-hidden="true">→</span></button><p id="employee-extras-help" role="status">{extrasHelp}</p></div></div>
          </EmployeeStepPanel>
          <EmployeeStepPanel step={3} active={step}>
          <section className="employee-card employee-details" ref={clientRef} tabIndex={-1} aria-label="Client details"><div className="employee-section-heading"><h2>Client details</h2><span>Who’s coming in?</span></div>
            <div className="employee-client-grid"><label>Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Client’s full name" maxLength={120} /></label><label>Email address<input required type="email" autoComplete="email" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} placeholder="client@example.com" maxLength={254} /></label><label>Phone number <span className="employee-optional">Optional</span><input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(415) 555-0123" maxLength={40} /></label><label>Internal note <span className="employee-optional">Optional</span><input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anything the team should know" maxLength={1000} /></label></div>
            <div className="employee-payment-note"><span aria-hidden="true">↗</span><div><strong>{preview ? 'Try the booking flow' : 'Payment link sent automatically'}</strong><p>{preview ? 'Use sample client details. This preview does not send invoices or create real bookings.' : 'The client receives a secure Stripe invoice. No card or upfront payment needed here.'}</p></div></div>
          </section>
          <button type="button" className="employee-text-button employee-back-button" disabled={locked} onClick={() => visitStep(2)}>← Back to setup & extras</button>
          </EmployeeStepPanel>
        </fieldset>
        {step === 1 && <aside className="employee-card employee-compact-summary" aria-label="Session at a glance"><h2>Your session</h2><h3>{studio.name}</h3><p className="employee-summary-subtitle">{money(studio.price * 100)}/hr</p><dl><div><dt>Date</dt><dd>{dateLabel}</dd></div><div><dt>Time</dt><dd>{timeLabel}</dd></div><div><dt>Duration</dt><dd>{formatBookingDuration(count)}</dd></div></dl><div className="employee-total"><span>Studio subtotal</span><strong>{money(Math.round(studio.price * count / 2 * 100))}</strong></div><button type="button" className="employee-primary" onClick={continueStep} disabled={!canContinueEmployeeStep(step, slotReady, extrasReady, locked)} aria-describedby="employee-session-help">Continue to setup <span aria-hidden="true">→</span></button><p className="employee-summary-help" id="employee-session-help" role="status">{sessionHelp}</p></aside>}
        </>}
        <EmployeeStepPanel step={3} active={step}>
        <aside className="employee-summary-column">
          <section className="employee-card employee-summary" aria-label="Review your session"><div className="employee-section-heading"><h2>{result ? 'Your session' : 'Final review'}</h2>{preview && <span className="employee-small-badge">Preview</span>}</div>
            <h3>{studio.name}</h3><p className="employee-summary-subtitle">{studio.type === 'podcast' ? 'Podcast session' : 'Studio rental'}</p>
            <EmployeeSessionDetails
              date={dateLabel}
              time={timeLabel}
              duration={formatBookingDuration(count)}
              setup={setup?.label || (setups.length ? 'Choose a setup' : 'Standard studio setup')}
              rate={`${money(studio.price * 100)}/hr`}
              addOns={[]}
            />
            <dl className="employee-price-breakdown"><div><dt>Studio · {formatBookingDuration(count)}</dt><dd>{money(Math.round(studio.price * count / 2 * 100))}</dd></div>{addOns.map((addon) => <div key={addon.id}><dt>{addon.name}</dt><dd>{addon.amountCents ? money(addon.amountCents) : 'No charge'}</dd></div>)}</dl>
            {!result && <div className="employee-summary-edit" aria-label="Edit booking details"><button type="button" disabled={locked} onClick={() => visitStep(1)}>Edit session</button><button type="button" disabled={locked} onClick={() => visitStep(2)}>Edit setup & extras</button></div>}
            <div className="employee-total"><span>Session total</span><strong>{money(result?.total ?? total)}</strong></div>
            {!result && <EmployeeBookingSubmit preview={preview} busy={busy} attempted={attempted} disabled={busy || (!ready && !attempted)} help={nextAction} />}
            {error && <p className="employee-notice" role="alert">{error}</p>}
            {result && status && <div className="employee-result" ref={resultRef} tabIndex={-1} role="status"><span className="employee-result-check" aria-hidden="true">✓</span><h3>{result.phase === 'cancelled' ? 'Reservation cancelled.' : preview ? 'Preview booking created.' : 'Studio reserved.'}</h3>
              <dl className="employee-result-status"><div><dt>Reservation</dt><dd>{status.reservation}</dd></div><div><dt>Payment</dt><dd>{status.payment}</dd></div><div><dt>Payment request</dt><dd>{status.delivery}</dd></div></dl>
              <p>{result.phase === 'cancelled' ? 'The room and selected equipment are available again. The payment link is no longer payable.' : preview ? 'Nothing was sent or charged. This room is now reserved in this preview only.' : result.emailed ? `Stripe accepted the email request for ${clientEmail}. Delivery to their inbox is not confirmed here.` : 'The studio is reserved, but the payment email has not been sent.'}</p>
              <p className="employee-result-client">{name}<br />{clientEmail}</p>
              {result.paymentUrl && result.phase !== 'cancelled' && <button type="button" className="employee-secondary" onClick={async () => { try { await navigator.clipboard.writeText(result.paymentUrl!); setCopied(true) } catch { setError('Could not copy the link. Please use the invoice in Stripe.') } }}>{copied ? 'Payment link copied ✓' : 'Copy payment link'}</button>}
              <button type="button" className="employee-primary" onClick={newBooking} disabled={busy}>Create another booking →</button>
              {result.phase !== 'cancelled' && result.phase !== 'paid' && <button type="button" className="employee-text-button" disabled={busy} aria-expanded={cancelPrompt} onClick={() => setCancelPrompt(!cancelPrompt)}>Cancel unpaid reservation</button>}
              {cancelPrompt && <div className="employee-notice"><p>{preview ? 'Release this sample studio and equipment reservation?' : 'Release this studio and disable the payment link?'}</p><button type="button" className="employee-secondary" onClick={cancel} disabled={busy}>{busy ? 'Cancelling…' : 'Yes, cancel reservation'}</button><button type="button" className="employee-text-button" onClick={() => setCancelPrompt(false)} disabled={busy}>Keep reservation</button></div>}
            </div>}
          </section>
          {result?.phase !== 'cancelled' && result?.phase !== 'paid' && <div className="employee-reservation-note"><span aria-hidden="true">◇</span><p><strong>Reserve now. Payment later.</strong> {preview ? 'Preview reservations reset when you reload.' : 'Unpaid reservations stay reserved until a team member cancels.'} {end && <>Turnaround ends at {formatTimeRelativeToDate(addMinutes(end, 30), date)}.</>}</p></div>}
        </aside>
        </EmployeeStepPanel>
      </form>
      <footer className="employee-footer"><span>VibeShack Studios · Team workspace</span><div className="employee-footer-actions"><Link href="/employee/">Employee access</Link>{!preview && <form action="/api/employee/auth/logout" method="post"><button type="submit" title={email}>Sign out</button></form>}</div></footer>
    </div>
  </>
}

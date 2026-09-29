'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { EmployeeHistoryItem, EmployeeHistoryPage } from '@/lib/employee/history'
import { EMPLOYEE_METHOD_NAMES, EMPLOYEE_RECORDED_METHODS, employeePaymentLabel, employeeRecordedPayment, type EmployeeRecordedMethod } from '@/lib/employee/payment'
import EmployeeHeader from '../EmployeeHeader'
import { EmployeeSelect } from '../EmployeeBookingUI'
import styles from './BookingsPage.module.css'

type Props = { email: string; role: 'superadmin' | 'employee'; enabled: boolean; preview?: boolean; initial?: EmployeeHistoryPage }
type Booking = Pick<EmployeeHistoryItem, 'phase' | 'payment'>
type Paid = Pick<EmployeeHistoryItem, 'phase' | 'payment' | 'paymentLabel'> & { outcome: 'marked' | 'already-paid' | 'paid-online' }
const date = (value: string) => new Date(value).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', year: 'numeric' })
const time = (value: string) => new Date(value).toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit' })
const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
// Money that moved outside the website is refunded outside it. The server applies the same rules.
const paidOutside = (item: Booking) => item.phase === 'paid' && item.payment !== 'stripe' && item.payment !== 'none'

export function bookingActionNote(item: Booking, role: Props['role'], enabled: boolean) {
  if (item.phase === 'cancelled') return 'Room released'
  if (!enabled) return 'Booking changes are not activated.'
  if (item.phase === 'new' || item.phase === 'reserved') return 'Setup is still in progress.'
  if (item.phase === 'paid' && item.payment === 'stripe') return 'Paid reservations need an administrator review to change.'
  if (paidOutside(item) && role !== 'superadmin') return 'Only an administrator can cancel a paid booking.'
  return 'Being updated. Refresh in a moment.'
}
export function bookingCancelCopy(item: Booking) {
  if (item.payment === 'stripe') return 'The unpaid payment request will be voided and the studio will become available again.'
  return paidOutside(item) ? 'The studio will become available again. Refunds are handled outside the website.' : 'The studio will become available again. Nothing is sent to the client.'
}
export function bookingCancelledMessage(item: Booking, preview: boolean) {
  if (preview) return 'Preview reservation cancelled. No real booking was changed.'
  if (item.payment === 'stripe') return 'Reservation cancelled. The payment request is void and the room has been released.'
  return paidOutside(item) ? 'Reservation cancelled. The room has been released. Handle any refund outside the website.' : 'Reservation cancelled. The room has been released.'
}
export function bookingPaidMessage(paid: Paid, preview: boolean) {
  if (preview) return `Preview booking now shows ${paid.paymentLabel}. No real booking was changed.`
  if (paid.outcome === 'paid-online') return 'The client already paid online, so this booking now shows Paid online. The method you chose was not recorded.'
  if (paid.outcome === 'already-paid') return `This booking was already paid. It shows ${paid.paymentLabel}.`
  return `Payment recorded. This booking now shows ${paid.paymentLabel}.`
}

export default function BookingsPage({ email, role, enabled, preview = false, initial }: Props) {
  const [history, setHistory] = useState<EmployeeHistoryPage | null>(initial || null)
  const [loading, setLoading] = useState(!initial)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [confirm, setConfirm] = useState<{ ref: string; action: 'cancel' | 'paid' } | null>(null)
  const [working, setWorking] = useState<string | null>(null)
  const [method, setMethod] = useState<EmployeeRecordedMethod | ''>('')
  const [note, setNote] = useState('')
  const mounted = useRef(true)
  const trigger = useRef<HTMLButtonElement>(null)
  const status = useRef<HTMLParagraphElement>(null)

  async function load(cursor?: string, signal?: AbortSignal) {
    setLoading(true); setError('')
    try {
      const response = await fetch(`/api/employee/bookings${cursor ? `?${new URLSearchParams({ cursor })}` : ''}`, { cache: 'no-store', signal })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Booking history could not load.')
      if (!mounted.current || signal?.aborted) return
      setHistory((previous) => {
        const items: EmployeeHistoryItem[] = cursor ? Array.from(new Map([...(previous?.items || []), ...data.items].map((item: EmployeeHistoryItem) => [item.ref, item])).values()) : data.items
        return { ...data, items: items.sort((a, b) => b.createdAt - a.createdAt || a.ref.localeCompare(b.ref)) }
      })
    } catch (failure) {
      if (mounted.current && !signal?.aborted) setError(failure instanceof Error ? failure.message : 'Booking history could not load.')
    } finally { if (mounted.current && !signal?.aborted) setLoading(false) }
  }

  useEffect(() => {
    mounted.current = true
    const controller = new AbortController()
    if (!preview) void load(undefined, controller.signal)
    return () => { mounted.current = false; controller.abort() }
  }, [preview])
  // A finished change removes the panel and often its button, so focus moves to the result.
  useEffect(() => { if (message) status.current?.focus() }, [message])

  const expanded = (ref: string, action: 'cancel' | 'paid') => confirm?.ref === ref && confirm.action === action
  // The row buttons are disclosures, so a second press closes the open panel.
  function toggleConfirm(ref: string, action: 'cancel' | 'paid') {
    if (expanded(ref, action)) return setConfirm(null)
    setConfirm({ ref, action }); setMethod(''); setNote(''); setMessage(''); setError('')
  }
  function keep() { trigger.current?.focus(); setConfirm(null) }
  function update(ref: string, change: Partial<EmployeeHistoryItem>) {
    setHistory((previous) => previous ? { ...previous, items: previous.items.map((booking) => booking.ref === ref ? { ...booking, ...change } : booking) } : previous)
  }

  async function cancel(item: EmployeeHistoryItem) {
    setWorking(item.ref); setError(''); setMessage('')
    try {
      if (!preview) {
        const response = await fetch('/api/employee/bookings/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: item.ref }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Cancellation could not finish. Please retry.')
      }
      if (!mounted.current) return
      update(item.ref, { phase: 'cancelled', paymentLabel: employeePaymentLabel({ phase: 'cancelled', payment: item.payment }), canCancel: false, canMarkPaid: false })
      setConfirm(null)
      setMessage(bookingCancelledMessage(item, preview))
    } catch (failure) { if (mounted.current) setError(failure instanceof Error ? failure.message : 'Cancellation could not finish. Please retry.') }
    finally { if (mounted.current) setWorking(null) }
  }

  async function markPaid(item: EmployeeHistoryItem) {
    if (!method || working) return
    setWorking(item.ref); setError(''); setMessage('')
    try {
      let paid: Paid = { phase: 'paid', payment: item.payment, paymentLabel: employeePaymentLabel({ phase: 'paid', payment: item.payment, paidMethod: method }), outcome: 'marked' }
      if (!preview) {
        const response = await fetch('/api/employee/bookings/paid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: item.ref, ...employeeRecordedPayment(method, note) }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'The payment could not be recorded. Please retry.')
        paid = result
      }
      if (!mounted.current) return
      // Only a superadmin may release money that moved outside the website. A paid invoice stays in Stripe review.
      update(item.ref, { phase: paid.phase, payment: paid.payment, paymentLabel: paid.paymentLabel, canMarkPaid: false, canCancel: role === 'superadmin' && paid.payment !== 'stripe' })
      setConfirm(null)
      setMessage(bookingPaidMessage(paid, preview))
    } catch (failure) { if (mounted.current) setError(failure instanceof Error ? failure.message : 'The payment could not be recorded. Please retry.') }
    finally { if (mounted.current) setWorking(null) }
  }

  return <div className={styles.page}>
    <EmployeeHeader email={email} role={role} active="bookings" preview={preview} />
    <main id="employee-content" className={styles.main}>
      <div className={styles.heading}>
        <div><p className={styles.eyebrow}>{role === 'superadmin' ? 'Team workspace' : 'Your workspace'}</p><h1>Bookings</h1><p>{role === 'superadmin' ? 'Employee-created reservations across the team.' : 'Reservations you created for your clients.'} All session times are Pacific.</p></div>
        <Link className={styles.primary} href={preview ? '/employee/preview/' : '/employee/book/'}>Book a client <span aria-hidden="true">↗</span></Link>
      </div>
      {preview && <p className={styles.notice}>Local preview · Fictional clients and reservations. Changes on this page stay in this preview.</p>}
      <div className={styles.toolbar}><p>Calendar booking records updated in the last 90 days. Public website bookings are outside this view.</p>{!preview && <button type="button" disabled={loading || Boolean(working)} onClick={() => { setMessage(''); void load() }}>Refresh</button>}</div>
      {error && <div className={styles.notice} role="alert"><p>{error}</p>{!history && <button type="button" disabled={loading} onClick={() => void load()}>Try again</button>}</div>}
      {message && <p className={styles.notice} role="status" ref={status} tabIndex={-1}>{message}</p>}
      {!history && loading && <p className={styles.empty} role="status">Loading booking history…</p>}
      {history && history.items.length === 0 && <div className={styles.empty}><h2>{history.nextCursor ? 'No matching bookings on this page' : 'No bookings to show'}</h2><p>{history.nextCursor ? 'More Calendar records are available. Load more to keep looking.' : 'Employee reservations updated in the last 90 days will appear here.'}</p></div>}
      {history && history.items.length > 0 && <ul className={styles.list} aria-label="Employee bookings">
        {history.items.map((item) => <li className={styles.booking} key={item.ref}>
          <div className={styles.client}><h2>{item.clientName}</h2><p>{item.clientEmail}</p><span className={styles.status} data-phase={item.phase} data-payment={item.payment}>{item.paymentLabel}</span></div>
          <div className={styles.session}><strong>{item.studioName}</strong><p>{date(item.start)}</p><p>{time(item.start)} – {time(item.end)}{date(item.start) !== date(item.end) ? ` · ends ${date(item.end)}` : ''}</p></div>
          <div className={styles.creator}><span>Booked by</span><p>{item.bookedBy}</p><span>{money(item.total)}</span></div>
          <div className={styles.actions}>{enabled && (item.canMarkPaid || item.canCancel) ? <>
            {item.canMarkPaid && <button type="button" ref={expanded(item.ref, 'paid') ? trigger : undefined} disabled={Boolean(working)} aria-expanded={expanded(item.ref, 'paid')} onClick={() => toggleConfirm(item.ref, 'paid')}>Mark as paid</button>}
            {item.canCancel && <button type="button" ref={expanded(item.ref, 'cancel') ? trigger : undefined} disabled={Boolean(working)} aria-expanded={expanded(item.ref, 'cancel')} onClick={() => toggleConfirm(item.ref, 'cancel')}>Cancel reservation</button>}
          </> : <span>{bookingActionNote(item, role, enabled)}</span>}</div>
          {expanded(item.ref, 'paid') && <form className={`${styles.confirm} ${styles.paid}`} aria-label={`Mark the booking for ${item.clientName} as paid`} onSubmit={(event) => { event.preventDefault(); void markPaid(item) }}>
            <div><strong>Mark this booking as paid?</strong><p>The team gets the booking email. If a website invoice was sent, it will show as paid so the client can’t pay twice.</p>
              <div className={styles.fields}><label>How they paid<EmployeeSelect aria-label="How they paid" required value={method} disabled={Boolean(working)} onChange={(event) => setMethod(event.target.value as EmployeeRecordedMethod)}><option value="" disabled>Choose a method</option>{EMPLOYEE_RECORDED_METHODS.map((value) => <option key={value} value={value}>{EMPLOYEE_METHOD_NAMES[value]}</option>)}</EmployeeSelect></label><label>Payment note <span className="employee-optional">Optional</span><input value={note} disabled={Boolean(working)} onChange={(event) => setNote(event.target.value)} placeholder="Zelle confirmation 1234" maxLength={200} /></label></div></div>
            <div><button type="button" disabled={Boolean(working)} onClick={keep}>Keep unpaid</button><button type="submit" disabled={Boolean(working) || !method}>{working === item.ref ? 'Recording…' : 'Confirm payment'}</button></div>
          </form>}
          {expanded(item.ref, 'cancel') && <div className={styles.confirm} role="group" aria-label={`Confirm cancellation for ${item.clientName}`}><div><strong>Cancel this reservation?</strong><p>{bookingCancelCopy(item)}</p></div><div><button type="button" disabled={Boolean(working)} onClick={keep}>Keep reservation</button><button type="button" disabled={Boolean(working)} onClick={() => void cancel(item)}>{working === item.ref ? 'Cancelling…' : 'Confirm cancellation'}</button></div></div>}
        </li>)}
      </ul>}
      {history && <div className={styles.pagination}><p>{history.items.length} {history.items.length === 1 ? 'reservation' : 'reservations'} loaded.{history.nextCursor ? ' More Calendar records are available.' : ' End of this 90-day history window.'}</p>{history.nextCursor && <button type="button" disabled={loading || Boolean(working)} onClick={() => void load(history.nextCursor || undefined)}>{loading ? 'Loading…' : 'Load more'}</button>}</div>}
    </main>
  </div>
}

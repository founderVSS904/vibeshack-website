'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { EmployeeHistoryItem, EmployeeHistoryPage } from '@/lib/employee/history'
import EmployeeHeader from '../EmployeeHeader'
import styles from './BookingsPage.module.css'

type Props = { email: string; role: 'superadmin' | 'employee'; enabled: boolean; preview?: boolean; initial?: EmployeeHistoryPage }
const phases = { new: 'In progress', reserved: 'Payment setup', ready: 'Awaiting payment', paid: 'Paid', cancelled: 'Cancelled' }
const date = (value: string) => new Date(value).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', year: 'numeric' })
const time = (value: string) => new Date(value).toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit' })
const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)

export default function BookingsPage({ email, role, enabled, preview = false, initial }: Props) {
  const [history, setHistory] = useState<EmployeeHistoryPage | null>(initial || null)
  const [loading, setLoading] = useState(!initial)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [confirmRef, setConfirmRef] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const mounted = useRef(true)

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

  async function cancel(item: EmployeeHistoryItem) {
    setCancelling(item.ref); setError(''); setMessage('')
    try {
      if (!preview) {
        const response = await fetch('/api/employee/bookings/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: item.ref }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Cancellation could not finish. Please retry.')
      }
      if (!mounted.current) return
      setHistory((previous) => previous ? { ...previous, items: previous.items.map((booking) => booking.ref === item.ref ? { ...booking, phase: 'cancelled', canCancel: false } : booking) } : previous)
      setConfirmRef(null)
      setMessage(preview ? 'Preview reservation cancelled. No real booking was changed.' : 'Reservation cancelled. The payment request is void and the room has been released.')
    } catch (failure) { if (mounted.current) setError(failure instanceof Error ? failure.message : 'Cancellation could not finish. Please retry.') }
    finally { if (mounted.current) setCancelling(null) }
  }

  return <div className={styles.page}>
    <EmployeeHeader email={email} role={role} active="bookings" preview={preview} />
    <main id="employee-content" className={styles.main}>
      <div className={styles.heading}>
        <div><p className={styles.eyebrow}>{role === 'superadmin' ? 'Team workspace' : 'Your workspace'}</p><h1>Bookings</h1><p>{role === 'superadmin' ? 'Employee-created reservations across the team.' : 'Reservations you created for your clients.'} All session times are Pacific.</p></div>
        <Link className={styles.primary} href={preview ? '/employee/preview/' : '/employee/book/'}>Book a client <span aria-hidden="true">↗</span></Link>
      </div>
      {preview && <p className={styles.notice}>Local preview · Fictional clients and reservations. Changes on this page stay in this preview.</p>}
      <div className={styles.toolbar}><p>Calendar booking records updated in the last 90 days. Public website bookings are outside this view.</p>{!preview && <button type="button" disabled={loading || Boolean(cancelling)} onClick={() => { setMessage(''); void load() }}>Refresh</button>}</div>
      {error && <div className={styles.notice} role="alert"><p>{error}</p>{!history && <button type="button" disabled={loading} onClick={() => void load()}>Try again</button>}</div>}
      {message && <p className={styles.notice} role="status">{message}</p>}
      {!history && loading && <p className={styles.empty} role="status">Loading booking history…</p>}
      {history && history.items.length === 0 && <div className={styles.empty}><h2>{history.nextCursor ? 'No matching bookings on this page' : 'No bookings to show'}</h2><p>{history.nextCursor ? 'More Calendar records are available. Load more to keep looking.' : 'Employee reservations updated in the last 90 days will appear here.'}</p></div>}
      {history && history.items.length > 0 && <ul className={styles.list} aria-label="Employee bookings">
        {history.items.map((item) => <li className={styles.booking} key={item.ref}>
          <div className={styles.client}><h2>{item.clientName}</h2><p>{item.clientEmail}</p><span className={styles.status} data-phase={item.phase}>{phases[item.phase]}</span></div>
          <div className={styles.session}><strong>{item.studioName}</strong><p>{date(item.start)}</p><p>{time(item.start)} – {time(item.end)}{date(item.start) !== date(item.end) ? ` · ends ${date(item.end)}` : ''}</p></div>
          <div className={styles.creator}><span>Booked by</span><p>{item.bookedBy}</p><span>{money(item.total)}</span></div>
          <div className={styles.actions}>{item.canCancel && enabled ? <button type="button" disabled={Boolean(cancelling)} onClick={() => { setConfirmRef(item.ref); setMessage(''); setError('') }}>Cancel reservation</button> : <span>{item.phase === 'paid' ? 'Paid reservations need an administrator review to change.' : item.phase === 'cancelled' ? 'Room released' : !enabled ? 'Cancellation is not activated.' : 'No cancellation action available.'}</span>}</div>
          {confirmRef === item.ref && <div className={styles.confirm} role="group" aria-label={`Confirm cancellation for ${item.clientName}`}><div><strong>Cancel this reservation?</strong><p>The unpaid payment request will be voided and the studio will become available again.</p></div><div><button type="button" disabled={Boolean(cancelling)} onClick={() => setConfirmRef(null)}>Keep reservation</button><button type="button" disabled={Boolean(cancelling)} onClick={() => void cancel(item)}>{cancelling === item.ref ? 'Cancelling…' : 'Confirm cancellation'}</button></div></div>}
        </li>)}
      </ul>}
      {history && <div className={styles.pagination}><p>{history.items.length} {history.items.length === 1 ? 'reservation' : 'reservations'} loaded.{history.nextCursor ? ' More Calendar records are available.' : ' End of this 90-day history window.'}</p>{history.nextCursor && <button type="button" disabled={loading || Boolean(cancelling)} onClick={() => void load(history.nextCursor || undefined)}>{loading ? 'Loading…' : 'Load more'}</button>}</div>}
    </main>
  </div>
}

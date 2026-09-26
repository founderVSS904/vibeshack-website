import { createHash, randomUUID } from 'node:crypto'
import type { BookingCartItem } from '../booking/calendar'
import { buildCanonicalBookingCart, calculateBookingCheckoutPricing } from '../booking/checkout-pricing'
import { bookingDateRange } from '../booking/time'
import { isEmail, stripControlChars } from '../server/sanitize'

export class EmployeeBookingError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}
export type EmployeeBooking = {
  version: 1; ref: string; hash: string; createdAt: number; employee: string
  cart: BookingCartItem[]; customer: { name: string; email: string; phone: string }; notes: string; total: number
  phase: 'new' | 'reserved' | 'ready' | 'paid' | 'cancelled'
  customerId?: string; invoiceId?: string; paymentUrl?: string; emailedAt?: number
  lease?: string; leaseUntil?: number
}
export type Snapshot = { record: EmployeeBooking; etag: string }
export interface EmployeeStore {
  read(): Promise<Snapshot | null>
  create(record: EmployeeBooking): Promise<void>
  save(snapshot: Snapshot, record: EmployeeBooking): Promise<void>
}
export interface EmployeeBookingServices {
  store(ref: string): Promise<EmployeeStore>
  available(record: EmployeeBooking): Promise<void>
  hold(record: EmployeeBooking): Promise<void>
  calendar(record: EmployeeBooking): Promise<void>
  release(record: EmployeeBooking): Promise<void>
  customer(record: EmployeeBooking): Promise<string>
  invoice(record: EmployeeBooking): Promise<string>
  finalize(record: EmployeeBooking): Promise<string>
  send(record: EmployeeBooking): Promise<void>
  voidInvoice(record: EmployeeBooking): Promise<void>
}
export function employeeBookingInput(raw: unknown, employee: string, now = new Date()): EmployeeBooking {
  if (!raw || typeof raw !== 'object') throw new EmployeeBookingError('Invalid booking')
  const input = raw as Record<string, unknown>
  if (typeof input.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId)) throw new EmployeeBookingError('Invalid booking attempt')
  let cart: BookingCartItem[]
  try { cart = buildCanonicalBookingCart([input.session]) } catch (error) { throw new EmployeeBookingError(error instanceof Error ? error.message : 'Invalid session') }
  const item = cart[0]
  if (!bookingDateRange(60, now).includes(item.date) || Date.parse(item.slots[0]) <= now.getTime()) throw new EmployeeBookingError('Choose a future time within the next 60 days')
  // This marker is applied here, behind employee authorization. Never trust a browser flag.
  item.reservationKind = 'employee'
  const customerInput = input.customer as Record<string, unknown> | undefined
  const customer = { name: stripControlChars(customerInput?.name, 120), email: stripControlChars(customerInput?.email, 254).toLowerCase(), phone: stripControlChars(customerInput?.phone, 40) }
  if (!customer.name || !isEmail(customer.email)) throw new EmployeeBookingError('Enter the client’s name and a valid email address')
  const notes = stripControlChars(input.notes, 1000)
  const total = calculateBookingCheckoutPricing(cart).computedTotalCents
  const hash = createHash('sha256').update(JSON.stringify({ cart, customer, notes, total })).digest('hex')
  return { version: 1, ref: `emp-${createHash('sha256').update(`${employee}:${input.requestId}`).digest('hex').slice(0, 40)}`, hash, createdAt: now.getTime(), employee, cart, customer, notes, total, phase: 'new' }
}
export function validEmployeeRef(ref: string) { return /^emp-[a-f0-9]{40}$/.test(ref) }
function conflict(error: unknown) { return [409, 412].includes(Number((error as { code?: number; response?: { status?: number } })?.response?.status || (error as { code?: number })?.code)) }

// Google Calendar ETags serialize booking retries and payment webhooks across
// serverless instances. Provider idempotency keys are secondary protection.
export async function withEmployeeBooking<T>(store: EmployeeStore, action: (record: EmployeeBooking, save: (record: EmployeeBooking) => Promise<void>) => Promise<T>) {
  let snapshot = await store.read()
  if (!snapshot) throw new EmployeeBookingError('Booking not found', 404)
  if ((snapshot.record.leaseUntil || 0) > Date.now()) throw new EmployeeBookingError('This booking is being processed. Please retry shortly.', 409)
  const lease = randomUUID()
  try { await store.save(snapshot, { ...snapshot.record, lease, leaseUntil: Date.now() + 5 * 60_000 }) }
  catch (error) { if (conflict(error)) throw new EmployeeBookingError('This booking is being processed. Please retry shortly.', 409); throw error }
  const save = async (record: EmployeeBooking) => {
    snapshot = await store.read()
    if (!snapshot || snapshot.record.lease !== lease || (snapshot.record.leaseUntil || 0) <= Date.now()) throw new EmployeeBookingError('Booking operation needs a retry', 409)
    await store.save(snapshot, { ...record, lease, leaseUntil: snapshot.record.leaseUntil })
  }
  try {
    snapshot = await store.read()
    if (!snapshot || snapshot.record.lease !== lease) throw new EmployeeBookingError('Booking operation needs a retry', 409)
    return await action(snapshot.record, save)
  } finally {
    const current = await store.read()
    if (current?.record.lease === lease) await store.save(current, { ...current.record, lease: undefined, leaseUntil: undefined })
  }
}
export async function createEmployeeBooking(input: EmployeeBooking, services: EmployeeBookingServices) {
  const store = await services.store(input.ref)
  if (!await store.read()) {
    try { await store.create(input) } catch (error) { if (!conflict(error)) throw error }
  }
  return withEmployeeBooking(store, async (record, save) => {
    if (record.hash !== input.hash || record.employee !== input.employee) throw new EmployeeBookingError('This attempt belongs to different booking details. Start a new booking.', 409)
    if (record.phase === 'cancelled') throw new EmployeeBookingError('This booking was cancelled. Start a new booking.', 409)
    if (record.phase === 'ready' || record.phase === 'paid') return record
    // Stripe retains idempotency keys for at least 24 hours. Do not blindly
    // recreate an uncertain invoice after that window.
    if (Date.now() - record.createdAt > 23 * 3600_000) throw new EmployeeBookingError('This interrupted booking needs administrator review in Calendar and Stripe before retrying.', 409)
    if (record.phase === 'new') {
      await services.available(record)
      await services.hold(record)
      try { await services.available(record) } catch (error) { await services.release(record); throw error }
      await services.calendar({ ...record, phase: 'reserved' })
      record.phase = 'reserved'; await save(record)
    }
    if (!record.customerId) { record.customerId = await services.customer(record); await save(record) }
    if (!record.invoiceId) { record.invoiceId = await services.invoice(record); await save(record) }
    if (!record.paymentUrl) { record.paymentUrl = await services.finalize(record); await save(record) }
    await services.calendar(record)
    if (!record.emailedAt) { await services.send(record); record.emailedAt = Date.now(); await save(record) }
    record.phase = 'ready'; await save(record)
    return record
  })
}
export function employeeBookingResult(record: EmployeeBooking) {
  return { ref: record.ref, phase: record.phase, paymentUrl: record.paymentUrl, emailed: Boolean(record.emailedAt), total: record.total }
}
export async function cancelEmployeeBooking(ref: string, services: EmployeeBookingServices) {
  if (!validEmployeeRef(ref)) throw new EmployeeBookingError('Invalid booking reference')
  return withEmployeeBooking(await services.store(ref), async (record, save) => {
    if (record.phase === 'paid') throw new EmployeeBookingError('This booking has been paid. Review it in Stripe before cancellation.', 409)
    if (!record.invoiceId && record.phase !== 'cancelled') throw new EmployeeBookingError('Finish or recover the payment request before cancelling this booking.', 409)
    if (record.phase !== 'cancelled') { await services.voidInvoice(record); record.phase = 'cancelled'; await save(record) }
    await services.calendar(record)
    await services.release(record)
    return record
  })
}

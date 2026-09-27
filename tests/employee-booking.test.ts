import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NextRequest } from 'next/server'
import { randomUUID } from 'node:crypto'
import { EMPLOYEE_COOKIE, allowedEmployee, readEmployeeSession, signEmployeeToken, readEmployeeToken, localEmployeePreview } from '../lib/employee/auth'
import { employeeGuard } from '../lib/employee/http'
import { createEmployeeBooking, employeeBookingInput, cancelEmployeeBooking, type EmployeeBooking, type EmployeeStore, type EmployeeBookingServices } from '../lib/employee/booking'
import { bookingDateRange, zonedDateTimeToUtc, addMinutes } from '../lib/booking/time'
import { previewSlots, previewTeleprompterAvailable } from '../lib/employee/preview'
import { buildCanonicalBookingCart } from '../lib/booking/checkout-pricing'
import type Stripe from 'stripe'
import { createEmployeeServices, reconcileEmployeeInvoice } from '../lib/employee/providers'
const employee = 'tester@example.com'
function input(addOnIds: string[] = []) {
  const date = bookingDateRange(60)[2]
  const start = zonedDateTimeToUtc(date, 15)
  return { requestId: randomUUID(), session: { studioId: 'the-executive', setupId: 'two-office-chairs-desk', date, slots: Array.from({ length: 4 }, (_, index) => addMinutes(start, index * 30).toISOString()), addOnIds, price: 1, hours: 99, reservationKind: 'employee' }, customer: { name: 'Test Client', email: 'test-client@example.com', phone: '' } }
}
function memoryServices() {
  let record: EmployeeBooking | null = null
  let revision = 0
  const calls: string[] = []
  const failures = new Set<string>()
  const step = (name: string) => { calls.push(name); if (failures.has(name)) throw new Error('Fixture provider failed') }
  const store: EmployeeStore = {
    async read() { return record ? { record: structuredClone(record), etag: String(revision) } : null },
    async create(value) { if (record) throw Object.assign(new Error('Duplicate'), { code: 409 }); record = structuredClone(value); revision++ },
    async save(snapshot, value) { if (snapshot.etag !== String(revision)) throw Object.assign(new Error('ETag conflict'), { code: 412 }); record = structuredClone(value); revision++ },
  }
  const services: EmployeeBookingServices = {
    async store() { return store },
    async available() { step('available') }, async hold() { step('hold') }, async calendar() { step('calendar') }, async release() { step('release') },
    async customer() { step('customer'); return 'cus_fixture' }, async invoice() { step('invoice'); return 'in_fixture' }, async finalize() { step('finalize'); return 'https://invoice.stripe.com/fixture' },
    async send() { step('send') }, async voidInvoice() { step('void') },
  }
  return { services, calls, failures, store }
}
test('staff pricing comes from the canonical catalog and teleprompter is per session', () => {
  const raw = input(['teleprompter', 'live-switching', 'remote-podcast'])
  const record = employeeBookingInput(raw, employee)
  assert.equal(record.total, 80_000) // 600 studio + 50 flat teleprompter + 150 switching
  assert.equal(record.cart[0].hours, 2)
  assert.equal(record.cart[0].reservationKind, 'employee')
  assert.equal(buildCanonicalBookingCart([raw.session])[0].reservationKind, undefined)
  assert.throws(() => employeeBookingInput({ ...raw, customer: { name: 'Test', email: 'invalid' } }, employee), /valid email/)
  assert.throws(() => employeeBookingInput({ ...raw, requestId: 'forged' }, employee), /attempt/)
})
test('staff bookings reject past dates, stale slots, missing setup, and out-of-horizon dates', () => {
  const raw = input()
  assert.throws(() => employeeBookingInput({ ...raw, session: { ...raw.session, setupId: '' } }, employee), /setup/)
  assert.throws(() => employeeBookingInput(raw, employee, new Date('2099-01-01')), /future/)
  assert.throws(() => employeeBookingInput({ ...raw, session: { ...raw.session, slots: [] } }, employee), /cart/)
})
test('employee overnight booking is one session with one flat teleprompter fee; public input cannot opt in', () => {
  const raw = input(['teleprompter', 'live-switching'])
  const start = zonedDateTimeToUtc(raw.session.date, 23)
  raw.session.slots = Array.from({ length: 4 }, (_, index) => addMinutes(start, index * 30).toISOString())
  const record = employeeBookingInput(raw, employee)
  assert.equal(record.cart.length, 1)
  assert.equal(record.cart[0].hours, 2)
  assert.equal(record.total, 80_000)
  assert.equal(record.cart[0].addOns?.find((addon) => addon.id === 'teleprompter')?.amountCents, 5000)
  assert.throws(() => buildCanonicalBookingCart([{ ...raw.session, allowOvernight: true }]), /Invalid cart/)
  const changedDate = { ...raw, session: { ...raw.session, date: bookingDateRange(60)[3] } }
  assert.throws(() => employeeBookingInput(changedDate, employee), /Invalid cart/)
})
test('creation reserves the room before preparing or sending a payment request, and repeat submissions are idempotent', async () => {
  const fixture = memoryServices()
  const record = employeeBookingInput(input(), employee)
  const result = await createEmployeeBooking(record, fixture.services)
  assert.equal(result.phase, 'ready')
  assert.ok(result.emailedAt)
  assert.deepEqual(fixture.calls, ['available', 'hold', 'available', 'calendar', 'customer', 'invoice', 'finalize', 'calendar', 'send'])
  const before = fixture.calls.length
  assert.equal((await createEmployeeBooking(record, fixture.services)).invoiceId, result.invoiceId)
  assert.equal(fixture.calls.length, before)
  assert.equal((await fixture.store.read())?.record.lease, undefined)
})
test('concurrent submissions create only one invoice and one email', async () => {
  const fixture = memoryServices()
  const record = employeeBookingInput(input(), employee)
  const results = await Promise.allSettled([createEmployeeBooking(record, fixture.services), createEmployeeBooking(record, fixture.services)])
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
  assert.equal(fixture.calls.filter((call) => call === 'invoice').length, 1)
  assert.equal(fixture.calls.filter((call) => call === 'send').length, 1)
})
test('invoice/email failures preserve the reservation and retries resume instead of creating another invoice', async () => {
  for (const failure of ['invoice', 'finalize', 'send']) {
    const fixture = memoryServices()
    fixture.failures.add(failure)
    const record = employeeBookingInput(input(), employee)
    await assert.rejects(createEmployeeBooking(record, fixture.services))
    const interrupted = (await fixture.store.read())!.record
    assert.equal(interrupted.phase, 'reserved')
    assert.equal(interrupted.emailedAt, undefined)
    assert.equal(fixture.calls.includes('release'), false)
    fixture.failures.clear()
    const result = await createEmployeeBooking(record, fixture.services)
    assert.equal(result.phase, 'ready')
    assert.equal(fixture.calls.filter((call) => call === 'hold').length, 1)
    assert.equal(fixture.calls.filter((call) => call === 'customer').length, 1)
    if (failure !== 'invoice') assert.equal(fixture.calls.filter((call) => call === 'invoice').length, 1)
  }
})
test('a conflicting attempt cannot mutate an existing reservation', async () => {
  const fixture = memoryServices()
  const raw = input()
  await createEmployeeBooking(employeeBookingInput(raw, employee), fixture.services)
  await assert.rejects(createEmployeeBooking(employeeBookingInput({ ...raw, notes: 'changed' }, employee), fixture.services), /different booking details/)
})
test('late uncertain retries stop before the Stripe idempotency retention boundary', async () => {
  const fixture = memoryServices()
  const record = employeeBookingInput(input(), employee)
  record.createdAt = Date.now() - 24 * 3600_000
  await assert.rejects(createEmployeeBooking(record, fixture.services), /administrator review/)
  assert.deepEqual(fixture.calls, [])
})
test('cancellation voids the payment request before releasing inventory; paid bookings are protected', async () => {
  const fixture = memoryServices()
  const record = employeeBookingInput(input(), employee)
  await createEmployeeBooking(record, fixture.services)
  const offset = fixture.calls.length
  assert.equal((await cancelEmployeeBooking(record.ref, fixture.services)).phase, 'cancelled')
  assert.deepEqual(fixture.calls.slice(offset), ['void', 'calendar', 'release'])
  await cancelEmployeeBooking(record.ref, fixture.services)
  assert.equal(fixture.calls.filter((call) => call === 'void').length, 1)
  const snapshot = (await fixture.store.read())!
  await fixture.store.save(snapshot, { ...snapshot.record, phase: 'paid' })
  await assert.rejects(cancelEmployeeBooking(record.ref, fixture.services), /paid/)
})
test('failed void does not release the studio or teleprompter', async () => {
  const fixture = memoryServices()
  const record = employeeBookingInput(input(), employee)
  await createEmployeeBooking(record, fixture.services)
  fixture.failures.add('void')
  await assert.rejects(cancelEmployeeBooking(record.ref, fixture.services))
  assert.equal(fixture.calls.includes('release'), false)
  assert.equal((await fixture.store.read())?.record.phase, 'ready')
})
test('preview reservations block their own studio for 30 extra minutes and equipment only for paid session times', () => {
  const raw = input()
  const start = raw.session.slots[0]
  const end = addMinutes(new Date(start), 120).toISOString()
  const reservations = [{ ref: 'preview', studioId: 'the-executive', start, end, teleprompter: true }]
  const own = previewSlots(raw.session.date, 'the-executive', reservations)
  assert.equal(own.find((slot) => slot.time === end)?.available, false)
  assert.equal(own.find((slot) => slot.time === addMinutes(new Date(end), 30).toISOString())?.available, true)
  assert.equal(previewSlots(raw.session.date, 'the-wing', reservations).find((slot) => slot.time === start)?.available, true)
  assert.equal(previewTeleprompterAvailable(start, end, reservations), false)
  assert.equal(previewTeleprompterAvailable(end, addMinutes(new Date(end), 60).toISOString(), reservations), true)
})
test('employee authentication is exact-allowlist, signed, expiring, purpose-bound, and rejects cross-origin writes', () => {
  const previous = { secret: process.env.EMPLOYEE_SESSION_SECRET, emails: process.env.EMPLOYEE_ALLOWED_EMAILS }
  process.env.EMPLOYEE_SESSION_SECRET = 'fixture-only-not-a-real-secret-value-123456789'
  process.env.EMPLOYEE_ALLOWED_EMAILS = employee
  try {
    const token = signEmployeeToken({ purpose: 'employee-session', email: employee, exp: Date.now() + 60_000 })
    assert.equal(readEmployeeSession(token)?.email, employee)
    assert.equal(readEmployeeSession(`${token}tampered`), null)
    assert.equal(readEmployeeSession(signEmployeeToken({ purpose: 'employee-session', email: employee, exp: Date.now() - 1 })), null)
    assert.equal(readEmployeeToken(token, 'employee-oauth'), null)
    assert.equal(allowedEmployee('other@example.com'), false)
    const unauthorized = new NextRequest('https://www.vibeshackstudios.com/api/employee/bookings')
    assert.equal(employeeGuard(unauthorized, true).response?.status, 401)
    const crossOrigin = new NextRequest('https://www.vibeshackstudios.com/api/employee/bookings', { headers: { cookie: `${EMPLOYEE_COOKIE}=${token}`, origin: 'https://example.org' } })
    assert.equal(employeeGuard(crossOrigin, true).response?.status, 403)
    process.env.EMPLOYEE_ALLOWED_EMAILS = ''
    assert.equal(readEmployeeSession(token), null)
    assert.equal(localEmployeePreview(), false)
  } finally {
    if (previous.secret === undefined) delete process.env.EMPLOYEE_SESSION_SECRET; else process.env.EMPLOYEE_SESSION_SECRET = previous.secret
    if (previous.emails === undefined) delete process.env.EMPLOYEE_ALLOWED_EMAILS; else process.env.EMPLOYEE_ALLOWED_EMAILS = previous.emails
  }
})

test('Stripe invoice adapter uses canonical amount, stable keys, manual collection and one hosted payment link', async () => {
  const record = employeeBookingInput(input(['teleprompter']), employee)
  const requests: Array<{ action: string; data: Record<string, unknown>; key?: string }> = []
  let total = 0
  let status = 'draft'
  const snapshot = () => ({ id: 'in_adapter_fixture', customer: 'cus_adapter_fixture', metadata: { source: 'vibeshack-employee-booking', bookingRef: record.ref }, currency: 'usd', total, status, hosted_invoice_url: status === 'draft' ? null : 'https://invoice.stripe.com/test-fixture' })
  const capture = (action: string, data: Record<string, unknown>, options?: { idempotencyKey?: string }) => requests.push({ action, data, key: options?.idempotencyKey })
  const stripe = {
    customers: { async create(data: Record<string, unknown>, options: { idempotencyKey: string }) { capture('customer', data, options); return { id: 'cus_adapter_fixture' } } },
    invoices: {
      async create(data: Record<string, unknown>, options: { idempotencyKey: string }) { capture('invoice', data, options); return snapshot() },
      async retrieve() { return snapshot() },
      async finalizeInvoice(id: string, data: Record<string, unknown>, options: { idempotencyKey: string }) { capture('finalize', data, options); status = 'open'; return snapshot() },
      async sendInvoice(id: string, data: Record<string, unknown>, options: { idempotencyKey: string }) { capture('send', data, options); return snapshot() },
    },
    invoiceItems: { async create(data: Record<string, unknown>, options: { idempotencyKey: string }) { capture('item', data, options); total = Number(data.amount); return {} } },
  } as unknown as Stripe
  const services = createEmployeeServices(() => stripe)
  record.customerId = await services.customer(record)
  record.invoiceId = await services.invoice(record)
  record.paymentUrl = await services.finalize(record)
  await services.send(record)
  assert.equal(record.paymentUrl, 'https://invoice.stripe.com/test-fixture')
  assert.equal(total, 65000)
  const create = requests.find(({ action }) => action === 'invoice')!
  assert.equal(create.data.auto_advance, false)
  assert.equal(create.data.collection_method, 'send_invoice')
  assert.equal(create.data.pending_invoice_items_behavior, 'exclude')
  assert.equal(create.data.due_date, Date.parse(record.cart[0].slots[0]) / 1000)
  assert.ok(requests.every((request) => request.key?.startsWith(`${record.ref}:`)))
  const itemCount = requests.filter(({ action }) => action === 'item').length
  await services.finalize(record)
  assert.equal(requests.filter(({ action }) => action === 'item').length, itemCount)
})

test('invoice reconciliation validates identity and amount, is retryable, and never regresses paid inventory', async () => {
  const fixture = memoryServices()
  const record = employeeBookingInput(input(), employee)
  await createEmployeeBooking(record, fixture.services)
  const invoice = { id: 'in_fixture', metadata: { source: 'vibeshack-employee-booking', bookingRef: record.ref }, customer: 'cus_fixture', currency: 'usd', status: 'paid', total: record.total, amount_paid: record.total }
  const stripe = { invoices: { async retrieve() { return structuredClone(invoice) } } } as unknown as Stripe
  invoice.total++
  await assert.rejects(reconcileEmployeeInvoice(invoice.id, fixture.services, stripe), /match reservation/)
  assert.equal((await fixture.store.read())?.record.phase, 'ready')
  invoice.total--
  fixture.failures.add('calendar')
  await assert.rejects(reconcileEmployeeInvoice(invoice.id, fixture.services, stripe))
  assert.equal((await fixture.store.read())?.record.phase, 'paid')
  fixture.failures.clear()
  await reconcileEmployeeInvoice(invoice.id, fixture.services, stripe)
  assert.equal((await fixture.store.read())?.record.phase, 'paid')
  invoice.status = 'void'
  await reconcileEmployeeInvoice(invoice.id, fixture.services, stripe)
  assert.equal((await fixture.store.read())?.record.phase, 'paid')
  assert.equal(fixture.calls.includes('release'), false)
})

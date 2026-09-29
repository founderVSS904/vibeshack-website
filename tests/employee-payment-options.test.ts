import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import { test } from 'node:test'
import type Stripe from 'stripe'
import { addMinutes, bookingDateRange, zonedDateTimeToUtc } from '../lib/booking/time'
import { cancelEmployeeBooking, createEmployeeBooking, employeeBookingInput, employeeBookingResult, employeeCanCancel, employeeCanMarkPaid, markEmployeeBookingPaid, type EmployeeBooking, type EmployeeBookingServices, type EmployeeStore } from '../lib/employee/booking'
import { createEmployeeServices, reconcileEmployeeInvoice } from '../lib/employee/providers'
import { employeePaymentLabel } from '../lib/employee/payment'

// Memory store and provider doubles only. No Calendar, Stripe, or mail request is made.
const creator = { id: '5fe67866-274d-4fdd-8666-bb6ec9e077ae', email: 'first@example.invalid', name: 'Fixture Employee', role: 'employee' as const }
const other = { id: '67f2c7af-52b9-4516-9fc7-34d6adf09e2b', email: 'other@example.invalid', name: 'Other Fixture', role: 'employee' as const }
const superadmin = { id: 'a1d2c3b4-52b9-4516-9fc7-34d6adf09e2b', email: 'founder@example.invalid', name: 'Fixture Admin', role: 'superadmin' as const }
const stripeCalls = ['customer', 'invoice', 'finalize', 'send', 'markInvoicePaid', 'void']
function raw(payment?: unknown) {
  const date = bookingDateRange(60)[2]
  const start = zonedDateTimeToUtc(date, 15)
  return { requestId: randomUUID(), session: { studioId: 'the-executive', setupId: 'two-office-chairs-desk', date, slots: Array.from({ length: 4 }, (_, index) => addMinutes(start, index * 30).toISOString()), addOnIds: [] }, customer: { name: 'Private Client', email: 'private-client@example.invalid', phone: '' }, notes: 'Fixture note', ...(payment === undefined ? {} : { payment }) }
}
function memory(initial?: EmployeeBooking) {
  let record: EmployeeBooking | null = initial ? structuredClone(initial) : null
  let revision = 0
  const calls: string[] = []
  const calendars: EmployeeBooking[] = []
  const failures = new Set<string>()
  let paidResult: 'out-of-band' | 'online' = 'out-of-band'
  const step = (name: string) => { calls.push(name); if (failures.has(name)) throw new Error('Fixture provider failed') }
  const store: EmployeeStore = {
    async read() { return record ? { record: structuredClone(record), etag: String(revision) } : null },
    async create(value) { if (record) throw Object.assign(new Error('Duplicate'), { code: 409 }); record = structuredClone(value); revision++ },
    async save(snapshot, value) { if (snapshot.etag !== String(revision)) throw Object.assign(new Error('ETag conflict'), { code: 412 }); record = structuredClone(value); revision++ },
  }
  const services: EmployeeBookingServices = {
    async store() { return store },
    async available() { step('available') }, async hold() { step('hold') }, async release() { step('release') },
    async calendar(value) { calendars.push(structuredClone(value)); step('calendar') },
    async customer() { step('customer'); return 'cus_fixture' }, async invoice() { step('invoice'); return 'in_fixture' }, async finalize() { step('finalize'); return 'https://invoice.example.invalid/fixture' },
    async send() { step('send') }, async markInvoicePaid() { step('markInvoicePaid'); return paidResult }, async notifyPaid() { step('notifyPaid') }, async voidInvoice() { step('void') },
  }
  return { services, store, calls, calendars, failures, online: () => { paidResult = 'online' }, current: async () => (await store.read())!.record }
}
async function captureErrors<T>(action: () => Promise<T>) {
  const logged: unknown[][] = []
  const original = console.error
  console.error = (...values: unknown[]) => { logged.push(values) }
  try { return { value: await action(), logged } } finally { console.error = original }
}
function stored(overrides: Partial<EmployeeBooking>, owner: typeof creator | typeof superadmin = creator): EmployeeBooking {
  return { ...employeeBookingInput(raw(), owner), phase: 'ready', ...overrides }
}

test('a missing payment choice keeps the Stripe flow and the original retry hash', () => {
  const body = raw()
  const record = employeeBookingInput(body, creator)
  const explicit = employeeBookingInput({ ...body, payment: { mode: 'stripe' } }, creator)
  const expected = createHash('sha256').update(JSON.stringify({ cart: record.cart, customer: record.customer, notes: record.notes, total: record.total })).digest('hex')
  assert.equal(record.hash, expected)
  assert.equal(explicit.hash, expected)
  assert.equal(Object.hasOwn(record, 'payment'), false)
  assert.equal(Object.hasOwn(record, 'paidMethod'), false)
  const hashes = new Set([record.hash, ...[{ mode: 'external' }, { mode: 'prepaid', method: 'zelle' }, { mode: 'prepaid', method: 'cash' }, { mode: 'prepaid', method: 'cash', note: 'Front desk' }].map((payment) => employeeBookingInput({ ...body, payment }, creator).hash), employeeBookingInput({ ...body, payment: { mode: 'none' } }, superadmin).hash])
  assert.equal(hashes.size, 6)
  assert.equal(employeeBookingInput({ ...body, payment: { mode: 'external' } }, creator).ref, record.ref)
})

test('payment choices are validated strictly and notes are bounded plain text', () => {
  for (const payment of [null, [], 'external', {}, { mode: 'bogus' }, { mode: 'external', method: 'cash' }, { mode: 'none', note: 'x' }, { mode: 'stripe', method: 'card' }, { mode: 'external', extra: true }]) {
    assert.throws(() => employeeBookingInput(raw(payment), superadmin), /Choose how this booking will be paid/, JSON.stringify(payment))
  }
  for (const method of [undefined, '', 'stripe', 'none', 'CASH', 'paypal', 5]) {
    assert.throws(() => employeeBookingInput(raw({ mode: 'prepaid', method }), creator), /Choose how the client already paid/, String(method))
  }
  assert.throws(() => employeeBookingInput(raw({ mode: 'prepaid', method: 'cash', note: 5 }), creator), /200 characters/)
  assert.throws(() => employeeBookingInput(raw({ mode: 'prepaid', method: 'cash', note: 'x'.repeat(201) }), creator), /200 characters/)
  assert.equal(employeeBookingInput(raw({ mode: 'prepaid', method: 'cash', note: 'x'.repeat(200) }), creator).paidNote?.length, 200)
  const cleaned = employeeBookingInput(raw({ mode: 'prepaid', method: 'bank', note: '  Wire\r\nBcc: wrong@example.invalid\u0000 ' }), creator)
  assert.equal(cleaned.paidNote, 'Wire Bcc: wrong@example.invalid')
  assert.equal(cleaned.paidMethod, 'bank')
  assert.equal(Object.hasOwn(employeeBookingInput(raw({ mode: 'prepaid', method: 'check', note: ' \n ' }), creator), 'paidNote'), false)
})

test('only a superadmin can create a no-charge booking', () => {
  for (const actor of [creator, { email: creator.email, name: creator.name }]) {
    assert.throws(() => employeeBookingInput(raw({ mode: 'none' }), actor), (error: { status?: number; message: string }) => error.status === 403 && /administrator/.test(error.message))
  }
  const record = employeeBookingInput(raw({ mode: 'none' }), superadmin)
  assert.equal(record.payment, 'none')
  assert.equal(record.paidMethod, 'none')
})

test('each payment mode reserves the room the same way and only Stripe mode calls Stripe', async () => {
  const cases = [
    { payment: undefined, actor: creator, phase: 'ready', label: 'Payment link sent', expected: ['available', 'hold', 'available', 'calendar', 'customer', 'invoice', 'finalize', 'send', 'calendar'] },
    { payment: { mode: 'external' }, actor: creator, phase: 'ready', label: 'Awaiting payment', expected: ['available', 'hold', 'available', 'calendar', 'calendar'] },
    { payment: { mode: 'prepaid', method: 'zelle', note: 'Paid at booking' }, actor: creator, phase: 'paid', label: 'Paid by Zelle', expected: ['available', 'hold', 'available', 'calendar', 'calendar', 'notifyPaid'] },
    { payment: { mode: 'none' }, actor: superadmin, phase: 'paid', label: 'No charge', expected: ['available', 'hold', 'available', 'calendar', 'calendar', 'notifyPaid'] },
  ] as const
  for (const item of cases) {
    const fixture = memory()
    const input = employeeBookingInput(raw(item.payment), item.actor)
    const result = await createEmployeeBooking(input, fixture.services)
    assert.deepEqual(fixture.calls, item.expected, JSON.stringify(item.payment))
    assert.equal(result.phase, item.phase)
    assert.equal(employeePaymentLabel(result), item.label)
    assert.equal(employeePaymentLabel(fixture.calendars.at(-1)!), item.label)
    assert.equal(employeePaymentLabel(fixture.calendars[0]), 'In progress')
    if (item.payment) assert.equal(fixture.calls.filter((call) => stripeCalls.includes(call)).length, 0)
    if (item.phase === 'paid') {
      assert.equal(result.paidBy, 'Fixture ' + (item.actor === superadmin ? 'Admin (founder@example.invalid)' : 'Employee (first@example.invalid)'))
      assert.ok(result.paidAt && result.internalNotifiedAt)
    } else assert.equal(result.paidAt, undefined)
    assert.equal(Boolean(result.emailedAt), !item.payment)
    // A retry of a finished booking returns it without another provider call.
    const before = fixture.calls.length
    assert.equal((await createEmployeeBooking(input, fixture.services)).phase, item.phase)
    assert.equal(fixture.calls.length, before)
    assert.equal((await fixture.store.read())?.record.lease, undefined)
  }
})

test('Calendar says a payment link was sent only after the invoice email goes out', async () => {
  const fixture = memory()
  fixture.failures.add('send')
  const input = employeeBookingInput(raw(), creator)
  await assert.rejects(createEmployeeBooking(input, fixture.services), /Fixture provider failed/)
  assert.equal((await fixture.current()).phase, 'reserved')
  assert.deepEqual(fixture.calendars.map(employeePaymentLabel), ['In progress'])
  fixture.failures.clear()
  const result = await createEmployeeBooking(input, fixture.services)
  assert.equal(result.phase, 'ready')
  assert.equal(employeePaymentLabel(fixture.calendars.at(-1)!), 'Payment link sent')
  assert.deepEqual(fixture.calls.slice(-2), ['send', 'calendar'])
  // A Calendar failure after the email is repaired by a retry without a second email.
  const later = memory()
  const second = employeeBookingInput(raw(), creator)
  let calendarWrites = 0
  const calendar = later.services.calendar
  later.services.calendar = async (value) => { if (++calendarWrites === 2) throw new Error('Synthetic Calendar outage'); await calendar(value) }
  await assert.rejects(createEmployeeBooking(second, later.services), /Calendar outage/)
  assert.equal((await later.current()).phase, 'reserved')
  assert.equal((await createEmployeeBooking(second, later.services)).phase, 'ready')
  assert.equal(later.calls.filter((call) => call === 'send').length, 1)
  assert.equal(employeePaymentLabel(later.calendars.at(-1)!), 'Payment link sent')
})

test('a failed staff email never fails a paid booking and is left for the follow-up job', async () => {
  const fixture = memory()
  fixture.failures.add('notifyPaid')
  const input = employeeBookingInput(raw({ mode: 'prepaid', method: 'cash' }), creator)
  const { value, logged } = await captureErrors(() => createEmployeeBooking(input, fixture.services))
  assert.equal(value.phase, 'paid')
  const saved = await fixture.current()
  assert.equal(saved.phase, 'paid')
  assert.equal(saved.internalNotifiedAt, undefined)
  assert.equal(logged.length, 1)
  assert.doesNotMatch(JSON.stringify(logged), /Private Client|private-client|first@example|Fixture Employee/)
  fixture.failures.clear()
  await createEmployeeBooking(input, fixture.services)
  assert.equal(fixture.calls.filter((call) => call === 'notifyPaid').length, 1)
})

test('interrupted non-Stripe bookings resume without a second hold, and concurrent retries notify once', async () => {
  for (const payment of [{ mode: 'external' }, { mode: 'prepaid', method: 'card' }]) {
    const fixture = memory()
    const input = employeeBookingInput(raw(payment), creator)
    let calendarWrites = 0
    const calendar = fixture.services.calendar
    fixture.services.calendar = async (value) => { if (++calendarWrites === 2) throw new Error('Synthetic Calendar outage'); await calendar(value) }
    await assert.rejects(createEmployeeBooking(input, fixture.services), /Calendar outage/)
    assert.equal((await fixture.current()).phase, 'reserved')
    const result = await createEmployeeBooking(input, fixture.services)
    assert.equal(result.phase, payment.mode === 'external' ? 'ready' : 'paid')
    assert.equal(fixture.calls.filter((call) => call === 'hold').length, 1)
    assert.equal(fixture.calls.filter((call) => call === 'notifyPaid').length, payment.mode === 'external' ? 0 : 1)
  }
  const fixture = memory()
  const input = employeeBookingInput(raw({ mode: 'prepaid', method: 'venmo' }), creator)
  const results = await Promise.allSettled([createEmployeeBooking(input, fixture.services), createEmployeeBooking(input, fixture.services)])
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
  assert.equal(fixture.calls.filter((call) => call === 'notifyPaid').length, 1)
})

test('mark as paid records an outside payment for staff-billed bookings without calling Stripe', async () => {
  const fixture = memory(stored({ payment: 'external' }))
  const ref = (await fixture.current()).ref
  const result = await markEmployeeBookingPaid(ref, { ref, method: 'cash', note: 'Front desk' }, fixture.services, creator)
  assert.equal(result.outcome, 'marked')
  assert.deepEqual(fixture.calls, ['calendar', 'notifyPaid'])
  const saved = await fixture.current()
  assert.equal(saved.phase, 'paid')
  assert.equal(saved.paidMethod, 'cash')
  assert.equal(saved.paidNote, 'Front desk')
  assert.equal(saved.paidBy, 'Fixture Employee (first@example.invalid)')
  assert.ok(saved.paidAt && saved.internalNotifiedAt)
  assert.equal(employeePaymentLabel(fixture.calendars[0]), 'Paid in cash')
  // A repeat returns the recorded payment unchanged and only rewrites Calendar.
  const repeat = await markEmployeeBookingPaid(ref, { ref, method: 'zelle' }, fixture.services, creator)
  assert.equal(repeat.outcome, 'already-paid')
  assert.equal(repeat.record.paidMethod, 'cash')
  assert.deepEqual(fixture.calls, ['calendar', 'notifyPaid', 'calendar'])
  assert.equal(employeePaymentLabel(fixture.calendars.at(-1)!), 'Paid in cash')
})

test('a superadmin may mark another employee booking paid and is recorded as the marker', async () => {
  const fixture = memory(stored({ payment: 'external' }))
  const ref = (await fixture.current()).ref
  await markEmployeeBookingPaid(ref, { ref, method: 'check' }, fixture.services, superadmin)
  const saved = await fixture.current()
  assert.equal(saved.paidBy, 'Fixture Admin (founder@example.invalid)')
  assert.equal(saved.employee, creator.email)
})

test('mark as paid rejects other employees before and inside the lease', async () => {
  const fixture = memory(stored({ payment: 'external' }))
  const ref = (await fixture.current()).ref
  await assert.rejects(markEmployeeBookingPaid(ref, { method: 'cash' }, fixture.services, { ...other, email: creator.email }), { status: 403 })
  assert.deepEqual(fixture.calls, [])
  const read = fixture.store.read
  let reads = 0
  fixture.store.read = async () => {
    const snapshot = await read()
    if (++reads >= 3 && snapshot) snapshot.record.employeeId = other.id
    return snapshot
  }
  await assert.rejects(markEmployeeBookingPaid(ref, { method: 'cash' }, fixture.services, creator), { status: 403 })
  assert.deepEqual(fixture.calls, [])
})

test('mark as paid validates input and only moves bookings awaiting payment', async () => {
  const fixture = memory(stored({ payment: 'external' }))
  const ref = (await fixture.current()).ref
  await assert.rejects(markEmployeeBookingPaid('emp-forged', { method: 'cash' }, fixture.services, creator), /Invalid booking reference/)
  for (const body of [{}, { method: 'stripe' }, { method: 'none' }, { method: 'cash', note: 'x'.repeat(201) }, null]) {
    await assert.rejects(markEmployeeBookingPaid(ref, body, fixture.services, creator), { status: 400 })
  }
  for (const [phase, pattern] of [['cancelled', /cancelled/], ['reserved', /still being set up/], ['new', /still being set up/]] as const) {
    const state = memory(stored({ payment: 'external', phase }))
    await assert.rejects(markEmployeeBookingPaid(ref, { method: 'cash' }, state.services, superadmin), (error: { status?: number; message: string }) => error.status === 409 && pattern.test(error.message))
    assert.deepEqual(state.calls, [])
  }
  const unfinished = memory(stored({}))
  await assert.rejects(markEmployeeBookingPaid(ref, { method: 'cash' }, unfinished.services, creator), { status: 409 })
  assert.deepEqual(unfinished.calls, [])
})

test('Stripe bookings close the invoice first, and a payment already collected online wins', async () => {
  const fixture = memory(stored({ customerId: 'cus_fixture', invoiceId: 'in_fixture', paymentUrl: 'https://invoice.example.invalid/fixture' }))
  const ref = (await fixture.current()).ref
  const result = await markEmployeeBookingPaid(ref, { method: 'zelle', note: 'Sent to studio' }, fixture.services, creator)
  assert.equal(result.outcome, 'marked')
  assert.deepEqual(fixture.calls, ['markInvoicePaid', 'calendar', 'notifyPaid'])
  assert.equal((await fixture.current()).paidMethod, 'zelle')

  const online = memory(stored({ customerId: 'cus_fixture', invoiceId: 'in_fixture' }))
  online.online()
  const paid = await markEmployeeBookingPaid(ref, { method: 'zelle', note: 'Sent to studio' }, online.services, creator)
  assert.equal(paid.outcome, 'paid-online')
  const saved = await online.current()
  assert.equal(saved.paidMethod, 'stripe')
  assert.equal(saved.paidBy, undefined)
  assert.equal(saved.paidNote, undefined)
  assert.equal(employeePaymentLabel(saved), 'Paid online')

  const failed = memory(stored({ customerId: 'cus_fixture', invoiceId: 'in_fixture' }))
  failed.failures.add('markInvoicePaid')
  await assert.rejects(markEmployeeBookingPaid(ref, { method: 'cash' }, failed.services, creator), /Fixture provider failed/)
  assert.equal((await failed.current()).phase, 'ready')
  assert.deepEqual(failed.calls, ['markInvoicePaid'])
})

test('a failed staff email never fails mark as paid', async () => {
  const fixture = memory(stored({ payment: 'external' }))
  fixture.failures.add('notifyPaid')
  const ref = (await fixture.current()).ref
  const { value, logged } = await captureErrors(() => markEmployeeBookingPaid(ref, { method: 'venmo' }, fixture.services, creator))
  assert.equal(value.outcome, 'marked')
  assert.equal((await fixture.current()).internalNotifiedAt, undefined)
  assert.doesNotMatch(JSON.stringify(logged), /Private Client|private-client|first@example/)
})

function invoiceFixture(record: EmployeeBooking, overrides: Record<string, unknown> = {}) {
  return { id: 'in_fixture', customer: 'cus_fixture', currency: 'usd', metadata: { source: 'vibeshack-employee-booking', bookingRef: record.ref }, total: record.total, amount_paid: 0, status: 'open', ...overrides }
}
function stripeDouble(record: EmployeeBooking, states: Array<Record<string, unknown>>, pay: (id: string, data: Record<string, unknown>, options: { idempotencyKey: string }) => Promise<unknown>) {
  const retrieves: string[] = []
  const stripe = { invoices: {
    async retrieve(id: string) { retrieves.push(id); return invoiceFixture(record, states[Math.min(retrieves.length - 1, states.length - 1)]) },
    pay,
  } } as unknown as Stripe
  return { stripe, retrieves }
}

test('Stripe out-of-band adapter pays open invoices once with a stable key and detects online payment races', async () => {
  const record = stored({ customerId: 'cus_fixture', invoiceId: 'in_fixture' })
  const requests: Array<{ data: Record<string, unknown>; key: string }> = []
  const open = stripeDouble(record, [{}], async (id, data, options) => { requests.push({ data, key: options.idempotencyKey }); return invoiceFixture(record, { status: 'paid' }) })
  assert.equal(await createEmployeeServices(() => open.stripe).markInvoicePaid(record), 'out-of-band')
  assert.deepEqual(requests, [{ data: { paid_out_of_band: true }, key: `${record.ref}:paid-out-of-band` }])
  // Staff notes and attribution never reach Stripe.
  assert.doesNotMatch(JSON.stringify(requests), /Fixture|first@example|note/i)

  // A retry after a crash replays the same key and Stripe returns the earlier result.
  const replay = stripeDouble(record, [{ status: 'paid' }], async () => invoiceFixture(record, { status: 'paid' }))
  assert.equal(await createEmployeeServices(() => replay.stripe).markInvoicePaid(record), 'out-of-band')

  const refused = Object.assign(new Error('Invoice is already paid'), { statusCode: 400 })
  const race = stripeDouble(record, [{}, { status: 'paid', amount_paid: record.total }], async () => { throw refused })
  assert.equal(await createEmployeeServices(() => race.stripe).markInvoicePaid(record), 'online')
  assert.equal(race.retrieves.length, 2)
  const earlier = stripeDouble(record, [{ status: 'paid', amount_paid: record.total }], async () => { throw refused })
  assert.equal(await createEmployeeServices(() => earlier.stripe).markInvoicePaid(record), 'online')
  const dashboard = stripeDouble(record, [{ status: 'paid', amount_paid: 0 }], async () => { throw refused })
  await assert.rejects(createEmployeeServices(() => dashboard.stripe).markInvoicePaid(record), { status: 409 })

  const uncertain = stripeDouble(record, [{}], async () => { throw new Error('Synthetic connection reset') })
  await assert.rejects(createEmployeeServices(() => uncertain.stripe).markInvoicePaid(record), /connection reset/)
  for (const state of [{ status: 'void' }, { status: 'draft' }, { status: 'uncollectible' }, { total: record.total + 1 }]) {
    let called = false
    const review = stripeDouble(record, [state], async () => { called = true; return {} })
    await assert.rejects(createEmployeeServices(() => review.stripe).markInvoicePaid(record), { status: 409 })
    assert.equal(called, false)
  }
  const forged = stripeDouble(record, [{ metadata: { source: 'vibeshack-employee-booking', bookingRef: `emp-${'f'.repeat(40)}` } }], async () => { throw new Error('Unexpected pay') })
  await assert.rejects(createEmployeeServices(() => forged.stripe).markInvoicePaid(record), /identity mismatch/)
})

test('reconciliation accepts out-of-band payment without replacing the recorded method or marker', async () => {
  const marked = stored({ customerId: 'cus_fixture', invoiceId: 'in_fixture', phase: 'paid', paidMethod: 'zelle', paidNote: 'Sent', paidBy: 'Fixture Admin (founder@example.invalid)', paidAt: 1, internalNotifiedAt: 2 })
  for (const invoice of [{ status: 'paid', amount_paid: 0 }, { status: 'paid', amount_paid: 0, paid_out_of_band: true }, { status: 'paid', amount_paid: marked.total }]) {
    const fixture = memory(marked)
    const stripe = { invoices: { async retrieve() { return invoiceFixture(marked, invoice) } } } as unknown as Stripe
    assert.equal(await reconcileEmployeeInvoice('in_fixture', fixture.services, stripe), true)
    const saved = await fixture.current()
    assert.deepEqual({ method: saved.paidMethod, note: saved.paidNote, by: saved.paidBy, at: saved.paidAt, phase: saved.phase }, { method: 'zelle', note: 'Sent', by: marked.paidBy, at: 1, phase: 'paid' })
    assert.equal(fixture.calls.includes('notifyPaid'), false)
  }
  const waiting = stored({ customerId: 'cus_fixture', invoiceId: 'in_fixture' })
  const collected = memory(waiting)
  const paidAt = 1_790_000_000
  await reconcileEmployeeInvoice('in_fixture', collected.services, { invoices: { async retrieve() { return invoiceFixture(waiting, { status: 'paid', amount_paid: waiting.total, status_transitions: { paid_at: paidAt } }) } } } as unknown as Stripe)
  const online = await collected.current()
  assert.equal(online.paidMethod, 'stripe')
  assert.equal(online.paidAt, paidAt * 1000)
  assert.equal(online.paidBy, undefined)
  assert.equal(employeePaymentLabel(online), 'Paid online')
  const outside = memory(waiting)
  await reconcileEmployeeInvoice('in_fixture', outside.services, { invoices: { async retrieve() { return invoiceFixture(waiting, { status: 'paid', amount_paid: 0 }) } } } as unknown as Stripe)
  assert.equal((await outside.current()).paidMethod, 'other')
  const cancelled = memory({ ...waiting, phase: 'cancelled' })
  await assert.rejects(reconcileEmployeeInvoice('in_fixture', cancelled.services, { invoices: { async retrieve() { return invoiceFixture(waiting, { status: 'paid', amount_paid: 0, paid_out_of_band: true }) } } } as unknown as Stripe), /manual review/)
})

test('a Calendar outage after the invoice closes keeps the staff payment through the webhook and a retry', async () => {
  const fixture = memory(stored({ customerId: 'cus_fixture', invoiceId: 'in_fixture', paymentUrl: 'https://invoice.example.invalid/fixture' }))
  const record = await fixture.current()
  const stripe = { invoices: { async retrieve() { return invoiceFixture(record, { status: 'paid', amount_paid: 0 }) } } } as unknown as Stripe
  const staff = { method: 'cash', note: 'Front desk', by: 'Fixture Employee (first@example.invalid)' }
  const payment = async () => { const saved = await fixture.current(); return { method: saved.paidMethod, note: saved.paidNote, by: saved.paidBy, phase: saved.phase, lease: saved.lease } }
  fixture.failures.add('calendar')
  await assert.rejects(markEmployeeBookingPaid(record.ref, { method: 'cash', note: 'Front desk' }, fixture.services, creator), /Fixture provider failed/)
  assert.deepEqual(fixture.calls, ['markInvoicePaid', 'calendar'])
  assert.deepEqual(await payment(), { ...staff, phase: 'paid', lease: undefined })
  // The invoice.paid webhook from the out-of-band payment never replaces it, in or after the outage.
  await assert.rejects(reconcileEmployeeInvoice('in_fixture', fixture.services, stripe), /Fixture provider failed/)
  assert.deepEqual(await payment(), { ...staff, phase: 'paid', lease: undefined })
  fixture.failures.clear()
  const retry = await markEmployeeBookingPaid(record.ref, { method: 'zelle' }, fixture.services, creator)
  assert.equal(retry.outcome, 'already-paid')
  assert.equal(employeePaymentLabel(fixture.calendars.at(-1)!), 'Paid in cash')
  assert.equal(await reconcileEmployeeInvoice('in_fixture', fixture.services, stripe), true)
  assert.deepEqual(await payment(), { ...staff, phase: 'paid', lease: undefined })
  assert.equal(fixture.calls.filter((call) => call === 'markInvoicePaid').length, 1)
  assert.equal(fixture.calls.filter((call) => call === 'notifyPaid').length, 1)
})

test('cancellation follows the payment mode and the list uses the same rule', async () => {
  const cases: Array<{ record: Partial<EmployeeBooking>; actor: typeof creator | typeof superadmin | typeof other; result: 'cancelled' | 403 | 409; void?: boolean }> = [
    { record: { invoiceId: 'in_fixture', customerId: 'cus_fixture' }, actor: creator, result: 'cancelled', void: true },
    { record: { phase: 'reserved', invoiceId: 'in_fixture', customerId: 'cus_fixture' }, actor: creator, result: 'cancelled', void: true },
    { record: { phase: 'paid', invoiceId: 'in_fixture', paidMethod: 'stripe' }, actor: superadmin, result: 409 },
    { record: { phase: 'paid', invoiceId: 'in_fixture', paidMethod: 'cash', paidBy: 'Fixture Admin (founder@example.invalid)' }, actor: superadmin, result: 409 },
    { record: { phase: 'new' }, actor: superadmin, result: 409 },
    { record: { payment: 'external' }, actor: creator, result: 'cancelled' },
    { record: { payment: 'external', phase: 'reserved' }, actor: creator, result: 'cancelled' },
    { record: { payment: 'external', phase: 'new' }, actor: superadmin, result: 409 },
    { record: { payment: 'external', phase: 'paid', paidMethod: 'zelle' }, actor: creator, result: 403 },
    { record: { payment: 'external', phase: 'paid', paidMethod: 'zelle' }, actor: superadmin, result: 'cancelled' },
    { record: { payment: 'prepaid', phase: 'paid', paidMethod: 'cash' }, actor: creator, result: 403 },
    { record: { payment: 'prepaid', phase: 'paid', paidMethod: 'cash' }, actor: superadmin, result: 'cancelled' },
    { record: { payment: 'prepaid', phase: 'reserved', paidMethod: 'cash' }, actor: creator, result: 403 },
    { record: { payment: 'none', phase: 'paid', paidMethod: 'none' }, actor: creator, result: 'cancelled' },
    { record: { payment: 'none', phase: 'paid', paidMethod: 'none' }, actor: superadmin, result: 'cancelled' },
    { record: { payment: 'none', phase: 'paid', paidMethod: 'none' }, actor: other, result: 403 },
  ]
  for (const item of cases) {
    const record = stored(item.record)
    const fixture = memory(record)
    const label = JSON.stringify(item.record) + item.actor.role
    assert.equal(employeeCanCancel(record, item.actor), item.result === 'cancelled', label)
    if (item.result === 'cancelled') {
      assert.equal((await cancelEmployeeBooking(record.ref, fixture.services, item.actor)).phase, 'cancelled', label)
      assert.deepEqual(fixture.calls, [...(item.void ? ['void'] : []), 'calendar', 'release'], label)
      // Retrying a finished cancellation repeats only the idempotent cleanup.
      await cancelEmployeeBooking(record.ref, fixture.services, item.actor)
      assert.equal(fixture.calls.filter((call) => call === 'void').length, item.void ? 1 : 0, label)
    } else {
      await assert.rejects(cancelEmployeeBooking(record.ref, fixture.services, item.actor), { status: item.result }, label)
      assert.deepEqual(fixture.calls, [], label)
      assert.equal((await fixture.current()).phase, record.phase, label)
    }
  }
})

test('mark-paid permission matches the server rule for each mode, phase, owner and lease', () => {
  assert.equal(employeeCanMarkPaid(stored({ payment: 'external' }), creator), true)
  assert.equal(employeeCanMarkPaid(stored({ invoiceId: 'in_fixture' }), creator), true)
  assert.equal(employeeCanMarkPaid(stored({ invoiceId: 'in_fixture' }), superadmin), true)
  assert.equal(employeeCanMarkPaid(stored({ invoiceId: 'in_fixture' }), other), false)
  assert.equal(employeeCanMarkPaid(stored({}), creator), false)
  assert.equal(employeeCanMarkPaid(stored({ payment: 'external', leaseUntil: Date.now() + 60_000 }), creator), false)
  for (const phase of ['new', 'reserved', 'paid', 'cancelled'] as const) assert.equal(employeeCanMarkPaid(stored({ payment: 'external', phase }), superadmin), false)
  assert.equal(employeeCanMarkPaid(stored({ payment: 'prepaid', phase: 'paid', paidMethod: 'cash' }), superadmin), false)
})

test('payment labels cover every mode and method in plain words', () => {
  const labels = {
    'In progress': { phase: 'reserved' }, 'Payment link sent': { phase: 'ready' }, 'Awaiting payment': { phase: 'ready', payment: 'external' },
    'Paid online': { phase: 'paid' }, 'Paid in cash': { phase: 'paid', payment: 'external', paidMethod: 'cash' }, 'Paid by Zelle': { phase: 'paid', paidMethod: 'zelle' },
    'Paid by Venmo': { phase: 'paid', payment: 'prepaid', paidMethod: 'venmo' }, 'Paid by card': { phase: 'paid', paidMethod: 'card' }, 'Paid by bank transfer': { phase: 'paid', paidMethod: 'bank' },
    'Paid by check': { phase: 'paid', paidMethod: 'check' }, 'Paid (other)': { phase: 'paid', paidMethod: 'other' }, 'No charge': { phase: 'paid', payment: 'none', paidMethod: 'none' }, 'Cancelled': { phase: 'cancelled', payment: 'prepaid' },
  } as const
  for (const [label, record] of Object.entries(labels)) {
    assert.equal(employeePaymentLabel(record as Pick<EmployeeBooking, 'phase' | 'payment' | 'paidMethod'>), label)
    assert.doesNotMatch(label, /\u2014|\u2013/)
  }
})

test('client-facing results never carry payment notes or staff attribution', async () => {
  const fixture = memory()
  const input = employeeBookingInput(raw({ mode: 'prepaid', method: 'cash', note: 'Private staff note' }), creator)
  const record = await createEmployeeBooking(input, fixture.services)
  const result = employeeBookingResult(record)
  assert.deepEqual(result, { ref: record.ref, phase: 'paid', paymentUrl: undefined, emailed: false, total: record.total, payment: 'prepaid', paymentLabel: 'Paid in cash' })
  assert.doesNotMatch(JSON.stringify(result), /Private staff note|Fixture Employee|first@example/)
})

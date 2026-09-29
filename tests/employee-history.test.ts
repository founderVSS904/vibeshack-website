import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import { addMinutes, bookingDateRange, zonedDateTimeToUtc } from '../lib/booking/time'
import { cancelEmployeeBooking, createEmployeeBooking, employeeBookingInput, type EmployeeBooking, type EmployeeBookingServices, type EmployeeStore } from '../lib/employee/booking'
import { employeeBookingHistory, type EmployeeHistorySource } from '../lib/employee/history'

const employee = { id: '5fe67866-274d-4fdd-8666-bb6ec9e077ae', email: 'first@example.invalid', name: 'Fixture Employee', role: 'employee' as const }
const other = { id: '67f2c7af-52b9-4516-9fc7-34d6adf09e2b', email: 'other@example.invalid', name: 'Other Fixture', role: 'employee' as const }
const superadmin = { ...other, role: 'superadmin' as const }
function rawBooking() {
  const date = bookingDateRange(60)[2]
  const start = zonedDateTimeToUtc(date, 15)
  return { requestId: randomUUID(), employeeId: other.id, employee: other.email, session: { studioId: 'the-executive', setupId: 'two-office-chairs-desk', date, slots: Array.from({ length: 4 }, (_, i) => addMinutes(start, i * 30).toISOString()), addOnIds: [] }, customer: { name: 'Fixture Client', email: 'client@example.invalid', phone: '' } }
}
function ready(creator = employee) {
  return { ...employeeBookingInput(rawBooking(), creator), phase: 'ready' as const, invoiceId: 'in_fixture' }
}
function fixture(initial: EmployeeBooking) {
  let record = structuredClone(initial)
  let revision = 0
  const calls: string[] = []
  const store: EmployeeStore = {
    async read() { return { record: structuredClone(record), etag: String(revision) } },
    async create() { throw new Error('Unexpected create') },
    async save(snapshot, next) { assert.equal(snapshot.etag, String(revision)); calls.push('save'); record = structuredClone(next); revision++ },
  }
  const services: EmployeeBookingServices = {
    async store() { return store },
    async available() { calls.push('available') }, async hold() { calls.push('hold') }, async calendar() { calls.push('calendar') }, async release() { calls.push('release') },
    async customer() { calls.push('customer'); return 'cus_fixture' }, async invoice() { calls.push('invoice'); return 'in_fixture' }, async finalize() { calls.push('finalize'); return 'https://example.invalid/invoice' },
    async send() { calls.push('send') }, async markInvoicePaid() { calls.push('markInvoicePaid'); return 'out-of-band' as const }, async notifyPaid() { calls.push('notify') }, async voidInvoice() { calls.push('void') },
  }
  return { services, store, calls }
}

test('booking captures only the authenticated stable employee ID and retries preserve creator identity', async () => {
  const raw = rawBooking()
  const original = employeeBookingInput(raw, employee)
  assert.equal(original.employeeId, employee.id)
  assert.notEqual(original.employeeId, raw.employeeId)
  const retry = employeeBookingInput(raw, { ...employee, email: 'renamed@example.invalid', name: 'Renamed Profile' })
  assert.equal(retry.ref, original.ref)
  const state = fixture({ ...original, phase: 'ready' })
  const result = await createEmployeeBooking(retry, state.services)
  assert.equal(result.employeeId, employee.id)
  assert.equal(result.employee, employee.email)
  assert.equal(result.employeeName, employee.name)
  assert.throws(() => employeeBookingInput(raw, { ...employee, id: 'not-a-uuid' }), /identity is invalid/)
})

test('another employee cannot cancel a booking or acquire its lease, even with the owner email', async () => {
  const record = ready()
  const state = fixture(record)
  await assert.rejects(cancelEmployeeBooking(record.ref, state.services, { ...other, email: employee.email }), { status: 403 })
  assert.deepEqual(state.calls, [])
  assert.deepEqual((await state.store.read())?.record, record)
})

test('stable owner may cancel after an email change, and superadmin may cancel another employee booking', async () => {
  for (const actor of [{ ...employee, email: 'renamed@example.invalid' }, superadmin]) {
    const state = fixture(ready())
    const result = await cancelEmployeeBooking((await state.store.read())!.record.ref, state.services, actor)
    assert.equal(result.phase, 'cancelled')
    assert.deepEqual(state.calls.filter((call) => call !== 'save'), ['void', 'calendar', 'release'])
  }
})

test('only records without an employee ID use the legacy email ownership fallback', async () => {
  const legacy = ready()
  delete legacy.employeeId
  const state = fixture(legacy)
  await assert.rejects(cancelEmployeeBooking(legacy.ref, state.services, other), { status: 403 })
  assert.deepEqual(state.calls, [])
  assert.equal((await cancelEmployeeBooking(legacy.ref, state.services, { ...employee, id: undefined })).phase, 'cancelled')
  const invalid = fixture({ ...ready(), employeeId: 'invalid' })
  await assert.rejects(cancelEmployeeBooking(legacy.ref, invalid.services, employee), { status: 403 })
  assert.deepEqual(invalid.calls, [])
})

test('cancellation rechecks owner after taking the lease and never calls mutation providers if ownership changed', async () => {
  const original = ready()
  const state = fixture(original)
  const read = state.store.read
  let reads = 0
  state.store.read = async () => {
    const snapshot = await read()
    reads++
    if (reads >= 3 && snapshot) snapshot.record.employeeId = other.id
    return snapshot
  }
  await assert.rejects(cancelEmployeeBooking(original.ref, state.services, employee), { status: 403 })
  assert.equal(state.calls.includes('void'), false)
  assert.equal(state.calls.includes('calendar'), false)
  assert.equal(state.calls.includes('release'), false)
})

function event(record: EmployeeBooking) {
  return { description: JSON.stringify(record), updated: '2026-09-26T20:00:00Z', extendedProperties: { private: { source: 'vibeshack-employee-booking-state', bookingRef: record.ref } } }
}

test('history filters client details by stable owner before return and excludes non-state or invalid events', async () => {
  const mine = ready()
  const theirs = ready(other)
  theirs.customer = { name: 'Other Private Client', email: 'other-client@example.invalid', phone: '' }
  const legacy = ready(); delete legacy.employeeId
  const wrongId = { ...ready(), employeeId: other.id }
  const source: EmployeeHistorySource = async () => ({ events: [event(mine), event(theirs), event(legacy), event(wrongId), { ...event(mine), description: 'broken' }, { ...event(mine), extendedProperties: { private: { source: 'public-booking', bookingRef: mine.ref } } }] })
  const result = await employeeBookingHistory(employee, undefined, source)
  assert.equal(result.scope, 'own')
  assert.deepEqual(result.items.map((item) => item.ref).sort(), [mine.ref, legacy.ref].sort())
  assert.equal(JSON.stringify(result).includes(theirs.customer.name), false)
  assert.equal(JSON.stringify(result).includes(theirs.customer.email), false)
  assert.equal(Object.hasOwn(result.items[0], 'notes'), false)
  assert.equal(Object.hasOwn(result.items[0], 'invoiceId'), false)
  assert.equal(result.items[0].canCancel, true)
  const admin = await employeeBookingHistory(superadmin, undefined, source)
  assert.equal(admin.scope, 'team')
  assert.equal(admin.items.length, 4)
})

test('history uses a bounded page and explicit recent window, preserves pagination, and re-filters every cursor', async () => {
  const mine = ready(); const theirs = ready(other)
  const requests: unknown[] = []
  const source: EmployeeHistorySource = async (options) => {
    requests.push(options)
    return options.cursor ? { events: [event(theirs)] } : { events: [event(mine)], nextCursor: 'fixture-next' }
  }
  const now = new Date('2026-09-26T20:00:00Z')
  const first = await employeeBookingHistory(employee, undefined, source, now)
  assert.equal(first.nextCursor, 'fixture-next')
  assert.deepEqual(requests[0], { cursor: undefined, updatedSince: '2026-06-28T20:00:00.000Z', maxResults: 100 })
  const next = await employeeBookingHistory(employee, first.nextCursor!, source, now)
  assert.equal(next.items.length, 0)
  assert.equal(next.nextCursor, null)
  await assert.rejects(employeeBookingHistory(employee, 'x'.repeat(2049), source), /cursor/)
  await assert.rejects(employeeBookingHistory(employee, 'unsafe\nvalue', source), /cursor/)
  assert.equal(requests.length, 2)
})

test('history only permits cancellation for unpaid invoices outside an active lease', async () => {
  const base = ready()
  const records = [base, { ...ready(), phase: 'paid' as const }, { ...ready(), phase: 'cancelled' as const }, { ...ready(), invoiceId: undefined }, { ...ready(), leaseUntil: Date.now() + 60_000 }]
  const result = await employeeBookingHistory(employee, undefined, async () => ({ events: records.map(event) }))
  assert.deepEqual(result.items.filter((item) => item.canCancel).map((item) => item.ref), [base.ref])
})

test('history shows each payment choice with the same cancel and mark-paid rules as the server', async () => {
  const base = ready()
  const noInvoice = (): EmployeeBooking => ({ ...ready(), invoiceId: undefined })
  const records: Record<string, EmployeeBooking> = {
    stripe: base,
    external: { ...noInvoice(), payment: 'external' },
    prepaid: { ...noInvoice(), payment: 'prepaid', phase: 'paid', paidMethod: 'zelle', paidNote: 'Private payment note', paidBy: 'Fixture Employee (first@example.invalid)' },
    none: { ...noInvoice(), payment: 'none', phase: 'paid', paidMethod: 'none' },
    externalPaid: { ...noInvoice(), payment: 'external', phase: 'paid', paidMethod: 'bank', paidBy: 'Other Fixture (other@example.invalid)' },
    stripeMarked: { ...ready(), phase: 'paid', paidMethod: 'cash' },
  }
  const invalid = { ...ready(), payment: 'bogus' } as unknown as EmployeeBooking
  const badMethod = { ...ready(), paidMethod: 'paypal' } as unknown as EmployeeBooking
  const source: EmployeeHistorySource = async () => ({ events: [...Object.values(records), invalid, badMethod].map(event) })
  const own = await employeeBookingHistory(employee, undefined, source)
  const team = await employeeBookingHistory(superadmin, undefined, source)
  const view = (page: typeof own) => Object.fromEntries(Object.entries(records).map(([name, record]) => {
    const item = page.items.find((entry) => entry.ref === record.ref)!
    return [name, [item.payment, item.paymentLabel, item.canCancel, item.canMarkPaid]]
  }))
  assert.equal(own.items.length, 6)
  assert.deepEqual(view(own), {
    stripe: ['stripe', 'Payment link sent', true, true], external: ['external', 'Awaiting payment', true, true],
    prepaid: ['prepaid', 'Paid by Zelle', false, false], none: ['none', 'No charge', true, false],
    externalPaid: ['external', 'Paid by bank transfer', false, false], stripeMarked: ['stripe', 'Paid in cash', false, false],
  })
  assert.deepEqual(view(team), {
    stripe: ['stripe', 'Payment link sent', true, true], external: ['external', 'Awaiting payment', true, true],
    prepaid: ['prepaid', 'Paid by Zelle', true, false], none: ['none', 'No charge', true, false],
    externalPaid: ['external', 'Paid by bank transfer', true, false], stripeMarked: ['stripe', 'Paid in cash', false, false],
  })
  assert.doesNotMatch(JSON.stringify(team), /Private payment note|paidBy|paidNote/)
  const leased = await employeeBookingHistory(employee, undefined, async () => ({ events: [event({ ...records.external, leaseUntil: Date.now() + 60_000 })] }))
  assert.deepEqual([leased.items[0].canCancel, leased.items[0].canMarkPaid], [false, false])
})

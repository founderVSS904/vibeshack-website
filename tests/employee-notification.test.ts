import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import { DELIVERY_LEASE_MS, type DeliveryRecord, type DeliveryStore } from '../lib/booking/delivery'
import { addMinutes, zonedDateTimeToUtc } from '../lib/booking/time'
import type { EmployeeBooking } from '../lib/employee/booking'
import { createEmployeeBookingNotifier, createEmployeeUnpaidReminder, employeeBookingNotification, employeeUnpaidReminder } from '../lib/employee/notification'

function booking(): EmployeeBooking {
  const start = zonedDateTimeToUtc('2026-09-27', 23)
  return {
    version: 1, ref: `emp-${'a'.repeat(40)}`, hash: 'fixture', createdAt: 1,
    employee: 'staff@example.invalid', employeeName: 'Alex Employee', phase: 'paid',
    customer: { name: 'Test Client', email: 'client@example.invalid', phone: '' },
    notes: 'Sample internal note', total: 65000, invoiceId: 'in_fixture',
    cart: [{
      studioId: 'the-executive', studioName: 'The Executive', setupId: 'two-office-chairs-desk',
      date: '2026-09-27', slots: Array.from({ length: 4 }, (_, index) => addMinutes(start, index * 30).toISOString()),
      hours: 2, price: 600, reservationKind: 'employee',
      addOns: [{ id: 'teleprompter', name: 'Teleprompter', hourlyRateCents: 5000, billing: 'session', amountCents: 5000 }],
    }],
  }
}

// Every delivery test injects its own memory ledger and mail transport. None
// calls the production adapter, reads Gmail credentials, or makes a network call.
function fixture(outcome: 'accepted' | 'rejected' | 'uncertain' = 'accepted') {
  let stored: DeliveryRecord | null = null
  let revision = 0
  let now = new Date('2026-09-26T12:00:00Z')
  let failSentSave = false
  const identities: string[] = []
  const messages: Array<ReturnType<typeof employeeBookingNotification> & { messageId: string }> = []
  const store: DeliveryStore = {
    async read() { return stored && { record: structuredClone(stored), etag: String(revision) } },
    async create() {
      if (stored) throw Object.assign(new Error('Exists'), { code: 409 })
      stored = { version: 1, messages: {} }; revision++
    },
    async save(snapshot, record) {
      if (snapshot.etag !== String(revision)) throw Object.assign(new Error('Changed'), { code: 412 })
      if (failSentSave && record.messages.staff?.state === 'sent') throw new Error('Synthetic save failure')
      stored = structuredClone(record); revision++
    },
  }
  const dependencies: Parameters<typeof createEmployeeBookingNotifier>[0] = {
    async store(identity) { identities.push(identity); return store },
    now: () => now,
    async send(message) {
      messages.push(message)
      if (outcome === 'uncertain') throw Object.assign(new Error('Synthetic SMTP timeout'), { code: 'ETIMEDOUT', command: 'DATA' })
      if (outcome === 'rejected') return { accepted: [], rejected: [message.to] }
      return { accepted: [message.to], rejected: [] }
    },
  }
  const notify = createEmployeeBookingNotifier(dependencies)
  const remind = createEmployeeUnpaidReminder(dependencies)
  return {
    notify, remind, messages, identities, store, dependencies,
    accept: () => { outcome = 'accepted' },
    failSentSave: () => { failSentSave = true },
    advance: () => { now = new Date(now.getTime() + DELIVERY_LEASE_MS + 1) },
  }
}

test('staff notification identifies the creator internally with overnight session details and a fixed recipient', () => {
  const record = booking()
  record.phase = 'ready'
  const message = employeeBookingNotification(record)
  assert.equal(message.to, 'founder@vibeshackstudios.com')
  assert.equal(message.subject, 'New Booking: Test Client - The Executive - September 27, 2026')
  assert.match(message.html, /<strong>Booked by:<\/strong> Alex Employee \(staff@example\.invalid\)/)
  assert.ok(message.html.indexOf('Booked by:') < message.html.indexOf('Client:'))
  for (const value of ['Payment link sent', '$650.00', '11:00 PM-1:00 AM (Mon, Sep 28) PT', '2 hours', 'Teleprompter', 'in_fixture', 'Sample internal note']) {
    assert.ok(message.text.includes(value), value)
  }
  assert.equal('cc' in message, false)
  assert.equal('bcc' in message, false)
  assert.equal('replyTo' in message, false)
  record.phase = 'paid'
  assert.match(employeeBookingNotification(record).text, /Payment: Paid online\n/)
  assert.doesNotMatch(employeeBookingNotification(record).text, /Payment link sent|Payment note|Marked paid by/)
})

test('notifications cannot be sent before verified payment or after cancellation', async () => {
  const instance = fixture()
  for (const phase of ['new', 'reserved', 'ready', 'cancelled'] as const) {
    await assert.rejects(instance.notify({ ...booking(), phase }), /requires verified payment/)
  }
  assert.equal(instance.messages.length, 0)
  assert.equal(instance.identities.length, 0)
})

test('older records retain honest email attribution and notification content is escaped', () => {
  const record = booking()
  delete record.employeeName
  assert.match(employeeBookingNotification(record).text, /Booked by: staff@example\.invalid\n/)
  record.employeeName = '   '
  assert.doesNotMatch(employeeBookingNotification(record).text, /Booked by: .*\(/)
  record.employeeName = '<Alex & "Employee">'
  record.customer.name = '<img src=x onerror=alert(1)>\r\nBcc: wrong@example.invalid'
  record.notes = '<script>private & "quoted"</script>'
  const message = employeeBookingNotification(record)
  assert.match(message.html, /&lt;Alex &amp; &quot;Employee&quot;&gt;/)
  assert.match(message.html, /&lt;script&gt;private &amp; &quot;quoted&quot;&lt;\/script&gt;/)
  assert.doesNotMatch(message.html, /<img|<script/)
  assert.doesNotMatch(message.subject, /[\r\n]/)
  assert.equal(message.to, 'founder@vibeshackstudios.com')
})

test('repeat and concurrent staff notifications use one durable delivery and stable message identity', async () => {
  const instance = fixture()
  const record = booking()
  await Promise.allSettled([instance.notify(record), instance.notify(record)])
  await instance.notify(record)
  assert.equal(instance.messages.length, 1)
  assert.equal(instance.messages[0].to, 'founder@vibeshackstudios.com')
  const identity = `employee:${record.ref}`
  assert.ok(instance.identities.every((value) => value === identity))
  assert.equal(instance.messages[0].messageId, `<${createHash('sha256').update(identity).digest('hex').slice(0, 40)}.staff@vibeshackstudios.com>`)
  assert.equal((await instance.store.read())?.record.messages.staff.state, 'sent')
})

test('resolved SMTP rejection remains retryable without changing the recipient or message identity', async () => {
  const instance = fixture('rejected')
  const record = booking()
  await assert.rejects(instance.notify(record), /recipient was rejected/)
  assert.equal((await instance.store.read())?.record.messages.staff.state, 'failed')
  instance.accept()
  await instance.notify(record)
  await instance.notify(record)
  assert.equal(instance.messages.length, 2)
  assert.equal(instance.messages[0].messageId, instance.messages[1].messageId)
  assert.ok(instance.messages.every((message) => message.to === 'founder@vibeshackstudios.com'))
})

test('an uncertain SMTP outcome does not blindly resend an internal notification', async () => {
  const instance = fixture('uncertain')
  const record = booking()
  await assert.rejects(instance.notify(record), /Synthetic SMTP timeout/)
  instance.accept()
  await assert.rejects(instance.notify(record), /delivery uncertain/)
  assert.equal(instance.messages.length, 1)
  assert.equal((await instance.store.read())?.record.messages.staff.state, 'uncertain')
})

test('SMTP acceptance followed by a failed ledger save never causes a duplicate notification', async () => {
  const instance = fixture()
  const record = booking()
  instance.failSentSave()
  await assert.rejects(instance.notify(record), /Synthetic save failure/)
  await assert.rejects(instance.notify(record), /delivery busy/)
  instance.advance()
  await assert.rejects(instance.notify(record), /delivery uncertain/)
  assert.equal(instance.messages.length, 1)
  assert.equal((await instance.store.read())?.record.messages.staff.state, 'uncertain')
})

test('staff email shows the payment label, note, and who marked it paid only when that differs from the creator', () => {
  const record: EmployeeBooking = { ...booking(), payment: 'external', paidMethod: 'cash', paidNote: 'Front desk <b>& "cash"</b>', paidBy: 'Other Staff (other@example.invalid)', paidAt: 1 }
  const message = employeeBookingNotification(record)
  assert.match(message.text, /Payment: Paid in cash\nPayment note: Front desk <b>& "cash"<\/b>\nMarked paid by: Other Staff \(other@example\.invalid\)\nTotal:/)
  assert.match(message.html, /<strong>Payment note:<\/strong> Front desk &lt;b&gt;&amp; &quot;cash&quot;&lt;\/b&gt;/)
  assert.doesNotMatch(message.html, /<b>/)
  const own = employeeBookingNotification({ ...record, paidBy: 'Alex Employee (staff@example.invalid)' })
  assert.doesNotMatch(own.text, /Marked paid by/)
  assert.match(employeeBookingNotification({ ...booking(), payment: 'none', paidMethod: 'none', paidBy: 'Alex Employee (staff@example.invalid)', invoiceId: undefined }).text, /Payment: No charge\n/)
  assert.match(employeeBookingNotification({ ...booking(), payment: 'prepaid', paidMethod: 'zelle' }).text, /Payment: Paid by Zelle\n/)
  assert.equal(message.to, 'founder@vibeshackstudios.com')
  assert.equal('cc' in message, false)
})

test('unpaid reminder goes to staff only, copies an active creator, and links to the Bookings page', () => {
  const record: EmployeeBooking = { ...booking(), phase: 'ready', payment: 'external', invoiceId: undefined }
  const message = employeeUnpaidReminder(record, 'staff@example.invalid')
  assert.equal(message.to, 'founder@vibeshackstudios.com')
  assert.equal(message.cc, 'staff@example.invalid')
  assert.equal(message.subject, 'Unpaid booking: Test Client - The Executive - September 27, 2026')
  for (const value of ['This session starts within 48 hours and is still unpaid.', 'Booked by: Alex Employee (staff@example.invalid)', 'Payment: Awaiting payment', 'Client: Test Client', 'https://www.vibeshackstudios.com/employee/bookings/', 'Mark it paid or cancel it', 'Nothing has been cancelled or released.']) {
    assert.ok(message.text.includes(value), value)
  }
  assert.match(message.html, /<a href="https:\/\/www\.vibeshackstudios\.com\/employee\/bookings\/">/)
  for (const part of [message.subject, message.text, message.html]) assert.doesNotMatch(part, /\u2014|\u2013/)
  // The creator saved in Calendar is never copied on its own.
  assert.equal('cc' in employeeUnpaidReminder(record), false)
  assert.equal('cc' in employeeUnpaidReminder(record, null), false)
  assert.equal('cc' in employeeUnpaidReminder(record, 'Founder@VibeShackStudios.com'), false)
  assert.equal('cc' in employeeUnpaidReminder(record, 'staff@example.invalid\r\nBcc: wrong@example.invalid'), false)
  assert.match(employeeUnpaidReminder({ ...record, payment: undefined, invoiceId: 'in_fixture' }).text, /Payment: Payment link sent\n/)
})

test('unpaid reminder copies the creator only while their team account is active', async () => {
  const record = { ...booking(), phase: 'ready' as const }
  const lookups: string[] = []
  // A disabled or unknown account resolves to null. A failed lookup also sends to staff only.
  for (const [active, cc] of [['staff@example.invalid', 'staff@example.invalid'], [null, undefined], [new Error('Synthetic registry outage'), undefined]] as const) {
    const instance = fixture()
    const remind = createEmployeeUnpaidReminder({ ...instance.dependencies, async activeCreator(value) { lookups.push(value.ref); if (active instanceof Error) throw active; return active } })
    await remind(record)
    assert.equal(instance.messages.length, 1)
    assert.equal(instance.messages[0].to, 'founder@vibeshackstudios.com')
    assert.equal(instance.messages[0].cc, cc)
    assert.ok(instance.messages[0].text.includes('Booked by: Alex Employee (staff@example.invalid)'))
  }
  assert.deepEqual(lookups, [record.ref, record.ref, record.ref])
})

test('unpaid reminder waits for an unpaid booking and uses its own durable ledger entry', async () => {
  const instance = fixture()
  for (const phase of ['new', 'reserved', 'paid', 'cancelled'] as const) {
    await assert.rejects(instance.remind({ ...booking(), phase }), /awaiting payment/)
  }
  assert.equal(instance.messages.length, 0)
  const record = { ...booking(), phase: 'ready' as const }
  await Promise.allSettled([instance.remind(record), instance.remind(record)])
  await instance.remind(record)
  assert.equal(instance.messages.length, 1)
  const identity = createHash('sha256').update(`employee:${record.ref}`).digest('hex').slice(0, 40)
  assert.equal(instance.messages[0].messageId, `<${identity}.unpaid-reminder@vibeshackstudios.com>`)
  await instance.notify({ ...record, phase: 'paid' })
  assert.equal(instance.messages.length, 2)
  assert.equal(instance.messages[1].messageId, `<${identity}.staff@vibeshackstudios.com>`)
  const ledger = (await instance.store.read())?.record.messages
  assert.deepEqual(Object.keys(ledger || {}).sort(), ['staff', 'unpaid-reminder'])
})

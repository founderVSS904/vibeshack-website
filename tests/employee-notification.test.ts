import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import { DELIVERY_LEASE_MS, type DeliveryRecord, type DeliveryStore } from '../lib/booking/delivery'
import { addMinutes, zonedDateTimeToUtc } from '../lib/booking/time'
import type { EmployeeBooking } from '../lib/employee/booking'
import { createEmployeeBookingNotifier, employeeBookingNotification } from '../lib/employee/notification'

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
  const notify = createEmployeeBookingNotifier({
    async store(identity) { identities.push(identity); return store },
    now: () => now,
    async send(message) {
      messages.push(message)
      if (outcome === 'uncertain') throw Object.assign(new Error('Synthetic SMTP timeout'), { code: 'ETIMEDOUT', command: 'DATA' })
      if (outcome === 'rejected') return { accepted: [], rejected: [message.to] }
      return { accepted: [message.to], rejected: [] }
    },
  })
  return {
    notify, messages, identities, store,
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
  for (const value of ['Payment pending', '$650.00', '11:00 PM-1:00 AM (Mon, Sep 28) PT', '2 hours', 'Teleprompter', 'in_fixture', 'Sample internal note']) {
    assert.ok(message.text.includes(value), value)
  }
  assert.equal('cc' in message, false)
  assert.equal('bcc' in message, false)
  assert.equal('replyTo' in message, false)
  record.phase = 'paid'
  assert.match(employeeBookingNotification(record).text, /Payment: Paid\n/)
  assert.doesNotMatch(employeeBookingNotification(record).text, /Payment pending/)
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

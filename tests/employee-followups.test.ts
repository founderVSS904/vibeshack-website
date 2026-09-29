import assert from 'node:assert/strict'
import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { addMinutes, bookingDateRange, zonedDateTimeToUtc } from '../lib/booking/time'
import { employeeBookingInput, type EmployeeBooking, type EmployeeStore } from '../lib/employee/booking'
import { employeeFollowupsForCron, runEmployeeFollowups, type EmployeeFollowupDependencies } from '../lib/employee/followups'
import type { EmployeeHistorySource } from '../lib/employee/history'

// Memory stores, a synthetic Calendar listing, and recording senders only. No
// Calendar, Stripe, or mail request is made and no environment secret is read.
const creator = { id: '5fe67866-274d-4fdd-8666-bb6ec9e077ae', email: 'first@example.invalid', name: 'Fixture Employee' }
const now = new Date('2026-09-28T18:00:00Z')
const settled = new Date(now.getTime() - 30 * 60_000).toISOString()
function booking(startsInHours: number, overrides: Partial<EmployeeBooking> = {}): EmployeeBooking {
  const date = bookingDateRange(60)[2]
  const start = zonedDateTimeToUtc(date, 15)
  const record = employeeBookingInput({ requestId: randomUUID(), session: { studioId: 'the-executive', setupId: 'two-office-chairs-desk', date, slots: Array.from({ length: 4 }, (_, index) => addMinutes(start, index * 30).toISOString()), addOnIds: [] }, customer: { name: 'Private Client', email: 'private-client@example.invalid', phone: '' } }, creator)
  // Move the session relative to the fixed clock; the canonical cart was already validated.
  const first = now.getTime() + startsInHours * 3600_000
  record.cart[0].slots = record.cart[0].slots.map((_, index) => new Date(first + index * 30 * 60_000).toISOString())
  return { ...record, createdAt: now.getTime() - 3600_000, phase: 'ready', invoiceId: 'in_fixture', ...overrides }
}
function harness(records: EmployeeBooking[], updated: Record<string, string> = {}) {
  const state = new Map(records.map((record) => [record.ref, { record: structuredClone(record), revision: 0 }]))
  const sent: Array<{ kind: string; ref: string }> = []
  const failing = new Set<string>()
  const pages: Array<{ cursor?: string; updatedSince: string; maxResults: number }> = []
  let pageSize = 1000
  const source: EmployeeHistorySource = async (options) => {
    pages.push(options)
    const all = [...state.values()].map(({ record }) => record)
    const offset = Number(options.cursor || 0)
    const next = offset + pageSize < all.length ? String(offset + pageSize) : null
    return { events: all.slice(offset, offset + pageSize).map((record) => ({ description: JSON.stringify(record), updated: updated[record.ref] || settled, extendedProperties: { private: { source: 'vibeshack-employee-booking-state', bookingRef: record.ref } } })), nextCursor: next }
  }
  const store = async (ref: string): Promise<EmployeeStore> => ({
    async read() { const entry = state.get(ref); return entry ? { record: structuredClone(entry.record), etag: String(entry.revision) } : null },
    async create() { throw new Error('Unexpected create') },
    async save(snapshot, value) {
      const entry = state.get(ref)!
      if (snapshot.etag !== String(entry.revision)) throw Object.assign(new Error('ETag conflict'), { code: 412 })
      entry.record = structuredClone(value); entry.revision++
    },
  })
  const dependencies: EmployeeFollowupDependencies = {
    source, store,
    async notifyPaid(record) { sent.push({ kind: 'notify', ref: record.ref }); if (failing.has(record.ref)) throw new Error('Synthetic SMTP failure') },
    async remindUnpaid(record) { sent.push({ kind: 'remind', ref: record.ref }); if (failing.has(record.ref)) throw new Error('Synthetic SMTP failure') },
  }
  return { dependencies, sent, failing, pages, state, record: (ref: string) => state.get(ref)!.record, setPageSize: (size: number) => { pageSize = size } }
}
async function quietly<T>(action: () => Promise<T>) {
  const original = console.error
  const logged: unknown[][] = []
  console.error = (...values: unknown[]) => { logged.push(values) }
  try { return { value: await action(), logged } } finally { console.error = original }
}

test('an unpaid booking starting within 48 hours gets one staff reminder and is never cancelled', async () => {
  const stripe = booking(24)
  const external = booking(47, { payment: 'external', invoiceId: undefined })
  const fixture = harness([stripe, external])
  const first = await runEmployeeFollowups({ now }, fixture.dependencies)
  assert.equal(first.reminded, 2)
  assert.deepEqual(fixture.sent.map(({ kind }) => kind), ['remind', 'remind'])
  for (const record of [stripe, external]) {
    const saved = fixture.record(record.ref)
    assert.ok(saved.unpaidReminderAt)
    assert.equal(saved.phase, 'ready')
    assert.equal(saved.lease, undefined)
  }
  const second = await runEmployeeFollowups({ now: new Date(now.getTime() + 3600_000) }, fixture.dependencies)
  assert.equal(second.reminded, 0)
  assert.equal(fixture.sent.length, 2)
})

test('reminders skip sessions outside the window and bookings that are paid, cancelled, in progress or past', async () => {
  const records = [
    booking(49), booking(-1), booking(0.5, { phase: 'paid', internalNotifiedAt: 1 }), booking(10, { phase: 'cancelled' }),
    booking(10, { phase: 'reserved' }), booking(10, { phase: 'new' }), booking(10, { unpaidReminderAt: 1 }),
    booking(10, { payment: 'prepaid', phase: 'paid', paidMethod: 'cash', internalNotifiedAt: 1 }), booking(10, { payment: 'none', phase: 'paid', paidMethod: 'none', internalNotifiedAt: 1 }),
  ]
  const fixture = harness(records)
  const result = await runEmployeeFollowups({ now }, fixture.dependencies)
  assert.equal(result.scanned, records.length)
  assert.equal(result.due, 0)
  assert.deepEqual(fixture.sent, [])
})

test('paid bookings missing their staff email are notified once after they settle', async () => {
  const pending = booking(72, { payment: 'prepaid', phase: 'paid', paidMethod: 'cash', paidAt: now.getTime() - 3600_000 })
  const recent = booking(72, { payment: 'external', phase: 'paid', paidMethod: 'zelle', paidAt: now.getTime() - 60_000 })
  const old = booking(72, { phase: 'paid', paidMethod: 'stripe', paidAt: now.getTime() - 8 * 86_400_000 })
  const legacy = booking(72, { phase: 'paid' })
  const fixture = harness([pending, recent, old, legacy], { [recent.ref]: new Date(now.getTime() - 5 * 60_000).toISOString() })
  const result = await runEmployeeFollowups({ now }, fixture.dependencies)
  assert.deepEqual(fixture.sent, [{ kind: 'notify', ref: pending.ref }, { kind: 'notify', ref: legacy.ref }])
  assert.equal(result.notified, 2)
  assert.ok(fixture.record(pending.ref).internalNotifiedAt)
  await runEmployeeFollowups({ now }, fixture.dependencies)
  assert.equal(fixture.sent.length, 2)
})

test('sends are bounded per run and the rest wait for the next run', async () => {
  const records = Array.from({ length: 25 }, () => booking(12))
  const fixture = harness(records)
  fixture.setPageSize(10)
  const first = await runEmployeeFollowups({ now }, fixture.dependencies)
  assert.deepEqual([first.due, first.reminded, first.deferred], [25, 20, 5])
  assert.deepEqual(fixture.pages.map(({ cursor }) => cursor), [undefined, '10', '20'])
  assert.ok(fixture.pages.every(({ maxResults, updatedSince }) => maxResults === 100 && updatedSince === '2026-06-30T18:00:00.000Z'))
  const second = await runEmployeeFollowups({ now }, fixture.dependencies)
  assert.deepEqual([second.due, second.reminded, second.deferred], [5, 5, 0])
  assert.equal(new Set(fixture.sent.map(({ ref }) => ref)).size, 25)
  const bounded = harness(records.map((record) => ({ ...record, unpaidReminderAt: undefined })))
  bounded.setPageSize(10)
  await runEmployeeFollowups({ now, maxPages: 2 }, bounded.dependencies)
  assert.equal(bounded.pages.length, 2)
})

test('a failed send, a busy lease, or a changed record never blocks the rest of the run', async () => {
  const failed = booking(12)
  const leased = booking(12, { leaseUntil: now.getTime() + 60_000 })
  const busy = booking(12)
  const changed = booking(12)
  const good = booking(12)
  const fixture = harness([failed, leased, busy, changed, good])
  fixture.failing.add(failed.ref)
  const read = fixture.dependencies.store
  fixture.dependencies.store = async (ref) => {
    const store = await read(ref)
    if (ref === busy.ref) fixture.state.get(ref)!.record.leaseUntil = Date.now() + 60_000
    if (ref === changed.ref) fixture.state.get(ref)!.record.phase = 'paid'
    return store
  }
  const { value, logged } = await quietly(() => runEmployeeFollowups({ now }, fixture.dependencies))
  assert.deepEqual([value.reminded, value.failed, value.skipped], [1, 1, 2])
  assert.deepEqual(fixture.sent.map(({ ref }) => ref), [failed.ref, good.ref])
  assert.equal(fixture.record(failed.ref).unpaidReminderAt, undefined)
  assert.equal(fixture.record(changed.ref).unpaidReminderAt, undefined)
  assert.equal(logged.length, 1)
  assert.doesNotMatch(JSON.stringify(logged), /Private Client|private-client|first@example/)
})

test('a dry run counts due follow-ups without leasing or sending', async () => {
  const fixture = harness([booking(12), booking(72, { phase: 'paid', paidAt: now.getTime() - 3600_000 })])
  const saves = [...fixture.state.values()].map(({ revision }) => revision)
  const result = await runEmployeeFollowups({ now, dryRun: true }, fixture.dependencies)
  assert.deepEqual([result.dryRun, result.due, result.reminded, result.notified], [true, 2, 0, 0])
  assert.deepEqual(fixture.sent, [])
  assert.deepEqual([...fixture.state.values()].map(({ revision }) => revision), saves)
})

test('the cron wrapper only runs when employee booking is enabled and never throws', async () => {
  const previous = process.env.EMPLOYEE_BOOKING_ENABLED
  let runs = 0
  const run = async () => { runs++; return { dryRun: false, scanned: 1, due: 1, notified: 0, reminded: 1, skipped: 0, failed: 0, deferred: 0 } }
  try {
    delete process.env.EMPLOYEE_BOOKING_ENABLED
    assert.deepEqual(await employeeFollowupsForCron(false, run), { status: 'disabled' })
    process.env.EMPLOYEE_BOOKING_ENABLED = '0'
    assert.deepEqual(await employeeFollowupsForCron(false, run), { status: 'disabled' })
    assert.equal(runs, 0)
    process.env.EMPLOYEE_BOOKING_ENABLED = '1'
    assert.deepEqual(await employeeFollowupsForCron(false, run), { status: 'ok', dryRun: false, scanned: 1, due: 1, notified: 0, reminded: 1, skipped: 0, failed: 0, deferred: 0 })
    const { value, logged } = await quietly(() => employeeFollowupsForCron(false, async () => { throw new Error('Synthetic Calendar outage for private-client@example.invalid') }))
    assert.deepEqual(value, { status: 'failed' })
    assert.doesNotMatch(JSON.stringify(logged), /private-client|outage/)
  } finally {
    if (previous === undefined) delete process.env.EMPLOYEE_BOOKING_ENABLED; else process.env.EMPLOYEE_BOOKING_ENABLED = previous
  }
})

function actualFunctions(file: string, names: string[]) {
  const source = fs.readFileSync(file, 'utf8')
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true)
  return names.map((name) => {
    const declaration = ast.statements.find((statement) => ts.isFunctionDeclaration(statement) && statement.name?.text === name)
    assert.ok(declaration, `${name} exists in ${file}`)
    return ts.transpileModule(declaration.getText(ast).replace(/^export\s+/, ''), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText
  }).join('\n')
}

test('hourly cron keeps the public reminder response and status when staff follow-ups fail', async () => {
  const order: string[] = []
  const reminderEvent = { eventId: 'evt_fixture', calendarId: 'fixture', bookingRef: 'VS-FIXTURE', customerName: 'Public Client', customerEmail: 'public@example.invalid', studioName: 'The Executive', start: now.toISOString(), end: now.toISOString(), privateProperties: {} }
  const run = async (followups: () => Promise<unknown>) => {
    const context = vm.createContext({
      URL, Map, Array, Date, console: { error() {} },
      process: { env: { CRON_SECRET: 'fixture-cron-value' } },
      NextResponse: { json: (body: unknown, init: { status: number }) => ({ body: JSON.parse(JSON.stringify(body)), status: init.status }) },
      listBookingEventsForReminderWindow: async () => [reminderEvent],
      sendReminderEmail: async () => { order.push('public-send') },
      markBookingReminderSent: async () => { order.push('public-mark') },
      employeeFollowupsForCron: async () => { order.push('employee'); return followups() },
    })
    vm.runInContext(actualFunctions('app/api/cron/booking-reminders/route.ts', ['isAuthorized', 'groupReminderEvents', 'GET']), context)
    return context.GET({ url: 'https://example.invalid/api/cron/booking-reminders/', headers: { get: () => 'Bearer fixture-cron-value' } })
  }
  const previous = process.env.EMPLOYEE_BOOKING_ENABLED
  process.env.EMPLOYEE_BOOKING_ENABLED = '1'
  try {
    const { value: failed } = await quietly(() => run(() => employeeFollowupsForCron(false, async () => { throw new Error('Synthetic failure') })))
    const disabled = await run(async () => ({ status: 'disabled' }))
    assert.deepEqual(order, ['public-send', 'public-mark', 'employee', 'public-send', 'public-mark', 'employee'])
    for (const response of [failed, disabled]) {
      assert.equal(response.status, 200)
      const { employeeFollowups: _employee, ...publicPart } = response.body
      assert.deepEqual(publicPart, { ok: true, dryRun: false, groups: 1, events: 1, sent: 1, failures: [] })
    }
    assert.deepEqual(failed.body.employeeFollowups, { status: 'failed' })
    assert.deepEqual(disabled.body.employeeFollowups, { status: 'disabled' })
  } finally {
    if (previous === undefined) delete process.env.EMPLOYEE_BOOKING_ENABLED; else process.env.EMPLOYEE_BOOKING_ENABLED = previous
  }
})

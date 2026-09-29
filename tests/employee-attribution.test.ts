import assert from 'node:assert/strict'
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import fs from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { createEmployeeBooking, employeeBookingInput, employeeBookingResult, EmployeeBookingError, markEmployeeBookingPaid, type EmployeeBooking, type EmployeeBookingServices, type EmployeeStore } from '../lib/employee/booking'
import { employeeCreatorLabel, employeeDisplayName } from '../lib/employee/identity'
import { employeePaymentDetails, employeePaymentLabel } from '../lib/employee/payment'
import { addMinutes, bookingDateRange, zonedDateTimeToUtc } from '../lib/booking/time'

// Run the production boundary functions with only synthetic identity/provider
// bindings. These contexts cannot access real environment values or the network.
function actualFunction(name: string, file: string) {
  const source = fs.readFileSync(file, 'utf8')
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true)
  const declaration = ast.statements.find((statement) => ts.isFunctionDeclaration(statement) && statement.name?.text === name)
  assert.ok(declaration, `${name} exists in ${file}`)
  return ts.transpileModule(declaration.getText(ast).replace(/^export\s+/, ''), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText
}

const creator = { email: 'staff@example.invalid', name: 'Fixture Employee' }
function rawBooking() {
  const date = bookingDateRange(60)[2]
  const start = zonedDateTimeToUtc(date, 15)
  return {
    requestId: randomUUID(),
    session: { studioId: 'the-executive', setupId: 'two-office-chairs-desk', date, slots: Array.from({ length: 4 }, (_, index) => addMinutes(start, index * 30).toISOString()), addOnIds: [] },
    customer: { name: 'Fixture Client', email: 'client@example.invalid', phone: '' },
    employee: 'forged@example.invalid', employeeName: 'Forged Browser Name', name: 'Another Forged Name',
  }
}

test('employee display names are bounded plain values, with email fallback for legacy records', () => {
  assert.equal(employeeDisplayName('  Fixture\n\u0000 Employee  '), 'Fixture Employee')
  assert.equal(employeeDisplayName('X'.repeat(150))?.length, 120)
  assert.equal(employeeDisplayName({ name: 'not a string' }), undefined)
  assert.equal(employeeDisplayName(' \n '), undefined)
  assert.equal(employeeCreatorLabel({ employee: creator.email, employeeName: creator.name }), 'Fixture Employee (staff@example.invalid)')
  assert.equal(employeeCreatorLabel({ employee: creator.email }), creator.email)
})

test('signed employee sessions retain verified names and accept legacy sessions without names', () => {
  const file = 'lib/employee/auth.ts'
  const context = vm.createContext({
    Buffer, Date, createHmac, timingSafeEqual, employeeDisplayName,
    process: { env: { EMPLOYEE_SESSION_SECRET: 'fixture-only-session-key-at-least-32-characters', EMPLOYEE_ALLOWED_EMAILS: creator.email } },
  })
  vm.runInContext(['secret', 'allowedEmployee', 'signEmployeeToken', 'readEmployeeToken', 'readEmployeeSession'].map((name) => actualFunction(name, file)).join('\n'), context)
  const claims = { purpose: 'employee-session', email: creator.email, exp: Date.now() + 60_000 }
  const token = context.signEmployeeToken({ ...claims, name: creator.name })
  assert.equal(context.readEmployeeSession(token).name, creator.name)
  assert.equal(context.readEmployeeSession(context.signEmployeeToken(claims)).name, undefined)
  const forgedPayload = Buffer.from(JSON.stringify({ ...claims, name: 'Forged Name' })).toString('base64url')
  assert.equal(context.readEmployeeSession(`${forgedPayload}.${token.split('.')[1]}`), null)
})

test('booking API stores the authenticated creator and ignores attribution supplied in the request body', async () => {
  let saved: EmployeeBooking | undefined
  const context = vm.createContext({
    process: { env: { EMPLOYEE_BOOKING_ENABLED: '1' } },
    employeeGuard: () => ({ employee: { ...creator, name: '  Fixture\nEmployee ' } }),
    readJsonBody: async () => rawBooking(), employeeBookingInput, employeeBookingResult,
    createEmployeeBooking: async (record: EmployeeBooking) => { saved = record; return record },
    employeeServices: {}, employeeJson: (value: unknown) => value,
    jsonBodyErrorResponse: (error: unknown) => { throw error },
  })
  vm.runInContext(actualFunction('POST', 'app/api/employee/bookings/route.ts'), context)
  await context.POST({})
  assert.ok(saved)
  assert.equal(saved.employee, creator.email)
  assert.equal(saved.employeeName, creator.name)
})

test('an interrupted booking retry preserves its original creator name even if the employee profile changes', async () => {
  let stored: EmployeeBooking | null = null
  let revision = 0
  let shouldFail = true
  const attributed: string[] = []
  const store: EmployeeStore = {
    async read() { return stored ? { record: structuredClone(stored), etag: String(revision) } : null },
    async create(record) { stored = structuredClone(record); revision++ },
    async save(snapshot, record) { assert.equal(snapshot.etag, String(revision)); stored = structuredClone(record); revision++ },
  }
  const services: EmployeeBookingServices = {
    async store() { return store }, async available() {}, async hold() {}, async release() {}, async voidInvoice() {},
    async calendar(record) { attributed.push(employeeCreatorLabel(record)) },
    async customer() { return 'cus_fixture' }, async invoice() { return 'in_fixture' },
    async finalize() { if (shouldFail) throw new Error('Synthetic interrupted invoice'); return 'https://example.invalid/invoice' },
    async send() {}, async markInvoicePaid() { return 'out-of-band' as const }, async notifyPaid() {},
  }
  const raw = rawBooking()
  await assert.rejects(createEmployeeBooking(employeeBookingInput(raw, creator), services), /interrupted invoice/)
  assert.equal((await store.read())?.record.employeeName, creator.name)
  shouldFail = false
  const result = await createEmployeeBooking(employeeBookingInput(raw, { ...creator, name: 'Updated Profile Name' }), services)
  assert.equal(result.phase, 'ready')
  assert.equal(result.employeeName, creator.name)
  assert.ok(attributed.length >= 2)
  assert.ok(attributed.every((label) => label === 'Fixture Employee (staff@example.invalid)'))
})

for (const existing of [false, true]) {
  test(`private Calendar ${existing ? 'update' : 'creation'} records the creator without notifying or inviting clients`, async () => {
    const record = employeeBookingInput(rawBooking(), creator)
    if (existing) delete record.employeeName // Records created before name capture remain readable.
    const calls: Array<{ method: string; data: { sendUpdates: string; requestBody: Record<string, unknown> } }> = []
    const context = vm.createContext({
      Date, createHash, addMinutes, employeeCreatorLabel, employeePaymentLabel, employeePaymentDetails,
      source: 'vibeshack-employee-booking', BOOKING_TIME_ZONE: 'America/Los_Angeles',
      googleStatus: (error: { code?: number }) => error.code,
      getStudioSetup: () => ({ label: 'Fixture setup' }), describeSlotRanges: () => '3:00 PM-5:00 PM',
      getCalendarConfig: async () => ({ calendarId: 'fixture-calendar', client: { events: {
        get: async () => { if (!existing) throw Object.assign(new Error('Synthetic not found'), { code: 404 }); return { data: { extendedProperties: { private: { bookingRef: record.ref } } } } },
        insert: async (data: { sendUpdates: string; requestBody: Record<string, unknown> }) => { calls.push({ method: 'insert', data }) },
        update: async (data: { sendUpdates: string; requestBody: Record<string, unknown> }) => { calls.push({ method: 'update', data }) },
      } } }),
    })
    vm.runInContext(actualFunction('writeEmployeeCalendar', 'lib/employee/providers.ts'), context)
    await context.writeEmployeeCalendar(record)
    assert.equal(calls.length, 1)
    assert.equal(calls[0].method, existing ? 'update' : 'insert')
    assert.equal(calls[0].data.sendUpdates, 'none')
    assert.equal(calls[0].data.requestBody.visibility, 'private')
    assert.equal(Object.hasOwn(calls[0].data.requestBody, 'attendees'), false)
    const description = String(calls[0].data.requestBody.description)
    assert.ok(description.includes(`Booked by: ${existing ? creator.email : 'Fixture Employee (staff@example.invalid)'}`))
    assert.equal(description.includes('Forged Browser Name'), false)
  })
}

test('booking results exclude the internal creator fields', () => {
  const record = employeeBookingInput(rawBooking(), creator)
  const result = employeeBookingResult(record)
  assert.deepEqual(Object.keys(result).sort(), ['emailed', 'payment', 'paymentLabel', 'paymentUrl', 'phase', 'ref', 'total'])
  assert.equal(JSON.stringify(result).includes(creator.name), false)
  assert.equal(JSON.stringify(result).includes(creator.email), false)
})

async function calendarBody(record: EmployeeBooking) {
  const calls: Array<{ sendUpdates: string; requestBody: { summary: string; description: string; attendees?: unknown; extendedProperties: { private: Record<string, string> } } }> = []
  const context = vm.createContext({
    Date, createHash, addMinutes, employeeCreatorLabel, employeePaymentLabel, employeePaymentDetails,
    source: 'vibeshack-employee-booking', BOOKING_TIME_ZONE: 'America/Los_Angeles',
    googleStatus: (error: { code?: number }) => error.code,
    getStudioSetup: () => ({ label: 'Fixture setup' }), describeSlotRanges: () => '3:00 PM-5:00 PM',
    getCalendarConfig: async () => ({ calendarId: 'fixture-calendar', client: { events: {
      get: async () => { throw Object.assign(new Error('Synthetic not found'), { code: 404 }) },
      insert: async (data: (typeof calls)[number]) => { calls.push(data) },
    } } }),
  })
  vm.runInContext(actualFunction('writeEmployeeCalendar', 'lib/employee/providers.ts'), context)
  await context.writeEmployeeCalendar(record)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].sendUpdates, 'none')
  assert.equal(Object.hasOwn(calls[0].requestBody, 'attendees'), false)
  return calls[0].requestBody
}

test('private Calendar shows the payment label, note, and who marked it paid while keeping paymentStatus', async () => {
  const record: EmployeeBooking = { ...employeeBookingInput(rawBooking(), creator), phase: 'paid', payment: 'external', paidMethod: 'zelle', paidNote: 'Ref 42', paidBy: 'Other Staff (other@example.invalid)' }
  const paid = await calendarBody(record)
  assert.match(paid.summary, / - Fixture Client \(Paid by Zelle\)$/)
  assert.ok(paid.description.includes('Payment: Paid by Zelle\nPayment note: Ref 42\nMarked paid by: Other Staff (other@example.invalid)\nBooked by: Fixture Employee (staff@example.invalid)'))
  assert.equal(paid.extendedProperties.private.paymentStatus, 'paid')
  const waiting = await calendarBody({ ...employeeBookingInput(rawBooking(), creator), phase: 'ready', payment: 'external' })
  assert.match(waiting.summary, /\(Awaiting payment\)$/)
  assert.ok(waiting.description.includes('Payment: Awaiting payment\nBooked by:'))
  assert.equal(waiting.extendedProperties.private.paymentStatus, 'pending')
  const own = await calendarBody({ ...record, paidBy: 'Fixture Employee (staff@example.invalid)' })
  assert.equal(own.description.includes('Marked paid by'), false)
})

test('mark-paid API records the authenticated actor and ignores attribution supplied in the request body', async () => {
  const stored: EmployeeBooking = { ...employeeBookingInput(rawBooking(), creator), phase: 'ready', payment: 'external' }
  let record = structuredClone(stored)
  let revision = 0
  const store: EmployeeStore = {
    async read() { return { record: structuredClone(record), etag: String(revision) } },
    async create() { throw new Error('Unexpected create') },
    async save(snapshot, next) { assert.equal(snapshot.etag, String(revision)); record = structuredClone(next); revision++ },
  }
  const services = { async store() { return store }, async calendar() {}, async notifyPaid() {}, async markInvoicePaid() { throw new Error('Unexpected Stripe call') } }
  let response: { value: Record<string, unknown>; status?: number } | undefined
  const context = vm.createContext({
    process: { env: { EMPLOYEE_BOOKING_ENABLED: '1' } },
    employeeGuard: () => ({ employee: { email: 'marker@example.invalid', name: 'Actual Marker', role: 'superadmin' } }),
    readJsonBody: async () => ({ ref: stored.ref, method: 'cash', note: 'Front desk', paidBy: 'Forged Marker', employee: 'forged@example.invalid', role: 'superadmin' }),
    markEmployeeBookingPaid, employeeBookingResult, EmployeeBookingError, employeeServices: services,
    employeeJson: (value: Record<string, unknown>, status?: number) => { response = { value, status }; return response },
    jsonBodyErrorResponse: () => null,
  })
  vm.runInContext(actualFunction('POST', 'app/api/employee/bookings/paid/route.ts'), context)
  await context.POST({})
  assert.equal(response?.status, undefined)
  assert.equal(response?.value.outcome, 'marked')
  assert.equal(response?.value.paymentLabel, 'Paid in cash')
  assert.doesNotMatch(JSON.stringify(response), /Front desk|Marker|marker@example/)
  assert.equal(record.paidBy, 'Actual Marker (marker@example.invalid)')
  assert.equal(record.employee, creator.email)
})

test('booking API refuses a no-charge booking from an employee on the server', async () => {
  let created = false
  let response: { value: { error?: string }; status?: number } | undefined
  const context = vm.createContext({
    process: { env: { EMPLOYEE_BOOKING_ENABLED: '1' } },
    employeeGuard: () => ({ employee: { ...creator, role: 'employee' } }),
    readJsonBody: async () => ({ ...rawBooking(), payment: { mode: 'none' }, role: 'superadmin' }), employeeBookingInput, employeeBookingResult, EmployeeBookingError,
    createEmployeeBooking: async () => { created = true },
    employeeServices: {}, employeeJson: (value: { error?: string }, status?: number) => { response = { value, status }; return response },
    jsonBodyErrorResponse: () => null,
  })
  vm.runInContext(actualFunction('POST', 'app/api/employee/bookings/route.ts'), context)
  await context.POST({})
  assert.equal(created, false)
  assert.equal(response?.status, 403)
  assert.match(response?.value.error || '', /administrator/)
})

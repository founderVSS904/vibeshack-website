import assert from 'node:assert/strict'
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import fs from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { createEmployeeBooking, employeeBookingInput, employeeBookingResult, type EmployeeBooking, type EmployeeBookingServices, type EmployeeStore } from '../lib/employee/booking'
import { employeeCreatorLabel, employeeDisplayName } from '../lib/employee/identity'
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

type CallbackOptions = { payload?: Record<string, unknown>; allowed?: boolean; rejectedToken?: boolean; state?: string }
function callbackFixture(options: CallbackOptions = {}) {
  const signed: Array<Record<string, unknown>> = []
  const cookies: Array<{ name: string; value: string }> = []
  let verified = 0
  let redirect = ''
  const context = vm.createContext({
    Date, employeeDisplayName,
    process: { env: { EMPLOYEE_GOOGLE_CLIENT_ID: 'fixture-oauth-client' } },
    EMPLOYEE_COOKIE: 'fixture-employee', OAUTH_COOKIE: 'fixture-oauth', SESSION_SECONDS: 28_800,
    readEmployeeToken: () => ({ state: 'fixture-state', nonce: 'fixture-nonce', verifier: 'fixture-verifier' }),
    employeeOAuthClient: () => ({
      getToken: async (input: { code: string; codeVerifier: string }) => {
        assert.equal(input.code, 'fixture-code')
        assert.equal(input.codeVerifier, 'fixture-verifier')
        return { tokens: { id_token: 'fixture-id-token' } }
      },
      verifyIdToken: async (input: { idToken: string; audience: string }) => {
        verified++
        assert.equal(input.idToken, 'fixture-id-token')
        assert.equal(input.audience, 'fixture-oauth-client')
        if (options.rejectedToken) throw new Error('Synthetic invalid provider signature')
        return { getPayload: () => options.payload ?? { email_verified: true, email: 'STAFF@example.invalid', name: '  Fixture\nEmployee ', nonce: 'fixture-nonce' } }
      },
    }),
    allowedEmployee: (email: string) => options.allowed !== false && email.toLowerCase() === creator.email,
    employeeOrigin: () => 'https://example.invalid', employeeCookieOptions: () => ({}),
    signEmployeeToken: (value: Record<string, unknown>) => { signed.push(structuredClone(value)); return 'fixture-signed-session' },
    NextResponse: { redirect: (url: string) => {
      redirect = url
      return { cookies: { set: (name: string, value: string) => { cookies.push({ name, value }) } }, headers: { set: () => undefined } }
    } },
  })
  vm.runInContext(actualFunction('GET', 'app/api/employee/auth/callback/route.ts'), context)
  return {
    signed, cookies, verified: () => verified, redirect: () => redirect,
    run: () => context.GET({
      cookies: { get: () => ({ value: 'fixture-oauth-cookie' }) },
      nextUrl: new URL(`https://example.invalid/api/employee/auth/callback?code=fixture-code&state=${options.state ?? 'fixture-state'}&name=Forged+Browser+Name&email=forged@example.invalid`),
    }) as Promise<unknown>,
  }
}

test('OAuth callback signs only the verified provider name, ignoring forged callback identity fields', async () => {
  const fixture = callbackFixture()
  await fixture.run()
  assert.equal(fixture.verified(), 1)
  assert.equal(fixture.signed.length, 1)
  assert.equal(fixture.signed[0].email, creator.email)
  assert.equal(fixture.signed[0].name, creator.name)
  assert.equal(fixture.signed[0].purpose, 'employee-session')
  assert.equal(fixture.redirect(), 'https://example.invalid/employee/book/')
  assert.equal(fixture.cookies.find((cookie) => cookie.name === 'fixture-employee')?.value, 'fixture-signed-session')
})

for (const [label, options] of [
  ['invalid provider signature', { rejectedToken: true }],
  ['unverified email', { payload: { email_verified: false, email: creator.email, nonce: 'fixture-nonce', name: creator.name } }],
  ['missing email', { payload: { email_verified: true, nonce: 'fixture-nonce', name: creator.name } }],
  ['wrong nonce', { payload: { email_verified: true, email: creator.email, nonce: 'forged-nonce', name: creator.name } }],
  ['disallowed employee', { allowed: false }],
  ['wrong OAuth state', { state: 'forged-state' }],
] satisfies Array<[string, CallbackOptions]>) {
  test(`OAuth callback never signs employee attribution for ${label}`, async () => {
    const fixture = callbackFixture(options)
    await fixture.run()
    assert.equal(fixture.signed.length, 0)
    assert.equal(fixture.cookies.some((cookie) => cookie.name === 'fixture-employee'), false)
    assert.equal(fixture.redirect(), 'https://example.invalid/employee/?error=signin')
    if (options.state) assert.equal(fixture.verified(), 0)
  })
}

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
    async send() {}, async notifyPaid() {},
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
      Date, createHash, addMinutes, employeeCreatorLabel,
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
  assert.deepEqual(Object.keys(result).sort(), ['emailed', 'paymentUrl', 'phase', 'ref', 'total'])
  assert.equal(JSON.stringify(result).includes(creator.name), false)
  assert.equal(JSON.stringify(result).includes(creator.email), false)
})

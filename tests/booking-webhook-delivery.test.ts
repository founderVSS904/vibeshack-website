import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createHash } from 'node:crypto'
import ts from 'typescript'
import { test } from 'node:test'
import { deliverMessage, type DeliveryRecord, type DeliveryStore } from '../lib/booking/delivery'
import { parseTeamEmailMetadata } from '../lib/booking/team-email-metadata'

// Execute the actual route/helper functions with isolated provider bindings.
// No environment values, network APIs, real mail transport, or Stripe client
// can be reached through this VM context.
function actualFunction(name: string, file = 'app/api/webhook/route.ts') {
  const source = fs.readFileSync(file, 'utf8')
  const ast = ts.createSourceFile('route.ts', source, ts.ScriptTarget.ES2022, true)
  const declaration = ast.statements.find((statement) => ts.isFunctionDeclaration(statement) && statement.name?.text === name)
  assert.ok(declaration)
  return ts.transpileModule(declaration.getText(ast).replace(/^export\s+/, ''), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText
}

function fixture(failedSubject = '', rejectedResult = false) {
  let stored: DeliveryRecord | null = null
  let revision = 0
  const store: DeliveryStore = {
    read: async () => stored && ({ etag: String(revision), record: structuredClone(stored) }),
    create: async () => {
      if (stored) throw Object.assign(new Error('Exists'), { code: 409 })
      stored = { version: 1, messages: {} }; revision++
    },
    save: async (snapshot, record) => {
      if (snapshot.etag !== String(revision)) throw Object.assign(new Error('Changed'), { code: 412 })
      stored = structuredClone(record); revision++
    },
  }
  const attempts = new Map<string, number>()
  const metadata: Record<string, string> = {
    bookingRef: 'fixture-booking', bookingHoldVersion: '1',
    vbsCalendarSyncedAt: '2026-09-01T00:00:00.000Z', vbsBookingHoldReleasedAt: '2026-09-01T00:00:00.000Z',
    customerName: 'Fixture Guest', customerEmail: 'guest@example.invalid',
    teamEmails: JSON.stringify(['team@example.invalid']),
  }
  const session = { id: 'cs_test_fixture', metadata, payment_status: 'paid', amount_total: 10000 }
  const cart = [{ studioId: 'canvas-rental', studioName: 'Canvas Rental', date: '2026-09-12', slots: ['2026-09-12T15:00:00.000Z', '2026-09-12T15:30:00.000Z'], price: 100 }]
  const context = vm.createContext({
    Date, Promise, Response, createHash,
    console: { error: () => undefined },
    process: { env: { STRIPE_WEBHOOK_SECRET: 'fixture', GMAIL_USER: 'fixture@example.invalid', GMAIL_APP_PASSWORD: 'fixture' } },
    require: (name: string) => {
      assert.equal(name, 'nodemailer')
      return { default: { createTransport: () => ({ sendMail: async (options: { subject: string; to: string; messageId: string }) => {
        assert.match(options.messageId, /^<[a-f0-9]{40}\.[a-z0-9]+@vibeshackstudios\.com>$/)
        const label = options.subject.split(' - ')[0]
        attempts.set(label, (attempts.get(label) || 0) + 1)
        if (label === failedSubject && attempts.get(label) === 1) {
          if (rejectedResult) return { accepted: [], rejected: [options.to] }
          throw Object.assign(new Error('Synthetic rejection'), { responseCode: 451 })
        }
        return { accepted: [options.to], rejected: [] }
      } }) } }
    },
    NextResponse: { json: (body: unknown, options?: { status?: number }) => new Response(JSON.stringify(body), { status: options?.status || 200 }) },
    getStripeClient: () => ({ webhooks: { constructEvent: () => ({ type: 'checkout.session.completed', id: 'evt_fixture', data: { object: session } }) } }),
    parseBookingCartItems: () => cart,
    hasCompleteBookingCartMetadata: () => true,
    validateCompletedSession: () => ({ ok: true }),
    parseReferralInfo: () => null,
    parseTeamEmailMetadata,
    stripControlChars: (value: unknown) => String(value ?? ''),
    attributionHtml: () => '',
    getStripeReceiptUrl: async () => '',
    getCurrentSessionMetadata: async () => ({ ...metadata }),
    bookingNeedsAttention: () => false,
    bookingDeliveryStore: async () => store,
    deliverMessage,
    markSessionFulfillmentStep: async (_session: string, key: string) => { metadata[key] = new Date().toISOString() },
    escapeHtml: (value: unknown) => String(value ?? ''),
    formatDateForDisplay: () => 'Saturday, September 12, 2026',
    formatBookingDuration: () => '1 hour',
    describeSlotRanges: () => '8:00 AM-9:00 AM',
    addMinutes: (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60_000),
    SLOT_DURATION_MINUTES: 30,
    bookingSetupEmailHtml: () => '', bookingAddOnsEmailHtml: () => '',
    buildPrepEmailHtml: () => '<p>Fixture</p>', emailLogoHtml: () => '',
    siteUrl: 'https://example.invalid',
  })
  vm.runInContext(`${actualFunction('sendConfirmationEmail')}\n${actualFunction('POST')}\nglobalThis.run = POST`, context)
  return { attempts, metadata, run: () => context.run({ text: async () => '{}', headers: { get: () => 'fixture-signature' } }) as Promise<Response> }
}

for (const failed of ["You're booked", 'Session prep', 'Session details', 'New Booking: Fixture Guest']) {
  test(`webhook retries failed ${failed} without repeating previously successful messages`, async () => {
    const instance = fixture(failed)
    assert.equal((await instance.run()).status, 500)
    assert.equal((await instance.run()).status, 200)
    assert.ok(instance.metadata.vbsConfirmationSentAt)
    assert.equal(instance.attempts.get(failed), 2)
    for (const [label, count] of instance.attempts) if (label !== failed) assert.equal(count, 1, label)
    assert.equal((await instance.run()).status, 200)
    assert.equal(instance.attempts.get(failed), 2)
  })
}

test('resolved SMTP total rejection still returns retryable webhook failure', async () => {
  const instance = fixture('Session details', true)
  assert.equal((await instance.run()).status, 500)
  assert.equal((await instance.run()).status, 200)
  assert.equal(instance.attempts.get('Session details'), 2)
  assert.equal(instance.attempts.get("You're booked"), 1)
})

test('concurrent webhook deliveries claim each actual email only once', async () => {
  const instance = fixture()
  await Promise.all([instance.run(), instance.run()])
  assert.equal((await instance.run()).status, 200)
  assert.equal(instance.attempts.size, 4)
  for (const count of instance.attempts.values()) assert.equal(count, 1)
})


test('tour POST does not resend confirmations when an already committed reservation is retried', async () => {
  let emails = 0
  let alreadyReserved = false
  const context = vm.createContext({
    Date, Number, Response,
    console: { error: () => undefined },
    RATE_LIMIT_MAX: 6, RATE_LIMIT_WINDOW_MS: 600_000, MAX_BODY_BYTES: 10_240, MIN_FORM_AGE_MS: 1500,
    rateLimit: () => null,
    readJsonBody: async () => ({ name: 'Fixture Guest', email: 'guest@example.invalid', date: '2026-09-12', slot: '2026-09-12T15:00:00.000Z' }),
    stripControlChars: (value: unknown) => String(value ?? ''),
    isEmail: () => true, isValidBookingDate: () => true,
    reserveTourBooking: async () => ({ ok: true, status: 200, error: '', alreadyReserved }),
    sendTourEmails: async () => { emails++ },
    formatTourSlotRange: () => '8:00 AM-8:30 AM',
    jsonBodyErrorResponse: () => null,
    NextResponse: { json: (body: unknown, options?: { status?: number }) => new Response(JSON.stringify(body), { status: options?.status || 200 }) },
  })
  vm.runInContext(`${actualFunction('POST', 'app/api/book-tour/route.ts')}\nglobalThis.run = POST`, context)
  const created = await context.run({}) as Response
  assert.equal(created.status, 200)
  assert.equal((await created.json()).created, true)
  assert.equal(emails, 1)
  alreadyReserved = true
  const retried = await context.run({}) as Response
  assert.equal(retried.status, 200)
  assert.equal((await retried.json()).created, false)
  assert.equal(emails, 1)
})

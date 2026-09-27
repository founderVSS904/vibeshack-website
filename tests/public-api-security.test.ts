import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'
import { NextRequest, NextResponse } from 'next/server'
import type { calendar_v3 } from 'googleapis'
import { addTourEvent, type BookingCalendarDependencies, type CalendarConfig } from '../lib/booking/calendar'
import { reserveTour, type TourReservationDependencies } from '../lib/booking/tour-reservation'
import { addMinutes, bookingDateInPacific, isValidBookingDate } from '../lib/booking/time'
import { isEmail, stripControlChars } from '../lib/server/sanitize'
import { jsonBodyErrorResponse, readJsonBody, readTextBody } from '../lib/server/request-guards'

function isolatedFunctions(file: string, names: string[], bindings: Record<string, unknown> = {}) {
  const ast = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.ES2022, true)
  const declarations: ts.FunctionDeclaration[] = []
  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && names.includes(node.name?.text || '')) declarations.push(node)
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.equal(declarations.length, names.length)
  const source = declarations.map((node) => node.getText(ast).replace(/^export\s+/, '')).join('\n')
  const context = vm.createContext({ Date, Number, Buffer, URL, URLSearchParams, Response, NextRequest, NextResponse,
    randomUUID, addMinutes, bookingDateInPacific, isValidBookingDate, isEmail, stripControlChars,
    jsonBodyErrorResponse, readJsonBody, readTextBody,
    console: { error: () => undefined }, ...bindings,
  })
  vm.runInContext(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, context)
  return context
}

const fixtureRequestId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const fixtureTour = { requestId: fixtureRequestId, name: 'Fixture Guest', email: 'guest@example.invalid', date: '2026-10-12', slot: '2026-10-12T17:00:00.000Z' }

for (const route of ['create-checkout-session', 'cancel-checkout-session', 'contact', 'book-tour', 'availability', 'add-on-availability', 'tour-availability', 'booking-confirmation']) {
  for (const status of [429, 503]) {
    test(`${route} awaits shared denial ${status} before any provider operation`, async () => {
      let claims = 0
      const method = ['availability', 'add-on-availability', 'tour-availability', 'booking-confirmation'].includes(route) ? 'GET' : 'POST'
      const context = isolatedFunctions(`app/api/${route}/route.ts`, [method], {
        CHECKOUT_RATE_LIMIT_MAX: 12, CHECKOUT_RATE_LIMIT_WINDOW_MS: 600_000,
        CANCEL_RATE_LIMIT_MAX: 20, CANCEL_RATE_LIMIT_WINDOW_MS: 600_000,
        RATE_LIMIT_MAX: 6, RATE_LIMIT_WINDOW_MS: 600_000,
        distributedRateLimit: async () => { await Promise.resolve(); claims++; return NextResponse.json({ error: 'Unavailable' }, { status }) },
      })
      // Provider bindings intentionally do not exist in this context.
      const result = await context[method](new NextRequest(`https://example.invalid/api/${route}`, { method }))
      assert.equal(result.status, status)
      assert.equal(claims, 1)
    })
  }
}

function tourCalendarFixture() {
  let reads = 0
  let stored: Record<string, unknown>[] = []
  const context = isolatedFunctions('lib/booking/calendar.ts', ['existingTourReservation'], {
    TOUR_DURATION_MINUTES: 30,
    getTourCalendarId: () => 'fixture-calendar',
    getCalendarConfig: async () => ({ client: { events: { list: async (request: { privateExtendedProperty: string[] }) => {
      reads++
      assert.ok(request.privateExtendedProperty.some((value) => value.startsWith('requestId=')))
      return { data: { items: stored } }
    } } } }),
  })
  const event = (requestId?: string, email = fixtureTour.email) => ({
    status: 'confirmed', start: { dateTime: fixtureTour.slot },
    extendedProperties: { private: { source: 'vibeshack-tour-booking', guestEmail: email, ...(requestId ? { requestId } : {}) } },
  })
  return { exists: (tour: typeof fixtureTour | Omit<typeof fixtureTour, 'requestId'>) => context.existingTourReservation(tour) as Promise<boolean>,
    set: (events: Record<string, unknown>[]) => { stored = events }, event, reads: () => reads }
}

test('tour retry lookup requires the original random request ID as well as guest and exact date/time', async () => {
  const fixture = tourCalendarFixture()
  fixture.set([fixture.event(fixtureRequestId)])
  assert.equal(await fixture.exists(fixtureTour), true)
  assert.equal(await fixture.exists({ ...fixtureTour, requestId: randomUUID() }), false)
  assert.equal(await fixture.exists({ ...fixtureTour, email: 'other@example.invalid' }), false)
  assert.equal(await fixture.exists({ ...fixtureTour, date: '2026-10-13' }), false)
  assert.equal(await fixture.exists({ ...fixtureTour, slot: '2026-10-12T17:30:00.000Z' }), false)
  fixture.set([fixture.event()])
  assert.equal(await fixture.exists(fixtureTour), false)
  const before = fixture.reads()
  const { requestId: _unused, ...legacyRequest } = fixtureTour
  assert.equal(await fixture.exists(legacyRequest), false)
  assert.equal(fixture.reads(), before)
})

test('a guessed guest email cannot change a busy tour response, but the original request can retry', async () => {
  const fixture = tourCalendarFixture()
  fixture.set([fixture.event(fixtureRequestId)])
  const unavailable = { ok: false, status: 409, error: 'This tour time is unavailable.' }
  let writes = 0
  const dependencies = {
    exists: fixture.exists,
    availability: async () => unavailable,
    acquire: async () => { writes++; return { ok: true, status: 200, error: '' } },
    insert: async () => { writes++ }, release: async () => { writes++ },
  }
  const guessedEmail = await reserveTour({ ...fixtureTour, requestId: randomUUID() }, dependencies)
  const differentEmail = await reserveTour({ ...fixtureTour, email: 'other@example.invalid', requestId: randomUUID() }, dependencies)
  assert.deepEqual(guessedEmail, differentEmail)
  assert.deepEqual(guessedEmail, unavailable)
  assert.equal((await reserveTour(fixtureTour, dependencies)).alreadyReserved, true)
  assert.equal(writes, 0)
})

test('tour creation stores retry authority only in private Calendar properties', async () => {
  const created: calendar_v3.Schema$Event[] = []
  const dependencies: BookingCalendarDependencies = {
    calendarIds: () => ['fixture-calendar'],
    getConfig: async () => ({
      calendarId: 'fixture-calendar', isStudioSpecificCalendar: false,
      client: { events: {
        get: async () => { throw Object.assign(new Error('Synthetic missing event'), { code: 404 }) },
        insert: async ({ requestBody }: { requestBody: calendar_v3.Schema$Event }) => {
          created.push(requestBody)
          return { data: requestBody }
        },
      } } as unknown as CalendarConfig['client'],
    }),
  }
  await addTourEvent({ ...fixtureTour, reservationRef: 'synthetic-reservation-authority' }, dependencies)
  assert.equal(created.length, 1)
  assert.equal(created[0].extendedProperties?.private?.requestId, fixtureRequestId)
  assert.equal(created[0].extendedProperties?.shared, undefined)
  assert.doesNotMatch(created[0].description || '', new RegExp(fixtureRequestId))
  assert.doesNotMatch(created[0].summary || '', new RegExp(fixtureRequestId))
})

test('tour route rejects bad request authority and recipient throttling before reservations or mail', async () => {
  let writes = 0
  const ids: string[] = []
  const context = isolatedFunctions('app/api/book-tour/route.ts', ['POST'], {
    RATE_LIMIT_MAX: 6, RATE_LIMIT_WINDOW_MS: 600_000, MAX_BODY_BYTES: 10_240, MIN_FORM_AGE_MS: 1500,
    distributedRateLimit: async (_req: unknown, options: { subject?: string; max: number; windowMs: number }) => {
      if (options.subject) {
        assert.equal(options.subject, fixtureTour.email)
        assert.equal(options.max, 3)
        assert.equal(options.windowMs, 3_600_000)
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      }
      return null
    },
    getStudioById: () => undefined,
    reserveTourBooking: async (tour: typeof fixtureTour, beforeCreate: TourReservationDependencies['beforeCreate']) => {
      const blocked = await beforeCreate?.()
      if (blocked) return blocked
      writes++; ids.push(tour.requestId)
      return { ok: true }
    },
    sendTourEmails: async () => { writes++ },
  })
  const request = (requestId: unknown) => new NextRequest('https://example.invalid/api/book-tour', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fixtureTour, requestId }),
  })
  for (const id of ['', null, {}, 'known-guest', 'a'.repeat(4096)]) assert.equal((await context.POST(request(id))).status, 400)
  assert.equal((await context.POST(request(fixtureRequestId))).status, 429)
  assert.equal(writes, 0)
  assert.deepEqual(ids, [])
})

test('verified tour retries skip recipient creation limits while new attempts remain capped before provider writes', async () => {
  const fixture = tourCalendarFixture()
  fixture.set([fixture.event(fixtureRequestId)])
  let ipClaims = 0
  let recipientClaims = 0
  let availabilityReads = 0
  let holds = 0
  let inserts = 0
  let emails = 0
  let storeUnavailable = false
  const calendar = isolatedFunctions('lib/booking/calendar.ts', ['reserveTourBooking'], {
    reserveTour, existingTourReservation: fixture.exists,
    assertTourSlotAvailable: async () => { availabilityReads++; return { ok: true, status: 200, error: '' } },
    acquireBookingHolds: async () => { holds++; return { ok: true, status: 200, error: '' } },
    addTourEvent: async () => { inserts++ },
    releaseBookingHolds: async () => undefined,
  })
  const context = isolatedFunctions('app/api/book-tour/route.ts', ['POST'], {
    RATE_LIMIT_MAX: 6, RATE_LIMIT_WINDOW_MS: 600_000, MAX_BODY_BYTES: 10_240, MIN_FORM_AGE_MS: 1500,
    distributedRateLimit: async (_req: unknown, options: { subject?: string }) => {
      if (!options.subject) { ipClaims++; return null }
      recipientClaims++
      if (storeUnavailable || recipientClaims > 3) return NextResponse.json({ error: 'Synthetic limit denial' }, {
        status: storeUnavailable ? 503 : 429, headers: { 'Retry-After': '45' },
      })
      return null
    },
    getStudioById: () => undefined,
    reserveTourBooking: calendar.reserveTourBooking,
    sendTourEmails: async () => { emails++ },
    formatTourSlotRange: () => '10:00 AM-10:30 AM',
  })
  const request = (requestId: string) => new NextRequest('https://example.invalid/api/book-tour', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fixtureTour, requestId }),
  })
  for (let attempt = 0; attempt < 6; attempt++) assert.equal((await context.POST(request(fixtureRequestId))).status, 200)
  assert.equal(ipClaims, 6)
  assert.equal(recipientClaims, 0)
  assert.equal(availabilityReads, 0)
  assert.equal(holds + inserts + emails, 0)
  for (let attempt = 0; attempt < 3; attempt++) assert.equal((await context.POST(request(randomUUID()))).status, 200)
  const limited = await context.POST(request(randomUUID()))
  assert.equal(limited.status, 429)
  assert.equal(limited.headers.get('Retry-After'), '45')
  assert.equal(limited.headers.get('Cache-Control'), 'private, no-store')
  assert.equal(recipientClaims, 4)
  assert.equal(availabilityReads, 6)
  assert.equal(holds, 3)
  assert.equal(inserts, 3)
  assert.equal(emails, 3)
  storeUnavailable = true
  assert.equal((await context.POST(request(fixtureRequestId))).status, 200)
  assert.equal(recipientClaims, 4)
  assert.equal((await context.POST(request(randomUUID()))).status, 503)
  assert.equal(ipClaims, 12)
  assert.equal(recipientClaims, 5)
  assert.equal(availabilityReads, 6)
  assert.equal(holds + inserts + emails, 9)
})

test('tour form retains request authority on an uncertain retry and tracks one successful submission', async () => {
  const bodies: Array<Record<string, unknown>> = []
  let leads = 0
  let failOnce = true
  const context = isolatedFunctions('app/tour/TourBookingForm.tsx', ['handleSubmit'], {
    studioId: '', selectedDate: fixtureTour.date, selectedSlot: fixtureTour.slot,
    name: fixtureTour.name, email: fixtureTour.email, phone: '', notes: '', company: '', startedAt: 1,
    submissionRef: { current: null }, crypto: { randomUUID },
    setError: () => undefined, setSubmitting: () => undefined, setConfirmed: () => undefined,
    isConfirmedTourResponse: () => true,
    trackSuccessfulLead: () => { leads++ },
    fetch: async (_url: string, options: { body: string }) => {
      bodies.push(JSON.parse(options.body))
      if (failOnce) { failOnce = false; throw new Error('Synthetic connection interruption') }
      return { ok: true, json: async () => ({ ok: true, tour: {} }) }
    },
  })
  const event = { preventDefault: () => undefined }
  await context.handleSubmit(event)
  await context.handleSubmit(event)
  await context.handleSubmit(event)
  assert.match(String(bodies[0].requestId), /^[a-f0-9-]{36}$/)
  assert.equal(bodies[0].requestId, bodies[1].requestId)
  assert.equal(bodies[1].requestId, bodies[2].requestId)
  assert.equal(leads, 1)
  context.selectedSlot = '2026-10-12T17:30:00.000Z'
  await context.handleSubmit(event)
  assert.notEqual(bodies[2].requestId, bodies[3].requestId)
})

test('webhook rejects absent signatures before reading and caps bytes before signature verification', async () => {
  let constructions = 0
  let reads = 0
  const context = isolatedFunctions('app/api/webhook/route.ts', ['POST'], {
    process: { env: { STRIPE_WEBHOOK_SECRET: 'synthetic-signing-fixture' } },
    readTextBody: async (req: NextRequest, max: number) => { reads++; assert.equal(max, 256 * 1024); return readTextBody(req, max) },
    getStripeClient: () => ({ webhooks: { constructEvent: () => { constructions++; throw new Error('Invalid signature') } } }),
  })
  const missing = await context.POST(new NextRequest('https://example.invalid/api/webhook', { method: 'POST', body: '{}' }))
  assert.equal(missing.status, 400)
  assert.equal(reads, 0)
  const oversized = await context.POST(new NextRequest('https://example.invalid/api/webhook', {
    method: 'POST', headers: { 'stripe-signature': 'synthetic' }, body: 'x'.repeat(256 * 1024 + 1),
  }))
  assert.equal(oversized.status, 413)
  assert.equal(constructions, 0)
})

test('forged webhook errors cannot copy caller payloads or provider objects into logs', async () => {
  const logs: unknown[][] = []
  const context = isolatedFunctions('app/api/webhook/route.ts', ['POST'], {
    process: { env: { STRIPE_WEBHOOK_SECRET: 'synthetic-signing-fixture' } },
    console: { error: (...args: unknown[]) => { logs.push(args) } },
    getStripeClient: () => ({ webhooks: { constructEvent: () => { throw Object.assign(new Error('Private provider detail'), { payload: 'Synthetic private payload', headers: { authorization: 'Synthetic secret' } }) } } }),
  })
  const response = await context.POST(new NextRequest('https://example.invalid/api/webhook', {
    method: 'POST', headers: { 'stripe-signature': 'synthetic' }, body: '{}',
  }))
  assert.equal(response.status, 400)
  assert.deepEqual(logs, [['Stripe webhook signature failed']])
  assert.doesNotMatch(await response.text(), /Synthetic|Private/)
})

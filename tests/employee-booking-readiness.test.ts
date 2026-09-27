import assert from 'node:assert/strict'
import { test } from 'node:test'
import type Stripe from 'stripe'
import type { CalendarConfig } from '../lib/booking/calendar'
import { STUDIOS } from '../lib/booking/catalog'
import { verifyEmployeeBookingConfiguration, type BookingReadinessDependencies } from '../scripts/verify-employee-booking'

const environment = {
  EMPLOYEE_BOOKING_ENABLED: '1', EMPLOYEE_BASE_URL: 'https://www.example.invalid',
  STRIPE_SECRET_KEY: 'synthetic-stripe-key', STRIPE_WEBHOOK_SECRET: 'synthetic-webhook-key',
  GMAIL_USER: 'sender@example.invalid', GMAIL_APP_PASSWORD: 'synthetic-mail-password', GCAL_HOLD_CALENDAR_ID: 'fixture-hold',
}
const requiredEvents = ['invoice.paid', 'invoice.voided', 'checkout.session.completed', 'checkout.session.expired']
function endpoint(overrides: Partial<Stripe.WebhookEndpoint> = {}): Stripe.WebhookEndpoint {
  return { id: 'we_fixture', url: 'https://www.example.invalid/api/webhook/', status: 'enabled', enabled_events: requiredEvents, ...overrides } as Stripe.WebhookEndpoint
}
function fixture() {
  const requestedStudios: Array<string | undefined> = []
  const calendarReads: Array<{ calendarId: string; fields?: string }> = []
  const stripeReads: Array<{ limit?: number; starting_after?: string }> = []
  const statuses: string[] = []
  let verified = 0
  let closed = 0
  let role = 'writer'
  let fail = ''
  let endpoints: Stripe.WebhookEndpoint[][] = [[endpoint()]]
  const adapters: BookingReadinessDependencies = {
    async calendar(studioId) {
      requestedStudios.push(studioId)
      return { calendarId: studioId === STUDIOS[0].id ? 'fixture-separate' : 'fixture-default', client: { calendarList: {
        async get(options: { calendarId: string; fields?: string }, requestOptions: { timeout: number }) {
          calendarReads.push(options)
          assert.equal(requestOptions.timeout, 15_000)
          if (fail === 'calendar') throw new Error('PRIVATE-provider-token-calendar')
          return { data: { accessRole: role } }
        },
      } } } as unknown as CalendarConfig
    },
    stripe() { return { webhookEndpoints: {
      async list(params: { limit?: number; starting_after?: string }, options: { timeout: number; maxNetworkRetries: number }) {
        stripeReads.push(params)
        assert.equal(options.timeout, 15_000)
        assert.equal(options.maxNetworkRetries, 0)
        if (fail === 'stripe') throw new Error('PRIVATE-provider-token-stripe')
        const index = stripeReads.length - 1
        return { data: endpoints[index] || [], has_more: index < endpoints.length - 1 }
      },
    } } as unknown as Pick<Stripe, 'webhookEndpoints'> },
    mail(options) {
      assert.equal(options.service, 'gmail')
      assert.deepEqual(options.auth, { user: environment.GMAIL_USER, pass: environment.GMAIL_APP_PASSWORD })
      assert.equal(options.socketTimeout, 30_000)
      return { async verify() { verified++; if (fail === 'mail') throw new Error('PRIVATE-provider-token-mail'); return true }, close() { closed++ } }
    },
    status(message) { statuses.push(message) },
  }
  return { adapters, requestedStudios, calendarReads, stripeReads, statuses, mailCounts: () => ({ verified, closed }), setRole(value: string) { role = value }, setFailure(value: string) { fail = value }, setEndpoints(value: Stripe.WebhookEndpoint[][]) { endpoints = value } }
}

test('booking readiness is inert when activation is off', async () => {
  const f = fixture()
  await verifyEmployeeBookingConfiguration({}, f.adapters)
  assert.equal(f.calendarReads.length + f.stripeReads.length, 0)
  assert.equal(f.requestedStudios.length, 0)
  assert.deepEqual(f.mailCounts(), { verified: 0, closed: 0 })
  assert.match(f.statuses[0], /activation is off/)
})

test('booking readiness checks each unique writable calendar, canonical webhook and SMTP auth without provider writes', async () => {
  const f = fixture()
  await verifyEmployeeBookingConfiguration(environment, f.adapters)
  assert.deepEqual(f.requestedStudios, [undefined, ...STUDIOS.map((studio) => studio.id)])
  assert.deepEqual(f.calendarReads.map((request) => request.calendarId).sort(), ['fixture-default', 'fixture-hold', 'fixture-separate'])
  assert.ok(f.calendarReads.every((request) => request.fields === 'accessRole'))
  assert.equal(f.stripeReads.length, 1)
  assert.deepEqual(f.mailCounts(), { verified: 1, closed: 1 })
  assert.equal(f.statuses.length, 3)
  assert.match(f.statuses[2], /not tested/)
  assert.equal(f.statuses.join(' ').includes('fixture-'), false)
  assert.equal(f.statuses.join(' ').includes(environment.GMAIL_USER), false)
})

test('missing secrets or noncanonical origins fail before any provider request', async () => {
  for (const patch of [{ STRIPE_WEBHOOK_SECRET: '' }, { GMAIL_APP_PASSWORD: '' }, { EMPLOYEE_BASE_URL: 'http://www.example.invalid' }, { EMPLOYEE_BASE_URL: 'https://www.example.invalid/extra/' }]) {
    const f = fixture()
    await assert.rejects(verifyEmployeeBookingConfiguration({ ...environment, ...patch }, f.adapters))
    assert.equal(f.requestedStudios.length, 0)
    assert.equal(f.stripeReads.length, 0)
  }
})

test('reader or unavailable Calendar permissions stop activation before Stripe or SMTP checks', async () => {
  for (const role of ['reader', 'freeBusyReader', '']) {
    const f = fixture(); f.setRole(role)
    await assert.rejects(verifyEmployeeBookingConfiguration(environment, f.adapters), /Calendar access verification failed/)
    assert.equal(f.stripeReads.length, 0)
    assert.equal(f.mailCounts().verified, 0)
  }
})

test('a disabled, wrong-origin or incompletely subscribed webhook never activates booking', async () => {
  for (const value of [endpoint({ status: 'disabled' }), endpoint({ url: 'https://other.example.invalid/api/webhook/' }), endpoint({ enabled_events: requiredEvents.filter((event) => event !== 'invoice.paid') }), endpoint({ enabled_events: requiredEvents.filter((event) => event !== 'checkout.session.expired') })]) {
    const f = fixture(); f.setEndpoints([[value]])
    await assert.rejects(verifyEmployeeBookingConfiguration(environment, f.adapters), /Stripe webhook verification failed/)
    assert.equal(f.mailCounts().verified, 0)
  }
})

test('Stripe endpoint discovery follows bounded pagination and accepts all-event subscriptions', async () => {
  const f = fixture()
  f.setEndpoints([[endpoint({ id: 'we_first', url: 'https://other.example.invalid/' })], [endpoint({ enabled_events: ['*'] })]])
  await verifyEmployeeBookingConfiguration(environment, f.adapters)
  assert.deepEqual(f.stripeReads, [{ limit: 100 }, { limit: 100, starting_after: 'we_first' }])
  const bounded = fixture()
  bounded.setEndpoints(Array.from({ length: 6 }, (_, index) => [endpoint({ id: `we_fixture_${index}`, url: 'https://other.example.invalid/' })]))
  await assert.rejects(verifyEmployeeBookingConfiguration(environment, bounded.adapters), /Stripe webhook verification failed/)
  assert.equal(bounded.stripeReads.length, 5)
})

test('provider failures return fixed safe errors and close the SMTP connection even on auth failure', async () => {
  for (const name of ['calendar', 'stripe', 'mail']) {
    const f = fixture(); f.setFailure(name)
    await assert.rejects(verifyEmployeeBookingConfiguration(environment, f.adapters), (error: Error) => {
      assert.equal(error.message.includes('PRIVATE'), false)
      assert.equal(error.message.includes(environment.STRIPE_SECRET_KEY), false)
      assert.match(error.message, /verification failed/)
      return true
    })
    assert.equal(f.statuses.join(' ').includes('PRIVATE'), false)
    if (name === 'mail') assert.deepEqual(f.mailCounts(), { verified: 1, closed: 1 })
  }
})

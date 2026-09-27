import { basename } from 'node:path'
import nodemailer from 'nodemailer'
import type Stripe from 'stripe'
import { getCalendarConfig, type CalendarConfig } from '../lib/booking/calendar'
import { STUDIOS } from '../lib/booking/catalog'
import { getStripeClient } from '../lib/booking/stripe'

type Environment = Record<string, string | undefined>
type MailOptions = { service: 'gmail'; auth: { user: string; pass: string }; connectionTimeout: number; greetingTimeout: number; socketTimeout: number }
export type BookingReadinessDependencies = {
  calendar: (studioId?: string) => Promise<CalendarConfig | null>
  stripe: () => Pick<Stripe, 'webhookEndpoints'>
  mail: (options: MailOptions) => { verify(): Promise<unknown>; close(): void }
  status: (message: string) => void
}
const dependencies: BookingReadinessDependencies = {
  calendar: getCalendarConfig,
  stripe: getStripeClient,
  mail(options) {
    const transport = nodemailer.createTransport(options)
    return { verify: () => transport.verify(), close: () => transport.close() }
  },
  status: (message) => console.log(message),
}

const failures = {
  configuration: 'Employee booking activation requires Stripe, webhook, and mail configuration.',
  origin: 'Employee booking activation requires a canonical HTTPS employee origin.',
  calendar: 'Employee booking Calendar access verification failed. Check credentials and private calendar write permissions.',
  stripe: 'Employee booking Stripe webhook verification failed. Check the canonical enabled endpoint and required event subscriptions.',
  mail: 'Employee booking mail authentication verification failed. Check the existing Gmail transport.',
}
class BookingReadinessError extends Error {}

// Read only: Calendar metadata, Stripe endpoint configuration, and SMTP auth.
// Never create a Calendar event, invoice, payment, invitation, or email here.
export async function verifyEmployeeBookingConfiguration(environment: Environment = process.env, adapters: BookingReadinessDependencies = dependencies) {
  if (environment.EMPLOYEE_BOOKING_ENABLED !== '1') {
    adapters.status('Employee booking activation is off. Booking provider checks skipped.')
    return
  }
  if (!environment.STRIPE_SECRET_KEY || !environment.STRIPE_WEBHOOK_SECRET || !environment.GMAIL_USER || !environment.GMAIL_APP_PASSWORD) throw new BookingReadinessError(failures.configuration)
  let origin: string
  try {
    const parsed = new URL(environment.EMPLOYEE_BASE_URL || 'https://www.vibeshackstudios.com')
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || !['', '/'].includes(parsed.pathname)) throw new Error('Invalid origin')
    origin = parsed.origin
  } catch { throw new BookingReadinessError(failures.origin) }

  try {
    const primary = await adapters.calendar()
    if (!primary) throw new Error('Calendar unavailable')
    const calendars = new Map<string, CalendarConfig>([[primary.calendarId, primary]])
    calendars.set(environment.GCAL_HOLD_CALENDAR_ID || primary.calendarId, primary)
    for (const studio of STUDIOS) {
      const config = await adapters.calendar(studio.id)
      if (!config) throw new Error('Calendar unavailable')
      calendars.set(config.calendarId, config)
    }
    for (const [calendarId, config] of calendars) {
      const result = await config.client.calendarList.get({ calendarId, fields: 'accessRole' }, { timeout: 15_000 })
      if (!['owner', 'writer'].includes(result.data.accessRole || '')) throw new Error('Calendar write permission required')
    }
  } catch { throw new BookingReadinessError(failures.calendar) }
  adapters.status('Employee booking private Calendar write permissions verified without reading events or writing records.')

  try {
    const stripe = adapters.stripe()
    const expected = `${origin}/api/webhook/`
    const required = ['invoice.paid', 'invoice.voided', 'checkout.session.completed', 'checkout.session.expired']
    let cursor: string | undefined
    let matched = false
    // Bound configuration pagination; a missing endpoint must fail closed.
    for (let page = 0; page < 5; page++) {
      const endpoints = await stripe.webhookEndpoints.list({ limit: 100, ...(cursor ? { starting_after: cursor } : {}) }, { timeout: 15_000, maxNetworkRetries: 0 })
      matched = endpoints.data.some((endpoint) => endpoint.url === expected && endpoint.status === 'enabled' && (endpoint.enabled_events.includes('*') || required.every((event) => endpoint.enabled_events.includes(event))))
      if (matched || !endpoints.has_more || !endpoints.data.length) break
      cursor = endpoints.data[endpoints.data.length - 1].id
    }
    if (!matched) throw new Error('Webhook configuration unavailable')
  } catch { throw new BookingReadinessError(failures.stripe) }
  adapters.status('Employee booking Stripe webhook endpoint and event subscriptions verified without creating invoices or payments.')

  try {
    const transport = adapters.mail({ service: 'gmail', auth: { user: environment.GMAIL_USER, pass: environment.GMAIL_APP_PASSWORD }, connectionTimeout: 15_000, greetingTimeout: 15_000, socketTimeout: 30_000 })
    try { if (await transport.verify() !== true) throw new Error('Mail authentication unavailable') }
    finally { transport.close() }
  } catch { throw new BookingReadinessError(failures.mail) }
  adapters.status('Employee booking SMTP authentication verified without sending mail. Invoice delivery and paid booking behavior are not tested by this check.')
}

if (basename(process.argv[1] || '') === 'verify-employee-booking.ts') {
  verifyEmployeeBookingConfiguration().catch((error: unknown) => {
    console.error(error instanceof BookingReadinessError ? error.message : 'Employee booking provider verification failed. Inspect the secure provider configuration.')
    process.exitCode = 1
  })
}

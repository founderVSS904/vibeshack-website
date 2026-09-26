import { createHash } from 'node:crypto'
import type { calendar_v3 } from 'googleapis'
import type Stripe from 'stripe'
import { acquireBookingHolds, assertCartSlotsAvailable, getCalendarConfig, releaseBookingHolds } from '../booking/calendar'
import { getStripeClient } from '../booking/stripe'
import { bookingAddOnDescription } from '../booking/add-ons'
import { getStudioSetup } from '../booking/studio-setups'
import { addMinutes, BOOKING_TIME_ZONE, describeSlotRanges, formatDateForDisplay } from '../booking/time'
import { EmployeeBookingError, withEmployeeBooking, validEmployeeRef, type EmployeeBooking, type EmployeeBookingServices, type EmployeeStore } from './booking'

const source = 'vibeshack-employee-booking'
const stateSource = 'vibeshack-employee-booking-state'
const googleStatus = (error: unknown) => Number((error as { response?: { status?: number }; code?: number })?.response?.status || (error as { code?: number })?.code)
export async function employeeStore(ref: string): Promise<EmployeeStore> {
  if (!validEmployeeRef(ref)) throw new EmployeeBookingError('Invalid booking reference')
  const config = await getCalendarConfig()
  if (!config) throw new EmployeeBookingError('Calendar is not configured', 503)
  const calendarId = process.env.GCAL_HOLD_CALENDAR_ID || config.calendarId
  const eventId = `vbse${createHash('sha256').update(ref).digest('hex').slice(0, 48)}`
  const body = (record: EmployeeBooking): calendar_v3.Schema$Event => ({
    id: eventId, summary: 'Employee booking state', description: JSON.stringify(record),
    visibility: 'private', transparency: 'transparent', start: { date: '2020-01-01' }, end: { date: '2020-01-02' },
    extendedProperties: { private: { source: stateSource, bookingRef: ref } },
  })
  return {
    async read() {
      try {
        const event = (await config.client.events.get({ calendarId, eventId })).data
        if (!event.etag || event.extendedProperties?.private?.source !== stateSource) throw new Error('Invalid employee booking state')
        const record = JSON.parse(event.description || '') as EmployeeBooking
        if (record.version !== 1 || record.ref !== ref || record.cart?.length !== 1 || record.cart[0].reservationKind !== 'employee' || !Number.isSafeInteger(record.total) || record.total <= 0) throw new Error('Invalid employee booking record')
        return { record, etag: event.etag }
      } catch (error) { if (googleStatus(error) === 404) return null; throw error }
    },
    async create(record) { await config.client.events.insert({ calendarId, sendUpdates: 'none', requestBody: body(record) }) },
    async save(snapshot, record) { await config.client.events.update({ calendarId, eventId, sendUpdates: 'none', requestBody: body(record) }, { headers: { 'If-Match': snapshot.etag } }) },
  }
}
export async function writeEmployeeCalendar(record: EmployeeBooking) {
  const item = record.cart[0]
  const config = await getCalendarConfig(item.studioId)
  if (!config) throw new EmployeeBookingError('Calendar is not configured', 503)
  const eventId = `vbeb${createHash('sha256').update(record.ref).digest('hex').slice(0, 48)}`
  const calendarId = config.calendarId
  let existing: calendar_v3.Schema$Event | undefined
  try { existing = (await config.client.events.get({ calendarId, eventId })).data } catch (error) { if (googleStatus(error) !== 404) throw error }
  if (existing && existing.extendedProperties?.private?.bookingRef !== record.ref) throw new Error('Calendar identity mismatch')
  if (record.phase === 'cancelled') {
    if (existing && existing.status !== 'cancelled') await config.client.events.delete({ calendarId, eventId, sendUpdates: 'none' })
    return
  }
  const end = addMinutes(new Date(item.slots[item.slots.length - 1]), 30)
  const body: calendar_v3.Schema$Event = {
    id: eventId, summary: `${item.studioName} - ${record.customer.name} (${record.phase === 'paid' ? 'Paid' : 'Payment pending'})`,
    description: [
      `Studio: ${item.studioName}`, `Client: ${record.customer.name}`, `Email: ${record.customer.email}`, `Phone: ${record.customer.phone || 'Not provided'}`,
      `Setup: ${getStudioSetup(item.studioId, item.setupId)?.label || 'Standard studio setup'}`,
      `Session: ${describeSlotRanges(item.slots)}`, 'Studio turnaround: 30 minutes after the session.',
      ...(item.addOns || []).map((addon) => `Add-on: ${bookingAddOnDescription(addon)}`),
      `Total: $${(record.total / 100).toFixed(2)}`, `Payment: ${record.phase === 'paid' ? 'Paid' : 'Pending'}`,
      ...(record.invoiceId ? [`Stripe invoice: ${record.invoiceId}`] : []),
      `Booked by: ${record.employee}`, `Booking reference: ${record.ref}`, `Internal notes: ${record.notes || 'None'}`,
      'Employee reservation. Only this studio is reserved. Coordinate crew separately.',
    ].join('\n'),
    start: { dateTime: item.slots[0], timeZone: BOOKING_TIME_ZONE }, end: { dateTime: end.toISOString(), timeZone: BOOKING_TIME_ZONE },
    visibility: 'private', transparency: 'opaque', status: 'confirmed', colorId: record.phase === 'paid' ? '10' : '5',
    extendedProperties: { private: { source, bookingRef: record.ref, studioId: item.studioId, setupId: item.setupId || '', resourceGroups: `studio:${item.studioId}`, addOnIds: (item.addOns || []).map(({ id }) => id).join(','), paymentStatus: record.phase === 'paid' ? 'paid' : 'pending', stripeInvoiceId: record.invoiceId || '' } },
  }
  if (existing) await config.client.events.update({ calendarId, eventId, sendUpdates: 'none', requestBody: body })
  else {
    try { await config.client.events.insert({ calendarId, sendUpdates: 'none', requestBody: body }) }
    catch (error) { if (googleStatus(error) !== 409) throw error; await writeEmployeeCalendar(record) }
  }
}
function key(record: EmployeeBooking, action: string) { return `${record.ref}:${action}` }
function assertInvoice(invoice: Stripe.Invoice, record: EmployeeBooking) {
  if (invoice.metadata?.bookingRef !== record.ref || invoice.metadata?.source !== source || invoice.customer !== record.customerId || invoice.currency !== 'usd') throw new Error('Invoice identity mismatch')
}
export function createEmployeeServices(stripeClient: () => Stripe = getStripeClient): EmployeeBookingServices { return {
  store: employeeStore,
  async available(record) {
    const result = await assertCartSlotsAvailable(record.cart, record.ref)
    if (!result.ok) throw new EmployeeBookingError(result.error, result.status)
  },
  async hold(record) {
    const last = record.cart[0].slots.at(-1)!
    const result = await acquireBookingHolds(record.cart, record.ref, new Date(Date.parse(last) + 25 * 3600_000), false)
    if (!result.ok) throw new EmployeeBookingError(result.error, result.status)
  },
  calendar: writeEmployeeCalendar,
  async release(record) { await releaseBookingHolds(record.cart, record.ref) },
  async customer(record) {
    const result = await stripeClient().customers.create({ name: record.customer.name, email: record.customer.email, ...(record.customer.phone ? { phone: record.customer.phone } : {}), metadata: { source, bookingRef: record.ref } }, { idempotencyKey: key(record, 'customer') })
    return result.id
  },
  async invoice(record) {
    const result = await stripeClient().invoices.create({ customer: record.customerId!, collection_method: 'send_invoice', due_date: Math.floor(Date.parse(record.cart[0].slots[0]) / 1000), auto_advance: false, pending_invoice_items_behavior: 'exclude', currency: 'usd', metadata: { source, bookingRef: record.ref }, description: 'Your VibeShack studio reservation. Please complete payment before your session. Contact the studio for booking changes. Your reservation is not automatically released if payment is late.' }, { idempotencyKey: key(record, 'invoice') })
    return result.id
  },
  async finalize(record) {
    const stripe = stripeClient()
    let invoice = await stripe.invoices.retrieve(record.invoiceId!)
    assertInvoice(invoice, record)
    if (invoice.status === 'draft') {
      const item = record.cart[0]
      await stripe.invoiceItems.create({ invoice: invoice.id, customer: record.customerId!, amount: record.total, currency: 'usd', description: `${item.studioName} | ${formatDateForDisplay(item.date)} | ${describeSlotRanges(item.slots)} PT | ${item.hours} hours | ${getStudioSetup(item.studioId, item.setupId)?.label || 'Standard setup'}${item.addOns?.length ? ` | ${item.addOns.map(bookingAddOnDescription).join(' | ')}` : ''}` }, { idempotencyKey: key(record, 'line-item') })
      invoice = await stripe.invoices.retrieve(invoice.id)
      if (invoice.total !== record.total) throw new Error('Invoice total mismatch')
      invoice = await stripe.invoices.finalizeInvoice(invoice.id, { auto_advance: false }, { idempotencyKey: key(record, 'finalize') })
    }
    if (invoice.total !== record.total || !['open', 'paid'].includes(invoice.status || '') || !invoice.hosted_invoice_url) throw new Error('Invoice is not payable')
    return invoice.hosted_invoice_url
  },
  async send(record) { await stripeClient().invoices.sendInvoice(record.invoiceId!, {}, { idempotencyKey: key(record, 'send') }) },
  async voidInvoice(record) {
    const stripe = stripeClient()
    const invoice = await stripe.invoices.retrieve(record.invoiceId!)
    assertInvoice(invoice, record)
    if (invoice.status === 'paid') throw new EmployeeBookingError('The client has already paid. Review the payment in Stripe before cancelling.', 409)
    if (invoice.status === 'void') return
    if (invoice.status !== 'open') throw new EmployeeBookingError('This invoice needs administrator review before cancellation.', 409)
    await stripe.invoices.voidInvoice(invoice.id, {}, { idempotencyKey: key(record, 'void') })
  },
} }
export const employeeServices = createEmployeeServices()

// Called only after Stripe signature validation. Re-read the invoice to handle
// duplicate/out-of-order notifications without regressing a paid reservation.
export async function reconcileEmployeeInvoice(invoiceId: string, services = employeeServices, stripe = getStripeClient()) {
  const invoice = await stripe.invoices.retrieve(invoiceId)
  if (invoice.metadata?.source !== source) return false
  const ref = invoice.metadata.bookingRef
  if (!ref || !validEmployeeRef(ref)) throw new Error('Missing employee booking identity')
  await withEmployeeBooking(await services.store(ref), async (record, save) => {
    assertInvoice(invoice, record)
    if (record.invoiceId !== invoice.id || invoice.total !== record.total) throw new Error('Employee invoice does not match reservation')
    if (invoice.status === 'paid') {
      if (record.phase === 'cancelled' || invoice.amount_paid !== record.total) throw new Error('Paid booking needs manual review')
      record.phase = 'paid'; await save(record); await services.calendar(record)
    } else if (invoice.status === 'void' && record.phase !== 'paid') {
      record.phase = 'cancelled'; await save(record); await services.calendar(record); await services.release(record)
    }
  })
  return true
}

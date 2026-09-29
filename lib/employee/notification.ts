import { createHash } from 'node:crypto'
import { bookingDeliveryStore } from '../booking/calendar'
import { bookingAddOnDescription } from '../booking/add-ons'
import { deliverMessage, type DeliveryStore } from '../booking/delivery'
import { getStudioSetup } from '../booking/studio-setups'
import { describeSlotRanges, formatBookingDuration, formatDateForDisplay } from '../booking/time'
import { escapeHtml, isEmail, stripControlChars } from '../server/sanitize'
import { siteUrl } from '../seo/site'
import type { EmployeeBooking } from './booking'
import { employeeCreatorLabel } from './identity'
import { employeePaymentDetails } from './payment'

type Notification = { to: string; cc?: string; subject: string; html: string; text: string }
type NotificationDependencies = {
  store(identity: string): Promise<DeliveryStore>
  send(message: Notification & { messageId: string }): Promise<{ accepted?: unknown[]; rejected?: unknown[] }>
  now?: () => Date
}

const internalAddress = 'founder@vibeshackstudios.com'
function bookingRows(record: EmployeeBooking) {
  const item = record.cart[0]
  return [
    ['Booked by', employeeCreatorLabel(record)],
    ['Client', record.customer.name],
    ['Email', record.customer.email],
    ['Phone', record.customer.phone || 'Not provided'],
    ...employeePaymentDetails(record),
    ['Total', `$${(record.total / 100).toFixed(2)}`],
    ['Studio', item.studioName],
    ['Date', formatDateForDisplay(item.date)],
    ['Session', `${describeSlotRanges(item.slots)} PT`],
    ['Duration', formatBookingDuration(item.slots.length)],
    ['Setup', getStudioSetup(item.studioId, item.setupId)?.label || 'Standard studio setup'],
    ...(item.addOns || []).map((addOn) => ['Add-on', bookingAddOnDescription(addOn)]),
    ['Booking reference', record.ref],
    ...(record.invoiceId ? [['Stripe invoice', record.invoiceId]] : []),
    ['Internal notes', record.notes || 'None'],
  ]
}
function subjectDetails(record: EmployeeBooking) {
  const item = record.cart[0]
  return `${stripControlChars(record.customer.name, 120)} - ${stripControlChars(item.studioName, 120)} - ${formatDateForDisplay(item.date).replace(/^\w+,\s*/, '')}`
}
const htmlRows = (rows: string[][]) => rows.map(([label, value]) => `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}`).join('<br>')
const textRows = (rows: string[][]) => rows.map(([label, value]) => `${label}: ${stripControlChars(value, 1000)}`).join('\n')

export function employeeBookingNotification(record: EmployeeBooking): Notification {
  const rows = bookingRows(record)
  const note = 'Employee reservation. Only this studio is reserved, including 30 minutes of turnaround. Coordinate operators and cameras separately.'
  return {
    to: internalAddress,
    subject: `New Booking: ${subjectDetails(record)}`,
    html: `<p><strong>New employee booking received.</strong></p><p>${htmlRows(rows)}</p><p>${note}</p>`,
    text: `New employee booking received.\n\n${textRows(rows)}\n\n${note}`,
  }
}

// Staff only. The creator is copied so the person who booked it can follow up.
export function employeeUnpaidReminder(record: EmployeeBooking): Notification {
  const rows = bookingRows(record)
  const link = `${siteUrl}/employee/bookings/`
  const intro = 'This session starts within 48 hours and is still unpaid.'
  const action = 'Mark it paid or cancel it on the Bookings page. Nothing has been cancelled or released.'
  const creator = stripControlChars(record.employee, 254).toLowerCase()
  return {
    to: internalAddress, ...(isEmail(creator) && creator !== internalAddress ? { cc: creator } : {}),
    subject: `Unpaid booking: ${subjectDetails(record)}`,
    html: `<p><strong>${intro}</strong></p><p>${htmlRows(rows)}</p><p>${action}</p><p><a href="${link}">${link}</a></p>`,
    text: `${intro}\n\n${textRows(rows)}\n\n${action}\n${link}`,
  }
}

// Every staff message for one booking shares one durable ledger, keyed by purpose.
function ledgerDelivery(dependencies: NotificationDependencies, key: string, message: (record: EmployeeBooking) => Notification) {
  return async (record: EmployeeBooking) => {
    const identity = `employee:${record.ref}`
    const store = await dependencies.store(identity)
    const value = message(record)
    await deliverMessage(store, key, async (messageId) => {
      const result = await dependencies.send({ ...value, messageId })
      if (result.rejected?.length && !result.accepted?.length) {
        throw Object.assign(new Error('The internal notification recipient was rejected'), { responseCode: 550 })
      }
    }, { identity: createHash('sha256').update(identity).digest('hex').slice(0, 40), now: dependencies.now })
  }
}

export function createEmployeeBookingNotifier(dependencies: NotificationDependencies) {
  const deliver = ledgerDelivery(dependencies, 'staff', employeeBookingNotification)
  return async (record: EmployeeBooking) => {
    if (record.phase !== 'paid') throw new Error('Employee booking notification requires verified payment')
    await deliver(record)
  }
}
export function createEmployeeUnpaidReminder(dependencies: NotificationDependencies) {
  const deliver = ledgerDelivery(dependencies, 'unpaid-reminder', employeeUnpaidReminder)
  return async (record: EmployeeBooking) => {
    if (record.phase !== 'ready') throw new Error('Unpaid reminders are only for bookings awaiting payment')
    await deliver(record)
  }
}

const mail: NotificationDependencies = {
  store: bookingDeliveryStore,
  async send(message) {
    const user = process.env.GMAIL_USER || 'founder@vibeshackstudios.com'
    const pass = process.env.GMAIL_APP_PASSWORD
    if (!pass) throw Object.assign(new Error('GMAIL_APP_PASSWORD is not configured'), { code: 'EAUTH' })
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.default.createTransport({
      service: 'gmail', auth: { user, pass },
      connectionTimeout: 20_000, greetingTimeout: 20_000, socketTimeout: 30_000,
    })
    return transporter.sendMail({ ...message, from: `"VibeShack Booking" <${user}>` })
  },
}
const notify = createEmployeeBookingNotifier(mail)
const remind = createEmployeeUnpaidReminder(mail)

export async function sendEmployeeBookingNotification(record: EmployeeBooking): Promise<void> {
  await notify(record)
}
export async function sendEmployeeUnpaidReminder(record: EmployeeBooking): Promise<void> {
  await remind(record)
}

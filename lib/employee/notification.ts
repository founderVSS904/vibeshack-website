import { createHash } from 'node:crypto'
import { bookingDeliveryStore } from '../booking/calendar'
import { bookingAddOnDescription } from '../booking/add-ons'
import { deliverMessage, type DeliveryStore } from '../booking/delivery'
import { getStudioSetup } from '../booking/studio-setups'
import { describeSlotRanges, formatBookingDuration, formatDateForDisplay } from '../booking/time'
import { escapeHtml, stripControlChars } from '../server/sanitize'
import type { EmployeeBooking } from './booking'
import { employeeCreatorLabel } from './identity'

type Notification = { to: string; subject: string; html: string; text: string }
type NotificationDependencies = {
  store(identity: string): Promise<DeliveryStore>
  send(message: Notification & { messageId: string }): Promise<{ accepted?: unknown[]; rejected?: unknown[] }>
  now?: () => Date
}

export function employeeBookingNotification(record: EmployeeBooking): Notification {
  const item = record.cart[0]
  const date = formatDateForDisplay(item.date)
  const rows = [
    ['Booked by', employeeCreatorLabel(record)],
    ['Client', record.customer.name],
    ['Email', record.customer.email],
    ['Phone', record.customer.phone || 'Not provided'],
    ['Payment', record.phase === 'paid' ? 'Paid' : 'Payment pending'],
    ['Total', `$${(record.total / 100).toFixed(2)}`],
    ['Studio', item.studioName],
    ['Date', date],
    ['Session', `${describeSlotRanges(item.slots)} PT`],
    ['Duration', formatBookingDuration(item.slots.length)],
    ['Setup', getStudioSetup(item.studioId, item.setupId)?.label || 'Standard studio setup'],
    ...(item.addOns || []).map((addOn) => ['Add-on', bookingAddOnDescription(addOn)]),
    ['Booking reference', record.ref],
    ...(record.invoiceId ? [['Stripe invoice', record.invoiceId]] : []),
    ['Internal notes', record.notes || 'None'],
  ]
  const note = 'Employee reservation. Only this studio is reserved, including 30 minutes of turnaround. Coordinate operators and cameras separately.'
  return {
    to: 'founder@vibeshackstudios.com',
    subject: `New Booking: ${stripControlChars(record.customer.name, 120)} - ${stripControlChars(item.studioName, 120)} - ${date.replace(/^\w+,\s*/, '')}`,
    html: `<p><strong>New employee booking received.</strong></p><p>${rows.map(([label, value]) => `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}`).join('<br>')}</p><p>${note}</p>`,
    text: `New employee booking received.\n\n${rows.map(([label, value]) => `${label}: ${stripControlChars(value, 1000)}`).join('\n')}\n\n${note}`,
  }
}

export function createEmployeeBookingNotifier(dependencies: NotificationDependencies) {
  return async (record: EmployeeBooking) => {
    if (record.phase !== 'paid') throw new Error('Employee booking notification requires verified payment')
    const identity = `employee:${record.ref}`
    const store = await dependencies.store(identity)
    const message = employeeBookingNotification(record)
    await deliverMessage(store, 'staff', async (messageId) => {
      const result = await dependencies.send({ ...message, messageId })
      if (result.rejected?.length && !result.accepted?.length) {
        throw Object.assign(new Error('The internal notification recipient was rejected'), { responseCode: 550 })
      }
    }, { identity: createHash('sha256').update(identity).digest('hex').slice(0, 40), now: dependencies.now })
  }
}

const notify = createEmployeeBookingNotifier({
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
})

export async function sendEmployeeBookingNotification(record: EmployeeBooking): Promise<void> {
  await notify(record)
}

import { getCalendarConfig } from '../booking/calendar'
import { addMinutes } from '../booking/time'
import { EmployeeBookingError, employeeCanManageBooking, validEmployeeRef, type EmployeeBooking, type EmployeeBookingActor } from './booking'
import { employeeCreatorLabel } from './identity'

const stateSource = 'vibeshack-employee-booking-state'
const historyDays = 90
const pageSize = 100
export type EmployeeHistoryItem = {
  ref: string; createdAt: number; updatedAt: string; clientName: string; clientEmail: string
  studioName: string; start: string; end: string; total: number; phase: EmployeeBooking['phase']; bookedBy: string; canCancel: boolean
}
export type EmployeeHistoryPage = {
  items: EmployeeHistoryItem[]; nextCursor: string | null; scope: 'own' | 'team'; updatedSince: string
}
type HistoryEvent = { description?: string | null; updated?: string | null; status?: string | null; extendedProperties?: { private?: Record<string, string> | null } | null }
export type EmployeeHistorySource = (options: { cursor?: string; updatedSince: string; maxResults: number }) => Promise<{ events: HistoryEvent[]; nextCursor?: string | null }>

const calendarHistorySource: EmployeeHistorySource = async ({ cursor, updatedSince, maxResults }) => {
  const config = await getCalendarConfig()
  if (!config) throw new EmployeeBookingError('Booking history is not connected to Calendar yet.', 503)
  const response = await config.client.events.list({
    calendarId: process.env.GCAL_HOLD_CALENDAR_ID || config.calendarId,
    privateExtendedProperty: [`source=${stateSource}`],
    showDeleted: false, maxResults, pageToken: cursor, updatedMin: updatedSince,
    fields: 'items(description,updated,status,extendedProperties/private),nextPageToken',
  })
  return { events: response.data.items || [], nextCursor: response.data.nextPageToken }
}

function historyRecord(event: HistoryEvent): EmployeeBooking | null {
  if (event.status === 'cancelled' || event.extendedProperties?.private?.source !== stateSource || !event.description || event.description.length > 64_000) return null
  try {
    const record = JSON.parse(event.description) as EmployeeBooking
    const item = record.cart?.[0]
    if (record.version !== 1 || !validEmployeeRef(record.ref) || record.ref !== event.extendedProperties.private.bookingRef || record.cart?.length !== 1 || !item || item.reservationKind !== 'employee') return null
    if (typeof record.employee !== 'string' || !record.employee || !Number.isFinite(record.createdAt) || !Number.isSafeInteger(record.total) || record.total <= 0) return null
    if (!['new', 'reserved', 'ready', 'paid', 'cancelled'].includes(record.phase) || typeof record.customer?.name !== 'string' || typeof record.customer?.email !== 'string' || typeof item.studioName !== 'string') return null
    if (!Array.isArray(item.slots) || item.slots.length < 1 || item.slots.length > 48 || item.slots.some((slot) => typeof slot !== 'string' || !Number.isFinite(Date.parse(slot)))) return null
    return record
  } catch { return null }
}

// One bounded provider page per request. Filter ownership before projecting or
// returning any client details; a cursor never grants access to another owner.
export async function employeeBookingHistory(actor: EmployeeBookingActor, cursor?: string, source: EmployeeHistorySource = calendarHistorySource, now = new Date()): Promise<EmployeeHistoryPage> {
  if (cursor !== undefined && (!cursor || cursor.length > 2048 || /[\u0000-\u0020]/.test(cursor))) throw new EmployeeBookingError('Invalid booking history cursor')
  const updatedSince = new Date(now.getTime() - historyDays * 86_400_000).toISOString()
  const page = await source({ cursor, updatedSince, maxResults: pageSize })
  const items: EmployeeHistoryItem[] = []
  for (const event of page.events.slice(0, pageSize)) {
    const record = historyRecord(event)
    if (!record || !employeeCanManageBooking(record, actor)) continue
    const item = record.cart[0]
    items.push({
      ref: record.ref, createdAt: record.createdAt, updatedAt: event.updated || new Date(record.createdAt).toISOString(),
      clientName: record.customer.name, clientEmail: record.customer.email, studioName: item.studioName,
      start: item.slots[0], end: addMinutes(new Date(item.slots[item.slots.length - 1]), 30).toISOString(),
      total: record.total, phase: record.phase, bookedBy: employeeCreatorLabel(record),
      canCancel: Boolean(record.invoiceId && ['ready', 'reserved'].includes(record.phase) && (record.leaseUntil || 0) <= now.getTime()),
    })
  }
  items.sort((a, b) => b.createdAt - a.createdAt || a.ref.localeCompare(b.ref))
  return { items, nextCursor: page.nextCursor || null, scope: actor.role === 'superadmin' ? 'team' : 'own', updatedSince }
}

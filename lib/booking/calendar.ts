import fs from 'fs'
import { google, type calendar_v3 } from 'googleapis'
import { getStudioById, STUDIOS } from './catalog'
import { formatMoneyFromCents, type ReferralInfo } from './referrals'
import { BOOKING_TIME_ZONE, addHours, addMinutes, formatDateForDisplay, formatTimeForDisplay, getTimeSlotsForDay, groupConsecutiveSlotIsos, isValidBookingDate, slotIsoSetForDate, zonedDateHourToUtc, zonedDateTimeToUtc } from './time'

export interface BookingCartItem {
  studioId: string
  studioName: string
  date: string
  slots: string[]
  hours: number
  price: number
}

export interface CalendarConfig {
  calendarId: string
  client: ReturnType<typeof google.calendar>
  studioId?: string
  isStudioSpecificCalendar: boolean
}

export interface TourBookingDetails {
  name: string
  email: string
  phone?: string
  date: string
  slot: string
  studioId?: string
  studioName?: string
  notes?: string
}

export interface BookingReminderEvent {
  calendarId: string
  eventId: string
  bookingRef: string
  studioId: string
  studioName: string
  customerName: string
  customerEmail: string
  start: string
  end: string
  summary: string
  privateProperties: Record<string, string>
}

export const TOUR_DURATION_MINUTES = 30
const TOUR_START_HOUR = 8
const TOUR_END_HOUR = 20
const TOUR_INTERVAL_MINUTES = 30
const TOUR_MIN_LEAD_MINUTES = 120

function readCalendarCredentials() {
  const inlineJson = process.env.GCAL_TOKEN_JSON
  if (inlineJson) return JSON.parse(inlineJson)

  const encodedJson = process.env.GCAL_TOKEN_B64
  if (encodedJson) return JSON.parse(Buffer.from(encodedJson, 'base64').toString('utf8'))

  const tokenPath = process.env.GCAL_TOKEN_PATH
  if (tokenPath && fs.existsSync(tokenPath)) {
    return JSON.parse(fs.readFileSync(tokenPath, 'utf8'))
  }

  return null
}

function normalizeCalendarEnvKey(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, '_')
}

function getDefaultCalendarId() {
  return process.env.GCAL_CALENDAR_ID || 'founder@vibeshackstudios.com'
}

function getTourCalendarId() {
  return process.env.GCAL_TOUR_CALENDAR_ID || process.env.GCAL_CALENDAR_ID_TOUR || getDefaultCalendarId()
}

function getStudioCalendarMap() {
  const raw = process.env.GCAL_STUDIO_CALENDAR_IDS || process.env.GCAL_STUDIO_CALENDAR_MAP
  if (!raw) return {} as Record<string, string>

  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed)
          .filter((entry): entry is [string, string] => typeof entry[0] === 'string' && typeof entry[1] === 'string')
          .map(([studioId, calendarId]) => [studioId.trim(), calendarId.trim()])
          .filter(([studioId, calendarId]) => studioId && calendarId),
      )
    }
  } catch {
    // Also support simple comma-separated config: studio-id=calendar-id,other-id=calendar-id
  }

  return Object.fromEntries(
    raw
      .split(',')
      .map((part) => part.split('='))
      .filter((parts): parts is [string, string] => parts.length === 2)
      .map(([studioId, calendarId]) => [studioId.trim(), calendarId.trim()])
      .filter(([studioId, calendarId]) => studioId && calendarId),
  )
}

function resolveCalendarId(studioId?: string) {
  if (!studioId) return { calendarId: getDefaultCalendarId(), isStudioSpecificCalendar: false }

  const envKey = `GCAL_CALENDAR_ID_${normalizeCalendarEnvKey(studioId)}`
  const directCalendarId = process.env[envKey]
  if (directCalendarId) {
    return { calendarId: directCalendarId, isStudioSpecificCalendar: true }
  }

  const mappedCalendarId = getStudioCalendarMap()[studioId]
  if (mappedCalendarId) {
    return { calendarId: mappedCalendarId, isStudioSpecificCalendar: true }
  }

  return { calendarId: getDefaultCalendarId(), isStudioSpecificCalendar: false }
}

async function getCalendarConfig(studioId?: string): Promise<CalendarConfig | null> {
  const credentials = readCalendarCredentials()
  if (!credentials) return null

  const { calendarId, isStudioSpecificCalendar } = resolveCalendarId(studioId)
  const scopes = ['https://www.googleapis.com/auth/calendar']

  if (credentials.client_email && credentials.private_key) {
    const auth = new google.auth.GoogleAuth({ credentials, scopes })
    return { calendarId, client: google.calendar({ version: 'v3', auth }), studioId, isStudioSpecificCalendar }
  }

  const clientId = credentials.client_id || process.env.GCAL_CLIENT_ID
  const clientSecret = credentials.client_secret || process.env.GCAL_CLIENT_SECRET
  const redirectUri = credentials.redirect_uri || process.env.GCAL_REDIRECT_URI
  const token = credentials.tokens || credentials.credentials || credentials

  if (!clientId || !clientSecret || !token) return null

  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  auth.setCredentials(token)
  return { calendarId, client: google.calendar({ version: 'v3', auth }), studioId, isStudioSpecificCalendar }
}

function configuredCalendarIds() {
  const ids = new Set<string>([getDefaultCalendarId(), getTourCalendarId()])
  for (const studio of STUDIOS) {
    ids.add(resolveCalendarId(studio.id).calendarId)
  }
  return Array.from(ids).filter(Boolean)
}

async function getBusyTimesForRange(start: Date, end: Date, calendarIds: string[]) {
  const config = await getCalendarConfig()
  if (!config) return null

  const ids = Array.from(new Set(calendarIds.filter(Boolean)))
  const response = await config.client.freebusy.query({
    requestBody: {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      timeZone: BOOKING_TIME_ZONE,
      items: ids.map((id) => ({ id })),
    },
  })

  const calendars = response.data.calendars || {}
  const errored = ids.filter((id) => calendars[id]?.errors?.length)
  if (errored.length) {
    throw new Error(`Calendar freebusy failed for: ${errored.join(', ')}`)
  }

  return ids.flatMap((id) => calendars[id]?.busy || [])
    .filter((range): range is { start: string; end: string } => Boolean(range.start && range.end))
    .map((range) => ({ start: range.start, end: range.end }))
}

function normalizeText(value: string | null | undefined) {
  return (value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function eventText(event: calendar_v3.Schema$Event) {
  return normalizeText([
    event.summary,
    event.description,
    event.location,
  ].filter(Boolean).join('\n'))
}

function eventStudioId(event: calendar_v3.Schema$Event) {
  const explicitStudioId = event.extendedProperties?.private?.studioId
    || event.extendedProperties?.shared?.studioId

  if (explicitStudioId && getStudioById(explicitStudioId)) {
    return explicitStudioId
  }

  const text = eventText(event)
  if (!text) return null

  for (const studio of STUDIOS) {
    const aliases = [
      normalizeText(studio.id),
      normalizeText(studio.name),
    ].filter(Boolean)

    if (aliases.some((alias) => alias && text.includes(alias))) {
      return studio.id
    }
  }

  return null
}

function eventBlocksStudio(event: calendar_v3.Schema$Event, studioId: string | undefined, isStudioSpecificCalendar: boolean) {
  if (event.status === 'cancelled' || event.transparency === 'transparent') return false
  if (!studioId || isStudioSpecificCalendar) return true

  const eventStudio = eventStudioId(event)
  return eventStudio ? eventStudio === studioId : true
}

function eventBoundaryToDate(boundary: calendar_v3.Schema$EventDateTime | undefined, isEnd = false) {
  if (!boundary) return null
  if (boundary.dateTime) return new Date(boundary.dateTime)
  if (boundary.date && isValidBookingDate(boundary.date)) return zonedDateHourToUtc(boundary.date, 0)
  return isEnd ? null : null
}

function eventBusyRange(event: calendar_v3.Schema$Event) {
  const start = eventBoundaryToDate(event.start)
  const end = eventBoundaryToDate(event.end, true)
  if (!start || !end) return null
  return { start: start.toISOString(), end: end.toISOString() }
}

function descriptionField(description: string | null | undefined, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`^${escaped}:\\s*(.+)$`, 'im').exec(description || '')
  return match?.[1]?.trim() || ''
}

function looksLikeEmail(value: string | null | undefined) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
}

function eventToBookingReminder(calendarId: string, event: calendar_v3.Schema$Event): BookingReminderEvent | null {
  const privateProperties = Object.fromEntries(
    Object.entries(event.extendedProperties?.private || {})
      .filter((entry): entry is [string, string] => typeof entry[0] === 'string' && typeof entry[1] === 'string'),
  )

  if (event.status === 'cancelled') return null
  if (privateProperties.source !== 'vibeshack-website') return null
  if (privateProperties.reminder24hSentAt) return null

  const start = event.start?.dateTime
  const end = event.end?.dateTime
  if (!event.id || !start || !end) return null

  const description = event.description || ''
  const customerEmail = event.attendees?.map((attendee) => attendee.email || '').find(looksLikeEmail)
    || descriptionField(description, 'Email')
  if (!looksLikeEmail(customerEmail)) return null

  const customerName = event.attendees?.find((attendee) => attendee.email === customerEmail)?.displayName
    || descriptionField(description, 'Client')
    || 'there'
  const studioId = privateProperties.studioId || eventStudioId(event) || ''
  const studioName = privateProperties.studioName
    || descriptionField(description, 'Studio')
    || (studioId ? getStudioById(studioId)?.name : '')
    || event.summary?.split(' - ')[0]
    || 'VibeShack Studios'

  return {
    calendarId,
    eventId: event.id,
    bookingRef: privateProperties.bookingRef || event.id,
    studioId,
    studioName,
    customerName,
    customerEmail,
    start: new Date(start).toISOString(),
    end: new Date(end).toISOString(),
    summary: event.summary || studioName,
    privateProperties,
  }
}

export async function getBusyTimesForDate(date: string, studioId?: string) {
  if (!isValidBookingDate(date)) {
    throw new Error('Invalid date')
  }

  const config = await getCalendarConfig(studioId)
  if (!config) return null

  const daySlots = getTimeSlotsForDay(date)
  const timeMin = daySlots[0].start.toISOString()
  const timeMax = daySlots[daySlots.length - 1].end.toISOString()

  const response = await config.client.events.list({
    calendarId: config.calendarId,
    timeMin,
    timeMax,
    timeZone: BOOKING_TIME_ZONE,
    singleEvents: true,
    orderBy: 'startTime',
    showDeleted: false,
  })

  const busyTimes = (response.data.items || [])
    .filter((event) => eventBlocksStudio(event, studioId, config.isStudioSpecificCalendar))
    .map(eventBusyRange)
    .filter((range): range is { start: string; end: string } => Boolean(range))

  const tourCalendarId = getTourCalendarId()
  if (studioId && tourCalendarId !== config.calendarId) {
    const tourBusyTimes = await getBusyTimesForRange(new Date(timeMin), new Date(timeMax), [tourCalendarId])
    if (!tourBusyTimes) return null
    busyTimes.push(...tourBusyTimes)
  }

  return busyTimes
}

function getTourSlotsForDay(date: string) {
  const slots: { start: Date; end: Date }[] = []
  for (let hour = TOUR_START_HOUR; hour < TOUR_END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += TOUR_INTERVAL_MINUTES) {
      const start = zonedDateTimeToUtc(date, hour, minute)
      const end = addMinutes(start, TOUR_DURATION_MINUTES)
      slots.push({ start, end })
    }
  }
  return slots
}

function tourSlotIsoSetForDate(date: string) {
  return new Set(getTourSlotsForDay(date).map(({ start }) => start.toISOString()))
}

export function formatTourSlotRange(slot: string) {
  const start = new Date(slot)
  return `${formatTimeForDisplay(start)}-${formatTimeForDisplay(addMinutes(start, TOUR_DURATION_MINUTES))}`
}

export async function getTourAvailabilityForDate(date: string) {
  if (!isValidBookingDate(date)) {
    return { verified: false, error: 'Invalid date', durationMinutes: TOUR_DURATION_MINUTES, slots: [] }
  }

  const allSlots = getTourSlotsForDay(date)
  const cutoff = addMinutes(new Date(), TOUR_MIN_LEAD_MINUTES)
  const timeMin = allSlots[0].start
  const timeMax = allSlots[allSlots.length - 1].end

  try {
    const busyTimes = await getBusyTimesForRange(timeMin, timeMax, configuredCalendarIds())
    if (!busyTimes) {
      return {
        verified: false,
        error: 'Calendar credentials are not configured',
        durationMinutes: TOUR_DURATION_MINUTES,
        slots: allSlots.map(({ start }) => ({
          time: start.toISOString(),
          label: formatTimeForDisplay(start),
          available: false,
        })),
      }
    }

    return {
      verified: true,
      durationMinutes: TOUR_DURATION_MINUTES,
      slots: allSlots.map(({ start, end }) => {
        const busy = busyTimes.some((busyTime) => {
          const busyStart = new Date(busyTime.start)
          const busyEnd = new Date(busyTime.end)
          return start < busyEnd && end > busyStart
        })
        return {
          time: start.toISOString(),
          label: formatTimeForDisplay(start),
          available: !busy && start > cutoff,
        }
      }),
    }
  } catch (error) {
    console.error('tour availability calendar error', error)
    return {
      verified: false,
      error: 'Tour availability could not be verified',
      durationMinutes: TOUR_DURATION_MINUTES,
      slots: allSlots.map(({ start }) => ({
        time: start.toISOString(),
        label: formatTimeForDisplay(start),
        available: false,
      })),
    }
  }
}

export async function assertTourSlotAvailable(date: string, slot: string) {
  if (!isValidBookingDate(date)) {
    return { ok: false, status: 400, error: 'Invalid tour date' }
  }

  if (!tourSlotIsoSetForDate(date).has(slot)) {
    return { ok: false, status: 400, error: 'Selected tour time does not match the date' }
  }

  const availability = await getTourAvailabilityForDate(date)
  if (!availability.verified) {
    return { ok: false, status: 503, error: 'Live tour availability is temporarily unavailable. Please try again shortly.' }
  }

  const selected = availability.slots.find((candidate) => candidate.time === slot)
  if (!selected?.available) {
    return { ok: false, status: 409, error: 'Sorry, that tour time was just booked or is no longer available. Please choose another open time.' }
  }

  return { ok: true, status: 200, error: '' }
}

export async function getAvailabilityForDate(date: string, studioId?: string) {
  if (!isValidBookingDate(date)) {
    return { verified: false, error: 'Invalid date', slots: [] }
  }

  const allSlots = getTimeSlotsForDay(date)
  const now = new Date()

  try {
    const busyTimes = await getBusyTimesForDate(date, studioId)
    if (!busyTimes) {
      return {
        verified: false,
        error: 'Calendar credentials are not configured',
        slots: allSlots.map(({ start }) => ({
          time: start.toISOString(),
          label: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: BOOKING_TIME_ZONE }),
          available: false,
        })),
      }
    }

    return {
      verified: true,
      slots: allSlots.map(({ start, end }) => {
        const busy = busyTimes.some((busyTime) => {
          const busyStart = new Date(busyTime.start)
          const busyEnd = new Date(busyTime.end)
          return start < busyEnd && end > busyStart
        })
        return {
          time: start.toISOString(),
          label: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: BOOKING_TIME_ZONE }),
          available: !busy && start > now,
        }
      }),
    }
  } catch (error) {
    console.error('availability calendar error', error)
    return {
      verified: false,
      error: 'Calendar availability could not be verified',
      slots: allSlots.map(({ start }) => ({
        time: start.toISOString(),
        label: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: BOOKING_TIME_ZONE }),
        available: false,
      })),
    }
  }
}

export async function assertCartSlotsAvailable(cartItems: BookingCartItem[]) {
  const byStudioDate = new Map<string, { studioId: string; date: string; slots: string[] }>()
  const requestedSlotKeys = new Set<string>()

  for (const item of cartItems) {
    if (!getStudioById(item.studioId)) {
      return { ok: false, status: 400, error: 'Invalid studio' }
    }

    if (!isValidBookingDate(item.date)) {
      return { ok: false, status: 400, error: 'Invalid booking date' }
    }
    if (!Array.isArray(item.slots) || item.slots.length < 1 || item.slots.length > 24) {
      return { ok: false, status: 400, error: 'Invalid booking slots' }
    }

    const validSlots = slotIsoSetForDate(item.date)
    for (const slot of item.slots) {
      if (!validSlots.has(slot)) {
        return { ok: false, status: 400, error: 'Selected slots do not match the booking date' }
      }

      const requestedSlotKey = `${item.studioId}|${item.date}|${slot}`
      if (requestedSlotKeys.has(requestedSlotKey)) {
        return { ok: false, status: 409, error: 'Selected sessions overlap for the same studio.' }
      }
      requestedSlotKeys.add(requestedSlotKey)
    }

    const groupKey = `${item.studioId}|${item.date}`
    const group = byStudioDate.get(groupKey) || { studioId: item.studioId, date: item.date, slots: [] }
    group.slots.push(...item.slots)
    byStudioDate.set(groupKey, group)
  }

  for (const { studioId, date, slots } of Array.from(byStudioDate.values())) {
    const availability = await getAvailabilityForDate(date, studioId)
    if (!availability.verified) {
      return { ok: false, status: 503, error: 'Live calendar availability is temporarily unavailable. Please try again shortly.' }
    }

    const available = new Set(availability.slots.filter((slot) => slot.available).map((slot) => slot.time))
    for (const slot of slots) {
      if (!available.has(slot)) {
        return { ok: false, status: 409, error: 'One or more selected slots are no longer available.' }
      }
    }
  }

  return { ok: true, status: 200, error: '' }
}

export async function addBookingEvents(
  cartItems: BookingCartItem[],
  customer: { name: string; email: string; phone: string },
  teamEmails: string[] = [],
  referralInfo: ReferralInfo | null = null,
  bookingRef = '',
  stripeEventId = '',
) {
  const existingBookingByCalendar = new Map<string, boolean>()

  for (const item of cartItems) {
    const config = await getCalendarConfig(item.studioId)
    if (!config) throw new Error('Calendar credentials are not configured')

    if (bookingRef && !existingBookingByCalendar.has(config.calendarId)) {
      const existing = await config.client.events.list({
        calendarId: config.calendarId,
        privateExtendedProperty: [`bookingRef=${bookingRef}`],
        showDeleted: false,
        maxResults: 1,
      })
      existingBookingByCalendar.set(config.calendarId, Boolean(existing.data.items?.length))
    }

    if (bookingRef && existingBookingByCalendar.get(config.calendarId)) {
      console.info(`Skipping duplicate calendar insert for bookingRef ${bookingRef} on ${config.calendarId}`)
      continue
    }

    const dateStr = formatDateForDisplay(item.date)
    const groups = groupConsecutiveSlotIsos(item.slots)

    for (const group of groups) {
      const startTime = new Date(group[0])
      const endTime = addHours(new Date(group[group.length - 1]), 1)

      await config.client.events.insert({
        calendarId: config.calendarId,
        requestBody: {
          summary: `${item.studioName} - ${customer.name}`,
          description: [
            `Studio: ${item.studioName}`,
            `Studio ID: ${item.studioId}`,
            `Client: ${customer.name}`,
            `Email: ${customer.email}`,
            `Phone: ${customer.phone || 'N/A'}`,
            `Date: ${dateStr}`,
            `Duration: ${group.length}hr`,
            `Amount: $${item.price}`,
            ...(referralInfo ? [
              '',
              `Referral partner: ${referralInfo.partnerName}`,
              `Referral source: ${referralInfo.source}`,
              `Partner commission: ${formatMoneyFromCents(referralInfo.commissionCents)} (${Math.round(referralInfo.commissionRate * 100)}%)`,
            ] : []),
            '',
            'Booked via VibeShack website',
          ].join('\n'),
          start: { dateTime: startTime.toISOString(), timeZone: BOOKING_TIME_ZONE },
          end: { dateTime: endTime.toISOString(), timeZone: BOOKING_TIME_ZONE },
          extendedProperties: {
            private: {
              source: 'vibeshack-website',
              bookingRef,
              stripeEventId,
              studioId: item.studioId,
              studioName: item.studioName,
            },
          },
          attendees: [
            { email: customer.email, displayName: customer.name },
            ...teamEmails.map((email) => ({ email })),
          ],
          colorId: '11',
        },
      })
    }
  }
}

export async function listBookingEventsForReminderWindow(now = new Date(), startHours = 23, endHours = 25) {
  const config = await getCalendarConfig()
  if (!config) return null

  const timeMin = addHours(now, startHours).toISOString()
  const timeMax = addHours(now, endHours).toISOString()
  const reminderEvents: BookingReminderEvent[] = []

  for (const calendarId of configuredCalendarIds()) {
    const response = await config.client.events.list({
      calendarId,
      timeMin,
      timeMax,
      timeZone: BOOKING_TIME_ZONE,
      privateExtendedProperty: ['source=vibeshack-website'],
      singleEvents: true,
      orderBy: 'startTime',
      showDeleted: false,
    })

    for (const event of response.data.items || []) {
      const reminderEvent = eventToBookingReminder(calendarId, event)
      if (reminderEvent) reminderEvents.push(reminderEvent)
    }
  }

  return reminderEvents
}

export async function markBookingReminderSent(events: BookingReminderEvent[], sentAt = new Date().toISOString()) {
  const config = await getCalendarConfig()
  if (!config) throw new Error('Calendar credentials are not configured')

  for (const event of events) {
    await config.client.events.patch({
      calendarId: event.calendarId,
      eventId: event.eventId,
      requestBody: {
        extendedProperties: {
          private: {
            ...event.privateProperties,
            reminder24hSentAt: sentAt,
          },
        },
      },
    })
  }
}

export async function addTourEvent(tour: TourBookingDetails) {
  const config = await getCalendarConfig()
  if (!config) throw new Error('Calendar credentials are not configured')

  const startTime = new Date(tour.slot)
  const endTime = addMinutes(startTime, TOUR_DURATION_MINUTES)
  const studioName = tour.studioName || (tour.studioId ? getStudioById(tour.studioId)?.name : '') || 'General studio tour'
  const dateStr = formatDateForDisplay(tour.date)
  const tourCalendarId = getTourCalendarId()

  const existingTour = await config.client.events.list({
    calendarId: tourCalendarId,
    timeMin: startTime.toISOString(),
    timeMax: endTime.toISOString(),
    privateExtendedProperty: [
      'source=vibeshack-tour-booking',
      `guestEmail=${tour.email}`,
    ],
    showDeleted: false,
    maxResults: 1,
  })

  if (existingTour.data.items?.length) {
    console.info(`Skipping duplicate tour insert for ${tour.email} at ${tour.slot}`)
    return
  }

  await config.client.events.insert({
    calendarId: tourCalendarId,
    sendUpdates: 'all',
    requestBody: {
      summary: `Studio Tour - ${tour.name}`,
      location: '950 Battery St, San Francisco, CA 94111',
      description: [
        'Free VibeShack studio tour booked from the website.',
        '',
        `Guest: ${tour.name}`,
        `Email: ${tour.email}`,
        `Phone: ${tour.phone || 'N/A'}`,
        `Date: ${dateStr}`,
        `Time: ${formatTourSlotRange(tour.slot)} PT`,
        `Studio interest: ${studioName}`,
        tour.notes ? `Notes: ${tour.notes}` : '',
      ].filter(Boolean).join('\n'),
      start: { dateTime: startTime.toISOString(), timeZone: BOOKING_TIME_ZONE },
      end: { dateTime: endTime.toISOString(), timeZone: BOOKING_TIME_ZONE },
      extendedProperties: {
        private: {
          source: 'vibeshack-tour-booking',
          bookingType: 'tour',
          guestEmail: tour.email,
          studioId: tour.studioId || '',
          studioName,
        },
      },
      attendees: [
        { email: tour.email, displayName: tour.name },
      ],
      colorId: '5',
    },
  })
}

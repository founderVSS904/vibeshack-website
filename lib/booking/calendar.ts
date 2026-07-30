import fs from 'fs'
import { createHash } from 'node:crypto'
import { google, type calendar_v3 } from 'googleapis'
import { getStudioById, STUDIOS } from './catalog'
import { bookingHoldIsActive } from './checkout-lifecycle'
import {
  bookingHoldCleanupError,
  collectBookingHoldCleanupFailures,
  deleteBookingHoldArtifact,
  runOptimisticBookingHoldCleanup,
} from './hold-cleanup'
import { formatMoneyFromCents, type ReferralInfo } from './referrals'
import { primaryStudioResourceGroup, studioIdsThatAffectAvailability, studioResourceGroups, studiosShareResources } from './resources'
import { BOOKING_TIME_ZONE, SLOT_DURATION_MINUTES, addHours, addMinutes, formatBookingDuration, formatDateForDisplay, formatTimeForDisplay, getTimeSlotsForDay, groupConsecutiveSlotIsos, hasConsecutiveBookingSlots, isValidBookingDate, slotIsoSetForDate, zonedDateHourToUtc, zonedDateTimeToUtc } from './time'

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
const BOOKING_HOLD_LEDGER_VERSION = 1
const BOOKING_HOLD_UPDATE_ATTEMPTS = 6

interface BookingHoldLedgerTarget {
  eventId: string
  resourceGroup: string
  date: string
  slots: string[]
}

interface BookingHold {
  expiresAt: string
  slots: string[]
}

interface BookingHoldLedger {
  version: number
  resourceGroup: string
  date: string
  holds: Record<string, BookingHold>
}

interface BookingHoldBusyEventTarget {
  eventId: string
  studioId: string
  studioName: string
  resourceGroups: string[]
  date: string
  start: string
  end: string
}

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

function getHoldCalendarId() {
  return process.env.GCAL_HOLD_CALENDAR_ID || getDefaultCalendarId()
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
  const ids = new Set<string>([getDefaultCalendarId(), getHoldCalendarId(), getTourCalendarId()])
  for (const studio of STUDIOS) {
    ids.add(resolveCalendarId(studio.id).calendarId)
  }
  return Array.from(ids).filter(Boolean)
}

function bookingHoldLedgerEventId(resourceGroup: string, date: string) {
  const digest = createHash('sha256')
    .update(`${resourceGroup}|${date}`)
    .digest('hex')
    .slice(0, 48)

  return `vbsh${digest}`
}

function bookingHoldLedgerTarget(
  resourceGroup: string,
  date: string,
  slots: string[] = [],
): BookingHoldLedgerTarget {
  return {
    eventId: bookingHoldLedgerEventId(resourceGroup, date),
    resourceGroup,
    date,
    slots: Array.from(new Set(slots)).sort((first, second) => Date.parse(first) - Date.parse(second)),
  }
}

function bookingHoldTargets(cartItems: BookingCartItem[]) {
  const targets = new Map<string, BookingHoldLedgerTarget>()

  for (const item of cartItems) {
    for (const resourceGroup of studioResourceGroups(item.studioId)) {
      const key = `${resourceGroup}|${item.date}`
      const existing = targets.get(key)
      targets.set(
        key,
        bookingHoldLedgerTarget(
          resourceGroup,
          item.date,
          [...(existing?.slots || []), ...item.slots],
        ),
      )
    }
  }

  return Array.from(targets.values())
    .sort((first, second) => first.eventId.localeCompare(second.eventId))
}

function availabilityHoldTargets(studioId: string | undefined, date: string) {
  const resourceGroups = studioId
    ? studioResourceGroups(studioId)
    : Array.from(new Set(STUDIOS.flatMap((studio) => studioResourceGroups(studio.id))))

  return resourceGroups
    .map((resourceGroup) => bookingHoldLedgerTarget(resourceGroup, date))
    .sort((first, second) => first.eventId.localeCompare(second.eventId))
}

function bookingHoldBusyEventTargets(
  cartItems: BookingCartItem[],
  bookingRef: string,
) {
  return cartItems.flatMap((item) => (
    groupConsecutiveSlotIsos(item.slots).map((slots) => {
      const start = slots[0]
      const finalSlotStart = new Date(slots[slots.length - 1])
      const end = addMinutes(finalSlotStart, SLOT_DURATION_MINUTES).toISOString()
      const digest = createHash('sha256')
        .update(`${bookingRef}|${item.studioId}|${item.date}|${start}`)
        .digest('hex')
        .slice(0, 48)

      return {
        eventId: `vbhb${digest}`,
        studioId: item.studioId,
        studioName: item.studioName,
        resourceGroups: studioResourceGroups(item.studioId),
        date: item.date,
        start,
        end,
      }
    })
  ))
}

function googleApiStatus(error: unknown) {
  if (!error || typeof error !== 'object') return 0

  const candidate = error as {
    code?: number
    response?: { status?: number }
  }

  return candidate.response?.status || candidate.code || 0
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function bookingHoldLedgerRequestBody(
  target: BookingHoldLedgerTarget,
  ledger: BookingHoldLedger,
  includeId = false,
) {
  return {
    ...(includeId ? { id: target.eventId } : {}),
    summary: `VibeShack booking holds: ${target.resourceGroup}`,
    description: JSON.stringify(ledger),
    start: { date: '2000-01-01' },
    end: { date: '2000-01-02' },
    transparency: 'transparent',
    visibility: 'private',
    extendedProperties: {
      private: {
        source: 'vibeshack-booking-hold-ledger',
        version: String(BOOKING_HOLD_LEDGER_VERSION),
        resourceGroup: target.resourceGroup,
        bookingDate: target.date,
      },
    },
  } satisfies calendar_v3.Schema$Event
}

function emptyBookingHoldLedger(target: BookingHoldLedgerTarget): BookingHoldLedger {
  return {
    version: BOOKING_HOLD_LEDGER_VERSION,
    resourceGroup: target.resourceGroup,
    date: target.date,
    holds: {},
  }
}

function parseBookingHoldLedger(
  event: calendar_v3.Schema$Event,
  target: BookingHoldLedgerTarget,
) {
  try {
    const parsed = JSON.parse(event.description || '') as BookingHoldLedger
    if (
      !parsed
      || parsed.version !== BOOKING_HOLD_LEDGER_VERSION
      || parsed.resourceGroup !== target.resourceGroup
      || parsed.date !== target.date
      || !parsed.holds
      || typeof parsed.holds !== 'object'
    ) {
      return emptyBookingHoldLedger(target)
    }

    return parsed
  } catch {
    return emptyBookingHoldLedger(target)
  }
}

function activeBookingHoldLedger(
  event: calendar_v3.Schema$Event,
  target: BookingHoldLedgerTarget,
  now = Date.now(),
) {
  const ledger = parseBookingHoldLedger(event, target)
  const holds = Object.fromEntries(
    Object.entries(ledger.holds).filter(([, hold]) => (
      hold
      && bookingHoldIsActive(hold.expiresAt, now)
      && Array.isArray(hold.slots)
    )),
  )

  return { ...ledger, holds }
}

async function getOrCreateBookingHoldLedger(
  client: ReturnType<typeof google.calendar>,
  calendarId: string,
  target: BookingHoldLedgerTarget,
) {
  try {
    return (await client.events.get({
      calendarId,
      eventId: target.eventId,
    })).data
  } catch (error) {
    if (googleApiStatus(error) !== 404) throw error
  }

  const emptyLedger = emptyBookingHoldLedger(target)
  try {
    await client.events.insert({
      calendarId,
      sendUpdates: 'none',
      requestBody: bookingHoldLedgerRequestBody(target, emptyLedger, true),
    })
  } catch (error) {
    if (googleApiStatus(error) !== 409) throw error
  }

  for (let attempt = 0; attempt < BOOKING_HOLD_UPDATE_ATTEMPTS; attempt++) {
    try {
      return (await client.events.get({
        calendarId,
        eventId: target.eventId,
      })).data
    } catch (error) {
      if (googleApiStatus(error) !== 404 || attempt === BOOKING_HOLD_UPDATE_ATTEMPTS - 1) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)))
    }
  }

  throw new Error('Booking hold ledger could not be initialized')
}

async function getExistingBookingHoldLedger(
  client: ReturnType<typeof google.calendar>,
  calendarId: string,
  target: BookingHoldLedgerTarget,
) {
  try {
    return (await client.events.get({
      calendarId,
      eventId: target.eventId,
    })).data
  } catch (error) {
    if (googleApiStatus(error) === 404) return null
    throw error
  }
}

async function updateBookingHoldLedger(
  client: ReturnType<typeof google.calendar>,
  calendarId: string,
  target: BookingHoldLedgerTarget,
  currentEvent: calendar_v3.Schema$Event,
  ledger: BookingHoldLedger,
) {
  if (!currentEvent.etag) throw new Error('Booking hold ledger is missing an etag')

  return client.events.update(
    {
      calendarId,
      eventId: target.eventId,
      sendUpdates: 'none',
      requestBody: bookingHoldLedgerRequestBody(target, ledger),
    },
    {
      headers: {
        'If-Match': currentEvent.etag,
      },
    },
  )
}

function bookingHoldBusyEventRequestBody(
  target: BookingHoldBusyEventTarget,
  bookingRef: string,
  expiresAt: Date,
  includeId = false,
) {
  return {
    ...(includeId ? { id: target.eventId } : {}),
    summary: `Temporary checkout hold: ${target.studioName}`,
    description: `A customer is completing checkout for this time. The temporary hold expires at ${expiresAt.toISOString()}.`,
    status: 'tentative',
    transparency: 'opaque',
    visibility: 'private',
    start: {
      dateTime: target.start,
      timeZone: BOOKING_TIME_ZONE,
    },
    end: {
      dateTime: target.end,
      timeZone: BOOKING_TIME_ZONE,
    },
    extendedProperties: {
      private: {
        source: 'vibeshack-booking-checkout-hold',
        bookingRef,
        studioId: target.studioId,
        studioName: target.studioName,
        resourceGroup: primaryStudioResourceGroup(target.studioId),
        resourceGroups: target.resourceGroups.join(','),
        bookingDate: target.date,
        expiresAt: expiresAt.toISOString(),
      },
    },
  } satisfies calendar_v3.Schema$Event
}

async function upsertBookingHoldBusyEvent(
  client: ReturnType<typeof google.calendar>,
  calendarId: string,
  target: BookingHoldBusyEventTarget,
  bookingRef: string,
  expiresAt: Date,
) {
  for (let attempt = 0; attempt < BOOKING_HOLD_UPDATE_ATTEMPTS; attempt++) {
    let currentEvent: calendar_v3.Schema$Event | null = null

    try {
      currentEvent = (await client.events.get({
        calendarId,
        eventId: target.eventId,
      })).data
    } catch (error) {
      if (googleApiStatus(error) !== 404) throw error
    }

    if (!currentEvent) {
      try {
        await client.events.insert({
          calendarId,
          sendUpdates: 'none',
          requestBody: bookingHoldBusyEventRequestBody(target, bookingRef, expiresAt, true),
        })
        return
      } catch (error) {
        if (googleApiStatus(error) !== 409) throw error
        continue
      }
    }

    if (!currentEvent.etag) throw new Error('Booking checkout hold is missing an etag')

    try {
      await client.events.update(
        {
          calendarId,
          eventId: target.eventId,
          sendUpdates: 'none',
          requestBody: bookingHoldBusyEventRequestBody(target, bookingRef, expiresAt),
        },
        {
          headers: {
            'If-Match': currentEvent.etag,
          },
        },
      )
      return
    } catch (error) {
      if (googleApiStatus(error) !== 412) throw error
      if (attempt === BOOKING_HOLD_UPDATE_ATTEMPTS - 1) {
        throw new Error('Booking checkout hold could not be updated after repeated calendar changes.')
      }
    }
  }
}

async function upsertBookingHoldBusyEvents(
  client: ReturnType<typeof google.calendar>,
  calendarId: string,
  cartItems: BookingCartItem[],
  bookingRef: string,
  expiresAt: Date,
) {
  for (const target of bookingHoldBusyEventTargets(cartItems, bookingRef)) {
    await upsertBookingHoldBusyEvent(client, calendarId, target, bookingRef, expiresAt)
  }
}

async function deleteBookingHoldBusyEvents(
  client: ReturnType<typeof google.calendar>,
  calendarId: string,
  cartItems: BookingCartItem[],
  bookingRef: string,
) {
  const targets = bookingHoldBusyEventTargets(cartItems, bookingRef)
  return collectBookingHoldCleanupFailures(
    targets,
    (target) => `busy event ${target.eventId}`,
    async (target) => {
      await deleteBookingHoldArtifact(
        () => client.events.delete({
          calendarId,
          eventId: target.eventId,
          sendUpdates: 'none',
        }),
        () => client.events.get({
          calendarId,
          eventId: target.eventId,
        }),
        googleApiStatus,
      )
    },
  )
}

function holdSlotsConflict(first: string[], second: string[]) {
  const firstSlots = new Set(first)
  return second.some((slot) => firstSlots.has(slot))
}

async function releaseBookingHoldsForTargets(
  client: ReturnType<typeof google.calendar>,
  calendarId: string,
  targets: BookingHoldLedgerTarget[],
  bookingRef: string,
) {
  return collectBookingHoldCleanupFailures(
    targets,
    (target) => `ledger ${target.resourceGroup} on ${target.date} (${target.eventId})`,
    async (target) => {
      await runOptimisticBookingHoldCleanup({
        attempts: BOOKING_HOLD_UPDATE_ATTEMPTS,
        load: () => getExistingBookingHoldLedger(client, calendarId, target),
        isReleased: (currentEvent) => (
          !currentEvent
          || !activeBookingHoldLedger(currentEvent, target).holds[bookingRef]
        ),
        update: async (currentEvent) => {
          if (!currentEvent) return
          const ledger = activeBookingHoldLedger(currentEvent, target)
          const nextHolds = { ...ledger.holds }
          delete nextHolds[bookingRef]
          await updateBookingHoldLedger(client, calendarId, target, currentEvent, {
            ...ledger,
            holds: nextHolds,
          })
        },
        verifyReleased: async () => {
          const verifiedEvent = await getExistingBookingHoldLedger(client, calendarId, target)
          return (
            !verifiedEvent
            || !activeBookingHoldLedger(verifiedEvent, target).holds[bookingRef]
          )
        },
        statusOf: googleApiStatus,
        concurrentFailureMessage: 'Booking hold could not be released after repeated calendar changes.',
      })
    },
  )
}

async function releaseBookingHoldArtifacts(
  client: ReturnType<typeof google.calendar>,
  calendarId: string,
  targets: BookingHoldLedgerTarget[],
  cartItems: BookingCartItem[],
  bookingRef: string,
) {
  const [busyEventFailures, ledgerFailures] = await Promise.all([
    deleteBookingHoldBusyEvents(client, calendarId, cartItems, bookingRef),
    releaseBookingHoldsForTargets(client, calendarId, targets, bookingRef),
  ])
  const failures = [...busyEventFailures, ...ledgerFailures]

  if (failures.length) {
    throw bookingHoldCleanupError(bookingRef, failures)
  }
}

async function getBookingHoldBusyTimes(
  client: ReturnType<typeof google.calendar>,
  studioId: string | undefined,
  date: string,
  excludedBookingRef?: string,
  createMissing = false,
) {
  if (!isValidBookingDate(date)) return []

  const calendarId = getHoldCalendarId()
  const busySlots = new Set<string>()

  for (const target of availabilityHoldTargets(studioId, date)) {
    const currentEvent = createMissing
      ? await getOrCreateBookingHoldLedger(client, calendarId, target)
      : await getExistingBookingHoldLedger(client, calendarId, target)
    if (!currentEvent) continue

    const ledger = activeBookingHoldLedger(currentEvent, target)
    for (const [bookingRef, hold] of Object.entries(ledger.holds)) {
      if (bookingRef === excludedBookingRef) continue
      hold.slots.forEach((slot) => busySlots.add(slot))
    }
  }

  return Array.from(busySlots).map((slot) => {
    const start = new Date(slot)
    return {
      start: start.toISOString(),
      end: addMinutes(start, SLOT_DURATION_MINUTES).toISOString(),
    }
  })
}

async function releaseAcquiredBookingHolds(
  client: ReturnType<typeof google.calendar>,
  calendarId: string,
  acquiredTargets: BookingHoldLedgerTarget[],
  cartItems: BookingCartItem[],
  bookingRef: string,
) {
  if (!acquiredTargets.length) return

  try {
    await releaseBookingHoldArtifacts(
      client,
      calendarId,
      acquiredTargets,
      cartItems,
      bookingRef,
    )
  } catch (error) {
    console.error('Partial booking hold cleanup failed:', error)
  }
}

async function acquireBookingHoldTarget(
  client: ReturnType<typeof google.calendar>,
  calendarId: string,
  target: BookingHoldLedgerTarget,
  bookingRef: string,
  expiresAt: Date,
) {
  for (let attempt = 0; attempt < BOOKING_HOLD_UPDATE_ATTEMPTS; attempt++) {
    const currentEvent = await getOrCreateBookingHoldLedger(client, calendarId, target)
    const ledger = activeBookingHoldLedger(currentEvent, target)
    const conflict = Object.entries(ledger.holds).some(([existingBookingRef, hold]) => (
      existingBookingRef !== bookingRef && holdSlotsConflict(target.slots, hold.slots)
    ))

    if (conflict) {
      return {
        ok: false,
        status: 409,
        error: 'That time is currently being checked out by another client. Please choose another open time.',
      }
    }

    try {
      await updateBookingHoldLedger(client, calendarId, target, currentEvent, {
        ...ledger,
        holds: {
          ...ledger.holds,
          [bookingRef]: {
            expiresAt: expiresAt.toISOString(),
            slots: target.slots,
          },
        },
      })
      return { ok: true, status: 200, error: '' }
    } catch (error) {
      if (googleApiStatus(error) !== 412) throw error
      if (attempt === BOOKING_HOLD_UPDATE_ATTEMPTS - 1) {
        throw new Error('Booking availability changed too quickly. Please try again.')
      }
    }
  }

  throw new Error('Booking hold could not be created')
}

export async function acquireBookingHolds(
  cartItems: BookingCartItem[],
  bookingRef: string,
  expiresAt: Date,
) {
  const config = await getCalendarConfig()
  if (!config) {
    return { ok: false, status: 503, error: 'Live calendar availability is temporarily unavailable. Please try again shortly.' }
  }

  const calendarId = getHoldCalendarId()
  const targets = bookingHoldTargets(cartItems)
  const attemptedTargets: BookingHoldLedgerTarget[] = []

  try {
    for (const target of targets) {
      // Include the current target before the update. Google may commit a
      // ledger write and then time out, so relying only on successful client
      // responses can omit a hold that still needs rollback.
      attemptedTargets.push(target)
      const result = await acquireBookingHoldTarget(
        config.client,
        calendarId,
        target,
        bookingRef,
        expiresAt,
      )

      if (!result.ok) {
        await releaseAcquiredBookingHolds(config.client, calendarId, attemptedTargets, cartItems, bookingRef)
        return result
      }
    }

    await upsertBookingHoldBusyEvents(config.client, calendarId, cartItems, bookingRef, expiresAt)
    return { ok: true, status: 200, error: '' }
  } catch (error) {
    await releaseAcquiredBookingHolds(config.client, calendarId, attemptedTargets, cartItems, bookingRef)
    throw error
  }
}

export async function releaseBookingHolds(
  cartItems: BookingCartItem[],
  bookingRef: string,
) {
  if (!bookingRef || !cartItems.length) return

  const config = await getCalendarConfig()
  if (!config) throw new Error('Calendar credentials are not configured')

  const targets = bookingHoldTargets(cartItems)
  await releaseBookingHoldArtifacts(
    config.client,
    getHoldCalendarId(),
    targets,
    cartItems,
    bookingRef,
  )
}

export async function hasActiveBookingHold(cartItems: BookingCartItem[], bookingRef: string) {
  if (!bookingRef || !cartItems.length) return false

  const config = await getCalendarConfig()
  if (!config) return false

  const calendarId = getHoldCalendarId()
  for (const target of bookingHoldTargets(cartItems)) {
    const currentEvent = await getExistingBookingHoldLedger(config.client, calendarId, target)
    if (!currentEvent) return false

    const hold = activeBookingHoldLedger(currentEvent, target).holds[bookingRef]
    if (!hold) return false

    const heldSlots = new Set(hold.slots)
    if (!target.slots.every((slot) => heldSlots.has(slot))) return false
  }

  return true
}

async function cleanupExpiredBookingHoldBusyEvents(
  client: ReturnType<typeof google.calendar>,
  calendarId: string,
  start: Date,
  end: Date,
) {
  const expiredEventIds: string[] = []
  let pageToken: string | undefined

  do {
    const response = await client.events.list({
      calendarId,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      timeZone: BOOKING_TIME_ZONE,
      singleEvents: true,
      showDeleted: false,
      privateExtendedProperty: ['source=vibeshack-booking-checkout-hold'],
      maxResults: 2500,
      pageToken,
    })

    expiredEventIds.push(...(response.data.items || [])
      .filter((event) => {
        const expiresAt = event.extendedProperties?.private?.expiresAt || ''
        return !bookingHoldIsActive(expiresAt)
      })
      .map((event) => event.id)
      .filter((eventId): eventId is string => Boolean(eventId)))

    pageToken = response.data.nextPageToken || undefined
  } while (pageToken)

  const failures = await collectBookingHoldCleanupFailures(
    expiredEventIds,
    (eventId) => `expired busy event ${eventId}`,
    async (eventId) => {
      try {
        await client.events.delete({
          calendarId,
          eventId,
          sendUpdates: 'none',
        })
      } catch (error) {
        const status = googleApiStatus(error)
        if (status !== 404 && status !== 410) throw error
      }
    },
  )

  if (failures.length) {
    throw new AggregateError(
      failures.map(({ error }) => error),
      `Expired booking hold housekeeping was incomplete. ${failures
        .map(({ target, error }) => `${target}: ${errorMessage(error)}`)
        .join('; ')}`,
    )
  }
}

async function getBusyTimesForRange(start: Date, end: Date, calendarIds: string[]) {
  const config = await getCalendarConfig()
  if (!config) return null

  const ids = Array.from(new Set(calendarIds.filter(Boolean)))
  const holdCalendarId = getHoldCalendarId()
  if (ids.includes(holdCalendarId)) {
    await cleanupExpiredBookingHoldBusyEvents(
      config.client,
      holdCalendarId,
      start,
      end,
    )
  }
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

function eventResourceGroups(event: calendar_v3.Schema$Event) {
  const privateProperties = event.extendedProperties?.private || {}
  const sharedProperties = event.extendedProperties?.shared || {}
  const rawGroups = privateProperties.resourceGroups
    || sharedProperties.resourceGroups
    || privateProperties.resourceGroup
    || sharedProperties.resourceGroup
    || ''

  return rawGroups
    .split(',')
    .map((resourceGroup) => resourceGroup.trim())
    .filter(Boolean)
}

function eventBlocksStudio(
  event: calendar_v3.Schema$Event,
  studioId: string | undefined,
  calendarStudioIds: Set<string>,
  isStudioSpecificCalendar: boolean,
  excludedBookingRef?: string,
) {
  if (event.status === 'cancelled' || event.transparency === 'transparent') return false

  const privateProperties = event.extendedProperties?.private || {}
  if (excludedBookingRef && privateProperties.bookingRef === excludedBookingRef) {
    return false
  }

  if (
    privateProperties.source === 'vibeshack-booking-checkout-hold'
    && !bookingHoldIsActive(privateProperties.expiresAt)
  ) {
    return false
  }

  if (!studioId) return true

  const eventStudio = eventStudioId(event)
  const effectiveResourceGroups = new Set(eventResourceGroups(event))
  if (eventStudio) {
    studioResourceGroups(eventStudio).forEach((resourceGroup) => effectiveResourceGroups.add(resourceGroup))
  }

  if (effectiveResourceGroups.size) {
    const targetResourceGroups = new Set(studioResourceGroups(studioId))
    return Array.from(effectiveResourceGroups).some((resourceGroup) => targetResourceGroups.has(resourceGroup))
  }

  if (eventStudio) return studiosShareResources(eventStudio, studioId)

  if (isStudioSpecificCalendar) {
    return Array.from(calendarStudioIds).some((calendarStudioId) => (
      studiosShareResources(calendarStudioId, studioId)
    ))
  }

  return true
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

export async function getBusyTimesForDate(
  date: string,
  studioId?: string,
  excludedBookingRef?: string,
  initializeBookingHoldLedgers = false,
) {
  if (!isValidBookingDate(date)) {
    throw new Error('Invalid date')
  }

  const config = await getCalendarConfig(studioId)
  if (!config) return null

  const daySlots = getTimeSlotsForDay(date)
  const timeMin = daySlots[0].start.toISOString()
  const timeMax = daySlots[daySlots.length - 1].end.toISOString()
  try {
    await cleanupExpiredBookingHoldBusyEvents(
      config.client,
      getHoldCalendarId(),
      new Date(timeMin),
      new Date(timeMax),
    )
  } catch (error) {
    // Availability below reads full event metadata and ignores expired hold
    // events itself. Cleanup is helpful housekeeping, but a failed deletion
    // must not make every otherwise-open booking time disappear.
    console.error('Expired booking hold housekeeping failed:', error)
  }
  const calendarContexts = new Map<string, {
    calendarId: string
    isStudioSpecificCalendar: boolean
    studioIds: Set<string>
  }>()

  const studioIdsToCheck = studioIdsThatAffectAvailability(studioId)
  if (studioIdsToCheck.length) {
    for (const affectedStudioId of studioIdsToCheck) {
      const resolved = resolveCalendarId(affectedStudioId)
      const context = calendarContexts.get(resolved.calendarId) || {
        calendarId: resolved.calendarId,
        isStudioSpecificCalendar: resolved.isStudioSpecificCalendar,
        studioIds: new Set<string>(),
      }
      context.isStudioSpecificCalendar = context.isStudioSpecificCalendar || resolved.isStudioSpecificCalendar
      context.studioIds.add(affectedStudioId)
      calendarContexts.set(resolved.calendarId, context)
    }
  } else {
    calendarContexts.set(config.calendarId, {
      calendarId: config.calendarId,
      isStudioSpecificCalendar: config.isStudioSpecificCalendar,
      studioIds: new Set<string>(),
    })
  }

  const busyTimes: { start: string; end: string }[] = []
  for (const context of calendarContexts.values()) {
    const response = await config.client.events.list({
      calendarId: context.calendarId,
      timeMin,
      timeMax,
      timeZone: BOOKING_TIME_ZONE,
      singleEvents: true,
      orderBy: 'startTime',
      showDeleted: false,
    })

    busyTimes.push(...(response.data.items || [])
      .filter((event) => eventBlocksStudio(
        event,
        studioId,
        context.studioIds,
        context.isStudioSpecificCalendar,
        excludedBookingRef,
      ))
      .map(eventBusyRange)
      .filter((range): range is { start: string; end: string } => Boolean(range)))
  }

  busyTimes.push(...await getBookingHoldBusyTimes(
    config.client,
    studioId,
    date,
    excludedBookingRef,
    initializeBookingHoldLedgers,
  ))

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

    const holdConfig = await getCalendarConfig()
    if (!holdConfig) {
      throw new Error('Calendar credentials are not configured')
    }
    busyTimes.push(...await getBookingHoldBusyTimes(holdConfig.client, undefined, date))

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
    return { ok: false, status: 409, error: 'Sorry, that tour time was booked moments ago or is no longer available. Please choose another open time.' }
  }

  return { ok: true, status: 200, error: '' }
}

export async function getAvailabilityForDate(
  date: string,
  studioId?: string,
  excludedBookingRef?: string,
  initializeBookingHoldLedgers = false,
) {
  if (!isValidBookingDate(date)) {
    return { verified: false, error: 'Invalid date', slots: [] }
  }

  const allSlots = getTimeSlotsForDay(date)
  const now = new Date()

  try {
    const busyTimes = await getBusyTimesForDate(
      date,
      studioId,
      excludedBookingRef,
      initializeBookingHoldLedgers,
    )
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

export async function assertCartSlotsAvailable(
  cartItems: BookingCartItem[],
  excludedBookingRef?: string,
) {
  const byStudioDate = new Map<string, { studioId: string; date: string; slots: string[] }>()
  const requestedSlotKeys = new Set<string>()

  for (const item of cartItems) {
    if (!getStudioById(item.studioId)) {
      return { ok: false, status: 400, error: 'Invalid studio' }
    }

    if (!isValidBookingDate(item.date)) {
      return { ok: false, status: 400, error: 'Invalid booking date' }
    }
    // A post-payment overlap check can contain only the still-future tail of a
    // valid booking, so availability accepts a one-slot sequence. Checkout and
    // webhook validation enforce the one-hour (two-slot) booking minimum.
    if (!Array.isArray(item.slots) || !hasConsecutiveBookingSlots(item.slots, 1)) {
      return { ok: false, status: 400, error: 'Invalid booking slots' }
    }

    const validSlots = slotIsoSetForDate(item.date)
    for (const slot of item.slots) {
      if (!validSlots.has(slot)) {
        return { ok: false, status: 400, error: 'Selected slots do not match the booking date' }
      }

      const resourceSlotKeys = studioResourceGroups(item.studioId)
        .map((resourceGroup) => `${resourceGroup}|${item.date}|${slot}`)

      if (resourceSlotKeys.some((requestedSlotKey) => requestedSlotKeys.has(requestedSlotKey))) {
        return { ok: false, status: 409, error: 'Selected sessions overlap for the same studio resources.' }
      }

      resourceSlotKeys.forEach((requestedSlotKey) => requestedSlotKeys.add(requestedSlotKey))
    }

    const groupKey = `${item.studioId}|${item.date}`
    const group = byStudioDate.get(groupKey) || { studioId: item.studioId, date: item.date, slots: [] }
    group.slots.push(...item.slots)
    byStudioDate.set(groupKey, group)
  }

  for (const { studioId, date, slots } of Array.from(byStudioDate.values())) {
    const availability = await getAvailabilityForDate(date, studioId, excludedBookingRef, true)
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

function confirmedBookingEventId(
  bookingRef: string,
  studioId: string,
  date: string,
  start: string,
) {
  const digest = createHash('sha256')
    .update(`${bookingRef}|${studioId}|${date}|${start}`)
    .digest('hex')
    .slice(0, 48)

  return `vbbk${digest}`
}

function isConfirmedBookingEvent(event: calendar_v3.Schema$Event, bookingRef: string) {
  const privateProperties = event.extendedProperties?.private || {}
  return (
    event.status !== 'cancelled'
    && privateProperties.source === 'vibeshack-website'
    && privateProperties.bookingRef === bookingRef
  )
}

function confirmedBookingEventKey(studioId: string, start: string) {
  return `${studioId}|${new Date(start).toISOString()}`
}

async function listConfirmedBookingEventKeys(
  client: ReturnType<typeof google.calendar>,
  calendarId: string,
  bookingRef: string,
) {
  const keys = new Set<string>()
  let pageToken: string | undefined

  do {
    const response = await client.events.list({
      calendarId,
      privateExtendedProperty: [
        `bookingRef=${bookingRef}`,
        'source=vibeshack-website',
      ],
      showDeleted: false,
      maxResults: 2500,
      pageToken,
    })

    for (const event of response.data.items || []) {
      const studioId = event.extendedProperties?.private?.studioId || ''
      const start = event.start?.dateTime || ''
      if (studioId && start && isConfirmedBookingEvent(event, bookingRef)) {
        keys.add(confirmedBookingEventKey(studioId, start))
      }
    }

    pageToken = response.data.nextPageToken || undefined
  } while (pageToken)

  return keys
}

export async function hasBookingEventsForRef(
  bookingRef: string,
  cartItems: BookingCartItem[],
) {
  if (!bookingRef || !cartItems.length) return false

  const expectedKeysByCalendar = new Map<string, {
    config: CalendarConfig
    keys: Set<string>
  }>()

  for (const item of cartItems) {
    const config = await getCalendarConfig(item.studioId)
    if (!config) return false

    for (const group of groupConsecutiveSlotIsos(item.slots)) {
      const entry = expectedKeysByCalendar.get(config.calendarId) || {
        config,
        keys: new Set<string>(),
      }
      entry.keys.add(confirmedBookingEventKey(item.studioId, group[0]))
      expectedKeysByCalendar.set(config.calendarId, entry)
    }
  }

  for (const [calendarId, { config, keys }] of expectedKeysByCalendar) {
    const existingKeys = await listConfirmedBookingEventKeys(config.client, calendarId, bookingRef)
    if (Array.from(keys).some((key) => !existingKeys.has(key))) return false
  }

  return true
}

export async function addBookingEvents(
  cartItems: BookingCartItem[],
  customer: { name: string; email: string; phone: string },
  teamEmails: string[] = [],
  referralInfo: ReferralInfo | null = null,
  bookingRef = '',
  stripeEventId = '',
) {
  const existingKeysByCalendar = new Map<string, Set<string>>()

  for (const item of cartItems) {
    const config = await getCalendarConfig(item.studioId)
    if (!config) throw new Error('Calendar credentials are not configured')
    if (bookingRef && !existingKeysByCalendar.has(config.calendarId)) {
      existingKeysByCalendar.set(
        config.calendarId,
        await listConfirmedBookingEventKeys(config.client, config.calendarId, bookingRef),
      )
    }

    const dateStr = formatDateForDisplay(item.date)
    const groups = groupConsecutiveSlotIsos(item.slots)

    for (const group of groups) {
      const startTime = new Date(group[0])
      const endTime = addMinutes(new Date(group[group.length - 1]), SLOT_DURATION_MINUTES)
      const eventId = confirmedBookingEventId(bookingRef, item.studioId, item.date, group[0])
      const eventKey = confirmedBookingEventKey(item.studioId, group[0])

      if (bookingRef && existingKeysByCalendar.get(config.calendarId)?.has(eventKey)) {
        console.info(`Skipping duplicate calendar insert for bookingRef ${bookingRef}, event ${eventKey}`)
        continue
      }

      if (bookingRef) {
        try {
          const existing = (await config.client.events.get({
            calendarId: config.calendarId,
            eventId,
          })).data
          if (isConfirmedBookingEvent(existing, bookingRef)) {
            console.info(`Skipping duplicate calendar insert for bookingRef ${bookingRef}, event ${eventId}`)
            existingKeysByCalendar.get(config.calendarId)?.add(eventKey)
            continue
          }
          throw new Error(`Calendar event ID collision for ${eventId}`)
        } catch (error) {
          if (googleApiStatus(error) !== 404) throw error
        }
      }

      try {
        await config.client.events.insert({
          calendarId: config.calendarId,
          requestBody: {
            ...(bookingRef ? { id: eventId } : {}),
            summary: `${item.studioName} - ${customer.name}`,
            description: [
              `Studio: ${item.studioName}`,
              `Studio ID: ${item.studioId}`,
              `Client: ${customer.name}`,
              `Email: ${customer.email}`,
              `Phone: ${customer.phone || 'N/A'}`,
              `Date: ${dateStr}`,
              `Duration: ${formatBookingDuration(group.length)}`,
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
                resourceGroup: primaryStudioResourceGroup(item.studioId),
                resourceGroups: studioResourceGroups(item.studioId).join(','),
              },
            },
            attendees: [
              { email: customer.email, displayName: customer.name },
              ...teamEmails.map((email) => ({ email })),
            ],
            colorId: '11',
          },
        })
        if (bookingRef) existingKeysByCalendar.get(config.calendarId)?.add(eventKey)
      } catch (error) {
        if (!bookingRef || googleApiStatus(error) !== 409) throw error

        const existing = (await config.client.events.get({
          calendarId: config.calendarId,
          eventId,
        })).data
        if (!isConfirmedBookingEvent(existing, bookingRef)) {
          throw new Error(`Calendar event ID collision for ${eventId}`)
        }
        console.info(`Calendar event already inserted for bookingRef ${bookingRef}, event ${eventId}`)
        existingKeysByCalendar.get(config.calendarId)?.add(eventKey)
      }
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

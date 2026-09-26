import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { calendar_v3 } from 'googleapis'
import {
  acquireBookingHolds, releaseBookingHolds, assertCartSlotsAvailable, getAvailabilityForDate,
  addBookingEvents, bookingEventBusyRange, listBookingEventsForReminderWindow,
  getTourAvailabilityForDate,
  type BookingCalendarDependencies, type CalendarConfig,
} from '../lib/booking/calendar'
import { buildCanonicalBookingCart } from '../lib/booking/checkout-pricing'
import { getStudioSetups } from '../lib/booking/studio-setups'
import { tourReservationCart } from '../lib/booking/tour-reservation'
import { bookingSlotFitsTurnaround, slotsWithTurnaround } from '../lib/booking/turnaround'
import { addMinutes, bookingDateInPacific, zonedDateTimeToUtc } from '../lib/booking/time'

const date = '2099-09-25'
const iso = (hour: number, minute = 0, day = date) => zonedDateTimeToUtc(day, hour, minute).toISOString()
function cart(studioId = 'canvas-rental', hour = 15, count = 4, day = date, minute = 0) {
  const start = zonedDateTimeToUtc(day, hour, minute)
  return buildCanonicalBookingCart([{
    studioId, date: day, setupId: getStudioSetups(studioId)[0]?.id,
    slots: Array.from({ length: count }, (_, i) => addMinutes(start, i * 30).toISOString()),
  }])
}
function bookingEvent(studioId = 'canvas-rental', start = iso(15), end = iso(17)): calendar_v3.Schema$Event {
  return {
    id: 'fixture-booking', status: 'confirmed', start: { dateTime: start }, end: { dateTime: end },
    extendedProperties: { private: { source: 'vibeshack-website', studioId, bookingRef: 'fixture-paid' } },
  }
}

// No credentials, real provider connections, calendar writes, or payment calls.
function memoryCalendar(initial: calendar_v3.Schema$Event[] = []) {
  const stored = new Map(initial.map((event) => [event.id!, structuredClone(event)]))
  let revision = 0
  let failListing = false
  const requests: Array<{ timeMin?: string; timeMax?: string }> = []
  const events = {
    async get({ eventId }: { eventId: string }) {
      const event = stored.get(eventId)
      if (!event) throw Object.assign(new Error('Fixture missing'), { code: 404 })
      return { data: structuredClone(event) }
    },
    async insert({ requestBody }: { requestBody: calendar_v3.Schema$Event }) {
      assert.ok(requestBody.id)
      if (stored.has(requestBody.id)) throw Object.assign(new Error('Fixture duplicate'), { code: 409 })
      const event = { ...structuredClone(requestBody), etag: String(++revision) }
      stored.set(requestBody.id, event)
      return { data: structuredClone(event) }
    },
    async update({ eventId, requestBody }: { eventId: string; requestBody: calendar_v3.Schema$Event }, options: { headers: Record<string, string> }) {
      if (stored.get(eventId)?.etag !== options.headers['If-Match']) throw Object.assign(new Error('Fixture changed'), { code: 412 })
      const event = { ...structuredClone(requestBody), id: eventId, etag: String(++revision) }
      stored.set(eventId, event)
      return { data: structuredClone(event) }
    },
    async delete({ eventId }: { eventId: string }) {
      if (!stored.delete(eventId)) throw Object.assign(new Error('Fixture missing'), { code: 404 })
      return { data: {} }
    },
    async list(request: { timeMin?: string; timeMax?: string; privateExtendedProperty?: string[] }) {
      if (failListing) throw new Error('Fixture provider unavailable')
      requests.push(request)
      const items = [...stored.values()].filter((event) => {
        const start = Date.parse(event.start?.dateTime || event.start?.date || '')
        const end = Date.parse(event.end?.dateTime || event.end?.date || '')
        return (!request.timeMin || end > Date.parse(request.timeMin))
          && (!request.timeMax || start < Date.parse(request.timeMax))
          && (request.privateExtendedProperty || []).every((value) => {
            const [key, expected] = value.split('=')
            return event.extendedProperties?.private?.[key] === expected
          })
      })
      return { data: { items: structuredClone(items) } }
    },
  }
  const dependencies: BookingCalendarDependencies = {
    getConfig: async () => ({
      calendarId: 'fixture', isStudioSpecificCalendar: false,
      client: { events, freebusy: { query: async () => ({ data: { calendars: {} } }) } } as unknown as CalendarConfig['client'],
    }),
    calendarIds: () => ['fixture'],
  }
  const availability = (studioId = 'canvas-rental', day = date, excludedRef?: string) =>
    getAvailabilityForDate(day, studioId, excludedRef, false, dependencies)
  return { stored, dependencies, requests, availability, fail: () => { failListing = true } }
}

test('a 3-5 booking blocks 5 PM, reopens exactly at 5:30, and reserves cleanup before a later booking too', async () => {
  const fixture = memoryCalendar([bookingEvent()])
  const result = await fixture.availability()
  assert.equal(result.verified, true)
  const available = (hour: number, minute = 0) => result.slots.find((slot) => slot.time === iso(hour, minute))?.available
  assert.equal(available(14), true) // Paid slot ends 2:30, cleanup ends 3.
  assert.equal(available(14, 30), false) // No room for cleanup before 3.
  assert.equal(available(16, 30), false)
  assert.equal(available(17), false)
  assert.equal(available(17, 30), true)
  assert.equal((await assertCartSlotsAvailable(cart('canvas-rental', 17), undefined, fixture.dependencies)).status, 409)
  assert.equal((await assertCartSlotsAvailable(cart('canvas-rental', 17, 2, date, 30), undefined, fixture.dependencies)).ok, true)
  assert.equal((await assertCartSlotsAvailable(cart('canvas-rental', 13), undefined, fixture.dependencies)).status, 409)
  assert.equal((await assertCartSlotsAvailable(cart('canvas-rental', 12, 5), undefined, fixture.dependencies)).ok, true)
})

test('room-only cleanup preserves shared-resource session conflicts without adding buffers to other rooms', async () => {
  const fixture = memoryCalendar([bookingEvent('the-executive')])
  const result = await fixture.availability('sunset')
  assert.equal(result.slots.find((slot) => slot.time === iso(16, 30))?.available, false)
  assert.equal(result.slots.find((slot) => slot.time === iso(17))?.available, true)
  // Another room may finish at 3 while the Executive starts, since only its own
  // room is needed for that preceding session's cleanup.
  assert.equal(result.slots.find((slot) => slot.time === iso(14, 30))?.available, true)
  const own = await fixture.availability('the-executive')
  assert.equal(own.slots.find((slot) => slot.time === iso(17))?.available, false)
})

test('midnight booking and pending-hold turnaround both occupy the next Pacific date', async () => {
  const fixture = memoryCalendar([bookingEvent('canvas-rental', iso(22), iso(24))])
  const nextDate = bookingDateInPacific(new Date(iso(24)))
  let result = await fixture.availability('canvas-rental', nextDate)
  assert.equal(result.slots[0].available, false)
  assert.equal(result.slots[1].available, true)
  assert.ok(fixture.requests.some((request) => request.timeMin === iso(23, 30)))
  const held = memoryCalendar()
  const original = cart('canvas-rental', 22)
  assert.equal((await acquireBookingHolds(original, 'midnight-hold', new Date(Date.now() + 60_000), false, held.dependencies)).ok, true)
  result = await held.availability('canvas-rental', nextDate)
  assert.equal(result.slots[0].available, false)
  assert.equal(result.slots[1].available, true)
  const ledgers = [...held.stored.values()].map((event) => JSON.parse(event.description || '{}'))
  assert.ok(ledgers.some((ledger) => ledger.date === nextDate && ledger.resourceGroup === 'studio:canvas-rental'))
  await releaseBookingHolds(original, 'midnight-hold', held.dependencies)
  assert.equal((await held.availability('canvas-rental', nextDate)).slots[0].available, true)
})

test('a session ending at midnight needs room for its cleanup before the next day booking', async () => {
  const fixture = memoryCalendar([bookingEvent('canvas-rental', iso(24), iso(25))])
  const result = await fixture.availability()
  assert.equal(result.slots.at(-1)?.available, false)
  assert.equal(result.slots.at(-2)?.available, true)
  assert.equal((await assertCartSlotsAvailable(cart('canvas-rental', 22), undefined, fixture.dependencies)).status, 409)
})

test('checkout ledger contention enforces turnaround in either acquisition order and releases it safely', async () => {
  const expiry = new Date(Date.now() + 60_000)
  for (const reverse of [false, true]) {
    const fixture = memoryCalendar()
    const first = cart()
    const second = cart('canvas-rental', 17, 2)
    const [a, b] = reverse ? [second, first] : [first, second]
    assert.equal((await acquireBookingHolds(a, 'first', expiry, false, fixture.dependencies)).ok, true)
    assert.equal((await acquireBookingHolds(b, 'second', expiry, false, fixture.dependencies)).status, 409)
    await releaseBookingHolds(a, 'first', fixture.dependencies)
    assert.equal((await acquireBookingHolds(b, 'second', expiry, false, fixture.dependencies)).ok, true)
  }
  const fixture = memoryCalendar()
  const results = await Promise.all([
    acquireBookingHolds(cart(), 'race-a', expiry, false, fixture.dependencies),
    acquireBookingHolds(cart('canvas-rental', 17, 2), 'race-b', expiry, false, fixture.dependencies),
  ])
  assert.equal(results.filter((result) => result.ok).length, 1)
})

test('new holds do not double-buffer, old holds receive cleanup, and self-exclusion stays safe', async () => {
  const fixture = memoryCalendar()
  await acquireBookingHolds(cart(), 'legacy-hold', new Date(Date.now() + 60_000), false, fixture.dependencies)
  let result = await fixture.availability()
  assert.equal(result.slots.find((slot) => slot.time === iso(17, 30))?.available, true)
  for (const event of fixture.stored.values()) {
    const ledger = JSON.parse(event.description || '{}')
    if (!ledger.holds || !ledger.resourceGroup.startsWith('studio:')) continue
    ledger.holds['legacy-hold'].slots = cart()[0].slots
    delete ledger.holds['legacy-hold'].occupancyVersion
    event.description = JSON.stringify(ledger)
  }
  result = await fixture.availability()
  assert.equal(result.slots.find((slot) => slot.time === iso(17))?.available, false)
  assert.equal(result.slots.find((slot) => slot.time === iso(17, 30))?.available, true)
  assert.equal((await assertCartSlotsAvailable(cart(), 'legacy-hold', fixture.dependencies)).ok, true)
  assert.equal((await acquireBookingHolds(cart('canvas-rental', 17, 2), 'new-hold', new Date(Date.now() + 60_000), false, fixture.dependencies)).status, 409)
})

test('cart sessions cannot consume each other’s same-room turnaround, including across midnight', async () => {
  const fixture = memoryCalendar()
  assert.equal((await assertCartSlotsAvailable([...cart(), ...cart('canvas-rental', 17, 2)], undefined, fixture.dependencies)).status, 409)
  assert.equal((await assertCartSlotsAvailable([...cart(), ...cart('canvas-rental', 17, 2, date, 30)], undefined, fixture.dependencies)).ok, true)
  const nextDate = bookingDateInPacific(new Date(iso(24)))
  assert.equal((await assertCartSlotsAvailable([...cart('canvas-rental', 22), ...cart('canvas-rental', 0, 2, nextDate)], undefined, fixture.dependencies)).status, 409)
})

test('turnaround is elapsed time through spring-forward and fall-back, with no extra paid slots', () => {
  for (const start of ['2026-03-08T09:30:00.000Z', '2026-11-01T08:30:00.000Z']) {
    const result = slotsWithTurnaround([start])
    assert.equal(Date.parse(result[1]) - Date.parse(start), 30 * 60_000)
  }
  const original = cart()[0]
  const snapshot = structuredClone(original)
  assert.equal(slotsWithTurnaround(original.slots).length, original.slots.length + 1)
  assert.deepEqual(original, snapshot)
  assert.equal(original.hours, 2)
  assert.equal(original.price, 200)
})

test('calendar invitations and reminder end times remain the paid end, not the turnaround end', async () => {
  const fixture = memoryCalendar()
  const original = cart()
  await addBookingEvents(original, { name: 'Fixture', email: 'guest@example.invalid', phone: '' }, [], null, 'fixture-ref', 'fixture-stripe', fixture.dependencies)
  const event = [...fixture.stored.values()][0]
  assert.equal(event.end?.dateTime, iso(17))
  assert.match(event.description || '', /Studio turnaround: 30 minutes/)
  assert.equal(bookingEventBusyRange(event, 'canvas-rental')?.end, iso(17, 30))
  const reminders = await listBookingEventsForReminderWindow(zonedDateTimeToUtc(date, 0), 0, 24, fixture.dependencies)
  assert.equal(reminders?.[0].end, iso(17))
})

test('cancelled/transparent events do not block and tours do not gain their own turnaround', async () => {
  const fixture = memoryCalendar([{ ...bookingEvent(), status: 'cancelled' }, { ...bookingEvent(), id: 'transparent', transparency: 'transparent' }])
  assert.equal((await fixture.availability()).slots.find((slot) => slot.time === iso(17))?.available, true)
  const tour = bookingEvent('canvas-rental', iso(15), iso(15, 30))
  tour.extendedProperties!.private!.source = 'vibeshack-tour-booking'
  assert.equal(bookingEventBusyRange(tour, 'canvas-rental')?.end, iso(15, 30))
  const held = memoryCalendar()
  await acquireBookingHolds(tourReservationCart({ date, slot: iso(15) }), 'tour-fixture', new Date(Date.now() + 60_000), false, held.dependencies)
  assert.equal((await held.availability()).slots.find((slot) => slot.time === iso(15, 30))?.available, true)
})

test('manual room bookings receive turnaround; all-day blocks and other rooms are not extended', () => {
  const manual = { start: { dateTime: iso(15) }, end: { dateTime: iso(17) } }
  assert.equal(bookingEventBusyRange(manual, 'canvas-rental', new Set(['canvas-rental']), true)?.end, iso(17, 30))
  assert.equal(bookingEventBusyRange(manual, 'the-wing', new Set(['canvas-rental']), true)?.end, iso(17))
  const allDay = { start: { date }, end: { date: '2099-09-26' } }
  assert.equal(bookingEventBusyRange(allDay, 'canvas-rental')?.end, iso(24))
})

test('tours respect studio cleanup after a paid booking but do not add cleanup after a tour', async () => {
  const fixture = memoryCalendar([bookingEvent()])
  const result = await getTourAvailabilityForDate(date, undefined, fixture.dependencies)
  assert.equal(result.verified, true)
  assert.equal(result.slots.find((slot) => slot.time === iso(17))?.available, false)
  assert.equal(result.slots.find((slot) => slot.time === iso(17, 30))?.available, true)
  assert.equal(result.slots.find((slot) => slot.time === iso(14, 30))?.available, true)
  const tour = bookingEvent('canvas-rental', iso(15), iso(15, 30))
  tour.extendedProperties!.private!.source = 'vibeshack-tour-booking'
  const tourFixture = memoryCalendar([tour])
  const tours = await getTourAvailabilityForDate(date, undefined, tourFixture.dependencies)
  assert.equal(tours.slots.find((slot) => slot.time === iso(15))?.available, false)
  assert.equal(tours.slots.find((slot) => slot.time === iso(15, 30))?.available, true)
})

test('moving a booking moves its derived cleanup, without orphaned turnaround blocks', async () => {
  const fixture = memoryCalendar([bookingEvent()])
  fixture.stored.set('fixture-booking', bookingEvent('canvas-rental', iso(18), iso(20)))
  const result = await fixture.availability()
  assert.equal(result.slots.find((slot) => slot.time === iso(17))?.available, true)
  assert.equal(result.slots.find((slot) => slot.time === iso(20))?.available, false)
  assert.equal(result.slots.find((slot) => slot.time === iso(20, 30))?.available, true)
})

test('provider failures fail closed, and forged client flags cannot remove the studio buffer', async () => {
  const fixture = memoryCalendar()
  fixture.fail()
  const result = await fixture.availability()
  assert.equal(result.verified, false)
  assert.ok(result.slots.every((slot) => !slot.available))
  const forged = buildCanonicalBookingCart([{ ...cart()[0], reservationKind: 'tour' }])
  assert.equal(forged[0].reservationKind, undefined)
  const busy = [{ start: iso(17), end: iso(18), blocksTurnaround: true }]
  assert.equal(bookingSlotFitsTurnaround(new Date(iso(16, 30)), new Date(iso(17)), busy), false)
})

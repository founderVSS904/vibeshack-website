import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { calendar_v3 } from 'googleapis'
import {
  acquireBookingHolds, releaseBookingHolds, assertCartSlotsAvailable, getAvailabilityForDate,
  getAddOnAvailabilityForSlots, addBookingEvents,
  type BookingCalendarDependencies, type CalendarConfig,
} from '../lib/booking/calendar'
import { addOnAvailabilityState, addOnRequestSlots, limitedAddOnIds } from '../lib/booking/add-on-inventory'
import { buildCanonicalBookingCart } from '../lib/booking/checkout-pricing'
import { getStudioSetups } from '../lib/booking/studio-setups'
import { addMinutes, getTimeSlotsForDay, zonedDateTimeToUtc } from '../lib/booking/time'

const date = '2099-09-25'
const iso = (hour: number, minute = 0) => zonedDateTimeToUtc(date, hour, minute).toISOString()
const expiry = () => new Date(Date.now() + 60_000)
function cart(studioId = 'canvas-rental', hour = 15, count = 4, addOnIds = ['teleprompter']) {
  return buildCanonicalBookingCart([{
    studioId, date, setupId: getStudioSetups(studioId)[0]?.id, addOnIds,
    slots: Array.from({ length: count }, (_, i) => addMinutes(new Date(iso(hour)), i * 30).toISOString()),
  }])
}
function reserved(): calendar_v3.Schema$Event {
  return {
    id: 'fixture-reserved', status: 'confirmed', start: { dateTime: iso(15) }, end: { dateTime: iso(17) },
    extendedProperties: { private: { source: 'vibeshack-website', studioId: 'the-executive', bookingRef: 'paid-ref', addOnIds: 'teleprompter' } },
  }
}

// Isolated, ETag-aware provider fixture. Never connects to Google or Stripe.
function memoryCalendar(initial: calendar_v3.Schema$Event[] = []) {
  const stored = new Map(initial.map((event) => [event.id!, structuredClone(event)]))
  let revision = 0
  const events = {
    async get({ eventId }: { eventId: string }) {
      if (!stored.has(eventId)) throw Object.assign(new Error('Fixture missing'), { code: 404 })
      return { data: structuredClone(stored.get(eventId)!) }
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
    async list(request: { calendarId?: string; pageToken?: string; timeMin?: string; timeMax?: string; privateExtendedProperty?: string[] }): Promise<{ data: calendar_v3.Schema$Events }> {
      return { data: { items: structuredClone([...stored.values()].filter((event) => {
        const start = Date.parse(event.start?.dateTime || event.start?.date || '')
        const end = Date.parse(event.end?.dateTime || event.end?.date || '')
        return (!request.timeMin || end > Date.parse(request.timeMin))
          && (!request.timeMax || start < Date.parse(request.timeMax))
          && (request.privateExtendedProperty || []).every((value) => {
            const [key, expected] = value.split('=')
            return event.extendedProperties?.private?.[key] === expected
          })
      })) } }
    },
  }
  const dependencies: BookingCalendarDependencies = {
    getConfig: async () => ({ calendarId: 'fixture', isStudioSpecificCalendar: false,
      client: { events, freebusy: { query: async () => ({ data: { calendars: {} } }) } } as unknown as CalendarConfig['client'] }),
    calendarIds: () => ['fixture'],
  }
  const available = (hour = 15, count = 4, excludedRef?: string) =>
    getAddOnAvailabilityForSlots(date, cart('canvas-rental', hour, count)[0].slots, excludedRef, dependencies)
  return { stored, events, dependencies, available }
}

test('one teleprompter is global across independent rooms, without blocking room-only bookings', async () => {
  const fixture = memoryCalendar([reserved()])
  const room = await getAvailabilityForDate(date, 'canvas-rental', undefined, false, fixture.dependencies)
  assert.equal(room.slots.find(({ time }) => time === iso(15))?.available, true)
  assert.deepEqual((await fixture.available()).availability, { teleprompter: false })
  const conflict = await assertCartSlotsAvailable(cart(), undefined, fixture.dependencies)
  assert.equal(conflict.status, 409)
  assert.deepEqual('unavailableAddOnIds' in conflict && conflict.unavailableAddOnIds, ['teleprompter'])
  assert.equal((await assertCartSlotsAvailable(cart('canvas-rental', 15, 4, []), undefined, fixture.dependencies)).ok, true)
  assert.equal((await assertCartSlotsAvailable(cart('canvas-rental', 15, 4, ['live-switching', 'remote-podcast']), undefined, fixture.dependencies)).ok, true)
})

test('equipment uses half-open paid times, not the separate room turnaround', async () => {
  const fixture = memoryCalendar([reserved()])
  for (const [hour, count, expected] of [[13, 4, true], [14, 3, false], [16, 4, false], [17, 2, true]]) {
    assert.equal((await fixture.available(Number(hour), Number(count))).availability.teleprompter, expected)
  }
  assert.equal((await assertCartSlotsAvailable(cart('canvas-rental', 17, 2), undefined, fixture.dependencies)).ok, true)
  assert.equal((await fixture.available(15, 4, 'paid-ref')).availability.teleprompter, true)
})

test('simultaneous checkouts in different rooms have only one winner and roll back the losing holds', async () => {
  for (const reverse of [false, true]) {
    const fixture = memoryCalendar()
    const carts = [cart('canvas-rental'), cart('the-executive')]
    if (reverse) carts.reverse()
    const results = await Promise.all(carts.map((items, i) => acquireBookingHolds(items, `race-${i}`, expiry(), false, fixture.dependencies)))
    assert.equal(results.filter(({ ok }) => ok).length, 1)
    const winner = results.findIndex(({ ok }) => ok)
    const loser = 1 - winner
    assert.equal(results[loser].status, 409)
    assert.deepEqual('unavailableAddOnIds' in results[loser] && results[loser].unavailableAddOnIds, ['teleprompter'])
    for (const event of fixture.stored.values()) {
      const ledger = JSON.parse(event.description || '{}')
      assert.equal(ledger.holds?.[`race-${loser}`], undefined)
    }
    assert.equal((await fixture.available()).availability.teleprompter, false)
    assert.equal((await fixture.available(15, 4, `race-${winner}`)).availability.teleprompter, true)
    await releaseBookingHolds(carts[winner], `race-${winner}`, fixture.dependencies)
    assert.equal((await fixture.available()).availability.teleprompter, true)
    assert.equal((await acquireBookingHolds(carts[loser], 'retry', expiry(), false, fixture.dependencies)).ok, true)
  }
})

test('expired holds free equipment, visible holds describe add-ons, and successful fulfillment preserves reservations', async () => {
  const fixture = memoryCalendar()
  await acquireBookingHolds(cart(), 'expired', new Date(Date.now() - 1000), true, fixture.dependencies)
  assert.equal((await fixture.available()).availability.teleprompter, true)
  await acquireBookingHolds(cart(), 'current', expiry(), true, fixture.dependencies)
  const busy = [...fixture.stored.values()].find((event) => event.extendedProperties?.private?.bookingRef === 'current')!
  assert.equal(busy.extendedProperties?.private?.addOnIds, 'teleprompter')
  assert.equal(busy.end?.dateTime, iso(17))
  assert.equal((await fixture.available(17, 2)).availability.teleprompter, true)
  await addBookingEvents(cart(), { name: 'Fixture', email: 'guest@example.invalid', phone: '' }, [], null, 'current', 'fixture-stripe', fixture.dependencies)
  await releaseBookingHolds(cart(), 'current', fixture.dependencies)
  assert.equal((await fixture.available()).availability.teleprompter, false)
})

test('new hold with no teleprompter does not lock it, while a legacy opaque hold conservatively does', async () => {
  const fixture = memoryCalendar()
  await acquireBookingHolds(cart('green-screen', 15, 4, ['live-switching']), 'unlimited', expiry(), true, fixture.dependencies)
  assert.equal((await fixture.available()).availability.teleprompter, true)
  const busy = [...fixture.stored.values()].find((event) => event.extendedProperties?.private?.bookingRef === 'unlimited')!
  delete busy.extendedProperties!.private!.addOnIds
  assert.equal((await fixture.available()).availability.teleprompter, false)
  assert.equal((await fixture.available(15, 4, 'unlimited')).availability.teleprompter, true)
  busy.extendedProperties!.private!.expiresAt = new Date(Date.now() - 1000).toISOString()
  assert.equal((await fixture.available()).availability.teleprompter, true)
})

test('moving or cancelling a calendar booking changes inventory using its actual event time', async () => {
  const fixture = memoryCalendar([reserved()])
  const event = fixture.stored.get('fixture-reserved')!
  event.start = { dateTime: iso(18) }; event.end = { dateTime: iso(20) }
  assert.equal((await fixture.available()).availability.teleprompter, true)
  assert.equal((await fixture.available(18)).availability.teleprompter, false)
  event.status = 'cancelled'
  assert.equal((await fixture.available(18)).availability.teleprompter, true)
  event.status = 'confirmed'; event.transparency = 'transparent'
  assert.equal((await fixture.available(18)).availability.teleprompter, true)
})

test('historical descriptions and named all-day equipment reservations count, but tours and ordinary studio events do not', async () => {
  for (const mode of ['description', 'summary', 'all-day']) {
    const event = reserved()
    delete event.extendedProperties!.private!.addOnIds
    if (mode === 'description') event.description = 'Add-on: Teleprompter: $50.00/hr, $100.00 for the session'
    else event.summary = 'Teleprompter reservation'
    if (mode === 'all-day') { event.start = { date }; event.end = { date: '2099-09-26' } }
    assert.equal((await memoryCalendar([event]).available()).availability.teleprompter, false)
  }
  const event = reserved()
  delete event.extendedProperties!.private!.addOnIds
  assert.equal((await memoryCalendar([event]).available()).availability.teleprompter, true)
  event.extendedProperties!.private!.source = 'vibeshack-tour-booking'
  event.extendedProperties!.private!.addOnIds = 'teleprompter'
  assert.equal((await memoryCalendar([event]).available()).availability.teleprompter, true)
})

test('global inventory reads every configured calendar and every page without returning event details', async () => {
  const fixture = memoryCalendar()
  fixture.dependencies.calendarIds = () => ['fixture', 'second-calendar']
  const requests: string[] = []
  fixture.events.list = async ({ calendarId, pageToken }) => {
    requests.push(`${calendarId}|${pageToken || ''}`)
    if (calendarId === 'second-calendar') return { data: pageToken ? { items: [reserved()] } : { items: [], nextPageToken: 'page-two' } }
    return { data: { items: [] } }
  }
  const result = await fixture.available()
  assert.deepEqual(result, { verified: true, availability: { teleprompter: false } })
  assert.deepEqual(requests, ['fixture|', 'second-calendar|', 'second-calendar|page-two'])
})

test('provider errors fail closed and no selected limited equipment means no global inventory query', async () => {
  const fixture = memoryCalendar()
  fixture.events.list = async () => { throw new Error('Private provider fixture failure') }
  const result = await fixture.available()
  assert.equal(result.verified, false)
  assert.equal(result.availability.teleprompter, false)
  assert.doesNotMatch(JSON.stringify(result), /Private provider/)
  fixture.dependencies.getConfig = async () => null
  assert.equal((await fixture.available()).verified, false)
  assert.deepEqual(limitedAddOnIds(cart('canvas-rental', 15, 4, ['live-switching', 'remote-podcast'])[0].addOns), [])
})

test('cart cannot reserve one unit twice across rooms but can reuse it exactly at the end', async () => {
  const fixture = memoryCalendar()
  const conflict = await assertCartSlotsAvailable([...cart(), ...cart('the-executive')], undefined, fixture.dependencies)
  assert.equal(conflict.status, 409)
  assert.deepEqual('unavailableAddOnIds' in conflict && conflict.unavailableAddOnIds, ['teleprompter'])
  assert.equal((await assertCartSlotsAvailable([...cart(), ...cart('the-executive', 17)], undefined, fixture.dependencies)).ok, true)
})

test('query validation rejects ambiguous requests and handles real elapsed slots through DST', () => {
  assert.equal(addOnRequestSlots(date, iso(15), 4)?.length, 4)
  for (const count of [0, 1, 2.5, 17, NaN]) assert.equal(addOnRequestSlots(date, iso(15), count), null)
  assert.equal(addOnRequestSlots(date, iso(15, 1), 4), null)
  assert.equal(addOnRequestSlots('invalid', iso(15), 4), null)
  assert.equal(addOnRequestSlots(date, iso(23, 30), 2), null)
  for (const day of ['2026-03-08', '2026-11-01']) {
    const daySlots = getTimeSlotsForDay(day)
    const slots = addOnRequestSlots(day, daySlots[2].start.toISOString(), 4)!
    assert.equal(Date.parse(slots[3]) - Date.parse(slots[0]), 90 * 60_000)
  }
})

test('stale or missing client answers cannot enable limited add-ons; other add-ons stay usable', () => {
  assert.equal(addOnAvailabilityState('teleprompter', false, true, { teleprompter: true }), 'checking')
  assert.equal(addOnAvailabilityState('teleprompter', true, false, { teleprompter: true }), 'unverified')
  assert.equal(addOnAvailabilityState('teleprompter', true, true, {}), 'unavailable')
  assert.equal(addOnAvailabilityState('teleprompter', true, true, { teleprompter: true }), 'available')
  for (const id of ['live-switching', 'remote-podcast']) assert.equal(addOnAvailabilityState(id, false, false, {}), 'available')
})

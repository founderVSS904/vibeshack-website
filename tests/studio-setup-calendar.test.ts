import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { calendar_v3 } from 'googleapis'
import {
  addBookingEvents, listBookingEventsForReminderWindow, markBookingReminderSent,
  type BookingCalendarDependencies, type BookingCartItem, type CalendarConfig,
} from '../lib/booking/calendar'
import { buildCanonicalBookingCart } from '../lib/booking/checkout-pricing'
import { WING_SETUPS } from '../lib/booking/studio-setups'
import { primaryStudioResourceGroup, studioResourceGroups } from '../lib/booking/resources'
import { getTimeSlotsForDay } from '../lib/booking/time'

// The real functions run against an injected in-memory calendar. This fixture
// cannot read credentials or create a real event, email, or network request.
function memoryCalendar() {
  const stored = new Map<string, calendar_v3.Schema$Event>()
  let inserts = 0
  const events = {
    async list(request: { privateExtendedProperty?: string[]; timeMin?: string; timeMax?: string }) {
      const items = [...stored.values()].filter((event) => {
        const matchesProperties = (request.privateExtendedProperty || []).every((filter) => {
          const separator = filter.indexOf('=')
          return event.extendedProperties?.private?.[filter.slice(0, separator)] === filter.slice(separator + 1)
        })
        const start = Date.parse(event.start?.dateTime || '')
        return matchesProperties
          && (!request.timeMin || start >= Date.parse(request.timeMin))
          && (!request.timeMax || start < Date.parse(request.timeMax))
      })
      return { data: { items: structuredClone(items) } }
    },
    async get(request: { eventId: string }) {
      const event = stored.get(request.eventId)
      if (!event) throw Object.assign(new Error('Fixture event not found'), { code: 404 })
      return { data: structuredClone(event) }
    },
    async insert(request: { requestBody: calendar_v3.Schema$Event }) {
      const event = structuredClone(request.requestBody)
      assert.ok(event.id)
      if (stored.has(event.id)) throw Object.assign(new Error('Fixture duplicate'), { code: 409 })
      event.status = 'confirmed'
      stored.set(event.id, event)
      inserts++
      return { data: structuredClone(event) }
    },
    async patch(request: { eventId: string; requestBody: calendar_v3.Schema$Event }) {
      const event = stored.get(request.eventId)
      assert.ok(event)
      Object.assign(event, structuredClone(request.requestBody))
      return { data: structuredClone(event) }
    },
  }
  const dependencies: BookingCalendarDependencies = {
    getConfig: async () => ({
      calendarId: 'fixture-calendar',
      isStudioSpecificCalendar: false,
      client: { events } as unknown as CalendarConfig['client'],
    }),
    calendarIds: () => ['fixture-calendar'],
  }
  return { stored, dependencies, insertedCount: () => inserts }
}

test('real Calendar insertion and reminder functions round-trip each setup without changing resources or idempotency', async () => {
  const fixture = memoryCalendar()
  const date = '2026-09-12'
  const daySlots = getTimeSlotsForDay(date).map(({ start }) => start.toISOString())
  const cart: BookingCartItem[] = WING_SETUPS.map((setup, index) => buildCanonicalBookingCart([{
    studioId: 'the-wing', date, slots: daySlots.slice(16 + index * 2, 18 + index * 2), setupId: setup.id,
  }])[0])
  cart.push({ ...cart[0], slots: daySlots.slice(24, 26), setupId: undefined })
  cart.push(buildCanonicalBookingCart([{ studioId: 'canvas-rental', date, slots: daySlots.slice(26, 28) }])[0])
  const customer = { name: 'Example Guest', email: 'guest@example.invalid', phone: '' }
  const insert = () => addBookingEvents(cart, customer, [], null, 'fixture-setup-booking', 'evt_fixture', fixture.dependencies)

  await insert()
  assert.equal(fixture.insertedCount(), 6)
  for (const [index, event] of [...fixture.stored.values()].entries()) {
    const item = cart[index]
    const privateProperties = event.extendedProperties?.private || {}
    assert.equal(privateProperties.setupId, item.setupId || '')
    assert.equal(privateProperties.resourceGroup, primaryStudioResourceGroup(item.studioId))
    assert.equal(privateProperties.resourceGroups, studioResourceGroups(item.studioId).join(','))
    assert.equal(event.start?.dateTime, item.slots[0])
    if (index < 4) assert.ok(event.description?.includes(`Setup: ${WING_SETUPS[index].label}`))
    if (index === 4) assert.match(event.description || '', /Setup not recorded/)
    if (index === 5) assert.doesNotMatch(event.description || '', /chair|Setup:/)
  }

  await insert()
  assert.equal(fixture.insertedCount(), 6)
  const originalEvents = structuredClone([...fixture.stored.values()])
  await addBookingEvents(cart.map((item) => item.studioId === 'the-wing' ? { ...item, setupId: 'one-black-chair' } : item), customer, [], null, 'fixture-setup-booking', 'evt_fixture_retry', fixture.dependencies)
  assert.equal(fixture.insertedCount(), 6)
  assert.deepEqual([...fixture.stored.values()], originalEvents)

  const now = new Date('2026-09-11T00:00:00.000Z')
  const reminders = await listBookingEventsForReminderWindow(now, 0, 72, fixture.dependencies)
  assert.ok(reminders)
  assert.equal(reminders.length, 6)
  assert.deepEqual(reminders.map(({ setupId }) => setupId), [...WING_SETUPS.map(({ id }) => id), undefined, undefined])
  const sentAt = '2026-09-11T18:00:00.000Z'
  await markBookingReminderSent(reminders, sentAt, fixture.dependencies)
  for (const reminder of reminders) {
    const privateProperties = fixture.stored.get(reminder.eventId)?.extendedProperties?.private
    assert.deepEqual(privateProperties, { ...reminder.privateProperties, reminder24hSentAt: sentAt })
  }
  assert.deepEqual(await listBookingEventsForReminderWindow(now, 0, 72, fixture.dependencies), [])
})

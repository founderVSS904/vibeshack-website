import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { calendar_v3 } from 'googleapis'
import {
  addBookingEvents, listBookingEventsForReminderWindow, markBookingReminderSent,
  type BookingCalendarDependencies, type BookingCartItem, type CalendarConfig,
} from '../lib/booking/calendar'
import { buildCanonicalBookingCart } from '../lib/booking/checkout-pricing'
import { WING_SETUPS, EXECUTIVE_SETUPS, getStudioSetup, getStudioSetups } from '../lib/booking/studio-setups'
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
  const variants = [
    ...WING_SETUPS.map((setup) => ({ studioId: 'the-wing', setup })),
    ...EXECUTIVE_SETUPS.map((setup) => ({ studioId: 'the-executive', setup })),
  ]
  const cart: BookingCartItem[] = variants.map(({ studioId, setup }, index) => buildCanonicalBookingCart([{
    studioId, date, slots: daySlots.slice(16 + index * 2, 18 + index * 2), setupId: setup.id,
  }])[0])
  const nextSlots = () => daySlots.slice(16 + cart.length * 2, 18 + cart.length * 2)
  cart.push({ ...cart[0], slots: nextSlots(), setupId: undefined })
  cart.push({ ...cart[4], slots: nextSlots(), setupId: undefined })
  cart.push(buildCanonicalBookingCart([{ studioId: 'canvas-rental', date, slots: nextSlots() }])[0])
  const customer = { name: 'Example Guest', email: 'guest@example.invalid', phone: '' }
  const insert = () => addBookingEvents(cart, customer, [], null, 'fixture-setup-booking', 'evt_fixture', fixture.dependencies)

  await insert()
  assert.equal(fixture.insertedCount(), 10)
  for (const [index, event] of [...fixture.stored.values()].entries()) {
    const item = cart[index]
    const privateProperties = event.extendedProperties?.private || {}
    assert.equal(privateProperties.setupId, item.setupId || '')
    assert.equal(privateProperties.resourceGroup, primaryStudioResourceGroup(item.studioId))
    assert.equal(privateProperties.resourceGroups, studioResourceGroups(item.studioId).join(','))
    assert.equal(event.start?.dateTime, item.slots[0])
    const setup = getStudioSetup(item.studioId, item.setupId)
    if (setup) assert.ok(event.description?.includes(`Setup: ${setup.label}`))
    else if (getStudioSetups(item.studioId).length) assert.match(event.description || '', /Setup not recorded/)
    else assert.doesNotMatch(event.description || '', /chair|Setup:/)
  }

  await insert()
  assert.equal(fixture.insertedCount(), 10)
  const originalEvents = structuredClone([...fixture.stored.values()])
  await addBookingEvents(cart.map((item) => ({ ...item, setupId: getStudioSetups(item.studioId)[0]?.id })), customer, [], null, 'fixture-setup-booking', 'evt_fixture_retry', fixture.dependencies)
  assert.equal(fixture.insertedCount(), 10)
  assert.deepEqual([...fixture.stored.values()], originalEvents)

  const now = new Date('2026-09-11T00:00:00.000Z')
  const reminders = await listBookingEventsForReminderWindow(now, 0, 72, fixture.dependencies)
  assert.ok(reminders)
  assert.equal(reminders.length, 10)
  assert.deepEqual(reminders.map(({ setupId }) => setupId), cart.map(({ setupId }) => setupId))
  const sentAt = '2026-09-11T18:00:00.000Z'
  await markBookingReminderSent(reminders, sentAt, fixture.dependencies)
  for (const reminder of reminders) {
    const privateProperties = fixture.stored.get(reminder.eventId)?.extendedProperties?.private
    assert.deepEqual(privateProperties, { ...reminder.privateProperties, reminder24hSentAt: sentAt })
  }
  assert.deepEqual(await listBookingEventsForReminderWindow(now, 0, 72, fixture.dependencies), [])
})

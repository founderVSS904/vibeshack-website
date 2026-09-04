import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { calendar_v3 } from 'googleapis'
import { acquireBookingHolds, releaseBookingHolds, addBookingEvents, bookingDeliveryStore, eventBlocksStudio, type BookingCalendarDependencies, type CalendarConfig } from '../lib/booking/calendar'
import { buildCanonicalBookingCart } from '../lib/booking/checkout-pricing'
import { buildBookingCartMetadata, withBookingAttributionMetadata } from '../lib/booking/checkout-metadata'
import { buildTeamEmailMetadata, parseTeamEmailMetadata } from '../lib/booking/team-email-metadata'
import { deliverMessage, DELIVERY_LEASE_MS } from '../lib/booking/delivery'
import { getTimeSlotsForDay } from '../lib/booking/time'
import { buildReferralInfo, REFERRAL_PARTNERS } from '../lib/booking/referrals'
import { reserveTour, tourReservationCart } from '../lib/booking/tour-reservation'
import { studioResourceGroups } from '../lib/booking/resources'

function memoryCalendar() {
  const stored = new Map<string, calendar_v3.Schema$Event>()
  let revision = 0
  const key = (request: { calendarId?: string; eventId?: string }) => `${request.calendarId}|${request.eventId}`
  const events = {
    async get(request: { calendarId?: string; eventId?: string }) {
      const item = stored.get(key(request))
      if (!item) throw Object.assign(new Error('Not found'), { code: 404 })
      return { data: structuredClone(item) }
    },
    async insert(request: { calendarId?: string; requestBody: calendar_v3.Schema$Event }) {
      const id = key({ calendarId: request.calendarId, eventId: request.requestBody.id || '' })
      if (stored.has(id)) throw Object.assign(new Error('Already exists'), { code: 409 })
      const item = { ...structuredClone(request.requestBody), etag: String(++revision), status: 'confirmed' }
      stored.set(id, item)
      return { data: structuredClone(item) }
    },
    async update(request: { calendarId?: string; eventId?: string; requestBody: calendar_v3.Schema$Event }, options: { headers: Record<string, string> }) {
      const old = stored.get(key(request))
      if (!old) throw Object.assign(new Error('Not found'), { code: 404 })
      if (old.etag !== options.headers['If-Match']) throw Object.assign(new Error('Changed'), { code: 412 })
      const item = { ...structuredClone(request.requestBody), etag: String(++revision), status: 'confirmed' }
      stored.set(key(request), item)
      return { data: structuredClone(item) }
    },
    async list(request: { calendarId?: string; privateExtendedProperty?: string[] }) {
      return { data: { items: [...stored.entries()].filter(([id, event]) => id.startsWith(`${request.calendarId}|`)
        && (request.privateExtendedProperty || []).every((value) => {
          const [name, expected] = value.split('=')
          return event.extendedProperties?.private?.[name] === expected
        })).map(([, event]) => structuredClone(event)) } }
    },
    async delete(request: { calendarId?: string; eventId?: string }) {
      if (!stored.delete(key(request))) throw Object.assign(new Error('Not found'), { code: 404 })
      return { data: {} }
    },
  }
  const dependencies: BookingCalendarDependencies = {
    getConfig: async () => ({ calendarId: 'fixture', isStudioSpecificCalendar: false, client: { events } as unknown as CalendarConfig['client'] }),
    calendarIds: () => ['fixture'],
  }
  return { stored, dependencies }
}

const date = '2026-09-12'
const slots = getTimeSlotsForDay(date).slice(16, 18).map(({ start }) => start.toISOString())
const cart = buildCanonicalBookingCart([{ studioId: 'canvas-rental', date, slots }])

test('ten full-length team addresses round-trip across 500 character metadata values', () => {
  const emails = Array.from({ length: 10 }, (_, index) => `${index}${'a'.repeat(63)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`)
  assert.equal(emails[0].length, 254)
  const metadata = buildTeamEmailMetadata(emails)
  assert.equal(metadata.teamEmailChunks, '6')
  assert.ok(Object.values(metadata).every((value) => value.length <= 500))
  assert.deepEqual(parseTeamEmailMetadata(metadata), emails)
  assert.deepEqual(parseTeamEmailMetadata({ teamEmails: JSON.stringify(['legacy@example.invalid']) }), ['legacy@example.invalid'])
  assert.throws(() => parseTeamEmailMetadata({ ...metadata, teamEmail_2: '' }), /Incomplete/)
  assert.throws(() => parseTeamEmailMetadata({ ...metadata, teamEmailChunks: '7' }), /Invalid/)
  // Thirteen current fixed checkout fields plus 20 sessions leave seven keys
  // for complete team metadata and ten lifecycle keys within Stripe's limit.
  const required = { ...Object.fromEntries(Array.from({ length: 13 }, (_, index) => [`fixed_${index}`, 'fixture'])), ...buildBookingCartMetadata(Array.from({ length: 20 }, () => cart[0])), ...metadata }
  assert.equal(Object.keys(withBookingAttributionMetadata(required, { trackingSource: 'fixture' })).length, 40)
})

test('referrals carry attribution only and cannot emit historical payout fields to calendar guests', async () => {
  for (const partner of Object.values(REFERRAL_PARTNERS)) assert.deepEqual(Object.keys(partner).sort(), ['displayName', 'id'])
  const referral = buildReferralInfo(Object.keys(REFERRAL_PARTNERS)[0])
  assert.ok(referral)
  assert.deepEqual(Object.keys(referral).sort(), ['partnerName', 'source'])
  const fixture = memoryCalendar()
  await addBookingEvents(cart, { name: 'Fixture Guest', email: 'guest@example.invalid', phone: '' }, ['team@example.invalid'], {
    ...referral, commissionRate: 0.123, commissionCents: 123,
  } as typeof referral, 'fixture-referral', 'evt_fixture', fixture.dependencies)
  const event = [...fixture.stored.values()][0]
  assert.equal(event.attendees?.length, 2)
  assert.doesNotMatch(event.description || '', /commission|payout|0\.123/i)
})

test('concurrent tour visitors contend on actual calendar resource ledgers', async () => {
  const fixture = memoryCalendar()
  const inserted = new Set<string>()
  const base = { name: 'Fixture', date, slot: slots[0], email: 'first@example.invalid' }
  const dependencies = {
    acquire: (items: typeof cart, ref: string, expiry: Date) => acquireBookingHolds(items, ref, expiry, false, fixture.dependencies),
    release: (items: typeof cart, ref: string) => releaseBookingHolds(items, ref, fixture.dependencies),
    availability: async () => ({ ok: true, status: 200, error: '' }),
    exists: async (tour: typeof base) => inserted.has(tour.email),
    insert: async (tour: typeof base) => { inserted.add(tour.email) },
  }
  const results = await Promise.all([reserveTour(base, dependencies), reserveTour({ ...base, email: 'second@example.invalid' }, dependencies)])
  assert.equal(results.filter((result) => result.ok).length, 1)
  assert.equal(inserted.size, 1)
})

test('tour locks conflict with paid checkout across every room resource', async () => {
  const fixture = memoryCalendar()
  const tour = { date, slot: slots[0] }
  const expiry = new Date(Date.now() + 60_000)
  const tourCart = tourReservationCart(tour)
  assert.equal((await acquireBookingHolds(tourCart, 'tour-fixture', expiry, false, fixture.dependencies)).ok, true)
  for (const item of tourCart) {
    const paid = { ...item, slots, hours: 1, price: 100 }
    assert.equal((await acquireBookingHolds([paid], `paid-${item.studioId}`, expiry, false, fixture.dependencies)).status, 409)
  }
  assert.ok(new Set(tourCart.flatMap((item) => studioResourceGroups(item.studioId))).has('podcast-production'))
  await releaseBookingHolds(tourCart, 'tour-fixture', fixture.dependencies)
  assert.equal((await acquireBookingHolds(cart, 'paid-after-release', expiry, false, fixture.dependencies)).ok, true)
})

test('mail claims are atomic, successful messages are never repeated and rejected messages retry independently', async () => {
  const fixture = memoryCalendar()
  const store = await bookingDeliveryStore('fixture-session', fixture.dependencies)
  let sent = 0
  const send = async () => { sent++ }
  const options = { identity: 'fixture-session' }
  await Promise.allSettled([deliverMessage(store, 'confirmation', send, options), deliverMessage(store, 'confirmation', send, options)])
  await deliverMessage(store, 'confirmation', send, options)
  assert.equal(sent, 1)
  let prepAttempts = 0
  await assert.rejects(deliverMessage(store, 'prep', async () => { prepAttempts++; throw Object.assign(new Error('Rejected'), { responseCode: 451 }) }, options))
  await deliverMessage(store, 'prep', async () => { prepAttempts++ }, options)
  await deliverMessage(store, 'confirmation', send, options)
  assert.equal(sent, 1)
  assert.equal(prepAttempts, 2)
  const record = (await store.read())!.record
  assert.equal(record.messages.confirmation.state, 'sent')
  assert.equal(record.messages.prep.state, 'sent')
  const event = [...fixture.stored.values()][0]
  assert.equal(event.visibility, 'private')
  assert.equal(event.transparency, 'transparent')
  assert.equal(event.attendees, undefined)
})

test('ambiguous mail outcomes and a crashed sending lease do not blindly send duplicates', async () => {
  const fixture = memoryCalendar()
  const store = await bookingDeliveryStore('fixture-uncertain', fixture.dependencies)
  const options = { identity: 'fixture-uncertain' }
  let attempts = 0
  await assert.rejects(deliverMessage(store, 'prep', async () => { attempts++; throw Object.assign(new Error('Timeout after DATA'), { code: 'ETIMEDOUT' }) }, options))
  await assert.rejects(deliverMessage(store, 'prep', async () => { attempts++ }, options), /uncertain/)
  assert.equal(attempts, 1)
  const snapshot = (await store.read())!
  snapshot.record.messages.staff = { state: 'sending', attempt: 'crashed-worker', startedAt: new Date(Date.now() - DELIVERY_LEASE_MS - 1).toISOString() }
  await store.save(snapshot, snapshot.record)
  await assert.rejects(deliverMessage(store, 'staff', async () => { attempts++ }, options), /uncertain/)
  assert.equal(attempts, 1)
})

test('a paid room hold prevents tour acquisition and remains held after partial tour rollback', async () => {
  const fixture = memoryCalendar()
  const expiry = new Date(Date.now() + 60_000)
  assert.equal((await acquireBookingHolds(cart, 'paid-first', expiry, false, fixture.dependencies)).ok, true)
  assert.equal((await acquireBookingHolds(tourReservationCart({ date, slot: slots[0] }), 'tour-second', expiry, false, fixture.dependencies)).status, 409)
  assert.equal((await acquireBookingHolds(cart, 'paid-third', expiry, false, fixture.dependencies)).status, 409)
})

test('tour rechecks availability after locking, releases rejected holds, and recovers an acknowledged-lost insert', async () => {
  const fixture = memoryCalendar()
  let inserted = false
  let checks = 0
  let releases = 0
  const tour = { name: 'Fixture', date, slot: slots[0], email: 'guest@example.invalid' }
  const dependencies = {
    acquire: (items: typeof cart, ref: string, expiry: Date) => acquireBookingHolds(items, ref, expiry, false, fixture.dependencies),
    release: async (items: typeof cart, ref: string) => { releases++; await releaseBookingHolds(items, ref, fixture.dependencies) },
    availability: async () => ({ ok: ++checks === 1, status: checks === 1 ? 200 : 409, error: checks === 1 ? '' : 'Now busy' }),
    exists: async () => inserted,
    insert: async () => { inserted = true; throw new Error('Response lost after commit') },
  }
  assert.equal((await reserveTour(tour, dependencies)).status, 409)
  assert.equal(inserted, false)
  assert.equal(releases, 1)
  const recovered = await reserveTour(tour, { ...dependencies, availability: async () => ({ ok: true, status: 200, error: '' }) })
  assert.equal(recovered.ok, true)
  assert.equal(inserted, true)
  assert.equal(releases, 2)
})

test('a failure to persist successful email delivery does not permit a second SMTP send', async () => {
  const fixture = memoryCalendar()
  const store = await bookingDeliveryStore('fixture-stamp-failure', fixture.dependencies)
  let sends = 0
  const failingStore = { ...store, save: async (...args: Parameters<typeof store.save>) => {
    if (args[1].messages.confirmation?.state === 'sent') throw new Error('Synthetic provider write failure')
    return store.save(...args)
  } }
  const options = { identity: 'fixture-stamp-failure' }
  await assert.rejects(deliverMessage(failingStore, 'confirmation', async () => { sends++ }, options))
  await assert.rejects(deliverMessage(store, 'confirmation', async () => { sends++ }, options), /busy/)
  assert.equal(sends, 1)
})

test('corrupt durable delivery records fail closed instead of treating a sent message as new', async () => {
  const fixture = memoryCalendar()
  const store = await bookingDeliveryStore('fixture-corrupt', fixture.dependencies)
  await store.create()
  const event = [...fixture.stored.values()][0]
  event.description = JSON.stringify({ version: 1, messages: { confirmation: { state: 'invalid' } } })
  let sent = false
  await assert.rejects(deliverMessage(store, 'confirmation', async () => { sent = true }, { identity: 'fixture-corrupt' }), /Invalid message/)
  assert.equal(sent, false)
})


test('a committed tour blocks all rooms even when the guest expressed interest in only one studio', () => {
  const tour = { status: 'confirmed', extendedProperties: { private: { source: 'vibeshack-tour-booking', studioId: 'the-wing' } } }
  for (const item of tourReservationCart({ date, slot: slots[0] })) {
    assert.equal(eventBlocksStudio(tour, item.studioId, new Set(['the-wing']), false), true)
  }
  assert.equal(eventBlocksStudio({ ...tour, status: 'cancelled' }, 'the-executive', new Set(), false), false)
})

test('SMTP connection and envelope timeouts remain retryable before DATA', async () => {
  const fixture = memoryCalendar()
  const store = await bookingDeliveryStore('fixture-pre-data', fixture.dependencies)
  for (const command of ['CONN', 'EHLO', 'AUTH PLAIN', 'MAIL FROM', 'RCPT TO']) {
    const key = command.replace(/ /g, '')
    let attempts = 0
    await assert.rejects(deliverMessage(store, key, async () => {
      attempts++; throw Object.assign(new Error('Timeout before DATA'), { code: 'ETIMEDOUT', command })
    }, { identity: 'fixture-pre-data' }))
    await deliverMessage(store, key, async () => { attempts++ }, { identity: 'fixture-pre-data' })
    assert.equal(attempts, 2)
  }
})

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  TELEPROMPTER,
  bookingAddOnDescription,
  bookingAddOnTotalCents,
  hasMatchingBookingAddOnTotal,
  parseBookingAddOns,
  priceBookingAddOns,
} from '../lib/booking/add-ons'
import { bookingAddOnsEmailHtml } from '../lib/booking/add-on-communication'
import { INITIAL_BOOKING_METADATA_KEY_BUDGET, buildBookingCartMetadata, hasCompleteBookingCartMetadata, parseBookingCartItems, withBookingAttributionMetadata } from '../lib/booking/checkout-metadata'
import { buildBookingCheckoutLineItems, buildCanonicalBookingCart, calculateBookingCheckoutPricing } from '../lib/booking/checkout-pricing'
import { parsePendingCheckout } from '../lib/booking/pending-checkout'
import { getTimeSlotsForDay } from '../lib/booking/time'

const date = '2026-09-12'
const slots = (count: number) => getTimeSlotsForDay(date).slice(20, 20 + count).map(({ start }) => start.toISOString())
const rawItem = (count = 3, addOnIds: unknown = [TELEPROMPTER.id]) => ({
  studioId: 'canvas-rental',
  studioName: 'Untrusted browser name',
  date,
  slots: slots(count),
  hours: -100,
  price: 0.01,
  addOnIds,
  addOns: [{ id: TELEPROMPTER.id, amountCents: 1, hourlyRateCents: 1 }],
})

describe('optional server-priced teleprompter', () => {
  test('defaults off and scales at $50 per hour, including half hours', () => {
    for (const selection of [undefined, null, []]) assert.deepEqual(priceBookingAddOns(selection, 3), [])
    assert.equal(bookingAddOnTotalCents(priceBookingAddOns([TELEPROMPTER.id], 1)), 2500)
    assert.equal(bookingAddOnTotalCents(priceBookingAddOns([TELEPROMPTER.id], 2)), 5000)
    assert.equal(bookingAddOnTotalCents(priceBookingAddOns([TELEPROMPTER.id], 3)), 7500)
    assert.equal(bookingAddOnTotalCents(priceBookingAddOns([TELEPROMPTER.id], 16)), 40000)
  })

  test('deduplicates known IDs and rejects unknown, mixed, or malformed selections', () => {
    assert.equal(priceBookingAddOns([TELEPROMPTER.id, TELEPROMPTER.id], 2).length, 1)
    const invalid = [
      'teleprompter', { id: 'teleprompter' }, ['unknown'], ['__proto__'],
      ['<script>alert(1)</script>'], ['teleprompter', 'operator'],
      [{ id: 'teleprompter', amountCents: 1 }], [null], [42],
    ]
    for (const selection of invalid) assert.throws(() => priceBookingAddOns(selection, 2), /Invalid add-on selection/)
    for (const count of [0, -1, 1.5, NaN]) assert.throws(() => priceBookingAddOns(['teleprompter'], count), /Invalid add-on duration/)
  })

  test('ignores client prices, hours, add-on amounts, and labels', () => {
    const [item] = buildCanonicalBookingCart([rawItem()])
    assert.equal(item.studioName, 'Canvas Rental')
    assert.equal(item.hours, 1.5)
    assert.equal(item.price, 150)
    assert.deepEqual(item.addOns, [{ id: 'teleprompter', name: 'Teleprompter', hourlyRateCents: 5000, amountCents: 7500 }])
    assert.equal(calculateBookingCheckoutPricing([item]).computedTotalCents, 22500)
    const [unselected] = buildCanonicalBookingCart([{ ...rawItem(), addOnIds: undefined }])
    assert.equal(bookingAddOnTotalCents(unselected.addOns), 0)
    assert.equal(unselected.price, 150)
  })

  test('rejects invalid cart IDs and noncanonical, duplicate, or partially invalid slots', () => {
    const invalid = [
      { ...rawItem(), studioId: 'unknown' },
      { ...rawItem(), addOnIds: ['operator'] },
      { ...rawItem(), slots: [slots(2)[0], 'invalid', slots(2)[1]] },
      { ...rawItem(), slots: [slots(2)[0], slots(2)[0]] },
      { ...rawItem(), date: '2026-09-13' },
      { ...rawItem(), slots: ['2026-09-12T17:01:00.000Z', '2026-09-12T17:31:00.000Z'] },
    ]
    for (const item of invalid) assert.throws(() => buildCanonicalBookingCart([item]))
    assert.throws(() => buildCanonicalBookingCart(Array.from({ length: 21 }, () => rawItem())))
  })

  test('applies weekly savings only to studio time and keeps Stripe item amounts exact', () => {
    const cart = buildCanonicalBookingCart([rawItem()])
    const pricing = calculateBookingCheckoutPricing(cart, 'weekly')
    assert.deepEqual(pricing, {
      baseSessionTotalCents: 15000,
      discountCents: 1500,
      discountedSessionAmounts: [13500],
      addOnTotalCents: 7500,
      computedTotalCents: 21000,
    })
    const lines = buildBookingCheckoutLineItems(cart, pricing, 'https://example.invalid/fixture.jpg')
    assert.deepEqual(lines.map((line) => line.price_data?.unit_amount), [13500, 7500])
    assert.match(lines[1].price_data?.product_data?.description || '', /\$50\.00\/hr for 1 hour 30 minutes/)
    assert.match(lines[1].price_data?.product_data?.description || '', /Recurring discounts do not apply/)
    assert.equal(lines.reduce((total, line) => total + (line.price_data?.unit_amount || 0) * (line.quantity || 0), 0), pricing.computedTotalCents)
  })

  test('prices multiple cart items independently without discounting their add-ons', () => {
    const cart = buildCanonicalBookingCart([rawItem(), { ...rawItem(4), studioId: 'the-executive' }])
    const pricing = calculateBookingCheckoutPricing(cart, 'weekly')
    assert.equal(pricing.baseSessionTotalCents, 75000)
    assert.equal(pricing.discountCents, 7500)
    assert.equal(pricing.addOnTotalCents, 17500)
    assert.equal(pricing.computedTotalCents, 85000)
    const lines = buildBookingCheckoutLineItems(cart, pricing, 'https://example.invalid/fixture.jpg')
    assert.deepEqual(lines.map((line) => line.price_data?.unit_amount), [13500, 54000, 7500, 10000])
    assert.equal(calculateBookingCheckoutPricing(cart, 'not-a-discount').discountCents, 0)
  })
})

describe('checkout add-on metadata and fulfillment', () => {
  test('reserves lifecycle metadata capacity and Stripe value bounds for20 maximum-duration cart items', () => {
    const cart = buildCanonicalBookingCart(Array.from({ length: 20 }, () => rawItem(16)))
    const required = {
      ...Object.fromEntries(Array.from({ length: 17 }, (_, index) => ['required_' + index, 'fixture'])),
      ...buildBookingCartMetadata(cart),
    }
    const attribution = {
      trackingSource: 'fixture-source', trackingMedium: 'fixture-medium', trackingCampaign: 'fixture-campaign',
      trackingClickId: 'fixture-click', trackingContent: 'fixture-content', trackingTerm: 'fixture-term',
      trackingLandingPath: '/fixture/', trackingReferrer: 'https://example.invalid/', trackingCapturedAt: 'fixture-time',
    }
    const metadata = withBookingAttributionMetadata(required, attribution)
    assert.equal(Object.keys(metadata).length, INITIAL_BOOKING_METADATA_KEY_BUDGET)
    for (const [key, value] of Object.entries(metadata)) {
      assert.ok(key.length <= 40)
      assert.ok(value.length <= 500)
    }
    for (const [key, value] of Object.entries(required)) assert.equal(metadata[key], value)
    assert.equal(metadata.trackingSource, attribution.trackingSource)
    assert.equal(metadata.trackingMedium, attribution.trackingMedium)
    assert.equal(metadata.trackingCampaign, attribution.trackingCampaign)
    assert.equal(Object.keys(metadata).filter((key) => key.startsWith('cart_')).length, 20)
    assert.ok(Object.keys(metadata).length + 10 <= 50)
    assert.deepEqual(withBookingAttributionMetadata({ bookingRef: 'fixture' }, attribution), { bookingRef: 'fixture', ...attribution })
    assert.throws(() => withBookingAttributionMetadata(Object.fromEntries(Array.from({ length: 41 }, (_, i) => ['key_' + i, 'fixture'])), {}), /capacity/)
  })

  test('round-trips multiple items and respects Stripe metadata value limits', () => {
    const cart = buildCanonicalBookingCart([rawItem(16), { ...rawItem(3), studioId: 'the-executive' }])
    const metadata = { bookingHoldVersion: '1', totalSessions: '2', ...buildBookingCartMetadata(cart), addOnTotalCents: '47500' }
    for (const value of Object.values(metadata)) assert.ok(value.length <= 500)
    const parsed = parseBookingCartItems(metadata)
    assert.equal(hasCompleteBookingCartMetadata(metadata, parsed), true)
    assert.deepEqual(parsed.map((item) => item.addOns), cart.map((item) => item.addOns))
    assert.equal(hasMatchingBookingAddOnTotal(metadata, parsed), true)
    assert.equal(hasMatchingBookingAddOnTotal({ ...metadata, addOnTotalCents: '0' }, parsed), false)
    assert.equal(hasMatchingBookingAddOnTotal({ ...metadata, addOnTotalCents: '47500junk' }, parsed), false)
  })

  test('keeps managed checkouts without add-ons and legacy hourly metadata readable', () => {
    const cart = buildCanonicalBookingCart([rawItem(2, [])])
    const metadata = { bookingHoldVersion: '1', totalSessions: '1', ...buildBookingCartMetadata(cart) }
    const parsed = parseBookingCartItems(metadata)
    assert.equal(hasCompleteBookingCartMetadata(metadata, parsed), true)
    assert.deepEqual(parsed[0].addOns, [])
    assert.equal(hasMatchingBookingAddOnTotal(metadata, parsed), true)
    const legacy = { totalSessions: '1', cart_0: JSON.stringify({ id: 'canvas-rental', d: date, t0: slots(2)[0], off: [0, 1] }) }
    const legacyParsed = parseBookingCartItems(legacy)
    assert.equal(legacyParsed[0].slots.length, 4)
    assert.deepEqual(legacyParsed[0].addOns, [])
    assert.equal(hasCompleteBookingCartMetadata(legacy, legacyParsed), true)
    const legacyJson = { cartJson: JSON.stringify([{ studioId: 'canvas-rental', studioName: 'Canvas Rental', date, slots: [slots(2)[0]], hours: 1, price: 100 }]) }
    assert.equal(hasCompleteBookingCartMetadata(legacyJson, parseBookingCartItems(legacyJson)), true)
    const hourlySlots = slots(16).filter((_, index) => index % 2 === 0)
    const legacySchemas: Record<string, string>[] = [
      { cart_0: JSON.stringify({ id: 'canvas-rental', n: 'Canvas Rental', d: date, s: hourlySlots, h: 8, p: 800 }) },
      { cartJson: JSON.stringify([{ studioId: 'canvas-rental', studioName: 'Canvas Rental', date, slots: hourlySlots, hours: 8, price: 800 }]) },
    ]
    for (const schema of legacySchemas) {
      for (const value of Object.values(schema)) assert.ok(value.length <= 500)
      const legacyItems = parseBookingCartItems(schema)
      assert.equal(legacyItems[0].slots.length, 16)
      assert.equal(hasCompleteBookingCartMetadata(schema, legacyItems), true)
    }
  })

  test('rejects corrupt, duplicate, or unknown metadata add-ons instead of silently dropping charges', () => {
    const valid = { id: 'teleprompter', r: 5000, p: 7500 }
    for (const value of [[{ ...valid, p: 1 }], [valid, valid], [{ ...valid, id: 'operator' }], [{ ...valid, r: '5000' }], null]) {
      assert.throws(() => parseBookingAddOns(value, 3), /Invalid add-on metadata/)
      const metadata = { bookingHoldVersion: '1', totalSessions: '1', cart_0: JSON.stringify({ id: 'canvas-rental', d: date, t0: slots(3)[0], u: 30, off: [0, 1, 2], a: value }) }
      assert.equal(hasCompleteBookingCartMetadata(metadata, parseBookingCartItems(metadata)), false)
    }
    assert.equal(hasMatchingBookingAddOnTotal({ addOnTotalCents: '5000' }, [{ addOns: [] }]), false)
  })

  test('retains the server price snapshot when validating a historical checkout', () => {
    assert.equal(parseBookingAddOns([{ id: 'teleprompter', r: 4000, p: 6000 }], 3)[0].amountCents, 6000)
  })

  test('communicates equipment and correct pricing to the studio and customer, without team pricing', () => {
    const addOns = priceBookingAddOns(['teleprompter'], 3)
    assert.equal(bookingAddOnDescription(addOns[0]), 'Teleprompter: $50.00/hr, $75.00 for the session')
    assert.match(bookingAddOnsEmailHtml(addOns), /Teleprompter: \$50\.00\/hr, \$75\.00 for the session/)
    assert.match(bookingAddOnsEmailHtml(addOns, false), /Selected add-on: Teleprompter/)
    assert.doesNotMatch(bookingAddOnsEmailHtml(addOns, false), /\$/)
    assert.equal(bookingAddOnsEmailHtml([]), '')
    assert.doesNotMatch(bookingAddOnsEmailHtml([{ ...addOns[0], name: '<script>bad</script>' }]), /<script>/)
  })
})

describe('checkout draft and revision compatibility', () => {
  const draft = {
    version: 1, clientSecret: 'fixture-only-secret', publishableKey: 'fixture-only-key',
    sessionId: 'cs_test_draftFixture', managementToken: 'fixture-only-token',
    expiresAt: '2026-09-01T18:00:00.000Z', selectedId: 'canvas-rental',
    durationSlots: 3, date, startSlot: slots(3)[0],
    slots: slots(4).map((time) => ({ time, label: 'Fixture time', available: true })),
    recurring: 'weekly', name: 'Example Guest', email: 'guest@example.invalid',
    phone: '', teamEmails: [], addOnIds: ['teleprompter'],
  }

  test('restores selected add-ons and defaults legacy drafts to off', () => {
    const restored = parsePendingCheckout(JSON.stringify(draft))
    assert.deepEqual(restored?.addOnIds, ['teleprompter'])
    assert.equal(restored?.recurring, 'weekly')
    assert.equal(restored?.managementToken, draft.managementToken)
    assert.deepEqual(parsePendingCheckout(JSON.stringify({ ...draft, addOnIds: undefined }))?.addOnIds, [])
    assert.deepEqual(parsePendingCheckout(JSON.stringify({ ...draft, addOnIds: ['teleprompter', 'teleprompter'] }))?.addOnIds, ['teleprompter'])
  })

  test('reprices preserved add-on IDs for a longer revised session', () => {
    const restored = parsePendingCheckout(JSON.stringify(draft))!
    const revised = buildCanonicalBookingCart([{ studioId: restored.selectedId, date: restored.date, slots: slots(4), addOnIds: restored.addOnIds, price: 0.01 }])
    const pricing = calculateBookingCheckoutPricing(revised, restored.recurring)
    assert.equal(pricing.addOnTotalCents, 10000)
    assert.equal(pricing.discountCents, 2000)
    assert.equal(pricing.computedTotalCents, 28000)
    const removed = buildCanonicalBookingCart([{ ...rawItem(4), addOnIds: [] }])
    assert.equal(calculateBookingCheckoutPricing(removed, restored.recurring).computedTotalCents, 18000)
  })

  test('rejects corrupt drafts and unknown add-on selections', () => {
    for (const raw of [null, 'invalid JSON', '{}', JSON.stringify({ ...draft, addOnIds: ['unknown'] }), JSON.stringify({ ...draft, durationSlots: 0 }), JSON.stringify({ ...draft, durationSlots: 2.5 })]) {
      assert.equal(parsePendingCheckout(raw), null)
    }
  })
})

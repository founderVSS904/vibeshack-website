import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import sharp from 'sharp'
import type Stripe from 'stripe'
import StudioSetupPicker from '../components/StudioSetupPicker'
import WingSetupSelector from '../app/the-wing/WingSetupSelector'
import { WING_SETUPS, BookingSetupSelectionError, bookingSetupDescription, getStudioSetup, getStudioSetups, validateBookingSetup } from '../lib/booking/studio-setups'
import { buildBookingCheckoutLineItems, buildCanonicalBookingCart, calculateBookingCheckoutPricing } from '../lib/booking/checkout-pricing'
import { buildBookingCartMetadata, hasCompleteBookingCartMetadata, parseBookingCartItems, withBookingAttributionMetadata } from '../lib/booking/checkout-metadata'
import { parsePendingCheckout, pendingCheckoutMatchesSelection } from '../lib/booking/pending-checkout'
import { bookingSetupCalendarFields, bookingSetupEmailHtml } from '../lib/booking/setup-communication'
import { getBookingConfirmation } from '../lib/booking/confirmation'
import { getTimeSlotsForDay } from '../lib/booking/time'
import { getContactInquiry } from '../lib/contact/inquiry'

Object.assign(globalThis, { React })

const date = '2026-09-12'
const slots = (count = 2) => getTimeSlotsForDay(date).slice(20, 20 + count).map(({ start }) => start.toISOString())
const rawItem = (setupId: unknown, count = 2) => ({
  studioId: 'the-wing', date, slots: slots(count), setupId,
  studioName: 'Untrusted name', setupLabel: 'Untrusted setup label',
  price: 0.01, hours: 999, addOnIds: ['teleprompter'],
})

describe('explicit, non-priced Wing setup selection', () => {
  test('offers exactly the four supplied configurations, only for The Wing', () => {
    assert.deepEqual(WING_SETUPS.map(({ id }) => id), ['one-black-chair', 'one-brown-chair', 'two-brown-chairs', 'two-black-chairs'])
    assert.deepEqual(WING_SETUPS.map(({ chairs }) => chairs), [1, 1, 2, 2])
    assert.equal(new Set(WING_SETUPS.map(({ image }) => image)).size, 4)
    assert.deepEqual(getStudioSetups('encore'), [])
    assert.deepEqual(getStudioSetups('__proto__'), [])
  })

  test('requires an exact scalar ID for every new Wing checkout', () => {
    for (const invalid of [undefined, null, '', ' ', 1, true, [], ['two-black-chairs'], { id: 'two-black-chairs' }, 'unknown', '__proto__', 'two-black-chairs ', '<script>bad</script>']) {
      assert.throws(() => buildCanonicalBookingCart([rawItem(invalid)]), BookingSetupSelectionError)
    }
    for (const setup of WING_SETUPS) {
      const [item] = buildCanonicalBookingCart([rawItem(setup.id)])
      assert.equal(item.setupId, setup.id)
      assert.equal(item.studioName, 'The Wing')
      assert.equal(item.price, 300)
    }
  })

  test('does not attach Wing configurations to another room', () => {
    for (const absent of [undefined, null, '']) assert.equal(validateBookingSetup('encore', absent), undefined)
    assert.equal(getStudioSetup('the-executive', 'two-black-chairs'), undefined)
    assert.throws(() => buildCanonicalBookingCart([{ ...rawItem('two-black-chairs'), studioId: 'the-executive' }]), BookingSetupSelectionError)
    assert.equal(buildCanonicalBookingCart([{ ...rawItem(undefined), studioId: 'encore' }])[0].price, 300)
  })

  test('keeps rate, discounts, and teleprompter charges identical for all four choices', () => {
    for (const setup of WING_SETUPS) {
      const cart = buildCanonicalBookingCart([rawItem(setup.id, 4)])
      const pricing = calculateBookingCheckoutPricing(cart, 'weekly')
      assert.deepEqual(pricing, {
        baseSessionTotalCents: 60000, discountCents: 6000,
        discountedSessionAmounts: [54000], addOnTotalCents: 10000, computedTotalCents: 64000,
      })
      const lines = buildBookingCheckoutLineItems(cart, pricing, 'https://example.invalid/fixture.jpg')
      assert.deepEqual(lines.map((line) => line.price_data?.unit_amount), [54000, 10000])
      assert.ok(lines[0].price_data?.product_data?.description?.includes(`Setup: ${setup.label}`))
      assert.doesNotMatch(JSON.stringify(lines), /Untrusted/)
    }
  })
})

describe('durable setup metadata without legacy resource regressions', () => {
  test('round-trips per-session choices through compact Stripe metadata', () => {
    const cart = buildCanonicalBookingCart(WING_SETUPS.map((setup) => rawItem(setup.id)))
    const metadata = { bookingHoldVersion: '1', totalSessions: '4', ...buildBookingCartMetadata(cart) }
    const parsed = parseBookingCartItems(metadata)
    assert.equal(hasCompleteBookingCartMetadata(metadata, parsed), true)
    assert.deepEqual(parsed.map(({ setupId }) => setupId), WING_SETUPS.map(({ id }) => id))
  })

  test('stays under Stripe value and lifecycle-safe key limits at maximum cart size', () => {
    const cart = buildCanonicalBookingCart(Array.from({ length: 20 }, (_, index) => rawItem(WING_SETUPS[index % 4].id, 16)))
    const required = {
      ...Object.fromEntries(Array.from({ length: 17 }, (_, index) => [`required_${index}`, 'fixture'])),
      ...buildBookingCartMetadata(cart),
    }
    const metadata = withBookingAttributionMetadata(required, { trackingSource: 'fixture', trackingMedium: 'fixture', trackingCampaign: 'fixture', trackingTerm: 'fixture' })
    assert.equal(Object.keys(metadata).length, 40)
    for (const value of Object.values(metadata)) assert.ok(value.length <= 500)
    assert.equal(Object.keys(metadata).filter((key) => key.startsWith('cart_')).length, 20)
  })

  test('missing or malformed historical setup never discards a resource cart or invents chairs', () => {
    const [item] = buildCanonicalBookingCart([rawItem('one-brown-chair')])
    const compact = JSON.parse(buildBookingCartMetadata([item]).cart_0)
    for (const invalid of [undefined, null, '', 'unknown', '<script>bad</script>', [], { id: 'one-black-chair' }]) {
      const metadata = { bookingHoldVersion: '1', totalSessions: '1', cart_0: JSON.stringify({ ...compact, setup: invalid }) }
      const parsed = parseBookingCartItems(metadata)
      assert.equal(hasCompleteBookingCartMetadata(metadata, parsed), true)
      assert.equal(parsed[0].setupId, undefined)
      assert.match(bookingSetupDescription(parsed[0].studioId, parsed[0].setupId), /Setup not recorded/)
      assert.doesNotMatch(bookingSetupEmailHtml(parsed[0].studioId, invalid), /<script>|one-black-chair|1 black chair/)
    }
  })

  test('legacy hourly slot arrays and cartJson remain compatible', () => {
    const legacy = { totalSessions: '1', cart_0: JSON.stringify({ id: 'the-wing', d: date, s: [slots()[0]], n: 'The Wing' }) }
    const parsed = parseBookingCartItems(legacy)
    assert.equal(parsed[0].slots.length, 2)
    assert.equal(parsed[0].setupId, undefined)
    assert.equal(hasCompleteBookingCartMetadata(legacy, parsed), true)
    const json = { cartJson: JSON.stringify([{ studioId: 'the-wing', studioName: 'The Wing', date, slots: [slots()[0]], setupId: 'two-brown-chairs' }]) }
    assert.equal(parseBookingCartItems(json)[0].setupId, 'two-brown-chairs')
    assert.equal(hasCompleteBookingCartMetadata(json, parseBookingCartItems(json)), true)
  })
})

describe('setup drafts and checkout revisions', () => {
  const draft = {
    version: 1, clientSecret: 'fixture-only', publishableKey: 'fixture-only', sessionId: 'cs_test_setupFixture',
    managementToken: 'fixture-authority', expiresAt: '2026-09-01T18:00:00.000Z', selectedId: 'the-wing',
    durationSlots: 2, date, startSlot: slots()[0], slots: slots().map((time) => ({ time, label: 'Fixture time', available: true })),
    recurring: 'weekly', name: 'Example Guest', email: 'guest@example.invalid', phone: '', teamEmails: [], addOnIds: ['teleprompter'],
  }

  test('restores each selection and preserves its checkout authority', () => {
    for (const setup of WING_SETUPS) {
      const restored = parsePendingCheckout(JSON.stringify({ ...draft, setupId: setup.id }))!
      assert.equal(restored.setupId, setup.id)
      assert.equal(restored.managementToken, draft.managementToken)
      const revised = buildCanonicalBookingCart([{ ...rawItem(restored.setupId, 4), addOnIds: restored.addOnIds }])
      assert.equal(calculateBookingCheckoutPricing(revised, restored.recurring).computedTotalCents, 64000)
    }
  })

  test('retains old or malformed drafts so they can be safely released before choosing a setup', () => {
    for (const invalid of [undefined, null, 'unknown', ['two-black-chairs']]) {
      const restored = parsePendingCheckout(JSON.stringify({ ...draft, setupId: invalid }))!
      assert.ok(restored)
      assert.equal(restored.setupId, undefined)
      assert.equal(restored.managementToken, draft.managementToken)
    }
    assert.equal(parsePendingCheckout(JSON.stringify({ ...draft, selectedId: 'the-executive', setupId: 'two-black-chairs' }))?.setupId, undefined)
  })

  test('detects an explicit new setup or studio instead of silently resuming another checkout', () => {
    const pending = { selectedId: 'the-wing', setupId: 'one-black-chair' as const }
    assert.equal(pendingCheckoutMatchesSelection(pending, { studioId: 'the-wing' }), true)
    assert.equal(pendingCheckoutMatchesSelection(pending, { studioId: 'the-wing', setupId: 'one-black-chair' }), true)
    assert.equal(pendingCheckoutMatchesSelection(pending, { studioId: 'the-wing', setupId: 'two-brown-chairs' }), false)
    assert.equal(pendingCheckoutMatchesSelection(pending, { studioId: 'the-wing', setupId: 'invalid' }), false)
    assert.equal(pendingCheckoutMatchesSelection(pending, { studioId: 'the-executive' }), false)
    assert.equal(pendingCheckoutMatchesSelection({ selectedId: 'the-wing' }, { studioId: 'the-wing', setupId: 'two-black-chairs' }), false)
  })
})

describe('setup communication and customer privacy', () => {
  test('uses canonical per-session labels for emails and calendar details', () => {
    for (const setup of WING_SETUPS) {
      assert.match(bookingSetupEmailHtml('the-wing', setup.id), new RegExp(`Setup: ${setup.label}`))
      assert.deepEqual(bookingSetupCalendarFields('the-wing', setup.id), {
        description: `Setup: ${setup.label}`, privateProperties: { setupId: setup.id },
      })
    }
    assert.equal(bookingSetupEmailHtml('encore', 'two-black-chairs'), '')
    assert.match(bookingSetupEmailHtml('the-executive', 'two-black-chairs'), /Setup not recorded/)
    assert.match(bookingSetupEmailHtml('the-wing', undefined), /Setup not recorded/)
    assert.doesNotMatch(bookingSetupEmailHtml('the-wing', '<img src=x onerror=alert(1)>'), /<img|onerror/)
  })

  test('shows setup confirmation details only with signed checkout authority', async () => {
    const cart = buildCanonicalBookingCart([rawItem('two-black-chairs')])
    const session = {
      id: 'cs_test_setupFixture', mode: 'payment', status: 'complete', payment_status: 'paid', amount_total: 35000, currency: 'usd',
      metadata: { bookingHoldVersion: '1', bookingRef: 'fixture-ref', totalSessions: '1', computedTotalCents: '35000', addOnTotalCents: '5000', vbsCalendarSyncedAt: '2026-09-01T18:00:00.000Z', ...buildBookingCartMetadata(cart) },
    } as unknown as Stripe.Checkout.Session
    const deps = { retrieveSession: async () => session, verifyManagementToken: (token: string) => token === 'fixture-authority' }
    const privateResult = await getBookingConfirmation(session.id, 'fixture-authority', deps)
    assert.equal(privateResult.status, 'confirmed')
    assert.equal(privateResult.summary?.sessions[0].setupDescription, 'Setup: 2 black chairs')
    const publicResult = await getBookingConfirmation(session.id, '', deps)
    assert.equal(publicResult.summary, undefined)
    assert.doesNotMatch(JSON.stringify(publicResult), /chair|setup/i)
  })

  test('prefills custom inquiries from known studio and setup IDs only', () => {
    const inquiry = getContactInquiry(new URLSearchParams({ service: 'studio-setup', studio: 'the-wing', setup: 'one-brown-chair' }))!
    assert.equal(inquiry.projectType, 'podcast')
    assert.match(inquiry.message, /custom setup for The Wing/)
    assert.match(inquiry.message, /1 brown chair/)
    for (const params of [
      { service: 'studio-setup', studio: 'the-wing', setup: '<script>bad</script>' },
      { service: 'studio-setup', studio: '<script>bad</script>', setup: 'two-black-chairs' },
    ]) assert.doesNotMatch(getContactInquiry(new URLSearchParams(params))!.message, /<script>|bad|2 black chairs/)
  })
})

describe('photo selector rendering', () => {
  test('starts unselected with all four full-frame photos and a disabled booking CTA', () => {
    const html = renderToStaticMarkup(React.createElement(WingSetupSelector))
    assert.equal((html.match(/type="radio"/g) || []).length, 4)
    assert.doesNotMatch(html, /checked=""/)
    assert.match(html, /disabled=""[^>]*>Choose a setup to book/)
    assert.match(html, /All of our sets are customizable/)
    assert.match(html, /mailto:founder@vibeshackstudios.com/)
    assert.match(html, /service=studio-setup/)
  })

  test('marks only the chosen photo and includes its context in the contact link', () => {
    const html = renderToStaticMarkup(React.createElement(StudioSetupPicker, { id: 'test', studioId: 'the-wing', value: 'two-black-chairs', onChange: () => {} }))
    assert.equal((html.match(/checked=""/g) || []).length, 1)
    assert.match(html, /aria-label="2 black chairs"/)
    assert.match(html, /setup=two-black-chairs/)
    assert.match(html, /Selected ✓/)
  })

  test('ships four optimized 4:3 assets without cropping the source frames', async () => {
    for (const setup of WING_SETUPS) {
      const bytes = readFileSync(resolve('public', setup.image.slice(1)))
      const metadata = await sharp(bytes).metadata()
      assert.equal(metadata.format, 'webp')
      assert.equal(metadata.width, 1448)
      assert.equal(metadata.height, 1086)
      assert.ok(bytes.length < 400_000)
    }
  })
})

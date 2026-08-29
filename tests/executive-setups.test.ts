import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import sharp from 'sharp'
import type Stripe from 'stripe'
import StudioSetupSelector from '../components/StudioSetupSelector'
import StudioSetupPicker from '../components/StudioSetupPicker'
import {
  EXECUTIVE_SETUPS, WING_SETUPS, BookingSetupSelectionError,
  bookingSetupDescription, getStudioSetup, getStudioSetups,
} from '../lib/booking/studio-setups'
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
  studioId: 'the-executive', date, slots: slots(count), setupId,
  studioName: 'Untrusted studio', setupLabel: 'Untrusted layout',
  price: 1, hours: 999, addOnIds: ['teleprompter'],
})

describe('Executive desk and armchair options', () => {
  test('provides exactly the three supplied layouts with room-scoped IDs', () => {
    assert.deepEqual(EXECUTIVE_SETUPS.map(({ id }) => id), ['one-office-chair-desk', 'two-office-chairs-desk', 'three-black-armchairs'])
    assert.deepEqual(EXECUTIVE_SETUPS.map(({ chairs }) => chairs), [1, 2, 3])
    assert.match(EXECUTIVE_SETUPS[0].label, /with desk$/)
    assert.match(EXECUTIVE_SETUPS[1].label, /with desk$/)
    assert.match(EXECUTIVE_SETUPS[2].label, /without desk$/)
    assert.equal(new Set([...WING_SETUPS, ...EXECUTIVE_SETUPS].map(({ id }) => id)).size, 7)
    for (const setup of EXECUTIVE_SETUPS) assert.equal(getStudioSetup('the-wing', setup.id), undefined)
    for (const setup of WING_SETUPS) assert.equal(getStudioSetup('the-executive', setup.id), undefined)
    for (const studioId of ['encore', 'unknown', '__proto__', 'constructor']) assert.deepEqual(getStudioSetups(studioId), [])
  })

  test('requires an exact Executive setup for new checkouts and rejects foreign or malformed choices', () => {
    for (const invalid of [undefined, null, '', ' ', 3, true, [], ['three-black-armchairs'], { id: 'three-black-armchairs' }, 'unknown', '__proto__', 'three-black-armchairs ', '<script>bad</script>', ...WING_SETUPS.map(({ id }) => id)]) {
      assert.throws(() => buildCanonicalBookingCart([rawItem(invalid)]), BookingSetupSelectionError)
    }
    for (const setup of EXECUTIVE_SETUPS) {
      const [item] = buildCanonicalBookingCart([rawItem(setup.id)])
      assert.equal(item.setupId, setup.id)
      assert.equal(item.studioName, 'The Executive')
      assert.equal(item.price, 300)
    }
  })

  test('keeps each layout at $300/hr and the teleprompter at $50/hr, including fractional durations and discounts', () => {
    for (const setup of EXECUTIVE_SETUPS) {
      const cart = buildCanonicalBookingCart([rawItem(setup.id, 3)])
      const pricing = calculateBookingCheckoutPricing(cart, 'weekly')
      assert.deepEqual(pricing, {
        baseSessionTotalCents: 45000, discountCents: 4500,
        discountedSessionAmounts: [40500], addOnTotalCents: 7500, computedTotalCents: 48000,
      })
      const lines = buildBookingCheckoutLineItems(cart, pricing, 'https://example.invalid/fixture.jpg')
      assert.deepEqual(lines.map((line) => line.price_data?.unit_amount), [40500, 7500])
      assert.ok(lines[0].price_data?.product_data?.description?.includes(`Setup: ${setup.label}`))
      assert.doesNotMatch(JSON.stringify(lines), /Untrusted/)
    }
  })

  test('round-trips mixed Wing and Executive sessions within maximum Stripe metadata bounds', () => {
    const choices = [
      ...EXECUTIVE_SETUPS.map((setup) => ({ studioId: 'the-executive', setupId: setup.id })),
      ...WING_SETUPS.map((setup) => ({ studioId: 'the-wing', setupId: setup.id })),
    ]
    const cart = buildCanonicalBookingCart(Array.from({ length: 20 }, (_, index) => ({ ...rawItem(undefined, 16), ...choices[index % choices.length] })))
    const required = {
      ...Object.fromEntries(Array.from({ length: 15 }, (_, index) => [`required_${index}`, 'fixture'])),
      bookingHoldVersion: '1', totalSessions: '20', ...buildBookingCartMetadata(cart),
    }
    const metadata = withBookingAttributionMetadata(required, { trackingSource: 'fixture', trackingMedium: 'fixture', trackingCampaign: 'fixture', trackingTerm: 'fixture' })
    const parsed = parseBookingCartItems(metadata)
    assert.equal(hasCompleteBookingCartMetadata(metadata, parsed), true)
    assert.equal(Object.keys(metadata).length, 40)
    for (const value of Object.values(metadata)) assert.ok(value.length <= 500)
    assert.deepEqual(parsed.map(({ studioId, setupId }) => ({ studioId, setupId })), cart.map(({ studioId, setupId }) => ({ studioId, setupId })))
  })
})

describe('Executive checkout compatibility', () => {
  const draft = {
    version: 1, clientSecret: 'fixture-only', publishableKey: 'fixture-only', sessionId: 'cs_test_executiveFixture',
    managementToken: 'fixture-authority', expiresAt: '2026-09-01T18:00:00.000Z', selectedId: 'the-executive',
    durationSlots: 2, date, startSlot: slots()[0], slots: slots().map((time) => ({ time, label: 'Fixture time', available: true })),
    recurring: null, name: 'Example Guest', email: 'guest@example.invalid', phone: '', teamEmails: [], addOnIds: ['teleprompter'],
  }

  test('restores every layout, equipment selection, and signed checkout authority', () => {
    for (const setup of EXECUTIVE_SETUPS) {
      const restored = parsePendingCheckout(JSON.stringify({ ...draft, setupId: setup.id }))!
      assert.equal(restored.setupId, setup.id)
      assert.equal(restored.managementToken, draft.managementToken)
      assert.equal(restored.sessionId, draft.sessionId)
      assert.deepEqual(restored.addOnIds, ['teleprompter'])
      assert.equal(calculateBookingCheckoutPricing(buildCanonicalBookingCart([rawItem(restored.setupId)]), null).computedTotalCents, 35000)
    }
  })

  test('preserves legacy and malformed drafts so the original checkout can be released safely', () => {
    for (const invalid of [undefined, null, '', 'unknown', ['three-black-armchairs'], { id: 'three-black-armchairs' }, ...WING_SETUPS.map(({ id }) => id)]) {
      const restored = parsePendingCheckout(JSON.stringify({ ...draft, setupId: invalid }))!
      assert.ok(restored)
      assert.equal(restored.setupId, undefined)
      assert.equal(restored.managementToken, draft.managementToken)
      assert.equal(restored.sessionId, draft.sessionId)
    }
  })

  test('does not silently resume a checkout for another room or another Executive layout', () => {
    const pending = { selectedId: 'the-executive', setupId: 'one-office-chair-desk' as const }
    assert.equal(pendingCheckoutMatchesSelection(pending, { studioId: 'the-executive' }), true)
    assert.equal(pendingCheckoutMatchesSelection(pending, { studioId: 'the-executive', setupId: 'one-office-chair-desk' }), true)
    for (const setupId of ['two-office-chairs-desk', 'three-black-armchairs', 'two-black-chairs', 'invalid']) {
      assert.equal(pendingCheckoutMatchesSelection(pending, { studioId: 'the-executive', setupId }), false)
    }
    assert.equal(pendingCheckoutMatchesSelection(pending, { studioId: 'the-wing', setupId: 'two-black-chairs' }), false)
    assert.equal(pendingCheckoutMatchesSelection({ selectedId: 'the-executive' }, { studioId: 'the-executive', setupId: 'three-black-armchairs' }), false)
  })

  test('keeps historical paid bookings valid without inventing a desk or chair choice', async () => {
    const cart = buildCanonicalBookingCart([rawItem('two-office-chairs-desk')])
    const compact = JSON.parse(buildBookingCartMetadata(cart).cart_0)
    for (const invalid of [undefined, null, 'two-black-chairs', '<script>bad</script>', ['three-black-armchairs']]) {
      const metadata = {
        bookingHoldVersion: '1', bookingRef: 'fixture-ref', totalSessions: '1',
        computedTotalCents: '35000', addOnTotalCents: '5000', vbsCalendarSyncedAt: '2026-09-01T18:00:00.000Z',
        ...buildBookingCartMetadata(cart), cart_0: JSON.stringify({ ...compact, setup: invalid }),
      }
      const parsed = parseBookingCartItems(metadata)
      assert.equal(hasCompleteBookingCartMetadata(metadata, parsed), true)
      assert.equal(parsed[0].setupId, undefined)
      assert.match(bookingSetupDescription('the-executive', parsed[0].setupId), /Setup not recorded/)
      const session = {
        id: 'cs_test_executiveFixture', mode: 'payment', status: 'complete', payment_status: 'paid',
        amount_total: 35000, currency: 'usd', metadata,
      } as unknown as Stripe.Checkout.Session
      const result = await getBookingConfirmation(session.id, 'fixture-authority', {
        retrieveSession: async () => session, verifyManagementToken: (token) => token === 'fixture-authority',
      })
      assert.equal(result.status, 'confirmed')
      assert.match(result.summary?.sessions[0].setupDescription || '', /Setup not recorded/)
      assert.doesNotMatch(JSON.stringify(result), /<script>|black.chair|armchair|with desk/)
    }
  })
})

describe('Executive customer and staff communication', () => {
  test('uses canonical desk or no-desk labels in emails, calendars, and signed confirmation details', async () => {
    for (const setup of EXECUTIVE_SETUPS) {
      const description = `Setup: ${setup.label}`
      assert.ok(bookingSetupEmailHtml('the-executive', setup.id).includes(description))
      assert.deepEqual(bookingSetupCalendarFields('the-executive', setup.id), { description, privateProperties: { setupId: setup.id } })
      const session = {
        id: 'cs_test_executiveFixture', mode: 'payment', status: 'complete', payment_status: 'paid', amount_total: 35000, currency: 'usd',
        metadata: {
          bookingHoldVersion: '1', bookingRef: 'fixture-ref', totalSessions: '1', computedTotalCents: '35000', addOnTotalCents: '5000',
          vbsCalendarSyncedAt: '2026-09-01T18:00:00.000Z', ...buildBookingCartMetadata(buildCanonicalBookingCart([rawItem(setup.id)])),
        },
      } as unknown as Stripe.Checkout.Session
      const deps = { retrieveSession: async () => session, verifyManagementToken: (token: string) => token === 'fixture-authority' }
      const signed = await getBookingConfirmation(session.id, 'fixture-authority', deps)
      assert.equal(signed.status, 'confirmed')
      assert.equal(signed.summary?.sessions[0].setupDescription, description)
      const unsigned = await getBookingConfirmation(session.id, '', deps)
      assert.equal(unsigned.summary, undefined)
      assert.doesNotMatch(JSON.stringify(unsigned), /chair|setup|desk/i)
    }
  })

  test('prefills customization inquiries only from valid room-scoped photo choices', () => {
    for (const setup of EXECUTIVE_SETUPS) {
      const inquiry = getContactInquiry(new URLSearchParams({ service: 'studio-setup', studio: 'the-executive', setup: setup.id }))!
      assert.equal(inquiry.projectType, 'podcast')
      assert.match(inquiry.message, /custom setup for The Executive/)
      assert.ok(inquiry.message.includes(setup.label))
    }
    for (const setup of ['two-black-chairs', '<script>bad</script>']) {
      const inquiry = getContactInquiry(new URLSearchParams({ service: 'studio-setup', studio: 'the-executive', setup }))!
      assert.doesNotMatch(inquiry.message, /<script>|bad|black.chair|photo option/)
    }
  })
})

describe('Executive photo selector', () => {
  test('starts with three required, unselected choices and accurate customization copy', () => {
    const html = renderToStaticMarkup(React.createElement(StudioSetupSelector, { studioId: 'the-executive' }))
    assert.equal((html.match(/type="radio"/g) || []).length, 3)
    assert.equal((html.match(/required=""/g) || []).length, 3)
    assert.doesNotMatch(html, /checked=""|The Wing|Choose your Wing/)
    assert.match(html, /disabled=""[^>]*>Choose a setup to book/)
    assert.match(html, /Three-person conversation/)
    assert.match(html, /All of our sets are customizable/)
    assert.match(html, /All three options use The Executive/)
    assert.match(html, /mailto:founder@vibeshackstudios.com/)
    assert.match(html, /service=studio-setup&amp;studio=the-executive/)
  })

  test('marks the chosen photo and carries the exact setup into contact and email links', () => {
    for (const setup of EXECUTIVE_SETUPS) {
      const html = renderToStaticMarkup(React.createElement(StudioSetupPicker, { id: 'executive-test', studioId: 'the-executive', value: setup.id, onChange: () => {} }))
      assert.equal((html.match(/checked=""/g) || []).length, 1)
      assert.ok(html.includes(`setup=${setup.id}`))
      assert.ok(html.includes(encodeURIComponent(`Custom setup for The Executive: ${setup.label}`)))
      assert.match(html, /Selected ✓/)
    }
  })

  test('ships optimized images with the complete dimensions of each supplied photo', async () => {
    for (const setup of EXECUTIVE_SETUPS) {
      const bytes = readFileSync(resolve('public', setup.image.slice(1)))
      const metadata = await sharp(bytes).metadata()
      assert.equal(metadata.format, 'webp')
      assert.equal(metadata.width, setup.width)
      assert.equal(metadata.height, setup.height)
      assert.ok(bytes.length < 400_000)
    }
  })
})

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import type Stripe from 'stripe'
import { getBookingConfirmation, type BookingConfirmationDependencies } from '../lib/booking/confirmation'
import { CONFIRMATION_STATUSES, PENDING_CHECKOUT_STORAGE_KEY, clearConfirmedPendingCheckout, pendingConfirmationToken } from '../lib/booking/confirmation-state'
import { buildCanonicalBookingCart } from '../lib/booking/checkout-pricing'
import { buildBookingCartMetadata } from '../lib/booking/checkout-metadata'
import { fulfillBookingCalendar } from '../lib/booking/fulfillment-state'

const sessionId = 'cs_test_bookingFixture123'
const bookingRef = 'fixture-booking-reference'
const timestamp = '2026-09-01T16:00:00.000Z'
const cart = buildCanonicalBookingCart([{
  studioId: 'canvas-rental', date: '2026-09-12',
  slots: ['2026-09-12T17:00:00.000Z', '2026-09-12T17:30:00.000Z', '2026-09-12T18:00:00.000Z'],
  addOnIds: ['teleprompter'],
}])
const baseMetadata = {
  bookingHoldVersion: '1', bookingRef, totalSessions: '1', computedTotalCents: '22500',
  addOnTotalCents: '7500', customerName: 'Fixture Private Name', customerEmail: 'fixture-private@example.invalid',
  customerPhone: 'fixture-private-phone', ...buildBookingCartMetadata(cart),
}

function session(overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session {
  return {
    id: sessionId, mode: 'payment', status: 'complete', payment_status: 'paid',
    amount_total: 22500, currency: 'usd', metadata: { ...baseMetadata }, ...overrides,
  } as Stripe.Checkout.Session
}

function dependencies(value: Stripe.Checkout.Session) {
  const calls: string[] = []
  const deps: BookingConfirmationDependencies = {
    retrieveSession: async (id) => { calls.push(id); return value },
    verifyManagementToken: (token, id, ref) => token === 'valid-fixture-token' && id === sessionId && ref === bookingRef,
  }
  return { calls, deps }
}

describe('verified booking confirmation', () => {
  test('does not look up missing or malformed IDs and never claim success', async () => {
    const { calls, deps } = dependencies(session())
    assert.deepEqual(await getBookingConfirmation(null, '', deps), { status: 'missing' })
    for (const invalid of ['audit-invalid', 'cs_test_', 'cs_test_bad?x=1', '<script>', 'cs_test_' + 'x'.repeat(260)]) {
      assert.deepEqual(await getBookingConfirmation(invalid, '', deps), { status: 'unverified' })
    }
    assert.deepEqual(calls, [])
  })

  test('treats fake session lookup errors as unverified status, without leaking diagnostics', async () => {
    const deps: BookingConfirmationDependencies = {
      retrieveSession: async () => { throw new Error('Fixture Stripe error with private diagnostics') },
      verifyManagementToken: () => false,
    }
    const result = await getBookingConfirmation(sessionId, '', deps)
    assert.deepEqual(result, { status: 'error' })
    assert.doesNotMatch(JSON.stringify(result), /private|Stripe/)
  })

  test('requires both complete and paid, not no_payment_required or an open payment', async () => {
    const incomplete: Partial<Stripe.Checkout.Session>[] = [
      { status: 'open', payment_status: 'unpaid' },
      { status: 'open', payment_status: 'paid' },
      { status: 'complete', payment_status: 'unpaid' },
      { status: 'complete', payment_status: 'no_payment_required' },
      { status: null, payment_status: 'paid' },
    ]
    for (const override of incomplete) {
      const { deps } = dependencies(session({ ...override, metadata: { ...baseMetadata, vbsCalendarSyncedAt: timestamp } }))
      assert.equal((await getBookingConfirmation(sessionId, '', deps)).status, 'not_paid')
    }
    const { deps } = dependencies(session({ status: 'expired', payment_status: 'unpaid' }))
    assert.equal((await getBookingConfirmation(sessionId, '', deps)).status, 'expired')
  })

  test('rejects unrelated paid sessions and incomplete or malformed VibeShack carts', async () => {
    const invalid: Partial<Stripe.Checkout.Session>[] = [
      { metadata: null },
      { metadata: { ...baseMetadata, bookingHoldVersion: '0' } },
      { metadata: { ...baseMetadata, bookingRef: '' } },
      { metadata: { ...baseMetadata, totalSessions: '2' } },
      { metadata: { ...baseMetadata, cart_0: '{}' } },
      { metadata: { ...baseMetadata, cart_0: 'invalid json' } },
      { id: 'cs_test_anotherSession' },
      { mode: 'subscription' },
    ]
    for (const override of invalid) {
      const { deps } = dependencies(session(override))
      assert.equal((await getBookingConfirmation(sessionId, '', deps)).status, 'unverified')
    }
  })

  test('rejects currency, paid amount, and add-on metadata mismatches', async () => {
    const invalid: Partial<Stripe.Checkout.Session>[] = [
      { currency: 'eur' },
      { amount_total: 1 },
      { amount_total: null },
      { metadata: { ...baseMetadata, computedTotalCents: '' } },
      { metadata: { ...baseMetadata, computedTotalCents: '22500junk' } },
      { metadata: { ...baseMetadata, computedTotalCents: '0' } },
      { metadata: { ...baseMetadata, addOnTotalCents: '1' } },
      { metadata: { ...baseMetadata, addOnTotalCents: '' } },
      { metadata: Object.fromEntries(Object.entries(baseMetadata).filter(([key]) => key !== 'addOnTotalCents')) },
    ]
    for (const override of invalid) {
      const { deps } = dependencies(session(override))
      assert.equal((await getBookingConfirmation(sessionId, '', deps)).status, 'unverified')
    }
  })

  test('reports payment received while webhook fulfillment is pending', async () => {
    const { calls, deps } = dependencies(session())
    assert.deepEqual(await getBookingConfirmation(sessionId, '', deps), { status: 'processing', emailSent: false })
    assert.deepEqual(calls, [sessionId])
    const invalidMarker = dependencies(session({ metadata: { ...baseMetadata, vbsCalendarSyncedAt: 'not-a-timestamp' } }))
    assert.equal((await getBookingConfirmation(sessionId, '', invalidMarker.deps)).status, 'processing')
  })

  test('confirms only after calendar fulfillment, independently of email delivery', async () => {
    const booked = dependencies(session({ metadata: { ...baseMetadata, vbsCalendarSyncedAt: timestamp } }))
    assert.deepEqual(await getBookingConfirmation(sessionId, '', booked.deps), { status: 'confirmed', emailSent: false })
    const emailed = dependencies(session({ metadata: { ...baseMetadata, vbsCalendarSyncedAt: timestamp, vbsConfirmationSentAt: timestamp } }))
    assert.deepEqual(await getBookingConfirmation(sessionId, '', emailed.deps), { status: 'confirmed', emailSent: true })
    const emailOnly = dependencies(session({ metadata: { ...baseMetadata, vbsConfirmationSentAt: timestamp } }))
    assert.equal((await getBookingConfirmation(sessionId, '', emailOnly.deps)).status, 'processing')
  })

  test('flags a known booking conflict even if calendar insertion also completed', async () => {
    const { deps } = dependencies(session({ metadata: { ...baseMetadata, vbsDoubleBookingAlertedAt: timestamp, vbsCalendarSyncedAt: timestamp } }))
    assert.equal((await getBookingConfirmation(sessionId, '', deps)).status, 'attention')
  })

  test('retains independent attention state when conflict alert email fails', async () => {
    const metadata: Record<string, string> = { ...baseMetadata }
    const actions: string[] = []
    await fulfillBookingCalendar(true, {
      markAttention: async () => { actions.push('attention'); metadata.vbsBookingAttentionAt = timestamp },
      insertEvents: async () => { actions.push('calendar') },
      markCalendarSynced: async () => { actions.push('synced'); metadata.vbsCalendarSyncedAt = timestamp },
    })
    assert.deepEqual(actions, ['attention', 'calendar', 'synced'])
    const failedAlert = async () => { throw new Error('Fixture mail failure') }
    await assert.rejects(failedAlert, /Fixture mail failure/)
    assert.equal(metadata.vbsDoubleBookingAlertedAt, undefined)
    const { deps } = dependencies(session({ metadata }))
    assert.equal((await getBookingConfirmation(sessionId, '', deps)).status, 'attention')
  })

  test('does not insert or publish synced if persisting a known conflict fails', async () => {
    const actions: string[] = []
    await assert.rejects(fulfillBookingCalendar(true, {
      markAttention: async () => { throw new Error('Fixture metadata failure') },
      insertEvents: async () => { actions.push('calendar') },
      markCalendarSynced: async () => { actions.push('synced') },
    }), /Fixture metadata failure/)
    assert.deepEqual(actions, [])
    const { deps } = dependencies(session())
    assert.equal((await getBookingConfirmation(sessionId, '', deps)).status, 'processing')
  })

  test('ordinary fulfillment does not create an attention state', async () => {
    const actions: string[] = []
    await fulfillBookingCalendar(false, {
      markAttention: async () => { actions.push('attention') },
      insertEvents: async () => { actions.push('calendar') },
      markCalendarSynced: async () => { actions.push('synced') },
    })
    assert.deepEqual(actions, ['calendar', 'synced'])
  })

  test('requires the signed management token for details and never returns contact data', async () => {
    const { deps } = dependencies(session({ metadata: { ...baseMetadata, vbsCalendarSyncedAt: timestamp } }))
    for (const token of ['', 'invalid-token']) {
      const result = await getBookingConfirmation(sessionId, token, deps)
      assert.equal(result.summary, undefined)
      assert.doesNotMatch(JSON.stringify(result), /Private Name|example.invalid|private-phone|2026-09-12/)
    }
    const result = await getBookingConfirmation(sessionId, 'valid-fixture-token', deps)
    assert.equal(result.summary?.totalPaid, 225)
    assert.equal(result.summary?.sessions[0].studioName, 'Canvas Rental')
    assert.deepEqual(result.summary?.sessions[0].addOns, [{ name: 'Teleprompter', hourlyRate: 50, amount: 75 }])
    assert.doesNotMatch(JSON.stringify(result), /Private Name|example.invalid|private-phone|client_secret/)
  })

  test('still confirms managed legacy checkout metadata with no add-ons', async () => {
    const legacyCart = buildCanonicalBookingCart([{
      studioId: 'canvas-rental', date: '2026-09-12',
      slots: ['2026-09-12T17:00:00.000Z', '2026-09-12T17:30:00.000Z'],
    }])
    const metadata = {
      bookingHoldVersion: '1', bookingRef, totalSessions: '1',
      computedTotalCents: '10000', ...buildBookingCartMetadata(legacyCart), vbsCalendarSyncedAt: timestamp,
    }
    const { deps } = dependencies(session({ amount_total: 10000, metadata }))
    assert.equal((await getBookingConfirmation(sessionId, '', deps)).status, 'confirmed')
  })
})

describe('pending checkout storage protection', () => {
  function storageFor(value: string) {
    const values = new Map([[PENDING_CHECKOUT_STORAGE_KEY, value]])
    return {
      values,
      storage: {
        getItem: (key: string) => values.get(key) || null,
        removeItem: (key: string) => { values.delete(key) },
      },
    }
  }

  test('retains the draft for every nonconfirmed status and for another session', () => {
    for (const status of CONFIRMATION_STATUSES.filter((value) => value !== 'confirmed')) {
      const { storage, values } = storageFor(JSON.stringify({ sessionId, managementToken: 'fixture-token' }))
      clearConfirmedPendingCheckout(storage, sessionId, status)
      assert.equal(values.has(PENDING_CHECKOUT_STORAGE_KEY), true, status)
    }
    const { storage, values } = storageFor(JSON.stringify({ sessionId: 'cs_test_other' }))
    clearConfirmedPendingCheckout(storage, sessionId, 'confirmed')
    assert.equal(values.has(PENDING_CHECKOUT_STORAGE_KEY), true)
  })

  test('clears only a matching draft after verified fulfillment', () => {
    const { storage, values } = storageFor(JSON.stringify({ sessionId }))
    clearConfirmedPendingCheckout(storage, sessionId, 'confirmed')
    assert.equal(values.has(PENDING_CHECKOUT_STORAGE_KEY), false)
    const broken = storageFor('not json')
    assert.doesNotThrow(() => clearConfirmedPendingCheckout(broken.storage, sessionId, 'confirmed'))
  })

  test('sends a draft token only for its matching checkout', () => {
    const raw = JSON.stringify({ sessionId, managementToken: 'fixture-token' })
    assert.equal(pendingConfirmationToken(raw, sessionId), 'fixture-token')
    assert.equal(pendingConfirmationToken(raw, 'cs_test_other'), '')
    assert.equal(pendingConfirmationToken('invalid', sessionId), '')
    assert.equal(pendingConfirmationToken(JSON.stringify({ sessionId, managementToken: 'x'.repeat(257) }), sessionId), '')
  })
})

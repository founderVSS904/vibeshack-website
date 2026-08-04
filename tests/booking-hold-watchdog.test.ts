import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import type Stripe from 'stripe'
import type { BookingCartItem } from '../lib/booking/calendar'
import {
  hasCompleteBookingCartMetadata,
  parseBookingCartItems,
} from '../lib/booking/checkout-metadata'
import {
  reconcileCheckoutHold,
  type CheckoutHoldReconcileDependencies,
} from '../lib/booking/hold-watchdog'

const NOW = new Date('2026-07-29T20:00:00.000Z')
const VALID_METADATA: Record<string, string> = {
  bookingHoldVersion: '1',
  bookingRef: 'booking-ref',
  totalSessions: '1',
  cart_0: JSON.stringify({
    id: 'canvas-rental',
    d: '2026-08-21',
    t0: '2026-08-21T17:00:00.000Z',
    u: 30,
    off: [0, 1],
  }),
}

function checkoutSession(
  overrides: Partial<Stripe.Checkout.Session> = {},
): Stripe.Checkout.Session {
  return {
    id: 'cs_test_watchdog',
    object: 'checkout.session',
    payment_status: 'unpaid',
    status: 'expired',
    expires_at: Math.floor(NOW.getTime() / 1000) - 60,
    metadata: { ...VALID_METADATA },
    ...overrides,
  } as Stripe.Checkout.Session
}

function dependencies(
  sessions: Stripe.Checkout.Session[],
  overrides: Partial<CheckoutHoldReconcileDependencies> = {},
) {
  let retrieveIndex = 0
  const calls = {
    retrieve: 0,
    expire: 0,
    release: 0,
    mark: 0,
  }

  const value: CheckoutHoldReconcileDependencies = {
    retrieveSession: async () => {
      calls.retrieve += 1
      const session = sessions[Math.min(retrieveIndex, sessions.length - 1)]
      retrieveIndex += 1
      return session
    },
    expireSession: async () => {
      calls.expire += 1
      return sessions[Math.min(retrieveIndex, sessions.length - 1)]
    },
    parseCart: parseBookingCartItems,
    hasCompleteCart: hasCompleteBookingCartMetadata,
    releaseHolds: async () => {
      calls.release += 1
    },
    markReleased: async () => {
      calls.mark += 1
    },
    now: () => NOW,
    ...overrides,
  }

  return { calls, value }
}

describe('booking hold watchdog orchestration', () => {
  test('protects a checkout that became paid before the fresh read', async () => {
    const paid = checkoutSession({
      payment_status: 'paid',
      status: 'expired',
    })
    const { calls, value } = dependencies([paid])

    const outcome = await reconcileCheckoutHold(paid.id, value)

    assert.equal(outcome, 'protected')
    assert.deepEqual(calls, { retrieve: 1, expire: 0, release: 0, mark: 0 })
  })

  test('protects a completed checkout even when Stripe reports it unpaid', async () => {
    const complete = checkoutSession({
      payment_status: 'unpaid',
      status: 'complete',
    })
    const { calls, value } = dependencies([complete])

    const outcome = await reconcileCheckoutHold(complete.id, value)

    assert.equal(outcome, 'protected')
    assert.deepEqual(calls, { retrieve: 1, expire: 0, release: 0, mark: 0 })
  })

  test('protects a checkout that completes while expiration races', async () => {
    const open = checkoutSession({
      status: 'open',
      expires_at: Math.floor(NOW.getTime() / 1000) - 60,
    })
    const complete = checkoutSession({ status: 'complete' })
    const { calls, value } = dependencies([open, complete], {
      expireSession: async () => {
        calls.expire += 1
        throw new Error('Stripe expiration raced with payment')
      },
    })

    const outcome = await reconcileCheckoutHold(open.id, value)

    assert.equal(outcome, 'protected')
    assert.deepEqual(calls, { retrieve: 2, expire: 1, release: 0, mark: 0 })
  })

  test('surfaces an expiration failure when the checkout is still open', async () => {
    const open = checkoutSession({
      status: 'open',
      expires_at: Math.floor(NOW.getTime() / 1000) - 60,
    })
    const { calls, value } = dependencies([open, open], {
      expireSession: async () => {
        calls.expire += 1
        throw new Error('Stripe expiration failed')
      },
    })

    await assert.rejects(
      reconcileCheckoutHold(open.id, value),
      /Stripe expiration failed/,
    )
    assert.deepEqual(calls, { retrieve: 2, expire: 1, release: 0, mark: 0 })
  })

  test('protects a checkout when expiration returns the winning payment state', async () => {
    const open = checkoutSession({
      status: 'open',
      expires_at: Math.floor(NOW.getTime() / 1000) - 60,
    })
    const paid = checkoutSession({
      payment_status: 'paid',
      status: 'complete',
    })
    const { calls, value } = dependencies([open, paid])

    const outcome = await reconcileCheckoutHold(open.id, value)

    assert.equal(outcome, 'protected')
    assert.deepEqual(calls, { retrieve: 1, expire: 1, release: 0, mark: 0 })
  })

  test('releases an expired unpaid hold once and then treats it as idempotent', async () => {
    const expired = checkoutSession()
    const first = dependencies([expired])

    assert.equal(await reconcileCheckoutHold(expired.id, first.value), 'released')
    assert.deepEqual(first.calls, { retrieve: 1, expire: 0, release: 1, mark: 1 })

    const alreadyReleased = checkoutSession({
      metadata: {
        ...VALID_METADATA,
        vbsBookingHoldReleasedAt: NOW.toISOString(),
      },
    })
    const second = dependencies([alreadyReleased])

    assert.equal(
      await reconcileCheckoutHold(alreadyReleased.id, second.value),
      'already-released',
    )
    assert.deepEqual(second.calls, { retrieve: 1, expire: 0, release: 0, mark: 0 })
  })

  test('does not mark a hold released when Calendar cleanup fails', async () => {
    const expired = checkoutSession()
    const { calls, value } = dependencies([expired], {
      releaseHolds: async (_cart: BookingCartItem[], _bookingRef: string) => {
        calls.release += 1
        throw new Error('Calendar cleanup failed')
      },
    })

    await assert.rejects(
      reconcileCheckoutHold(expired.id, value),
      /Calendar cleanup failed/,
    )
    assert.deepEqual(calls, { retrieve: 1, expire: 0, release: 1, mark: 0 })
  })

  test('retries Calendar cleanup after a transient failure', async () => {
    const expired = checkoutSession()
    let cleanupAttempts = 0
    const { calls, value } = dependencies([expired], {
      releaseHolds: async () => {
        calls.release += 1
        cleanupAttempts += 1
        if (cleanupAttempts === 1) throw new Error('Transient Calendar failure')
      },
    })

    await assert.rejects(
      reconcileCheckoutHold(expired.id, value),
      /Transient Calendar failure/,
    )
    assert.equal(await reconcileCheckoutHold(expired.id, value), 'released')
    assert.deepEqual(calls, { retrieve: 2, expire: 0, release: 2, mark: 1 })
  })

  test('safely repeats idempotent cleanup when recording release fails', async () => {
    const expired = checkoutSession()
    let markAttempts = 0
    const { calls, value } = dependencies([expired], {
      markReleased: async () => {
        calls.mark += 1
        markAttempts += 1
        if (markAttempts === 1) throw new Error('Stripe metadata update failed')
      },
    })

    await assert.rejects(
      reconcileCheckoutHold(expired.id, value),
      /Stripe metadata update failed/,
    )
    assert.equal(await reconcileCheckoutHold(expired.id, value), 'released')
    assert.deepEqual(calls, { retrieve: 2, expire: 0, release: 2, mark: 2 })
  })

  test('refuses malformed metadata without touching Calendar', async () => {
    const malformed = checkoutSession({
      metadata: {
        bookingHoldVersion: '1',
        bookingRef: 'booking-ref',
        totalSessions: '1',
        cart_0: JSON.stringify({
          id: 'unknown-studio',
          d: 'not-a-date',
          t0: 'bad-slot',
          u: 30,
          off: [0, 1],
        }),
      },
    })
    const { calls, value } = dependencies([malformed])

    await assert.rejects(
      reconcileCheckoutHold(malformed.id, value),
      /incomplete cart metadata/,
    )
    assert.deepEqual(calls, { retrieve: 1, expire: 0, release: 0, mark: 0 })
  })
})

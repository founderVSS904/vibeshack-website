import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import {
  CHECKOUT_HOLD_GRACE_MINUTES,
  CHECKOUT_SESSION_MINUTES,
  bookingCheckoutExpirations,
  bookingHoldIsActive,
  checkoutHoldReleaseAction,
  checkoutHoldWatchdogAction,
} from '../lib/booking/checkout-lifecycle'
import {
  hasCompleteBookingCartMetadata,
  parseBookingCartItems,
} from '../lib/booking/checkout-metadata'
import {
  createCheckoutManagementToken,
  verifyCheckoutManagementToken,
} from '../lib/booking/checkout-management'
import { watchdogAlertIsDue } from '../lib/booking/hold-watchdog'

describe('checkout hold release decisions', () => {
  test('never releases a paid or complete checkout', () => {
    assert.equal(
      checkoutHoldReleaseAction({ payment_status: 'paid', status: 'open' }),
      'completed',
    )
    assert.equal(
      checkoutHoldReleaseAction({ payment_status: 'paid', status: 'expired' }),
      'completed',
    )
    assert.equal(
      checkoutHoldReleaseAction({ payment_status: 'unpaid', status: 'complete' }),
      'completed',
    )
  })

  test('expires an open unpaid checkout before releasing its hold', () => {
    assert.equal(
      checkoutHoldReleaseAction({ payment_status: 'unpaid', status: 'open' }),
      'expire',
    )
    assert.equal(
      checkoutHoldReleaseAction({ payment_status: 'unpaid', status: 'expired' }),
      'release',
    )
    assert.equal(
      checkoutHoldReleaseAction({ payment_status: 'unpaid', status: null }),
      'wait',
    )
  })
})

describe('watchdog reconciliation decisions', () => {
  const nowSeconds = Date.UTC(2026, 6, 29, 20, 0, 0) / 1000
  const session = {
    payment_status: 'unpaid',
    status: 'open',
    expires_at: nowSeconds + 60,
    managed: true,
    released: false,
  }

  test('ignores unmanaged or already released holds', () => {
    assert.equal(
      checkoutHoldWatchdogAction({ ...session, managed: false }, nowSeconds),
      'ignore',
    )
    assert.equal(
      checkoutHoldWatchdogAction({ ...session, released: true }, nowSeconds),
      'ignore',
    )
  })

  test('protects paid or completed checkouts at every age', () => {
    assert.equal(
      checkoutHoldWatchdogAction({
        ...session,
        payment_status: 'paid',
        expires_at: nowSeconds - 60,
      }, nowSeconds),
      'protect',
    )
    assert.equal(
      checkoutHoldWatchdogAction({
        ...session,
        status: 'complete',
        expires_at: nowSeconds - 60,
      }, nowSeconds),
      'protect',
    )
  })

  test('waits for an active checkout and reconciles only after expiry', () => {
    assert.equal(checkoutHoldWatchdogAction(session, nowSeconds), 'wait')
    assert.equal(
      checkoutHoldWatchdogAction({
        ...session,
        expires_at: nowSeconds,
      }, nowSeconds),
      'expire',
    )
    assert.equal(
      checkoutHoldWatchdogAction({
        ...session,
        status: 'expired',
        expires_at: nowSeconds - 60,
      }, nowSeconds),
      'release',
    )
  })
})

test('watchdog alert cooldown honors both sent and reserved timestamps', () => {
  const nowMs = Date.UTC(2026, 6, 29, 20, 0, 0)
  const cooldownMs = 6 * 60 * 60 * 1000
  const reservationCooldownMs = 30 * 60 * 1000

  assert.equal(watchdogAlertIsDue(null, nowMs, cooldownMs), true)
  assert.equal(watchdogAlertIsDue({
    vbsWatchdogAlertedAt: new Date(nowMs - cooldownMs + 1).toISOString(),
  }, nowMs, cooldownMs), false)
  assert.equal(watchdogAlertIsDue({
    vbsWatchdogAlertReservedAt: new Date(nowMs - cooldownMs + 1).toISOString(),
  }, nowMs, cooldownMs), false)
  assert.equal(watchdogAlertIsDue({
    vbsWatchdogAlertedAt: new Date(nowMs - cooldownMs - 1).toISOString(),
    vbsWatchdogAlertReservedAt: 'not-a-date',
  }, nowMs, cooldownMs), true)
  assert.equal(watchdogAlertIsDue({
    vbsWatchdogAlertReservedAt: new Date(nowMs - reservationCooldownMs - 1).toISOString(),
  }, nowMs, cooldownMs, reservationCooldownMs), true)
})

test('an abandoned checkout has a bounded hard-expiry window', () => {
  const nowMs = Date.UTC(2026, 6, 29, 20, 0, 0)
  const { checkoutExpiresAt, holdExpiresAt } = bookingCheckoutExpirations(nowMs)

  assert.equal(
    checkoutExpiresAt,
    nowMs / 1000 + CHECKOUT_SESSION_MINUTES * 60,
  )
  assert.equal(
    holdExpiresAt.getTime(),
    nowMs + (CHECKOUT_SESSION_MINUTES + CHECKOUT_HOLD_GRACE_MINUTES) * 60 * 1000,
  )
  assert.equal(
    holdExpiresAt.getTime() - checkoutExpiresAt * 1000,
    CHECKOUT_HOLD_GRACE_MINUTES * 60 * 1000,
  )
})

test('calendar availability ignores invalid or expired holds', () => {
  const nowMs = Date.UTC(2026, 6, 29, 20, 0, 0)

  assert.equal(bookingHoldIsActive('', nowMs), false)
  assert.equal(bookingHoldIsActive('not-a-date', nowMs), false)
  assert.equal(bookingHoldIsActive(new Date(nowMs).toISOString(), nowMs), false)
  assert.equal(
    bookingHoldIsActive(new Date(nowMs + 60_000).toISOString(), nowMs),
    true,
  )
})

describe('checkout metadata completeness', () => {
  const compactCartItem = JSON.stringify({
    id: 'canvas-rental',
    d: '2026-08-21',
    t0: '2026-08-21T17:00:00.000Z',
    u: 30,
    off: [0, 1],
  })

  test('rejects an empty or partially parsed declared cart', () => {
    assert.equal(hasCompleteBookingCartMetadata({ totalSessions: '1' }, []), false)

    const metadata = {
      totalSessions: '2',
      cart_0: compactCartItem,
    }
    const parsed = parseBookingCartItems(metadata)

    assert.equal(parsed.length, 1)
    assert.equal(hasCompleteBookingCartMetadata(metadata, parsed), false)
  })

  test('accepts a fully parsed declared cart', () => {
    const metadata = {
      bookingHoldVersion: '1',
      totalSessions: '1',
      cart_0: compactCartItem,
    }
    const parsed = parseBookingCartItems(metadata)

    assert.equal(parsed.length, 1)
    assert.equal(hasCompleteBookingCartMetadata(metadata, parsed), true)
  })

  test('rejects semantically invalid managed hold metadata', () => {
    const candidates = [
      {
        bookingHoldVersion: '1',
        totalSessions: '1',
        cart_0: JSON.stringify({
          id: 'unknown-studio',
          d: '2026-08-21',
          t0: '2026-08-21T17:00:00.000Z',
          u: 30,
          off: [0, 1],
        }),
      },
      {
        bookingHoldVersion: '1',
        totalSessions: '1',
        cart_0: JSON.stringify({
          id: 'canvas-rental',
          d: 'not-a-date',
          t0: '2026-08-21T17:00:00.000Z',
          u: 30,
          off: [0, 1],
        }),
      },
      {
        bookingHoldVersion: '1',
        totalSessions: '1',
        cart_0: JSON.stringify({
          id: 'canvas-rental',
          d: '2026-08-21',
          t0: '2026-08-21T17:15:00.000Z',
          u: 30,
          off: [0, 1],
        }),
      },
      {
        bookingHoldVersion: '1',
        totalSessions: '1',
        cart_0: JSON.stringify({
          id: 'canvas-rental',
          d: '2026-08-21',
          t0: '2026-08-21T17:00:00.000Z',
          u: 30,
          off: [0, 0],
        }),
      },
      {
        bookingHoldVersion: '1',
        totalSessions: '1',
        cart_0: JSON.stringify({
          id: 'canvas-rental',
          d: '2026-08-21',
          t0: '2026-08-21T17:00:00.000Z',
          u: 30,
          off: [0, 1, 100],
        }),
      },
      {
        bookingHoldVersion: '1',
        totalSessions: '1.0',
        cart_0: compactCartItem,
      },
    ]

    for (const metadata of candidates) {
      const parsed = parseBookingCartItems(metadata)
      assert.equal(hasCompleteBookingCartMetadata(metadata, parsed), false)
    }
  })
})

describe('checkout management authorization', () => {
  const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const originalStripeSecret = process.env.STRIPE_SECRET_KEY

  before(() => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_unit_test_only'
    delete process.env.STRIPE_SECRET_KEY
  })

  after(() => {
    if (originalWebhookSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET
    else process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret

    if (originalStripeSecret === undefined) delete process.env.STRIPE_SECRET_KEY
    else process.env.STRIPE_SECRET_KEY = originalStripeSecret
  })

  test('binds cancellation authority to one session and booking reference', () => {
    const token = createCheckoutManagementToken('cs_test_session', 'booking-ref')

    assert.equal(
      verifyCheckoutManagementToken(token, 'cs_test_session', 'booking-ref'),
      true,
    )
    assert.equal(
      verifyCheckoutManagementToken(token, 'cs_test_other', 'booking-ref'),
      false,
    )
    assert.equal(
      verifyCheckoutManagementToken(token, 'cs_test_session', 'other-ref'),
      false,
    )
  })
})

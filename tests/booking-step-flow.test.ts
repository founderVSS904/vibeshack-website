import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  EDITABLE_BOOKING_STEPS,
  bookingStepIsReady,
  stepAfterPrimarySelection,
} from '../lib/booking/step-flow'

describe('booking step flow', () => {
  test('advances an explicit room choice to time and a valid time choice to extras', () => {
    assert.equal(stepAfterPrimarySelection('room'), 'datetime')
    assert.equal(stepAfterPrimarySelection('datetime'), 'extras')
    assert.deepEqual(EDITABLE_BOOKING_STEPS, ['room', 'datetime', 'extras', 'review'])
  })

  test('keeps setup selection out of the Date & Time gate', () => {
    assert.equal(bookingStepIsReady({
      step: 'datetime',
      hasStudio: true,
      hasValidTime: true,
      setupReady: false,
      submitting: false,
    }), true)
    assert.equal(bookingStepIsReady({
      step: 'datetime',
      hasStudio: true,
      hasValidTime: false,
      setupReady: true,
      submitting: false,
    }), false)
  })

  test('requires a room in Step 1 and any required setup in Extras', () => {
    assert.equal(bookingStepIsReady({
      step: 'room',
      hasStudio: false,
      hasValidTime: false,
      setupReady: false,
      submitting: false,
    }), false)
    assert.equal(bookingStepIsReady({
      step: 'room',
      hasStudio: true,
      hasValidTime: false,
      setupReady: false,
      submitting: false,
    }), true)
    assert.equal(bookingStepIsReady({
      step: 'extras',
      hasStudio: true,
      hasValidTime: true,
      setupReady: false,
      submitting: false,
    }), false)
    assert.equal(bookingStepIsReady({
      step: 'extras',
      hasStudio: true,
      hasValidTime: true,
      setupReady: true,
      submitting: false,
    }), true)
  })

  test('keeps Review and payment blocked while submitting or missing a setup', () => {
    for (const step of ['review', 'payment'] as const) {
      assert.equal(bookingStepIsReady({
        step,
        hasStudio: true,
        hasValidTime: true,
        setupReady: false,
        submitting: false,
      }), false)
      assert.equal(bookingStepIsReady({
        step,
        hasStudio: true,
        hasValidTime: true,
        setupReady: true,
        submitting: true,
      }), false)
      assert.equal(bookingStepIsReady({
        step,
        hasStudio: true,
        hasValidTime: true,
        setupReady: true,
        submitting: false,
      }), true)
    }
  })
})

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  bookingHoldCleanupError,
  collectBookingHoldCleanupFailures,
  deleteBookingHoldArtifact,
  runOptimisticBookingHoldCleanup,
} from '../lib/booking/hold-cleanup'

function apiError(status: number, message: string) {
  return Object.assign(new Error(message), { status })
}

function statusOf(error: unknown) {
  return typeof error === 'object' && error && 'status' in error
    ? Number(error.status)
    : 0
}

describe('booking hold cleanup', () => {
  test('attempts every artifact and returns every failure', async () => {
    const attempted: string[] = []
    const artifacts = ['busy-event', 'resource-ledger', 'studio-ledger']

    const failures = await collectBookingHoldCleanupFailures(
      artifacts,
      (artifact) => artifact,
      async (artifact) => {
        attempted.push(artifact)
        if (artifact !== 'resource-ledger') {
          throw new Error(`${artifact} failed`)
        }
      },
    )

    assert.deepEqual(attempted, artifacts)
    assert.deepEqual(
      failures.map(({ target }) => target),
      ['busy-event', 'studio-ledger'],
    )
  })

  test('builds one actionable aggregate error for all failed artifacts', () => {
    const first = new Error('first failure')
    const second = new Error('second failure')
    const error = bookingHoldCleanupError('booking-ref', [
      { target: 'busy event event-1', error: first },
      { target: 'ledger studio on 2026-08-21', error: second },
    ])

    assert.ok(error instanceof AggregateError)
    assert.deepEqual(error.errors, [first, second])
    assert.match(error.message, /booking-ref/)
    assert.match(error.message, /busy event event-1: first failure/)
    assert.match(error.message, /ledger studio on 2026-08-21: second failure/)
  })

  test('treats missing and commit-then-timeout deletes as successful', async () => {
    let missingVerificationCalls = 0
    await deleteBookingHoldArtifact(
      async () => { throw apiError(404, 'already gone') },
      async () => { missingVerificationCalls += 1 },
      statusOf,
    )
    assert.equal(missingVerificationCalls, 0)

    await deleteBookingHoldArtifact(
      async () => { throw apiError(500, 'delete response timed out') },
      async () => { throw apiError(410, 'confirmed gone') },
      statusOf,
    )
  })

  test('reports a delete that still exists or cannot be verified', async () => {
    const timeout = apiError(500, 'delete response timed out')
    await assert.rejects(
      deleteBookingHoldArtifact(
        async () => { throw timeout },
        async () => ({ id: 'still-there' }),
        statusOf,
      ),
      (error) => error === timeout,
    )

    await assert.rejects(
      deleteBookingHoldArtifact(
        async () => { throw timeout },
        async () => { throw apiError(503, 'verification unavailable') },
        statusOf,
      ),
      /deletion could not be verified: verification unavailable/,
    )
  })

  test('retries concurrent ledger updates and verifies ambiguous commits', async () => {
    let updateAttempts = 0
    await runOptimisticBookingHoldCleanup({
      attempts: 3,
      load: async () => ({ released: false }),
      isReleased: (state) => state.released,
      update: async () => {
        updateAttempts += 1
        if (updateAttempts < 3) throw apiError(412, 'etag changed')
      },
      verifyReleased: async () => false,
      statusOf,
      concurrentFailureMessage: 'too many changes',
    })
    assert.equal(updateAttempts, 3)

    let released = false
    await runOptimisticBookingHoldCleanup({
      attempts: 3,
      load: async () => ({ released }),
      isReleased: (state) => state.released,
      update: async () => {
        released = true
        throw apiError(500, 'response timed out after commit')
      },
      verifyReleased: async () => released,
      statusOf,
      concurrentFailureMessage: 'too many changes',
    })
    assert.equal(released, true)
  })

  test('fails after repeated concurrent ledger changes', async () => {
    await assert.rejects(
      runOptimisticBookingHoldCleanup({
        attempts: 2,
        load: async () => ({ released: false }),
        isReleased: (state) => state.released,
        update: async () => { throw apiError(412, 'etag changed') },
        verifyReleased: async () => false,
        statusOf,
        concurrentFailureMessage: 'too many changes',
      }),
      /too many changes/,
    )
  })
})

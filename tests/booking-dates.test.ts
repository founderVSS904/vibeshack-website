import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { bookingDateInPacific, bookingDateRange, bookingStartIsInFuture, getTimeSlotsForDay } from '../lib/booking/time'

describe('Pacific booking civil dates', () => {
  test('includes today for both booking windows without offering yesterday', () => {
    const now = new Date('2026-08-27T13:32:00.000Z')
    for (const count of [45, 60]) {
      const dates = bookingDateRange(count, now)
      assert.equal(dates.length, count)
      assert.equal(dates[0], '2026-08-27')
      assert.equal(dates.includes('2026-08-26'), false)
      assert.equal(new Set(dates).size, count)
    }
  })

  test('uses Pacific midnight rather than UTC midnight or the visitor timezone', () => {
    assert.equal(bookingDateInPacific(new Date('2026-08-28T06:59:59.999Z')), '2026-08-27')
    assert.equal(bookingDateInPacific(new Date('2026-08-28T07:00:00.000Z')), '2026-08-28')
    assert.equal(bookingDateInPacific(new Date('2026-01-01T07:59:59.999Z')), '2025-12-31')
    assert.equal(bookingDateInPacific(new Date('2026-01-01T08:00:00.000Z')), '2026-01-01')
    assert.deepEqual(bookingDateRange(3, new Date('2026-01-01T07:00:00.000Z')), ['2025-12-31', '2026-01-01', '2026-01-02'])
  })

  test('does not skip or duplicate civil dates across either DST transition', () => {
    assert.deepEqual(bookingDateRange(4, new Date('2026-03-07T20:00:00.000Z')), ['2026-03-07', '2026-03-08', '2026-03-09', '2026-03-10'])
    assert.deepEqual(bookingDateRange(4, new Date('2026-10-31T19:00:00.000Z')), ['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03'])
    assert.equal(getTimeSlotsForDay('2026-03-08').length, 46)
    assert.equal(getTimeSlotsForDay('2026-11-01').length, 50)
  })

  test('studio availability permits future slots today but excludes past and current instants', () => {
    const now = new Date('2026-08-27T13:32:00.000Z')
    assert.equal(bookingStartIsInFuture(new Date('2026-08-27T14:00:00.000Z'), now), true)
    assert.equal(bookingStartIsInFuture(new Date('2026-08-27T13:30:00.000Z'), now), false)
    assert.equal(bookingStartIsInFuture(now, now), false)
    assert.equal(bookingStartIsInFuture(new Date('2026-08-26T20:00:00.000Z'), now), false)
    assert.equal(bookingStartIsInFuture(new Date('invalid'), now), false)
  })

  test('same-day tours retain the existing two-hour lead time', () => {
    const now = new Date('2026-08-27T13:32:00.000Z')
    assert.equal(bookingStartIsInFuture(new Date('2026-08-27T15:30:00.000Z'), now, 120), false)
    assert.equal(bookingStartIsInFuture(new Date('2026-08-27T15:32:00.000Z'), now, 120), false)
    assert.equal(bookingStartIsInFuture(new Date('2026-08-27T16:00:00.000Z'), now, 120), true)
  })

  test('future-slot comparison remains instant-based during repeated DST hours', () => {
    const now = new Date('2026-11-01T08:45:00.000Z')
    assert.equal(bookingStartIsInFuture(new Date('2026-11-01T08:30:00.000Z'), now), false)
    assert.equal(bookingStartIsInFuture(new Date('2026-11-01T09:30:00.000Z'), now), true)
  })
})

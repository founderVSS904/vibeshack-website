import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { getTimeSlotsForDay, zonedDateTimeToUtc } from '../lib/booking/time'
import { previewSlots, previewTeleprompterAvailable, type PreviewReservation } from '../lib/employee/preview'
import { employeeResultStatus, findNextEmployeeSession, sessionFits, timePeriod } from '../lib/employee/scheduling-ui'

const date = '2026-09-27'
const now = new Date('2026-09-27T21:59:00Z') // 2:59 PM Pacific
const signal = () => new AbortController().signal
const iso = (hour: number, minute = 0) => zonedDateTimeToUtc(date, hour, minute).toISOString()

describe('employee scheduling shortcuts', () => {
  test('groups slots by Pacific hour, regardless of the computer timezone', () => {
    for (const [hour, expected] of [[0, 'overnight'], [7, 'overnight'], [8, 'morning'], [11, 'morning'], [12, 'afternoon'], [16, 'afternoon'], [17, 'evening'], [21, 'evening'], [22, 'overnight']] as const) {
      assert.equal(timePeriod(zonedDateTimeToUtc(date, hour)), expected)
    }
  })

  test('requires the entire duration and rejects missing, busy, oversized and out-of-day slots', () => {
    const day = getTimeSlotsForDay(date)
    const available = new Set(day.map((slot) => slot.start.toISOString()))
    assert.equal(sessionFits(day, available, 0, 4), true)
    for (const [index, count] of [[-1, 4], [47, 4], [0, 1], [0, 17], [0, 2.5]]) assert.equal(sessionFits(day, available, index, count), false)
    available.delete(day[2].start.toISOString())
    assert.equal(sessionFits(day, available, 0, 4), false)
    assert.equal(sessionFits(day, available, 3, 4), true)
  })

  test('next available respects room turnaround but does not block another studio', async () => {
    const reservations: PreviewReservation[] = [{ ref: 'sample', studioId: 'the-executive', start: iso(15), end: iso(17), teleprompter: true }]
    const executive = await findNextEmployeeSession([date], 4, async (day) => previewSlots(day, 'the-executive', reservations, now), signal(), now)
    const wing = await findNextEmployeeSession([date], 4, async (day) => previewSlots(day, 'the-wing', reservations, now), signal(), now)
    assert.equal(executive?.start, iso(17, 30))
    assert.equal(wing?.start, iso(15))
    assert.equal(previewTeleprompterAvailable(wing!.start, iso(17), reservations), false)
  })

  test('skips past starts even if an availability response marks them available', async () => {
    const result = await findNextEmployeeSession([date], 4, async (day) => previewSlots(day, 'the-executive', [], new Date('2026-01-01')), signal(), now)
    assert.equal(result?.start, iso(15))
  })

  test('advances dates only when necessary and stops at the first fit', async () => {
    const visited: string[] = []
    const result = await findNextEmployeeSession([date, '2026-09-28', '2026-09-29'], 4, async (day) => {
      visited.push(day)
      return previewSlots(day, 'the-executive', [], now).map((slot) => ({ ...slot, available: day !== date }))
    }, signal(), now)
    assert.deepEqual(visited, [date, '2026-09-28'])
    assert.equal(result?.date, '2026-09-28')
    assert.equal(timePeriod(new Date(result!.start)), 'overnight')
  })

  test('reports no fit within the provided window without inventing an opening', async () => {
    assert.equal(await findNextEmployeeSession([date], 4, async () => [], signal(), now), null)
  })

  test('fails closed when a day cannot be verified', async () => {
    let calls = 0
    await assert.rejects(findNextEmployeeSession([date, '2026-09-28'], 4, async () => { calls++; throw new Error('Unverified') }, signal(), now), /Unverified/)
    assert.equal(calls, 1)
  })

  test('cancelled searches do not return a stale selection or continue fetching', async () => {
    const controller = new AbortController()
    let calls = 0
    await assert.rejects(findNextEmployeeSession([date, '2026-09-28'], 4, async (day) => {
      calls++; controller.abort()
      return previewSlots(day, 'the-executive', [], now)
    }, controller.signal, now), { name: 'AbortError' })
    assert.equal(calls, 1)
    await assert.rejects(findNextEmployeeSession([date], 4, async () => { throw new Error('Must not fetch') }, controller.signal, now), { name: 'AbortError' })
  })

  test('DST days retain real consecutive half-hours across the clock change', () => {
    for (const dayString of ['2026-03-08', '2026-11-01']) {
      const day = getTimeSlotsForDay(dayString)
      const available = new Set(day.map((slot) => slot.start.toISOString()))
      assert.equal(sessionFits(day, available, 2, 4), true)
      assert.equal(day[5].start.getTime() - day[2].start.getTime(), 90 * 60_000)
    }
  })
})

describe('employee result status', () => {
  test('does not claim preview payments or email delivery', () => {
    assert.deepEqual(employeeResultStatus('ready', false, true), { reservation: 'Reserved in preview', payment: 'Payment pending (sample)', delivery: 'Nothing sent' })
  })
  test('separates reservation, payment and email-request status', () => {
    assert.deepEqual(employeeResultStatus('ready', true, false), { reservation: 'Studio reserved', payment: 'Payment pending', delivery: 'Email request accepted' })
    assert.equal(employeeResultStatus('reserved', false, false).delivery, 'Email not sent')
    assert.equal(employeeResultStatus('paid', true, false).payment, 'Paid')
    assert.deepEqual(employeeResultStatus('cancelled', true, false), { reservation: 'Cancelled', payment: 'Not payable', delivery: 'Payment link disabled' })
  })
})

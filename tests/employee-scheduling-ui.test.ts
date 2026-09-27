import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { addMinutes, bookingSlotsMatchStartDate, describeSlotRanges, formatTimeRelativeToDate, getBookingWindowForDay, getTimeSlotsForDay, nextDateString, zonedDateTimeToUtc } from '../lib/booking/time'
import { previewSlots, previewTeleprompterAvailable, type PreviewReservation } from '../lib/employee/preview'
import { EMPLOYEE_TIME_PERIODS, employeeRequestSlots, employeeResultStatus, employeeStartSlots, findNextEmployeeSession, loadEmployeeBookingWindow, sessionFits, timePeriod } from '../lib/employee/scheduling-ui'

const date = '2026-09-27'
const now = new Date('2026-09-27T21:59:00Z') // 2:59 PM Pacific
const signal = () => new AbortController().signal
const iso = (hour: number, minute = 0) => zonedDateTimeToUtc(date, hour, minute).toISOString()

describe('employee scheduling shortcuts', () => {
  test('groups slots by Pacific hour, regardless of the computer timezone', () => {
    for (const [hour, expected] of [[0, 'overnight'], [5, 'overnight'], [6, 'morning'], [11, 'morning'], [12, 'afternoon'], [17, 'afternoon'], [18, 'evening'], [21, 'evening'], [23, 'evening']] as const) {
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

describe('24-hour employee sessions', () => {
  test('four visible ranges cover every half-hour exactly once', () => {
    assert.equal(EMPLOYEE_TIME_PERIODS.length, 4)
    const day = getTimeSlotsForDay(date)
    for (const period of EMPLOYEE_TIME_PERIODS) assert.equal(day.filter((slot) => timePeriod(slot.start) === period.id).length, 12)
    assert.equal(new Set(EMPLOYEE_TIME_PERIODS.map(({ id }) => id)).size, 4)
  })

  test('late starts can use a full eight hours without starting on the wrong date', () => {
    const slots = employeeRequestSlots(date, iso(23, 30), 16)!
    assert.equal(slots.length, 16)
    assert.equal(slots.at(-1), zonedDateTimeToUtc('2026-09-28', 7).toISOString())
    assert.equal(bookingSlotsMatchStartDate(date, slots, true), true)
    assert.equal(bookingSlotsMatchStartDate(date, slots), false)
    assert.equal(employeeRequestSlots(date, zonedDateTimeToUtc('2026-09-28', 0).toISOString(), 4), null)
    for (const count of [1, 17, 2.5, NaN]) assert.equal(employeeRequestSlots(date, iso(23), count), null)
    assert.equal(employeeRequestSlots(date, iso(23, 15), 4), null)
    assert.equal(employeeRequestSlots('invalid', iso(23), 4), null)
    assert.equal(bookingSlotsMatchStartDate('2026-09-28', slots, true), false)
  })

  test('next-day end and turnaround dates are explicit, including year boundaries', () => {
    const slots = employeeRequestSlots(date, iso(23), 4)!
    assert.equal(describeSlotRanges(slots), '11:00 PM-1:00 AM (Mon, Sep 28)')
    assert.equal(formatTimeRelativeToDate(addMinutes(new Date(slots.at(-1)!), 60), date), '1:30 AM (Mon, Sep 28)')
    assert.equal(formatTimeRelativeToDate(zonedDateTimeToUtc(date, 17), date), '5:00 PM')
    assert.equal(nextDateString('2026-12-31'), '2027-01-01')
  })

  test('verifies both calendar dates and fails closed on missing or unverified continuation', async () => {
    const visited: string[] = []
    const load = async (day: string) => {
      visited.push(day)
      return { verified: true, slots: previewSlots(day, 'the-executive', [], now).slice(0, getTimeSlotsForDay(day).length) }
    }
    const result = await loadEmployeeBookingWindow(date, load)
    assert.deepEqual(visited, [date, '2026-09-28'])
    assert.equal(result.verified, true)
    assert.equal(result.slots.length, 63)
    assert.equal((await loadEmployeeBookingWindow(date, async (day) => ({ ...await load(day), verified: day === date }))).verified, false)
    assert.deepEqual(await loadEmployeeBookingWindow(date, async (day) => ({ ...await load(day), slots: [] })), { verified: false, slots: [] })
  })

  test('search finds an overnight session starting today, but does not mislabel tomorrow as today', async () => {
    const lateNow = zonedDateTimeToUtc(date, 22, 59)
    const result = await findNextEmployeeSession([date], 4, async (day) => previewSlots(day, 'the-executive', [], lateNow), signal(), lateNow)
    assert.equal(result?.start, iso(23))
    const afterLastStart = zonedDateTimeToUtc(date, 23, 45)
    assert.equal(await findNextEmployeeSession([date], 4, async (day) => previewSlots(day, 'the-executive', [], afterLastStart), signal(), afterLastStart), null)
  })

  test('preview blocks the room through next-day turnaround and equipment only for paid time', () => {
    const nextIso = (hour: number, minute = 0) => zonedDateTimeToUtc('2026-09-28', hour, minute).toISOString()
    const reservations = [{ ref: 'overnight', studioId: 'the-executive', start: iso(23), end: nextIso(1), teleprompter: true }]
    const room = previewSlots('2026-09-28', 'the-executive', reservations, now)
    assert.equal(room.find((slot) => slot.time === nextIso(1))?.available, false)
    assert.equal(room.find((slot) => slot.time === nextIso(1, 30))?.available, true)
    assert.equal(previewSlots('2026-09-28', 'the-wing', reservations, now)[0].available, true)
    assert.equal(previewTeleprompterAvailable(nextIso(0), nextIso(2), reservations), false)
    assert.equal(previewTeleprompterAvailable(nextIso(1), nextIso(2), reservations), true)
    const window = getBookingWindowForDay(date)
    const available = new Set(previewSlots(date, 'the-executive', reservations, now).filter((slot) => slot.available).map((slot) => slot.time))
    assert.equal(sessionFits(window, available, 44, 4), false)
  })

  test('midnight continuation preserves actual duration on both DST transitions', () => {
    for (const day of ['2026-03-07', '2026-03-08', '2026-10-31', '2026-11-01']) {
      const slots = employeeRequestSlots(day, zonedDateTimeToUtc(day, 23, 30).toISOString(), 16)!
      assert.equal(slots.length, 16)
      assert.equal(Date.parse(slots.at(-1)!) - Date.parse(slots[0]), 15 * 30 * 60_000)
      assert.equal(bookingSlotsMatchStartDate(day, slots, true), true)
      assert.equal(getBookingWindowForDay(day).length, getTimeSlotsForDay(day).length + 15)
    }
  })

  test('time buttons stay on the start date and distinguish repeated daylight-saving hours', () => {
    const normal = employeeStartSlots(date, getBookingWindowForDay(date))
    assert.equal(normal.length, 48)
    assert.equal(normal[0].label, '12:00 AM')
    assert.equal(normal.at(-1)?.label, '11:30 PM')
    const fallback = employeeStartSlots('2026-11-01', getBookingWindowForDay('2026-11-01'))
    assert.equal(fallback.length, 50)
    assert.deepEqual(fallback.filter((slot) => slot.clock === '1:00 AM').map((slot) => slot.label), ['1:00 AM PDT', '1:00 AM PST'])
    assert.equal(employeeStartSlots('2026-03-08', getBookingWindowForDay('2026-03-08')).length, 46)
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

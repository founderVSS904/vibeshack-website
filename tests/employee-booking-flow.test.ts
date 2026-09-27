import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import { canContinueEmployeeStep, canVisitEmployeeStep, EMPLOYEE_BOOKING_STEPS } from '../lib/employee/booking-flow'

describe('employee booking steps', () => {
  test('has exactly three focused steps with the full review last', () => {
    assert.deepEqual(EMPLOYEE_BOOKING_STEPS.map((step) => step.label), ['Session', 'Setup & extras', 'Client & review'])
  })

  test('session proceeds only with a verified full-duration time and does not require setup yet', () => {
    assert.equal(canContinueEmployeeStep(1, false, false, false), false)
    assert.equal(canContinueEmployeeStep(1, true, false, false), true)
  })

  test('setup requires both a valid session and setup/equipment checks before review', () => {
    assert.equal(canContinueEmployeeStep(2, true, false, false), false)
    assert.equal(canContinueEmployeeStep(2, false, true, false), false)
    assert.equal(canContinueEmployeeStep(2, true, true, false), true)
    assert.equal(canContinueEmployeeStep(3, true, true, false), false)
  })

  test('progress does not skip steps that have not been reached', () => {
    assert.equal(canVisitEmployeeStep(1, 2, 1, true, true, false), false)
    assert.equal(canVisitEmployeeStep(1, 3, 1, true, true, false), false)
    assert.equal(canVisitEmployeeStep(2, 3, 2, true, true, false), false)
  })

  test('staff can go back to repair a lost time or unavailable add-on', () => {
    assert.equal(canVisitEmployeeStep(3, 2, 3, false, false, false), true)
    assert.equal(canVisitEmployeeStep(3, 1, 3, false, false, false), true)
    assert.equal(canVisitEmployeeStep(2, 1, 2, false, false, false), true)
  })

  test('previously visited review is gated again after session or equipment changes', () => {
    assert.equal(canVisitEmployeeStep(1, 3, 3, false, true, false), false)
    assert.equal(canVisitEmployeeStep(1, 3, 3, true, false, false), false)
    assert.equal(canVisitEmployeeStep(2, 3, 3, true, false, false), false)
    assert.equal(canVisitEmployeeStep(1, 2, 3, true, false, false), true)
    assert.equal(canVisitEmployeeStep(1, 3, 3, true, true, false), true)
  })

  test('an uncertain, busy or completed reservation locks navigation for idempotent retry', () => {
    for (const current of [1, 2, 3] as const) {
      assert.equal(canContinueEmployeeStep(current, true, true, true), false)
      for (const target of [1, 2, 3] as const) assert.equal(canVisitEmployeeStep(current, target, 3, true, true, true), false)
    }
  })

  test('page enforces final-step submission and keeps draft fields outside mounted step panels', () => {
    const source = readFileSync(new URL('../app/employee/EmployeeBookingPage.tsx', import.meta.url), 'utf8')
    assert.match(source, /if \(step !== 3 \|\| submitLock\.current/)
    for (const field of ['name', 'clientEmail', 'phone', 'notes', 'setupId', 'addOnIds', 'platform', 'studioId', 'date', 'start', 'count']) {
      assert.ok(source.indexOf(`const [${field},`) < source.indexOf('return <>'), field)
    }
    const navigation = source.slice(source.indexOf('function visitStep'), source.indexOf('function focusSection'))
    assert.doesNotMatch(navigation, /setName\(|setClientEmail\(|setPhone\(|setNotes\(|setSetupId\(|setAddOnIds\(|setPlatform\(|setStart\(/)
    assert.match(navigation, /setReachedStep/)
    assert.match(source, /setStep\(1\); setReachedStep\(1\)/)
    assert.equal((source.match(/<EmployeeBookingSubmit /g) || []).length, 1)
  })
})

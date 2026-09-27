import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { EmployeeBookingProgress, EmployeeBookingSubmit, EmployeeSelect, EmployeeSessionDetails, EmployeeSessionRecap, EmployeeSetupPicker, EmployeeStepPanel } from '../app/employee/EmployeeBookingUI'
import { EXECUTIVE_SETUPS, WING_SETUPS } from '../lib/booking/studio-setups'
import EmployeeBookingPage from '../app/employee/EmployeeBookingPage'

Object.assign(globalThis, { React })

describe('employee booking presentation', () => {
  test('styles a real native select without replacing its accessibility or validation', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSelect, {
      'aria-label': 'Session length', required: true, disabled: true, value: 4, onChange: () => {},
    }, createElement('option', { value: 2 }, '1 hour'), createElement('option', { value: 4 }, '2 hours')))
    assert.match(html, /employee-select--default/)
    assert.match(html, /<select aria-label="Session length" required="" disabled="">/)
    assert.match(html, /<option value="4" selected="">2 hours<\/option>/)
    assert.match(html, /aria-hidden="true" focusable="false"/)
    assert.doesNotMatch(html, /<button|role="combobox"/)
  })

  test('keeps date, time, duration, setup, price and add-ons in separate readable rows', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSessionDetails, {
      date: 'Sun, Sep 27', time: '3:00 PM – 5:00 PM', duration: '2 hours',
      setup: '2 black office chairs with desk', rate: '$300/hr',
      addOns: [{ id: 'teleprompter', name: 'Teleprompter', price: '$50' }, { id: 'remote-podcast', name: 'Remote podcast', price: 'Included' }],
    }))
    assert.equal((html.match(/<dt>/g) || []).length, 7)
    assert.equal((html.match(/<dd>/g) || []).length, 7)
    for (const text of ['Date', 'Time', 'Duration', 'Setup', 'Studio rate', 'Sun, Sep 27', '3:00 PM – 5:00 PM', '2 hours', '$300/hr', 'Teleprompter', '$50', 'Included']) assert.ok(html.includes(text), text)
    assert.equal((html.match(/aria-hidden="true"/g) || []).length, 7)
  })

  test('retains employee-specific controls and rules while using clear calendar labels', () => {
    const html = renderToStaticMarkup(createElement(EmployeeBookingPage, { email: '', preview: true, enabled: true }))
    for (const day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) assert.ok(html.includes(`>${day}</span>`), day)
    assert.match(html, /aria-label="Previous month"/)
    assert.match(html, /aria-label="Next month"/)
    assert.match(html, /aria-current="date"/)
    assert.match(html, /role="group" aria-label="Available start times"/)
    assert.match(html, /employee-select--studio/)
    assert.match(html, /aria-label="Session length"/)
    assert.match(html, /30 minutes after the session/)
    assert.match(html, /Continue to setup/)
    assert.doesNotMatch(html, /type="submit"/)
    assert.doesNotMatch(html, /autoComplete="name"|autoComplete="email"/)
    assert.doesNotMatch(html, /name="studio-setup"|Optional extras|Final review/)
    assert.equal((html.match(/aria-label="Session length"/g) || []).length, 1)
    assert.doesNotMatch(html, /One session at a time across all podcast studios/)
  })

  test('exposes quick dates and time groups with a compact summary on the first step', () => {
    const html = renderToStaticMarkup(createElement(EmployeeBookingPage, { email: '', preview: true, enabled: true }))
    for (const text of ['Today', 'Tomorrow', 'Next available', 'Morning', 'Afternoon', 'Evening', 'Overnight hours', 'Show unavailable']) assert.ok(html.includes(text), text)
    assert.match(html, /aria-label="Quick date selection"/)
    assert.match(html, /aria-label="Time of day"/)
    assert.match(html, /aria-label="Session at a glance"/)
    assert.match(html, /id="employee-search-message" role="status"/)
    assert.match(html, /aria-describedby="employee-session-help"/)
  })

  test('setup photos use native required radios with a single selection and real catalog assets', () => {
    for (const options of [EXECUTIVE_SETUPS, WING_SETUPS]) {
      const html = renderToStaticMarkup(createElement(EmployeeSetupPicker, { options, value: options[1].id, onChange: () => {} }))
      assert.equal((html.match(/type="radio"/g) || []).length, options.length)
      assert.equal((html.match(/checked=""/g) || []).length, 1)
      assert.equal((html.match(/required=""/g) || []).length, options.length)
      assert.match(html, /<legend>Studio setup<\/legend>/)
      for (const option of options) assert.ok(html.includes(option.label), option.label)
      assert.match(html, /studio-setups/)
      assert.doesNotMatch(html, /<select/)
    }
  })

  test('inactive steps are unmounted, not merely visually hidden required controls', () => {
    const requiredField = createElement('input', { type: 'email', required: true, name: 'client-email' })
    assert.equal(renderToStaticMarkup(createElement(EmployeeStepPanel, { active: 1, step: 3 }, requiredField)), '')
    assert.equal(renderToStaticMarkup(createElement(EmployeeStepPanel, { active: 2, step: 3 }, requiredField)), '')
    assert.match(renderToStaticMarkup(createElement(EmployeeStepPanel, { active: 3, step: 3 }, requiredField)), /type="email" required=""/)
  })

  test('progress marks the current step and disables unreached steps without submitting', () => {
    const html = renderToStaticMarkup(createElement(EmployeeBookingProgress, { step: 1, canVisit: (step) => step === 1, onVisit: () => {} }))
    assert.match(html, /aria-label="Booking steps"/)
    assert.equal((html.match(/aria-current="step"/g) || []).length, 1)
    assert.equal((html.match(/disabled=""/g) || []).length, 2)
    assert.equal((html.match(/type="button"/g) || []).length, 3)
    assert.doesNotMatch(html, /type="submit"/)
  })

  test('production action describes the real side effects while preview action stays explicitly simulated', () => {
    const props = { busy: false, attempted: false, disabled: false, help: 'No payment collected now.' }
    const production = renderToStaticMarkup(createElement(EmployeeBookingSubmit, { ...props, preview: false }))
    assert.match(production, /Reserve &amp; send payment link/)
    assert.doesNotMatch(production, /Create preview booking/)
    const preview = renderToStaticMarkup(createElement(EmployeeBookingSubmit, { ...props, preview: true }))
    assert.match(preview, /Create preview booking/)
    const retry = renderToStaticMarkup(createElement(EmployeeBookingSubmit, { ...props, attempted: true, preview: false }))
    assert.match(retry, /Retry this booking/)
    const disabled = renderToStaticMarkup(createElement(EmployeeBookingPage, { email: '', enabled: false }))
    assert.match(disabled, /Employee booking is not activated yet/)
  })

  test('later steps use a small text recap without repeating the room photo or full pricing', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSessionRecap, { studio: 'The Executive', date: 'Sun, Sep 27', time: '3:00 PM – 5:00 PM', duration: '2 hours', onEdit: () => {}, locked: false }))
    for (const text of ['The Executive', 'Sun, Sep 27', '3:00 PM – 5:00 PM', '2 hours', 'Change session']) assert.ok(html.includes(text))
    assert.doesNotMatch(html, /<img|type="submit"|Final review/)
    const locked = renderToStaticMarkup(createElement(EmployeeSessionRecap, { studio: 'The Executive', date: 'Sun, Sep 27', time: '3:00 PM – 5:00 PM', duration: '2 hours', onEdit: () => {}, locked: true }))
    assert.match(locked, /disabled=""/)
  })
})

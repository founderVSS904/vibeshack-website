import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { EmployeeMobileReview, EmployeeSelect, EmployeeSessionDetails, EmployeeSetupPicker } from '../app/employee/EmployeeBookingUI'
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
    assert.match(html, /Only this studio is reserved/)
    assert.match(html, /30 minutes after the session/)
    assert.match(html, /Create preview booking/)
    assert.match(html, /autoComplete="name"/)
    assert.match(html, /autoComplete="email"/)
    assert.doesNotMatch(html, /One session at a time across all podcast studios/)
  })

  test('exposes quick dates, time groups and edit shortcuts without replacing the calendar', () => {
    const html = renderToStaticMarkup(createElement(EmployeeBookingPage, { email: '', preview: true, enabled: true }))
    for (const text of ['Today', 'Tomorrow', 'Next available', 'Morning', 'Afternoon', 'Evening', 'Overnight hours', 'Show unavailable', 'Edit time', 'Edit extras', 'Edit client']) assert.ok(html.includes(text), text)
    assert.match(html, /aria-label="Quick date selection"/)
    assert.match(html, /aria-label="Time of day"/)
    assert.match(html, /aria-label="Review your session"/)
    assert.match(html, /id="employee-search-message" role="status"/)
    assert.match(html, /aria-describedby="employee-next-action"/)
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

  test('teleprompter rate is visible before a start time is chosen and its availability remains disabled', () => {
    const html = renderToStaticMarkup(createElement(EmployeeBookingPage, { email: '', preview: true, enabled: true }))
    assert.match(html, /type="checkbox" disabled=""\/><span><strong>Teleprompter<\/strong><small>\$50\/session<\/small>/)
    assert.match(html, /Choose a time to check/)
    assert.match(html, /Studio · /)
    assert.match(html, /Use sample client details/)
  })

  test('mobile review is a navigation button, never a second booking submission', () => {
    const html = renderToStaticMarkup(createElement(EmployeeMobileReview, { total: '$800', detail: 'Sun, Sep 27', onReview: () => {} }))
    assert.match(html, /role="region" aria-label="Booking review shortcut"/)
    assert.match(html, /<button type="button"/)
    assert.match(html, /Review booking/)
    assert.match(html, /\$800/)
    assert.doesNotMatch(html, /type="submit"/)
  })

  test('production action describes the real side effects while preview action stays explicitly simulated', () => {
    const production = renderToStaticMarkup(createElement(EmployeeBookingPage, { email: 'staff@example.test', enabled: true }))
    assert.match(production, /Reserve &amp; send payment link/)
    assert.doesNotMatch(production, /Create preview booking/)
    const disabled = renderToStaticMarkup(createElement(EmployeeBookingPage, { email: '', enabled: false }))
    assert.match(disabled, /Employee booking is not activated yet/)
  })
})

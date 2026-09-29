import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { EmployeeBookingProgress, EmployeeBookingSubmit, EmployeePaymentPicker, EmployeeSelect, EmployeeSessionDetails, EmployeeSessionRecap, EmployeeSetupPicker, EmployeeStepPanel } from '../app/employee/EmployeeBookingUI'
import { EXECUTIVE_SETUPS, WING_SETUPS } from '../lib/booking/studio-setups'
import { employeePaymentInput } from '../lib/employee/booking'
import { EMPLOYEE_PAYMENT_DRAFT, employeePaymentReady, employeePaymentRequest, type EmployeePaymentDraft } from '../lib/employee/payment'
import { employeeResultMessage, employeeResultStatus } from '../lib/employee/scheduling-ui'
import EmployeeBookingPage from '../app/employee/EmployeeBookingPage'
import EmployeeHeader from '../app/employee/EmployeeHeader'

Object.assign(globalThis, { React })

describe('employee booking presentation', () => {
  test('preview account disclosure never offers authenticated actions or claims an employee identity', () => {
    const html = renderToStaticMarkup(createElement(EmployeeHeader, { email: 'unused@example.com', preview: true }))
    assert.match(html, /Local preview/)
    assert.match(html, /No employee account is signed in/)
    assert.match(html, /href="\/employee\/?"/)
    assert.doesNotMatch(html, /unused@example.com|Sign out|<form|\/api\/employee\//)
    assert.match(html, /href="\/" target="_blank" rel="noopener noreferrer"/)
  })

  test('authenticated account sign-out retains the existing POST endpoint outside the booking form', () => {
    const html = renderToStaticMarkup(createElement(EmployeeBookingPage, { email: 'staff@example.com', enabled: false }))
    assert.match(html, /staff@example.com/)
    assert.match(html, /<form action="\/api\/employee\/auth\/logout" method="post">/)
    assert.equal((html.match(/Sign out/g) || []).length, 1)
    assert.ok(html.indexOf('</header>') < html.indexOf('class="employee-booking-grid'))
    assert.doesNotMatch(html, /Local preview|No employee account is signed in/)
  })

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
    for (const text of ['Today', 'Tomorrow', 'Next available', 'Night', 'Morning', 'Afternoon', 'Evening', '12 AM–6 AM', '6 AM–12 PM', '12 PM–6 PM', '6 PM–12 AM', 'Open 24 hours', 'Choose the date your session starts.', 'Show unavailable']) assert.ok(html.includes(text), text)
    assert.doesNotMatch(html, /Overnight hours|Daytime hours/)
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

describe('employee payment choice', () => {
  const draft = (patch: Partial<EmployeePaymentDraft> = {}): EmployeePaymentDraft => ({ ...EMPLOYEE_PAYMENT_DRAFT, ...patch })
  const picker = (value: EmployeePaymentDraft, superadmin = false) => renderToStaticMarkup(createElement(EmployeePaymentPicker, { draft: value, superadmin, onChange: () => {} }))
  const source = () => readFileSync(new URL('../app/employee/EmployeeBookingPage.tsx', import.meta.url), 'utf8')

  test('employees get three native radio cards with the website invoice selected by default', () => {
    const html = picker(EMPLOYEE_PAYMENT_DRAFT)
    assert.equal((html.match(/type="radio" name="payment-mode"/g) || []).length, 3)
    assert.equal((html.match(/checked=""/g) || []).length, 1)
    assert.match(html, /checked="" value="stripe"/)
    assert.match(html, /role="radiogroup" aria-labelledby="employee-payment-heading"/)
    assert.match(html, /<h2 id="employee-payment-heading">Payment<\/h2>/)
    for (const text of ['Send payment link', 'The client gets an invoice by email from the website.', 'We’ll bill them', 'Nothing is sent to the client. Mark it paid when the money arrives.', 'Already paid', 'Record how they paid. Nothing is sent to the client.']) assert.ok(html.includes(text), text)
    assert.doesNotMatch(html, /No charge|value="none"|<select|How they paid/)
  })

  test('only a superadmin is offered No charge', () => {
    const html = picker(draft({ mode: 'none' }), true)
    assert.equal((html.match(/type="radio"/g) || []).length, 4)
    assert.match(html, /checked="" value="none"/)
    assert.ok(html.includes('For partner or internal sessions. Nothing to pay.'))
    assert.ok(html.indexOf('value="prepaid"') < html.indexOf('value="none"'))
  })

  test('Already paid requires a method with no preselected value and keeps the note optional and bounded', () => {
    const html = picker(draft({ mode: 'prepaid' }))
    assert.match(html, /How they paid<span class="employee-select employee-select--default"><select aria-label="How they paid" required="">/)
    assert.match(html, /<option value="" disabled="" selected="">Choose a method<\/option>/)
    assert.deepEqual([...html.matchAll(/<option value="([a-z]+)">([^<]+)<\/option>/g)].map((match) => `${match[1]}:${match[2]}`), ['cash:Cash', 'zelle:Zelle', 'venmo:Venmo', 'card:Card', 'bank:Bank transfer', 'check:Check', 'other:Other'])
    assert.match(html, /Payment note <span class="employee-optional">Optional<\/span><input placeholder="Zelle confirmation 1234" maxLength="200" value=""\/>/)
    assert.match(picker(draft({ mode: 'prepaid', method: 'zelle', note: 'Ref 12' })), /<option value="zelle" selected="">Zelle<\/option>/)
    assert.equal(employeePaymentReady(draft({ mode: 'prepaid' })), false)
    assert.equal(employeePaymentReady(draft({ mode: 'prepaid', method: 'bogus' as never })), false)
    assert.equal(employeePaymentReady(draft({ mode: 'prepaid', method: 'zelle' })), true)
    for (const mode of ['stripe', 'external', 'none'] as const) assert.equal(employeePaymentReady(draft({ mode })), true, mode)
  })

  test('each choice sends exactly the payment field the server accepts', () => {
    const cases: Array<[EmployeePaymentDraft, object]> = [
      [draft(), { mode: 'stripe' }],
      [draft({ mode: 'external', method: 'cash', note: 'left from Already paid' }), { mode: 'external' }],
      [draft({ mode: 'none', method: 'zelle', note: 'x' }), { mode: 'none' }],
      [draft({ mode: 'prepaid', method: 'zelle', note: '   ' }), { mode: 'prepaid', method: 'zelle' }],
      [draft({ mode: 'prepaid', method: 'bank', note: '  Wire 55  ' }), { mode: 'prepaid', method: 'bank', note: 'Wire 55' }],
    ]
    for (const [value, expected] of cases) {
      const payload = employeePaymentRequest(value)
      assert.deepEqual(payload, expected)
      assert.deepEqual(employeePaymentInput(JSON.parse(JSON.stringify(payload))), expected)
    }
    assert.throws(() => employeePaymentInput(employeePaymentRequest(draft({ mode: 'prepaid' }))), /Choose how the client already paid/)
  })

  test('the primary button names what happens for the chosen payment', () => {
    const props = { busy: false, attempted: false, disabled: false, help: '', preview: false }
    const label = (mode?: EmployeePaymentDraft['mode'], patch = {}) => renderToStaticMarkup(createElement(EmployeeBookingSubmit, { ...props, ...patch, mode })).replace(/<[^>]+>/g, '|').split('|').filter(Boolean)[0]
    assert.equal(label(), 'Reserve &amp; send payment link')
    assert.equal(label('stripe'), 'Reserve &amp; send payment link')
    assert.equal(label('external'), 'Reserve studio')
    assert.equal(label('prepaid'), 'Reserve as paid')
    assert.equal(label('none'), 'Reserve at no charge')
    for (const mode of ['external', 'prepaid', 'none'] as const) {
      assert.equal(label(mode, { preview: true }), 'Create preview booking')
      assert.equal(label(mode, { busy: true }), 'Creating reservation…')
      assert.equal(label(mode, { attempted: true }), 'Retry this booking')
    }
  })

  test('the result says what happened for each choice and only the invoice reports an email', () => {
    assert.deepEqual(employeeResultMessage('ready', true, false, 'stripe', 'client@example.invalid'), { title: 'Studio reserved.', detail: 'Stripe accepted the email request for client@example.invalid. Delivery to their inbox is not confirmed here.' })
    assert.equal(employeeResultMessage('ready', false, false, 'external').title, 'Reserved. Nothing was sent to the client.')
    assert.equal(employeeResultMessage('paid', false, false, 'prepaid').title, 'Reserved and marked paid.')
    assert.equal(employeeResultMessage('paid', false, false, 'none').title, 'Reserved at no charge.')
    for (const mode of ['stripe', 'external', 'prepaid', 'none'] as const) assert.equal(employeeResultMessage(mode === 'stripe' || mode === 'external' ? 'ready' : 'paid', false, true, mode).title, 'Preview booking created.')
    assert.doesNotMatch(employeeResultMessage('cancelled', false, false, 'external').detail, /payment link/)
    assert.match(employeeResultMessage('cancelled', true, false, 'stripe').detail, /payment link is no longer payable/)
    assert.deepEqual(employeeResultStatus('ready', true, false, 'stripe', 'Payment link sent'), { reservation: 'Studio reserved', payment: 'Payment link sent', delivery: 'Email request accepted' })
    assert.deepEqual(employeeResultStatus('ready', false, false, 'external', 'Awaiting payment'), { reservation: 'Studio reserved', payment: 'Awaiting payment', delivery: 'Nothing sent' })
    assert.deepEqual(employeeResultStatus('paid', false, false, 'prepaid', 'Paid by Zelle'), { reservation: 'Studio reserved', payment: 'Paid by Zelle', delivery: 'Nothing sent' })
    assert.deepEqual(employeeResultStatus('paid', false, true, 'none', 'No charge'), { reservation: 'Reserved in preview', payment: 'No charge', delivery: 'Nothing sent' })
    assert.deepEqual(employeeResultStatus('cancelled', false, false, 'external', 'Cancelled'), { reservation: 'Cancelled', payment: 'Not payable', delivery: 'Nothing sent' })
  })

  test('the booking page sends the choice, locks it during a retry and copies a link only for the invoice', () => {
    const page = source()
    assert.match(page, /customer: \{ name, email: clientEmail, phone \}, notes, payment: employeePaymentRequest\(payment\) \}\)/)
    const fieldset = page.indexOf('<fieldset disabled={locked}')
    assert.ok(fieldset > 0 && fieldset < page.indexOf('<EmployeePaymentPicker') && page.indexOf('<EmployeePaymentPicker') < page.indexOf('</fieldset>'))
    assert.match(page, /<EmployeePaymentPicker draft=\{payment\} superadmin=\{role === 'superadmin'\} onChange=\{setPayment\} \/>/)
    assert.match(page, /employeePaymentReady\(payment\) && enabled/)
    assert.match(page, /\{invoice && result\.paymentUrl && result\.phase !== 'cancelled' && <button/)
    assert.match(page, /\{paymentMode === 'none' && <p className="employee-total-note">No charge\. The total is shown for reference only\.<\/p>\}/)
    assert.match(page.slice(page.indexOf('function newBooking'), page.indexOf('return <>')), /setPayment\(EMPLOYEE_PAYMENT_DRAFT\)/)
    assert.doesNotMatch(page, /Payment link sent automatically|secure Stripe invoice/)
  })

  test('the preview may show every choice because its workspace already shows superadmin pages', () => {
    const preview = readFileSync(new URL('../app/employee/preview/page.tsx', import.meta.url), 'utf8')
    assert.match(preview, /if \(!localEmployeePreview\(\)\) notFound\(\)/)
    assert.match(preview, /<EmployeeBookingPage email="Local preview" role="superadmin" preview enabled \/>/)
    const book = readFileSync(new URL('../app/employee/book/page.tsx', import.meta.url), 'utf8')
    assert.match(book, /role=\{session\.role\}/)
  })
})

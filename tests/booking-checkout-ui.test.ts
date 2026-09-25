import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import BookingContactFields from '../components/BookingContactFields'
import BookingReviewCard, { bookingDisplayPrice } from '../components/BookingReviewCard'
import { priceBookingAddOns } from '../lib/booking/add-ons'

const summaryProps = {
  studioName: 'Canvas Podcast', image: '/studio-images/canvas.webp', imageAlt: 'Canvas Podcast',
  dateLabel: 'Saturday, September 26, 2026', timeRange: '10:00 AM to 12:00 PM',
  durationLabel: '2 hours', hourlyRate: 400, sessionSubtotal: 800,
  addOns: priceBookingAddOns(['live-switching', 'remote-podcast'], 4, 'Zoom'),
  recurringLabel: 'Every week', discountAmount: 80, total: 870, requiresSetup: false,
  disabled: false, onEditTime: () => {}, onEditExtras: () => {},
}

describe('polished checkout presentation', () => {
  test('gives date, time and duration their own full-width details', () => {
    const html = renderToStaticMarkup(createElement(BookingReviewCard, summaryProps))
    assert.match(html, /aria-labelledby="session-summary-heading"/)
    assert.match(html, />Date<\/dt><dd[^>]*>Saturday, September 26, 2026<\/dd>/)
    assert.match(html, />Time<\/dt><dd[^>]*>10:00 AM to 12:00 PM<\/dd>/)
    assert.match(html, /2 hours · Pacific time/)
    assert.match(html, /Edit date &amp; time/)
  })

  test('displays all canonical extras, the no-charge platform, discount and total', () => {
    const html = renderToStaticMarkup(createElement(BookingReviewCard, summaryProps))
    for (const text of ['Live switching', '$150', 'Remote podcast (Zoom)', 'No charge', '−$80', '$870', 'Session total']) {
      assert.ok(html.includes(text), text)
    }
    assert.match(html, /covers this session only/)
    assert.equal(bookingDisplayPrice(112.5), '$112.50')
    assert.equal(bookingDisplayPrice(1000), '$1,000')
  })

  test('preserves setup selection and disables edits while checkout is preparing', () => {
    const html = renderToStaticMarkup(createElement(BookingReviewCard, {
      ...summaryProps, requiresSetup: true, setupLabel: 'Two black office chairs with desk', disabled: true,
    }))
    assert.match(html, /Two black office chairs with desk/)
    assert.match(html, /object-contain/)
    assert.equal((html.match(/disabled=""/g) || []).length, 3)
    const withoutSetup = renderToStaticMarkup(createElement(BookingReviewCard, summaryProps))
    assert.doesNotMatch(withoutSetup, /Change setup/)
  })

  test('keeps an edit path for studio-only bookings without inventing extras or savings', () => {
    const html = renderToStaticMarkup(createElement(BookingReviewCard, {
      ...summaryProps, addOns: [], recurringLabel: undefined, discountAmount: 0, total: 800,
    }))
    assert.match(html, /Edit extras/)
    assert.doesNotMatch(html, /No charge|Studio-time savings|Live switching/)
  })

  test('uses associated labels, standard autofill, mobile keyboards and native required fields', () => {
    const props = { name: '', email: '', phone: '', disabled: false, onNameChange: () => {}, onEmailChange: () => {}, onPhoneChange: () => {} }
    const html = renderToStaticMarkup(createElement(BookingContactFields, props))
    for (const id of ['detail-full-name', 'detail-email', 'detail-phone']) assert.ok(html.includes('for="' + id + '"'))
    for (const value of ['name', 'email', 'tel']) assert.ok(html.includes('autoComplete="' + value + '"'))
    assert.match(html, /name="email" type="email"[^>]*inputMode="email"/)
    assert.match(html, /name="phone" type="tel"[^>]*inputMode="tel"/)
    assert.equal((html.match(/required=""/g) || []).length, 2)
    assert.equal((renderToStaticMarkup(createElement(BookingContactFields, { ...props, disabled: true })).match(/disabled=""/g) || []).length, 3)
    assert.match(html, /text-base/)
  })

  test('makes payment wording honest while preserving native form validation and checkout guards', () => {
    const source = readFileSync(new URL('../app/book/BookPageClient.tsx', import.meta.url), 'utf8')
    assert.doesNotMatch(source, /Lock In Session|Lock it in/)
    assert.match(source, /Continue to payment/)
    assert.match(source, /form\?\.requestSubmit\(\)/)
    assert.match(source, /if \(checkoutCreatingRef.current\) return/)
    assert.match(source, /onSubmit={handlePay}/)
  })
})

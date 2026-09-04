import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import SupportPage from '../app/support/page'
import TermsPage from '../app/terms/page'
import ProfessionalTermsPage from '../app/terms-professional/page'
import { business, externalProfiles, peerspaceListings } from '../lib/seo/site'
import { BOOKING_CONFIRMATION_SUMMARY, RECURRING_BOOKING_SUMMARY, SINGLE_SESSION_BOOKING_SUMMARY } from '../lib/booking/public-policy'

Object.assign(globalThis, { React })

describe('current public booking policy', () => {
  test('support schema and visible copy describe single-session checkout and requested recurring dates', () => {
    const html = renderToStaticMarkup(React.createElement(SupportPage))
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map((match) => JSON.parse(match[1]))
    const faq = schemas.find((schema) => schema['@type'] === 'FAQPage')
    const answer = (question: string) => faq.mainEntity.find((item: { name: string }) => item.name === question).acceptedAnswer.text
    assert.equal(answer('Can I book multiple sessions at once?'), SINGLE_SESSION_BOOKING_SUMMARY)
    assert.equal(answer('Can I set up a recurring booking?'), RECURRING_BOOKING_SUMMARY)
    assert.ok(answer('How do I book a studio?').includes(BOOKING_CONFIRMATION_SUMMARY))
    assert.doesNotMatch(html, /Confirmation is instant|lock in your slot|multiple studios and time slots to a single order/)
  })

  test('canonical terms carry the same booking facts under the shared main landmark', () => {
    const html = renderToStaticMarkup(React.createElement(TermsPage)).replace(/&#x27;/g, "'")
    for (const summary of [BOOKING_CONFIRMATION_SUMMARY, RECURRING_BOOKING_SUMMARY, SINGLE_SESSION_BOOKING_SUMMARY]) {
      assert.ok(html.includes(summary))
    }
    assert.doesNotMatch(html, /<main|moment payment is processed|full recurring period|does NOT provide/)
  })

  test('legacy professional terms permanently redirect to the canonical policy', () => {
    assert.throws(() => ProfessionalTermsPage(), (error) => {
      return error instanceof Error && 'digest' in error && String(error.digest).includes('/terms/;308;')
    })
  })

  test('the retired photo/video rental is absent from public listing and identity data', () => {
    const publicData = JSON.stringify({ peerspaceListings, externalProfiles, sameAs: business.sameAs })
    assert.doesNotMatch(publicData, /696b13947d5d350c77c56c90|\$75\/hr|Photo & Video Studio with HMU/)
    assert.ok(peerspaceListings.some((listing) => listing.serviceType === 'White Cyc Studio Rental'))
  })
})

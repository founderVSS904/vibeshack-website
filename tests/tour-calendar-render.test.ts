import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import TourBookingForm from '../app/tour/TourBookingForm'

Object.assign(globalThis, { React })

describe('tour calendar prerender', () => {
  test('does not freeze a build-time month or date into the first render', () => {
    const html = renderToStaticMarkup(React.createElement(TourBookingForm))
    assert.match(html, /role="status"[^>]*>Loading current tour dates/)
    assert.doesNotMatch(html, /aria-label="(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),/)
    assert.doesNotMatch(html, /(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{4}/)
    assert.match(html, /type="submit" disabled=""/)
  })
})

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ExecutivePage, { metadata as executiveMetadata } from '../app/the-executive/page'
import WingPage, { metadata as wingMetadata } from '../app/the-wing/page'
import EncorePage, { metadata as encoreMetadata } from '../app/encore/page'
import ParlorPage, { metadata as parlorMetadata } from '../app/parlor/page'
import HorizonPage, { metadata as horizonMetadata } from '../app/horizon/page'
import CanvasPodcastPage, { metadata as canvasMetadata } from '../app/canvas-podcast/page'
import SunsetPage from '../app/sunset-studio/page'
import { metadata as sunsetMetadata } from '../app/sunset-studio/layout'
import PricingPage from '../app/pricing/page'
import SupportPage from '../app/support/page'
import GreenScreenPage from '../app/green-screen-studio-sf/page'
import {
  PODCAST_CAMERA_LABEL,
  PODCAST_CREW_LABEL,
  PODCAST_HOURLY_RATES,
  PODCAST_PACKAGE_SUMMARY,
} from '../lib/booking/podcast-package'

// The standalone tsx test runner uses classic JSX for this Next.js project.
Object.assign(globalThis, { React })

function schemasFrom(html: string) {
  return [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]))
}

describe('approved public podcast packages', () => {
  const rooms = [
    { id: 'the-executive', Page: ExecutivePage, metadata: executiveMetadata },
    { id: 'the-wing', Page: WingPage, metadata: wingMetadata },
    { id: 'encore', Page: EncorePage, metadata: encoreMetadata },
    { id: 'sunset', Page: SunsetPage, metadata: sunsetMetadata },
    { id: 'parlor', Page: ParlorPage, metadata: parlorMetadata },
    { id: 'horizon', Page: HorizonPage, metadata: horizonMetadata },
    { id: 'canvas-podcast', Page: CanvasPodcastPage, metadata: canvasMetadata },
  ] as const

  for (const { id, Page, metadata } of rooms) {
    test(`${id} renders the included operators, minimum cameras, and correct rate`, () => {
      const html = renderToStaticMarkup(React.createElement(Page))
      const rate = PODCAST_HOURLY_RATES[id]
      assert.ok(html.includes(PODCAST_CREW_LABEL))
      assert.ok(html.includes(PODCAST_CAMERA_LABEL))
      assert.ok(html.includes(PODCAST_PACKAGE_SUMMARY))
      assert.ok(html.includes(`$${rate}`))
      assert.doesNotMatch(html, /cameraman|operator optional|crew options|two-camera coverage|dual 4K cinema cameras/i)
      assert.ok(metadata.description?.includes(PODCAST_CREW_LABEL))
      assert.ok(metadata.description?.includes(PODCAST_CAMERA_LABEL))
      assert.ok(metadata.description?.includes(`$${rate}/hr`))

      if (id !== 'canvas-podcast') {
        for (const hours of [2, 4, 8]) {
          assert.ok(html.includes(`$${(rate * hours).toLocaleString('en-US')}`))
        }
      }
    })
  }

  test('pricing offers describe each room at its published rate', () => {
    const html = renderToStaticMarkup(React.createElement(PricingPage))
    const service = schemasFrom(html).find((schema) => schema['@type'] === 'Service')
    const expected = [
      ['The Executive', 300], ['The Wing', 300], ['Encore', 300], ['Sunset', 300],
      ['Parlor', 400], ['Horizon', 400], ['Canvas Podcast', 400],
      ['Green Screen', 100], ['Canvas Rental', 100],
    ] as const
    assert.ok(service)
    for (const [name, rate] of expected) {
      const offer = service.offers.find((item: { name: string }) => item.name === name)
      assert.ok(offer, `Missing offer for ${name}`)
      assert.equal(offer.price, String(rate))
      assert.equal(offer.priceSpecification.price, String(rate))
    }
    assert.ok(html.includes('$300'))
    assert.ok(html.includes('$400'))
    assert.ok(html.includes(PODCAST_PACKAGE_SUMMARY))
  })

  test('support schema matches the corrected visible package answer', () => {
    const html = renderToStaticMarkup(React.createElement(SupportPage))
    const faq = schemasFrom(html).find((schema) => schema['@type'] === 'FAQPage')
    const answer = faq.mainEntity.find((item: { name: string }) =>
      item.name === 'What is the difference between a Podcast Studio and a Rental?'
    ).acceptedAnswer.text
    assert.ok(answer.includes(PODCAST_PACKAGE_SUMMARY))
    assert.ok(answer.includes('Canvas Podcast, Horizon, and Parlor at $400/hr'))
    assert.ok(html.includes(answer))
    assert.doesNotMatch(html, /cameraman|All equipment is provided/i)
  })

  test('green-screen production support is arranged before booking', () => {
    const html = renderToStaticMarkup(React.createElement(GreenScreenPage))
    assert.match(html, /available by arrangement/i)
    assert.doesNotMatch(html, /Camera Operator for \$50|streaming add-on is available for \$100/)
  })
})

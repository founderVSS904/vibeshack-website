import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import postcss from 'postcss'
import MediaDialog from '../components/media/MediaDialog'
import PhotoLightbox from '../components/media/PhotoLightbox'
import ZoomableImage from '../components/media/ZoomableImage'
import StudioSetupPicker from '../components/StudioSetupPicker'

Object.assign(globalThis, { React })
const noop = () => {}
const photos = [
  { src: '/studio-setups/the-wing/one-black-chair.webp', alt: 'One black chair', title: 'Solo', width: 1448, height: 1086 },
  { src: '/studio-setups/the-wing/two-black-chairs.webp', alt: 'Two black chairs', title: 'Conversation', width: 1448, height: 1086 },
]

describe('media viewer markup and lazy media', () => {
  test('does not render an iframe or other media inside a closed dialog', () => {
    const html = renderToStaticMarkup(React.createElement(MediaDialog, {
      open: false, onClose: noop, title: 'Film',
    }, React.createElement('iframe', { src: 'https://www.youtube-nocookie.com/embed/3Rbir7bu408', title: 'Film' })))
    assert.match(html, /<dialog/)
    assert.doesNotMatch(html, /<iframe|<img|youtube-nocookie/)
  })

  test('provides a named dialog and an explicitly labelled close button', () => {
    const html = renderToStaticMarkup(React.createElement(MediaDialog, { open: true, onClose: noop, title: 'Studio photos', description: 'No selection changes' }, 'Preview'))
    assert.match(html, /aria-labelledby=/)
    assert.match(html, /aria-describedby=/)
    assert.match(html, /aria-label="Close viewer"/)
    assert.match(html, /type="button"/)
    assert.match(html, /Studio photos/)
  })

  test('keeps closed and out-of-range photo galleries empty', () => {
    for (const index of [null, -1, 8]) {
      const html = renderToStaticMarkup(React.createElement(PhotoLightbox, { photos, index, onIndexChange: noop, onClose: noop }))
      assert.doesNotMatch(html, /<img|Photo [0-9]/)
    }
  })

  test('renders a full-frame photo with labelled navigation and separate thumbnail buttons', () => {
    const html = renderToStaticMarkup(React.createElement(PhotoLightbox, { photos, index: 1, onIndexChange: noop, onClose: noop }))
    assert.match(html, /alt="Two black chairs"/)
    assert.match(html, /object-contain/)
    assert.match(html, /Photo 2 of 2/)
    assert.match(html, /aria-label="Previous photo"/)
    assert.match(html, /aria-label="Next photo"/)
    assert.match(html, /aria-label="Preview Conversation" aria-pressed="true"/)
    assert.match(html, /aspect-ratio:1448 \/ 1086/)
  })

  test('a standalone image has a keyboard-operable trigger without nesting its dialog', () => {
    const html = renderToStaticMarkup(React.createElement(ZoomableImage, { src: photos[0].src, alt: photos[0].alt, width: 1448, height: 1086 }))
    assert.match(html, /aria-haspopup="dialog"/)
    assert.match(html, /aria-label="View larger: One black chair"/)
    assert.ok(html.indexOf('</button>') < html.indexOf('<dialog'))
  })
})

describe('setup preview and booking separation', () => {
  for (const [studioId, count] of [['the-wing', 4], ['the-executive', 3]] as const) {
    test(`${studioId} keeps preview controls outside selection labels`, () => {
      const html = renderToStaticMarkup(React.createElement(StudioSetupPicker, { id: 'test-setup', studioId, value: '', onChange: noop }))
      const labels = [...html.matchAll(/<label\b[\s\S]*?<\/label>/g)]
      assert.equal(labels.length, count)
      for (const [label] of labels) {
        assert.match(label, /type="radio"/)
        assert.match(label, /required=""/)
        assert.doesNotMatch(label, /<button|<a\b/)
      }
      assert.equal((html.match(/aria-haspopup="dialog"/g) || []).length, count)
      assert.doesNotMatch(html, /checked=""/)
    })
  }

  test('retains the exact checked option when rendering the new preview controls', () => {
    const html = renderToStaticMarkup(React.createElement(StudioSetupPicker, { id: 'test-setup', studioId: 'the-executive', value: 'two-office-chairs-desk', onChange: noop }))
    assert.equal((html.match(/checked=""/g) || []).length, 1)
    assert.match(html, /checked="" value="two-office-chairs-desk"/)
  })

  test('shared viewer styles parse and keep the close header sticky', () => {
    const dialogCss = readFileSync(new URL('../components/media/MediaDialog.module.css', import.meta.url), 'utf8')
    const photoCss = readFileSync(new URL('../components/media/PhotoLightbox.module.css', import.meta.url), 'utf8')
    assert.doesNotThrow(() => postcss.parse(dialogCss))
    assert.doesNotThrow(() => postcss.parse(photoCss))
    assert.match(dialogCss, /position: sticky/)
    assert.match(dialogCss, /prefers-reduced-motion: no-preference/)
    assert.match(photoCss, /touch-action: pan-y pinch-zoom/)
  })
})

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import BookingAddOnPicker from '../components/BookingAddOnPicker'
import type { AddOnAvailabilityState } from '../lib/booking/add-on-inventory'

function renderPicker(selectedIds: string[] = [], durationSlots = 4, remotePlatform = '', state: AddOnAvailabilityState = 'available') {
  return renderToStaticMarkup(createElement(BookingAddOnPicker, {
    selectedIds, durationSlots, remotePlatform, availability: { teleprompter: state }, onToggle: () => {}, onPlatformChange: () => {},
  }))
}

describe('booking add-on cards', () => {
  test('renders three named, described toggle buttons with authoritative prices', () => {
    const html = renderPicker()
    assert.equal((html.match(/aria-pressed="false"/g) || []).length, 3)
    for (const id of ['teleprompter', 'live-switching', 'remote-podcast']) {
      assert.match(html, new RegExp(`aria-labelledby="add-on-${id}-title"`))
      assert.match(html, new RegExp(`aria-describedby="add-on-${id}-description add-on-${id}-price"`))
    }
    assert.match(html, /\$75/)
    assert.match(html, /\$150 for 2 hours/)
    assert.match(html, /No charge/)
    assert.doesNotMatch(html, /id="remote-podcast-platform"/)
  })

  test('exposes independent selected states and the optional platform only when selected', () => {
    const html = renderPicker(['live-switching', 'remote-podcast'], 3, 'Zoom')
    assert.equal((html.match(/aria-pressed="true"/g) || []).length, 2)
    assert.match(html, /\$112.50 for 1 hour 30 minutes/)
    assert.match(html, /id="remote-podcast-platform"/)
    assert.match(html, /value="Zoom"/)
    assert.match(html, /maxLength="60"/)
    assert.match(html, /aria-describedby="remote-podcast-platform-help"/)
    assert.doesNotMatch(renderPicker(['live-switching'], 3, 'Zoom'), /id="remote-podcast-platform"/)
  })

  test('keeps the editable field outside the toggle and respects reduced motion', () => {
    const html = renderPicker(['remote-podcast'], 4, '<script>test</script>')
    const buttonContents = [...html.matchAll(/<button\b[^>]*>(.*?)<\/button>/g)].map((match) => match[1])
    assert.equal(buttonContents.length, 3)
    assert.ok(buttonContents.every((content) => !content.includes('<input')))
    assert.match(html, /value="&lt;script&gt;test&lt;\/script&gt;"/)
    assert.match(html, /motion-safe:transition-colors/)
    assert.match(html, /focus-visible:ring-2/)
  })

  test('teleprompter is a flat session fee at both short and long durations', () => {
    for (const count of [2, 3, 16]) {
      const card = renderPicker([], count).split('</button>')[0]
      assert.match(card, /\$50/)
      assert.match(card, /\/ session/)
      assert.match(card, /One-time session fee/)
      assert.doesNotMatch(card, /\/ hour|\$400/)
    }
  })

  test('unavailable or unverified teleprompters cannot be added but can always be removed', () => {
    for (const state of ['checking', 'unavailable', 'unverified'] as const) {
      const html = renderPicker([], 4, '', state)
      const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map(([tag]) => tag)
      assert.match(buttons[0], /disabled=""/)
      assert.doesNotMatch(buttons[1] + buttons[2], / disabled=""/)
      const selected = renderPicker(['teleprompter'], 4, '', state)
      assert.doesNotMatch(selected.match(/<button\b[^>]*>/)![0], / disabled=""/)
      assert.match(selected, /Remove to continue/)
      assert.match(selected, /add-on-teleprompter-status/)
    }
    assert.match(renderPicker([], 4, '', 'unavailable'), /Reserved for this time/)
  })
})

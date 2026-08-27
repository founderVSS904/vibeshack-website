import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { getFeaturedPlaybackState, getFeaturedVideoEmbedUrl } from '../lib/home/featuredOriginals'

const playing = {
  motionPaused: false,
  reducedMotion: false,
  inView: true,
  videoOpen: false,
  autoAdvance: true,
  hovered: false,
  focusWithin: false,
}

describe('Featured Originals playback', () => {
  test('plays the active preview and rotates only when there are no blockers', () => {
    assert.deepEqual(getFeaturedPlaybackState(playing), {
      playPreview: true,
      advanceSlides: true,
    })
  })

  for (const blocker of ['motionPaused', 'reducedMotion', 'videoOpen'] as const) {
    test(`${blocker} stops both background motion and slide rotation`, () => {
      assert.deepEqual(getFeaturedPlaybackState({ ...playing, [blocker]: true }), {
        playPreview: false,
        advanceSlides: false,
      })
    })
  }

  test('offscreen carousels do not play or advance', () => {
    assert.deepEqual(getFeaturedPlaybackState({ ...playing, inView: false }), {
      playPreview: false,
      advanceSlides: false,
    })
  })

  test('hover and keyboard focus each pause rotation without stopping the preview', () => {
    for (const state of [
      { hovered: true, focusWithin: false },
      { hovered: false, focusWithin: true },
      { hovered: true, focusWithin: true },
    ]) {
      assert.deepEqual(getFeaturedPlaybackState({ ...playing, ...state }), {
        playPreview: true,
        advanceSlides: false,
      })
    }
  })

  test('manual navigation can keep previews playing without re-enabling rotation', () => {
    assert.deepEqual(getFeaturedPlaybackState({ ...playing, autoAdvance: false }), {
      playPreview: true,
      advanceSlides: false,
    })
  })

  test('closing a dialog does not clear a persistent user pause', () => {
    for (const videoOpen of [true, false]) {
      assert.deepEqual(getFeaturedPlaybackState({ ...playing, motionPaused: true, videoOpen }), {
        playPreview: false,
        advanceSlides: false,
      })
    }
  })

  test('resuming motion still respects focus until the visitor leaves the carousel', () => {
    assert.equal(getFeaturedPlaybackState({ ...playing, focusWithin: true }).advanceSlides, false)
    assert.equal(getFeaturedPlaybackState(playing).advanceSlides, true)
  })
})

describe('Featured Originals video URLs', () => {
  for (const videoId of ['3Rbir7bu408', '3mLFnCovlF8', 'tX5nk9EEBHs']) {
    test(`uses the privacy-enhanced host for ${videoId}`, () => {
      assert.equal(
        getFeaturedVideoEmbedUrl(`https://www.youtube.com/watch?v=${videoId}`),
        `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`,
      )
    })
  }

  test('accepts the bare YouTube host and does not forward arbitrary query parameters', () => {
    assert.equal(
      getFeaturedVideoEmbedUrl('https://youtube.com/watch?v=3Rbir7bu408&autoplay=0&origin=https://example.com'),
      'https://www.youtube-nocookie.com/embed/3Rbir7bu408?autoplay=1&playsinline=1&rel=0',
    )
  })

  test('rejects non-YouTube, insecure, credentialed, and malformed URLs', () => {
    for (const url of [
      'https://youtube.com.example.com/watch?v=3Rbir7bu408',
      'https://example.com/watch?v=3Rbir7bu408',
      'http://www.youtube.com/watch?v=3Rbir7bu408',
      'https://user:password@www.youtube.com/watch?v=3Rbir7bu408',
      'https://www.youtube.com:444/watch?v=3Rbir7bu408',
      'https://www.youtube.com/embed/3Rbir7bu408',
      'https://www.youtube.com/watch?v=short',
      'https://www.youtube.com/watch?v=3Rbir7bu408%2F',
      'https://www.youtube.com/watch',
      '/watch?v=3Rbir7bu408',
      'javascript:alert(1)',
      '',
    ]) {
      assert.equal(getFeaturedVideoEmbedUrl(url), null, url)
    }
  })
})

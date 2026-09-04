import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import sharp from 'sharp'
import { stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { allowAmbientVideo, allowPreShowSource, type MediaPreferences } from '../lib/media/playback'
import { DynamicFrameHero } from '../components/DynamicFrameHero'
import { FeaturedOriginals } from '../components/home/FeaturedOriginals'
import { HomeMotionProvider } from '../components/home/HomeMotion'
import { CinemaExperience } from '../components/our-work/CinemaExperience'
import { cinemaProjects } from '../lib/cinema/cinemaCatalog'

Object.assign(globalThis, { React })

const desktop: MediaPreferences = { ready: true, reducedMotion: false, saveData: false, canHover: true }

describe('ambient media loading', () => {
  test('does not load before preferences are known, outside the viewport, or after a user pause', () => {
    assert.equal(allowAmbientVideo({ ...desktop, ready: false }, { inView: true }), false)
    assert.equal(allowAmbientVideo(desktop, { inView: false }), false)
    assert.equal(allowAmbientVideo(desktop, { inView: true, paused: true }), false)
    assert.equal(allowAmbientVideo(desktop, { inView: true }), true)
  })

  test('touch, reduced motion, and Save-Data do not request desktop previews', () => {
    for (const preferences of [
      { ...desktop, canHover: false },
      { ...desktop, reducedMotion: true },
      { ...desktop, saveData: true },
    ]) {
      assert.equal(allowAmbientVideo(preferences, { inView: true, requiresHover: true }), false)
      assert.equal(allowPreShowSource(preferences, false), false)
    }
  })

  test('visitors can explicitly request a pre-show even with a restrictive preference', () => {
    for (const preferences of [
      { ...desktop, canHover: false },
      { ...desktop, reducedMotion: true },
      { ...desktop, saveData: true },
    ]) {
      assert.equal(allowPreShowSource(preferences, true), true)
    }
    assert.equal(allowPreShowSource(desktop, false, false), false)
  })

  test('homepage server HTML has usable image fallbacks and no speculative video downloads', () => {
    for (const component of [DynamicFrameHero, FeaturedOriginals]) {
      const html = renderToStaticMarkup(React.createElement(HomeMotionProvider, null, React.createElement(component)))
      assert.match(html, /<img\b/)
      assert.doesNotMatch(html, /<video\b|\.mp4/)
      assert.match(html, /aria-label="Homepage motion paused"/)
      assert.match(html, /data-motion-paused="true"/)
    }
  })

  test('cinema starts with a poster and an enabled user-play action, not an eager movie source', () => {
    const html = renderToStaticMarkup(React.createElement(CinemaExperience, { projects: cinemaProjects }))
    const video = html.match(/<video\b[^>]*>/)?.[0]
    assert.ok(video)
    assert.match(video, /poster=/)
    assert.match(video, /preload="none"/)
    assert.doesNotMatch(video, /\ssrc=/)
    const button = [...html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)].find(([markup]) => markup.includes('Play pre-show'))?.[0]
    assert.ok(button)
    assert.doesNotMatch(button, /disabled/)
    assert.doesNotMatch(html, /theater_idle\.png|theater_playing_base\.png/)
  })
})

describe('cinema plate derivatives', () => {
  test('preserve the geometry shared by the film screen and lighting masks while reducing delivery size', async () => {
    for (const name of ['theater_idle', 'theater_playing_base']) {
      const root = new URL('../public/studio-videos/cinema/runtime-v017/', import.meta.url)
      const original = new URL(`${name}.png`, root)
      const derivative = new URL(`${name}-q95.webp`, root)
      const [before, after, beforeStat, afterStat] = await Promise.all([
        sharp(fileURLToPath(original)).metadata(), sharp(fileURLToPath(derivative)).metadata(), stat(original), stat(derivative),
      ])
      assert.equal(after.width, before.width)
      assert.equal(after.height, before.height)
      assert.equal(after.hasAlpha, before.hasAlpha)
      assert.ok(afterStat.size < beforeStat.size * 0.3)
    }
  })
})

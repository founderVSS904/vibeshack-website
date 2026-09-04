import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { STUDIOS } from '../lib/booking/catalog'
import { PODCAST_CAMERA_LABEL, PODCAST_CREW_LABEL, PODCAST_HOURLY_RATES } from '../lib/booking/podcast-package'
import {
  getStudioFinderContactHref,
  getStudioFinderBookingHref,
  getStudioFinderSetup,
  getStudioFinderInquiry,
  getStudioFinderMatches,
  getStudioFinderGuidance,
  studioFinderNeedsProductionSupport,
  parseOnCameraCount,
  STUDIO_FINDER_FORMATS,
  VERIFIED_ON_CAMERA_CAPACITY,
} from '../lib/booking/studio-finder'

describe('approved podcast packages', () => {
  test('all seven podcast rooms use the approved rates, crew and camera minimum', () => {
    const podcasts = STUDIOS.filter((studio) => studio.type === 'podcast')
    assert.equal(podcasts.length, 7)
    for (const studio of podcasts) {
      assert.equal(studio.price, PODCAST_HOURLY_RATES[studio.id as keyof typeof PODCAST_HOURLY_RATES])
      assert.ok(studio.includes.includes(PODCAST_CREW_LABEL), studio.id)
      assert.ok(studio.includes.includes(PODCAST_CAMERA_LABEL), studio.id)
      assert.doesNotMatch(studio.description, /cameraman|optional|full crew/i)
    }
    assert.deepEqual(podcasts.filter((studio) => studio.price === 400).map((studio) => studio.id), ['parlor', 'horizon', 'canvas-podcast'])
    assert.equal(STUDIOS.find((studio) => studio.id === 'canvas-rental')?.price, 100)
    assert.equal(STUDIOS.find((studio) => studio.id === 'green-screen')?.price, 100)
  })
})

describe('exact on-camera counts', () => {
  test('accepts whole numbers and supports product shoots without people', () => {
    assert.equal(parseOnCameraCount('1', 'podcast'), 1)
    assert.equal(parseOnCameraCount('2', 'podcast'), 2)
    assert.equal(parseOnCameraCount('999', 'podcast'), 999)
    assert.equal(parseOnCameraCount('0', 'photo'), 0)
    assert.equal(parseOnCameraCount('0', 'video'), 0)
    assert.equal(parseOnCameraCount('0', 'podcast'), null)
  })

  test('rejects ranges, fractions, exponents, negative or missing counts', () => {
    for (const value of [null, '', ' ', '-1', '1.5', '2-5', '2 to 5', '1e2', '1000', 'Infinity', 'NaN', '<script>']) {
      assert.equal(parseOnCameraCount(value, 'podcast'), null, String(value))
    }
  })
})

describe('capacity-checked recommendations', () => {
  test('matches one or two podcast participants only with documented fits', () => {
    for (const peopleOnCamera of [1, 2]) {
      for (const bringingCrew of [true, false]) {
        assert.deepEqual(
          getStudioFinderMatches({ format: 'podcast', peopleOnCamera, bringingCrew }).map((studio) => studio.id),
          ['the-executive', 'the-wing'],
        )
      }
    }
  })

  test('matches three people only to the supplied Executive armchair setup', () => {
    for (const bringingCrew of [true, false]) {
      const answers = { format: 'podcast' as const, peopleOnCamera: 3, bringingCrew }
      assert.deepEqual(getStudioFinderMatches(answers).map(({ id }) => id), ['the-executive'])
      assert.equal(getStudioFinderSetup('the-executive', answers)?.id, 'three-black-armchairs')
      assert.equal(getStudioFinderBookingHref('the-executive', answers), '/book/?studio=the-executive&setup=three-black-armchairs')
      assert.equal(getStudioFinderSetup('the-wing', answers), undefined)
      assert.match(getStudioFinderBookingHref('the-wing', answers), /^\/contact\//)
    }
  })

  test('leaves the photo choice open when multiple layouts fit the count', () => {
    for (const peopleOnCamera of [1, 2]) {
      for (const studioId of ['the-wing', 'the-executive']) {
        const answers = { format: 'podcast' as const, peopleOnCamera, bringingCrew: false }
        assert.equal(getStudioFinderSetup(studioId, answers), undefined)
        assert.equal(getStudioFinderBookingHref(studioId, answers), `/book/?studio=${studioId}`)
      }
    }
  })

  test('does not route four or more people into small sets or unverified rental rooms', () => {
    for (const peopleOnCamera of [4, 5, 6, 20, 21, 999]) {
      assert.deepEqual(getStudioFinderMatches({ format: 'podcast', peopleOnCamera, bringingCrew: false }), [])
    }
  })

  test('unknown, invalid and unsupported capacities produce no automatic recommendation', () => {
    for (const format of STUDIO_FINDER_FORMATS) {
      for (const peopleOnCamera of [null, -1, 1.5, 1000, NaN, Infinity]) {
        assert.deepEqual(getStudioFinderMatches({ format, peopleOnCamera, bringingCrew: false }), [])
      }
    }
    for (const format of ['photo', 'greenscreen', 'video', 'notsure'] as const) {
      assert.deepEqual(getStudioFinderMatches({ format, peopleOnCamera: 2, bringingCrew: true }), [])
    }
  })

  test('every match across all formats is covered by a verified capacity', () => {
    for (const format of STUDIO_FINDER_FORMATS) {
      for (const bringingCrew of [true, false]) {
        for (let peopleOnCamera = 0; peopleOnCamera <= 30; peopleOnCamera += 1) {
          for (const studio of getStudioFinderMatches({ format, peopleOnCamera, bringingCrew })) {
            const capacity = VERIFIED_ON_CAMERA_CAPACITY[studio.id]
            assert.equal(typeof capacity, 'number')
            assert.ok(peopleOnCamera <= capacity!, `${studio.id}: ${peopleOnCamera}`)
          }
        }
      }
    }
  })
})

describe('team-confirmation handoff', () => {
  test('distinguishes unknown headcounts from a requested production service', () => {
    assert.match(getStudioFinderGuidance({ format: 'podcast', peopleOnCamera: null, bringingCrew: false }), /on-camera count is still open/)
    assert.match(getStudioFinderGuidance({ format: 'podcast', peopleOnCamera: 8, bringingCrew: true }), /setup check/)
    assert.match(getStudioFinderGuidance({ format: 'photo', peopleOnCamera: 1, bringingCrew: false }), /photographer.*quote/)
    assert.match(getStudioFinderGuidance({ format: 'greenscreen', peopleOnCamera: 1, bringingCrew: false }), /crew.*equipment.*quote/)
    assert.match(getStudioFinderGuidance({ format: 'notsure', peopleOnCamera: null, bringingCrew: false }), /choose the format/)
  })

  test('rental productions without their own crew require a production handoff', () => {
    for (const format of ['photo', 'video', 'greenscreen'] as const) {
      assert.equal(studioFinderNeedsProductionSupport({ format, peopleOnCamera: 1, bringingCrew: false }), true)
      assert.equal(studioFinderNeedsProductionSupport({ format, peopleOnCamera: 1, bringingCrew: true }), false)
    }
    assert.equal(studioFinderNeedsProductionSupport({ format: 'podcast', peopleOnCamera: 2, bringingCrew: false }), false)
  })

  test('preserves format, exact count and crew context in an editable inquiry', () => {
    const href = getStudioFinderContactHref({ format: 'podcast', peopleOnCamera: 5, bringingCrew: false })
    const url = new URL(href, 'https://www.vibeshackstudios.com')
    assert.equal(url.pathname, '/contact/')
    assert.equal(url.hash, '#project-inquiry')
    const inquiry = getStudioFinderInquiry(url.searchParams)
    assert.equal(inquiry?.projectType, 'podcast')
    assert.match(inquiry!.message, /5 people will be on camera at the same time/)
    assert.match(inquiry!.message, /production support from VibeShack/)
    assert.match(inquiry!.message, /confirm the room capacity and setup before we book/)
  })

  test('preserves unknown counts and zero-person product shoots', () => {
    for (const peopleOnCamera of [null, 0]) {
      const url = new URL(getStudioFinderContactHref({ format: 'photo', peopleOnCamera, bringingCrew: true }), 'https://www.vibeshackstudios.com')
      const inquiry = getStudioFinderInquiry(url.searchParams)
      assert.equal(inquiry?.projectType, 'photo-services')
      assert.match(inquiry!.message, peopleOnCamera === null ? /not confirmed yet/ : /0 people will/)
      assert.match(inquiry!.message, /bringing our own photographer or production crew/)
    }
  })

  test('rejects invalid or unrecognized URL context', () => {
    const valid = { from: 'studio-finder', service: 'podcast', on_camera: '5', crew: 'no' }
    for (const [key, value] of [
      ['from', 'other'], ['service', '<script>'], ['on_camera', '2-5'],
      ['on_camera', '0'], ['on_camera', '1000'], ['crew', '<script>'],
    ]) {
      assert.equal(getStudioFinderInquiry(new URLSearchParams({ ...valid, [key]: value })), null)
    }
    assert.equal(getStudioFinderInquiry(new URLSearchParams()), null)
  })
})

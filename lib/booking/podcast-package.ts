// Podcast package facts confirmed by Tay on August 27, 2026.
// Canvas Rental is a separate $100/hour rental, not Canvas Podcast.
export const PODCAST_INCLUDED_OPERATORS = 2
export const PODCAST_MINIMUM_CAMERAS = 3
export const PODCAST_CREW_LABEL = '2 studio operators included'
export const PODCAST_CAMERA_LABEL = 'Minimum 3 cameras'
export const PODCAST_PACKAGE_SUMMARY =
  'Every podcast booking includes 2 studio operators and a minimum of 3 cameras.'
export const PODCAST_RATE_SUMMARY =
  'Podcast studios are $300/hr, except Canvas Podcast, Horizon, and Parlor at $400/hr.'

export const PODCAST_HOURLY_RATES = {
  'the-executive': 300,
  'the-wing': 300,
  encore: 300,
  sunset: 300,
  parlor: 400,
  horizon: 400,
  'canvas-podcast': 400,
} as const

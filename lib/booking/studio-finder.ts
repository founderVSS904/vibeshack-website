import { STUDIOS, type Studio } from './catalog'
import { getStudioSetups } from './studio-setups'

export const STUDIO_FINDER_FORMATS = ['podcast', 'video', 'photo', 'greenscreen', 'notsure'] as const
export type StudioFinderFormat = (typeof STUDIO_FINDER_FORMATS)[number]

export interface StudioFinderAnswers {
  format: StudioFinderFormat
  peopleOnCamera: number | null
  bringingCrew: boolean
}

// These are confirmed seated/on-camera layouts, not building occupancy limits.
// Tay supplied Executive's three-armchair/no-desk setup on August 27, 2026.
// Its desk layouts seat one or two. Wing's supplied layouts seat up to two.
// Unverified rooms must stay on a team-confirmation path until Tay confirms them.
export const VERIFIED_ON_CAMERA_CAPACITY: Readonly<Record<string, number | null>> = {
  'the-executive': 3,
  'the-wing': 2,
  encore: null,
  sunset: null,
  parlor: null,
  horizon: null,
  'canvas-podcast': null,
  'green-screen': null,
  'canvas-rental': null,
}

export function isStudioFinderFormat(value: string | null): value is StudioFinderFormat {
  return STUDIO_FINDER_FORMATS.some((format) => format === value)
}

export function parseOnCameraCount(value: string | null, format: StudioFinderFormat): number | null {
  if (value === null || !/^\d{1,3}$/.test(value)) return null
  const count = Number(value)
  const minimum = format === 'podcast' ? 1 : 0
  return Number.isInteger(count) && count >= minimum && count <= 999 ? count : null
}

export function getStudioFinderMatches(answers: StudioFinderAnswers): Studio[] {
  const count = answers.peopleOnCamera
  if (count === null || parseOnCameraCount(String(count), answers.format) === null) return []
  if (answers.format === 'notsure') return []
  if (studioFinderNeedsProductionSupport(answers)) return []

  return STUDIOS.filter((studio) => {
    const capacity = VERIFIED_ON_CAMERA_CAPACITY[studio.id]
    if (capacity === null || capacity === undefined || count > capacity) return false

    if (answers.format === 'podcast') return studio.type === 'podcast'
    if (answers.format === 'greenscreen') return studio.type === 'greenscreen'
    if (answers.format === 'photo') return studio.type === 'photo'
    return studio.type === 'photo' || studio.type === 'greenscreen'
  })
}

export function studioFinderNeedsProductionSupport(answers: StudioFinderAnswers) {
  return !answers.bringingCrew && ['photo', 'video', 'greenscreen'].includes(answers.format)
}

export function getStudioFinderGuidance(answers: StudioFinderAnswers) {
  if (studioFinderNeedsProductionSupport(answers)) {
    return answers.format === 'photo'
      ? 'Tell us about the photos you need. We will confirm the photographer, room, and production quote before you book.'
      : 'Tell us about your production. We will confirm the crew, equipment, room, and quote before you book.'
  }
  if (answers.format === 'notsure') {
    return 'Share what you want to make, or book a free tour. We will help you choose the format, room, and setup.'
  }
  if (answers.peopleOnCamera === null) {
    return 'Your on-camera count is still open. Send us your project details so we can confirm the group size and a suitable setup with you.'
  }
  return 'Your project needs a setup check with our team. Send us your on-camera count, crew, and equipment needs so we can confirm a suitable room before you book.'
}

// Carry a photo choice only when exactly one supplied layout fits the count.
// Otherwise keep the customer's choice open, including Wing's chair colors.
export function getStudioFinderSetup(studioId: string, answers: StudioFinderAnswers) {
  if (answers.peopleOnCamera === null || !getStudioFinderMatches(answers).some((studio) => studio.id === studioId)) return undefined
  const count = answers.peopleOnCamera
  const suitable = getStudioSetups(studioId).filter((setup) => setup.chairs >= count)
  return suitable.length === 1 ? suitable[0] : undefined
}

export function getStudioFinderBookingHref(studioId: string, answers: StudioFinderAnswers) {
  if (!getStudioFinderMatches(answers).some((studio) => studio.id === studioId)) return getStudioFinderContactHref(answers)
  const query = new URLSearchParams({ studio: studioId })
  const setup = getStudioFinderSetup(studioId, answers)
  if (setup) query.set('setup', setup.id)
  return `/book/?${query.toString()}`
}

const SERVICE_BY_FORMAT: Record<StudioFinderFormat, string> = {
  podcast: 'podcast',
  video: 'video-production',
  photo: 'photo-services',
  greenscreen: 'green-screen',
  notsure: 'studio-finder',
}

const PROJECT_TYPE_BY_FORMAT: Record<StudioFinderFormat, string> = {
  podcast: 'podcast',
  video: 'video-interview',
  photo: 'photo-services',
  greenscreen: 'green-screen',
  notsure: 'other',
}

const FORMAT_LABEL: Record<StudioFinderFormat, string> = {
  podcast: 'a podcast or interview',
  video: 'a video production',
  photo: 'a photo shoot',
  greenscreen: 'a green screen production',
  notsure: 'a project whose format is still to be decided',
}

export function getStudioFinderContactHref(answers: StudioFinderAnswers): string {
  const query = new URLSearchParams({
    from: 'studio-finder',
    service: SERVICE_BY_FORMAT[answers.format],
    on_camera: answers.peopleOnCamera === null ? 'unsure' : String(answers.peopleOnCamera),
    crew: answers.bringingCrew ? 'yes' : 'no',
  })
  return `/contact/?${query.toString()}#project-inquiry`
}

export function getStudioFinderInquiry(searchParams: URLSearchParams): { projectType: string; message: string } | null {
  if (searchParams.get('from') !== 'studio-finder') return null
  const format = STUDIO_FINDER_FORMATS.find((value) => SERVICE_BY_FORMAT[value] === searchParams.get('service'))
  if (!format) return null
  const crew = searchParams.get('crew')
  if (crew !== 'yes' && crew !== 'no') return null
  const rawCount = searchParams.get('on_camera')
  const count = parseOnCameraCount(rawCount, format)
  if (rawCount !== 'unsure' && count === null) return null

  const people = count === null
    ? 'The number of people on camera is not confirmed yet.'
    : `${count} ${count === 1 ? 'person will' : 'people will'} be on camera at the same time.`
  const production = crew === 'yes'
    ? 'We are bringing our own photographer or production crew.'
    : 'We would like production support from VibeShack.'

  return {
    projectType: PROJECT_TYPE_BY_FORMAT[format],
    message: `Please help me choose a studio for ${FORMAT_LABEL[format]}. ${people} ${production} Please confirm the room capacity and setup before we book.`,
  }
}

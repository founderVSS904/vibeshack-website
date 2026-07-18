import { allWorkProjects, shotAtVibeshack } from '@/lib/seo/workProjects'

export type CinemaProject = {
  slug: string
  title: string
  client: string
  category: string
  categoryLabel: string
  summary: string
  image: string
  alt: string
  objectPosition?: string
  cinemaSrc: string
  fullscreenSrc: string
  fullscreenOffsetSeconds?: number
  cinemaPoster?: string
  cinemaMode: 'integrated' | 'runtime'
  displayFit?: 'contain' | 'cover'
  displayPosition?: 'center' | 'center bottom'
  screenFit?: 'contain' | 'cover'
  screenPosition?: { x: number; y: number }
  href: string
  external: boolean
}

const fullCinemaSrc = (slug: string) => `/studio-videos/cinema/full-v017/${slug}.mp4`

const screenPresentation: Record<
  string,
  Pick<CinemaProject, 'screenFit' | 'screenPosition'>
> = {
  'the-buzzer': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  'wing-battle': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  'damian-stone': { screenFit: 'cover', screenPosition: { x: 0.5, y: 0.5 } },
  'damian-stone-feature': { screenFit: 'cover', screenPosition: { x: 0.5, y: 0.45 } },
  'evil-eye': { screenFit: 'cover', screenPosition: { x: 0.5, y: 0.5 } },
  chilled: { screenFit: 'cover', screenPosition: { x: 0.5, y: 0.5 } },
  'the-client': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  'note-to-self': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  'the-giver': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  betrayed: { screenFit: 'cover', screenPosition: { x: 0.5, y: 0.5 } },
  unpaused: { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  'second-nature': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  'vegas-veteran-voices': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  'scott-stephenson-ai-show': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  'jason-tartick': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  gavriella: { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  'varii-ballin-out': { screenFit: 'cover', screenPosition: { x: 0.5, y: 0.48 } },
}

const cinemaPresentationOverrides: Partial<
  Record<
    string,
    Partial<
      Pick<
        CinemaProject,
        | 'cinemaSrc'
        | 'fullscreenSrc'
        | 'fullscreenOffsetSeconds'
        | 'cinemaPoster'
        | 'cinemaMode'
        | 'displayFit'
        | 'displayPosition'
        | 'screenFit'
        | 'screenPosition'
      >
    >
  >
> = {
  'body-is-tea': {
    cinemaSrc: '/studio-videos/cinema/cinema-body-is-tea-preview-v016.mp4',
    fullscreenSrc: fullCinemaSrc('body-is-tea'),
    fullscreenOffsetSeconds: 3,
    cinemaPoster: '/studio-videos/cinema/cinema-body-is-tea-poster-v016.jpg',
    cinemaMode: 'integrated',
    displayFit: 'cover',
    displayPosition: 'center bottom',
  },
}

const portfolioProjects: CinemaProject[] = allWorkProjects.map((project) => ({
  slug: project.slug,
  title: project.title,
  client: project.client,
  category: project.category,
  categoryLabel: project.categoryLabel,
  summary: project.summary,
  image: project.image,
  alt: project.alt,
  objectPosition: project.objectPosition,
  cinemaSrc: fullCinemaSrc(project.slug),
  fullscreenSrc: fullCinemaSrc(project.slug),
  cinemaMode: 'runtime',
  ...(screenPresentation[project.slug] ?? {
    screenFit: 'contain' as const,
    screenPosition: { x: 0.5, y: 0.5 },
  }),
  href: `/our-work/${project.slug}/`,
  external: false,
  ...(cinemaPresentationOverrides[project.slug] ?? {}),
}))

const shotAtIdentity: Record<string, { slug: string; client: string }> = {
  ReIQcS8L6Hs: { slug: 'unpaused', client: 'unPAUSED' },
  QMXrpJteBXA: { slug: 'second-nature', client: 'Second Nature' },
  E893IZTGmrQ: { slug: 'vegas-veteran-voices', client: 'Vegas Veteran Voices' },
  dKY24SpeYKo: { slug: 'scott-stephenson-ai-show', client: 'Scott Stephenson' },
  '4zd17_NxABw': { slug: 'jason-tartick', client: 'Jason Tartick' },
  J4ZKUYv4JqY: { slug: 'gavriella', client: 'Gavriella' },
  '2nJD5lCXbuo': { slug: 'varii-ballin-out', client: 'Varii' },
}

const studioProjects: CinemaProject[] = shotAtVibeshack.map((project) => {
  const identity = shotAtIdentity[project.youtubeId]
  if (!identity) throw new Error(`Missing cinema identity for YouTube ${project.youtubeId}`)
  return {
    slug: identity.slug,
    title: project.title,
    client: identity.client,
    category: 'shot-at-vibeshack',
    categoryLabel: 'Shot at VibeShack',
    summary: project.detail,
    image: project.image,
    alt: project.alt,
    objectPosition: project.objectPosition,
    cinemaSrc: fullCinemaSrc(identity.slug),
    fullscreenSrc: fullCinemaSrc(identity.slug),
    cinemaMode: 'runtime',
    ...(screenPresentation[identity.slug] ?? {
      screenFit: 'contain' as const,
      screenPosition: { x: 0.5, y: 0.5 },
    }),
    href: `https://www.youtube.com/watch?v=${project.youtubeId}`,
    external: true,
    ...(cinemaPresentationOverrides[identity.slug] ?? {}),
  }
})

export const cinemaProjects: CinemaProject[] = [...portfolioProjects, ...studioProjects]

const uniqueSlugs = new Set(cinemaProjects.map((project) => project.slug))
if (uniqueSlugs.size !== cinemaProjects.length) {
  throw new Error('Cinema project slugs must be unique')
}

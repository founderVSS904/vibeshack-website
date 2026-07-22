import { allWorkProjects, shotAtVibeshack } from '@/lib/seo/workProjects'
import type { WorkRelationship } from '@/lib/seo/workProjects'

export type CinemaProject = {
  slug: string
  title: string
  client: string
  category: string
  categoryLabel: string
  relationship: WorkRelationship
  creditLabel: string
  summary: string
  image: string
  alt: string
  objectPosition?: string
  cinemaSrc?: string
  fullscreenSrc?: string
  youtubeId?: string
  playback: 'hosted' | 'youtube'
  collection: 'podcasts' | 'creative-productions'
  fullscreenOffsetSeconds?: number
  cinemaPoster?: string
  cinemaMode: 'integrated' | 'runtime'
  displayFit?: 'contain' | 'cover'
  displayPosition?: 'center' | 'center bottom'
  screenFit?: 'contain' | 'cover'
  screenPosition?: { x: number; y: number }
  screenBackdrop?: 'ambient' | 'black'
  href: string
  external: boolean
}

const CINEMA_MEDIA_ROOT = 'https://ufxqykf6ncbj7jav.public.blob.vercel-storage.com/cinema/full-v017'
const fullCinemaSrc = (slug: string) => `${CINEMA_MEDIA_ROOT}/${slug}.mp4`

const screenPresentation: Record<
  string,
  Pick<CinemaProject, 'screenFit' | 'screenPosition'> & Pick<CinemaProject, 'screenBackdrop'>
> = {
  'the-buzzer': {
    screenFit: 'contain',
    screenPosition: { x: 0.5, y: 0.5 },
    screenBackdrop: 'black',
  },
  'wing-battle': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  'damian-stone': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  'damian-stone-feature': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  'evil-eye': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  chilled: { screenFit: 'cover', screenPosition: { x: 0.5, y: 0.5 } },
  'the-client': {
    screenFit: 'contain',
    screenPosition: { x: 0.5, y: 0.5 },
    screenBackdrop: 'black',
  },
  'note-to-self': { screenFit: 'cover', screenPosition: { x: 0.5, y: 0.5 } },
  'the-giver': { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
  betrayed: { screenFit: 'contain', screenPosition: { x: 0.5, y: 0.5 } },
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
        | 'screenBackdrop'
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
  relationship: project.relationship,
  creditLabel: project.creditLabel,
  summary: project.summary,
  image: project.image,
  alt: project.alt,
  objectPosition: project.objectPosition,
  cinemaSrc: fullCinemaSrc(project.slug),
  fullscreenSrc: fullCinemaSrc(project.slug),
  playback: 'hosted',
  collection: 'creative-productions',
  cinemaMode: 'runtime',
  ...(screenPresentation[project.slug] ?? {
    screenFit: 'contain' as const,
    screenPosition: { x: 0.5, y: 0.5 },
  }),
  href: `/our-work/${project.slug}/`,
  external: false,
  ...(cinemaPresentationOverrides[project.slug] ?? {}),
}))

const studioProjects: CinemaProject[] = shotAtVibeshack.map((project) => {
  const hosted = project.playback === 'hosted'
  return {
    slug: project.slug,
    title: project.title,
    client: project.client,
    category: project.relationship === 'collaboration' ? 'collaboration' : 'shot-at-vibeshack',
    categoryLabel: project.relationship === 'collaboration' ? 'Production Collaboration' : 'Shot at VibeShack',
    relationship: project.relationship,
    creditLabel: project.creditLabel,
    summary: project.detail,
    image: project.image,
    alt: project.alt,
    objectPosition: project.objectPosition,
    cinemaSrc: hosted ? fullCinemaSrc(project.slug) : undefined,
    fullscreenSrc: hosted ? fullCinemaSrc(project.slug) : undefined,
    youtubeId: hosted ? undefined : project.youtubeId,
    playback: project.playback,
    collection: project.collection,
    cinemaMode: 'runtime',
    ...(screenPresentation[project.slug] ?? {
      screenFit: 'contain' as const,
      screenPosition: { x: 0.5, y: 0.5 },
    }),
    href: `https://www.youtube.com/watch?v=${project.youtubeId}`,
    external: true,
    ...(cinemaPresentationOverrides[project.slug] ?? {}),
  }
})

const cinemaProjectOrder = [
  'body-is-tea',
  'damian-stone',
  'damian-stone-feature',
  'evil-eye',
  'chilled',
  'the-client',
  'note-to-self',
  'the-giver',
  'betrayed',
  'gavriella',
  'the-buzzer',
  'wing-battle',
  'pearl-sitdown-matt-cross',
  'how-i-invest-trillion-company',
  'beyond-tomorrow-agi-control',
  'how-i-invest-future-venture-capital',
  'due-diligence-open-source-ai',
  'due-diligence-ai-agents',
  'beyond-tomorrow-longevity-emergency',
  'due-diligence-openai-data',
  'unpaused-infertility-crisis',
  'powerlaw-investor-roadshow',
  'beyond-tomorrow-aging-disease',
  'due-diligence-checks-on-vibes',
  'beyond-tomorrow-death-engineering',
  'beyond-tomorrow-cuba',
  'second-nature-ai-conservation',
  'second-nature-carbon-accounting',
  'unpaused',
  'second-nature',
  'vegas-veteran-voices',
  'scott-stephenson-ai-show',
  'jason-tartick',
  'varii-ballin-out',
] as const

const cinemaProjectRank = new Map<string, number>(
  cinemaProjectOrder.map((slug, index) => [slug, index]),
)

export const cinemaProjects: CinemaProject[] = [...portfolioProjects, ...studioProjects]
  .sort((left, right) => (
    (cinemaProjectRank.get(left.slug) ?? Number.MAX_SAFE_INTEGER)
    - (cinemaProjectRank.get(right.slug) ?? Number.MAX_SAFE_INTEGER)
  ))

const unorderedCinemaProject = cinemaProjects.find((project) => !cinemaProjectRank.has(project.slug))
if (unorderedCinemaProject || cinemaProjectOrder.length !== cinemaProjects.length) {
  throw new Error(`Cinema project order is incomplete${unorderedCinemaProject ? `: ${unorderedCinemaProject.slug}` : ''}`)
}

const uniqueSlugs = new Set(cinemaProjects.map((project) => project.slug))
if (uniqueSlugs.size !== cinemaProjects.length) {
  throw new Error('Cinema project slugs must be unique')
}

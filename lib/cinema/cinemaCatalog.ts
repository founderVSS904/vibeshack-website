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
  href: string
  external: boolean
}

const cinemaSrc = (slug: string) => `/studio-videos/cinema/cinema-${slug}-preview-v014.mp4`

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
  cinemaSrc: cinemaSrc(project.slug),
  href: `/our-work/${project.slug}/`,
  external: false,
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
    cinemaSrc: cinemaSrc(identity.slug),
    href: `https://www.youtube.com/watch?v=${project.youtubeId}`,
    external: true,
  }
})

export const cinemaProjects: CinemaProject[] = [...portfolioProjects, ...studioProjects]

const uniqueSlugs = new Set(cinemaProjects.map((project) => project.slug))
if (uniqueSlugs.size !== cinemaProjects.length) {
  throw new Error('Cinema project slugs must be unique')
}

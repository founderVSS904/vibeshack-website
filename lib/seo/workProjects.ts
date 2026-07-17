export type WorkCategorySlug =
  | 'all'
  | 'music-videos'
  | 'films'
  | 'series'
  | 'sports'
  | 'events'

export type WorkProject = {
  slug: string
  title: string
  category: Exclude<WorkCategorySlug, 'all'>
  categoryLabel: string
  client: string
  image: string
  // Sized-down variant for the native <video poster> attribute.
  poster?: string
  alt: string
  objectPosition?: string
  year: string
  // Either a YouTube id for embedded projects or a local video path for
  // films hosted on the site itself.
  youtubeId?: string
  video?: string
  // Short muted loop that plays while the card is hovered.
  hoverClip?: string
  serviceHref: string
  summary: string
  credits: string[]
}

export type ShotAtVibeshackItem = {
  title: string
  detail: string
  youtubeId: string
  image: string
  alt: string
  objectPosition?: string
  hoverClip?: string
}

export const workCategories: { slug: WorkCategorySlug; label: string }[] = [
  { slug: 'all', label: 'All Work' },
  { slug: 'music-videos', label: 'Music Videos' },
  { slug: 'films', label: 'Films' },
  { slug: 'series', label: 'Series' },
  { slug: 'sports', label: 'Sports' },
  { slug: 'events', label: 'Events' },
]

export const featuredWorkProject: WorkProject = {
  slug: 'body-is-tea',
  title: 'Body Is Tea',
  category: 'music-videos',
  categoryLabel: 'Music Video',
  client: 'Varii x Josh Sidhu',
  image: '/studio-images/work-body-is-tea-dancers-v20260716.jpg',
    hoverClip: '/studio-videos/work-hover-body-is-tea-v20260716.mp4',
  alt: 'Dancer mid-move in front of red lowriders in the Body Is Tea music video',
  objectPosition: 'center',
  year: '2026',
  youtubeId: '3Rbir7bu408',
  serviceHref: '/video-production/',
  summary:
    'A summer-soaked music video for Varii and Josh Sidhu: lowriders, dancers, and golden-hour driveways, presented by VibeShack Studios.',
  credits: ['Presented by VibeShack Studios', 'Directed by Gill'],
}

export const workProjects: WorkProject[] = [
  {
    slug: 'the-buzzer',
    title: 'The Buzzer',
    category: 'series',
    categoryLabel: 'Series',
    client: 'Silicon Mania',
    image: '/studio-images/work-the-buzzer-set-v20260716.jpg',
    hoverClip: '/studio-videos/work-hover-the-buzzer-v20260716.mp4',
    alt: 'A founder pitches an investor across the buzzer table on the Silicon Mania set',
    year: '2026',
    youtubeId: '3mLFnCovlF8',
    serviceHref: '/video-production/',
      summary:
      'A pitch show where founders pitch real investors, and the investors hold a buzzer that can end the meeting. Shot on a clean white set at VibeShack.',
    credits: ['A Silicon Mania production', 'Shot at VibeShack Studios'],
  },
  {
    slug: 'wing-battle',
    title: 'Wing Battle',
    category: 'events',
    categoryLabel: 'Event Film',
    client: "Melinda's Foods",
    image: '/studio-images/work-wing-battle-toast-v20260717.jpg',
    hoverClip: '/studio-videos/work-hover-wing-battle-v20260717.mp4',
    alt: "A competitor raises a drink outside the bar at Melinda's Wing Battle",
    year: '2025',
    youtubeId: 'tX5nk9EEBHs',
    serviceHref: '/video-production/',
      summary:
      "Event coverage of Melinda's Hot Sauce Wing Battle in Hayward, CA: pit smoke, hot sauce, competitors, and the crown.",
    credits: ["A Melinda's Hot Sauce event", 'Filmed in Hayward, CA'],
  },
  {
    slug: 'damian-stone',
    title: 'Damian Stone',
    category: 'sports',
    categoryLabel: 'Sports Film',
    client: 'Oakland Ballers',
    image: '/studio-images/work-damian-stone-gloves-v20260716.jpg',
    hoverClip: '/studio-videos/work-hover-damian-stone-v20260716.mp4',
    alt: 'Damian Stone pulls on his batting gloves in the dugout',
    year: '2026',
    youtubeId: 'i-YfBQia7UI',
    serviceHref: '/video-production/',
      summary:
      'A hype film for Oakland Ballers pitcher Damian Stone: pre-game ritual and locker-room texture, shot for game-day focus.',
    credits: ['For the Oakland Ballers'],
  },
  {
    slug: 'damian-stone-feature',
    title: 'Damian Stone: Player Feature',
    category: 'sports',
    categoryLabel: 'Player Feature',
    client: 'Oakland Ballers',
    image: '/studio-images/work-damian-stone-feature-v20260716.jpg',
    hoverClip: '/studio-videos/work-hover-damian-stone-feature-v20260716.mp4',
    alt: 'Damian Stone jogging across the outfield in his Oakland Ballers uniform',
    year: '2026',
    youtubeId: 'WWF3sDSyLJw',
    serviceHref: '/video-production/',
      summary:
      'A sit-down player feature with Oakland Ballers pitcher Damian Stone, cut between the interview chair and the ballpark.',
    credits: ['Directed by Akar', 'For the Oakland Ballers'],
  },
  {
    slug: 'evil-eye',
    title: 'Evil Eye',
    category: 'music-videos',
    categoryLabel: 'Music Video',
    client: 'Varii',
    image: '/studio-images/work-evil-eye-hummer-v20260716.jpg',
    hoverClip: '/studio-videos/work-hover-evil-eye-v20260716.mp4',
    alt: "Varii in front of a white Hummer's light bar at night",
    year: '2026',
    youtubeId: 'uNwd86wwgtc',
    serviceHref: '/video-production/',
      summary:
      'Varii at night: a white Hummer under hard light, with red typography cut over the San Francisco skyline.',
    credits: ['Presented by VibeShack', 'Night exteriors across San Francisco'],
  },
  {
    slug: 'chilled',
    title: 'Chilled',
    category: 'music-videos',
    categoryLabel: 'Music Video',
    client: 'TeYo',
    image: '/studio-images/work-chilled-teyo-v20260716.jpg',
    hoverClip: '/studio-videos/work-hover-chilled-v20260716.mp4',
    alt: 'Two friends on rooftop couches over a foggy San Francisco skyline in the Chilled music video',
    year: '2025',
    youtubeId: 'Y5GQGx1gbPE',
    serviceHref: '/video-production/',
    summary:
      'A night-drifting music video for TeYo: rooftop couches above a foggy skyline, empty streets, and a city cooling down after dark.',
    credits: ['A VibeShack Studios production with Opale and Zen Studios', 'Directed by Eden Moshe'],
  },
  {
    slug: 'the-client',
    title: 'The Client',
    category: 'films',
    categoryLabel: 'Short Film',
    client: 'The Babysitters',
    image: '/studio-images/work-the-client-bar-v20260716.jpg',
    poster: '/studio-images/poster-work-the-client-bar-v20260716.jpg',
    hoverClip: '/studio-videos/work-hover-the-client-v20260716.mp4',
    alt: 'The client and the fixer across a candlelit reading table in a neon bar',
    objectPosition: 'center 22%',
    year: '2026',
    video: '/studio-videos/film-the-client-v20260716.mp4',
    serviceHref: '/video-production/',
    summary:
      'An action short made for the SF 48 Hour Film Competition: a client, a fixer, and a card reading in a neon-lit bar. Part of The Babysitters.',
    credits: ['A VibeShack Studios film', 'Directed by Tay and Victor Li', 'Cinematography by Kylan Philipina and Breton'],
  },
  {
    slug: 'note-to-self',
    title: 'Note To Self',
    category: 'music-videos',
    categoryLabel: 'Visualizer',
    client: '97Shadd',
    image: '/studio-images/work-note-to-self-desk-v20260716.jpg',
    alt: '97Shadd at a desk under green and red neon in the Note To Self video',
    year: '2026',
    youtubeId: 'Ytvv1tTrvyI',
    hoverClip: '/studio-videos/work-hover-note-to-self-v20260716.mp4',
    serviceHref: '/video-production/',
    summary:
      "A neon studio session for 97Shadd's Note To Self: one desk, one late night, and the route out written across the frame.",
    credits: ['Directed and shot by Tay', 'Creative agency: VibeShack Studios', 'Edited by Erevnaa'],
  },
  {
    slug: 'the-giver',
    title: 'The Giver',
    category: 'music-videos',
    categoryLabel: 'Music Video',
    client: '97Shadd',
    image: '/studio-images/work-the-giver-portrait-v20260716.jpg',
    poster: '/studio-images/poster-work-the-giver-portrait-v20260716.jpg',
    alt: '97Shadd in a yellow cap mid-verse in The Giver music video',
    year: '2026',
    video: '/studio-videos/film-the-giver-v20260717.mp4',
    hoverClip: '/studio-videos/work-hover-the-giver-v20260716.mp4',
    serviceHref: '/video-production/',
    summary:
      'A music video for the Note To Self outro: a lone figure on a projected stage, planes on the runway, and the words carrying the weight.',
    credits: ['A VibeShack Studios production', 'Music video for the Note To Self EP'],
  },
  {
    slug: 'betrayed',
    title: 'Betrayed',
    category: 'music-videos',
    categoryLabel: 'Visualizer',
    client: 'Varii',
    image: '/studio-images/work-betrayed-rider-v20260716.jpg',
    hoverClip: '/studio-videos/work-hover-betrayed-v20260716.mp4',
    alt: 'A rider on a motorcycle under an overpass at night in Betrayed',
    year: '2025',
    youtubeId: 'Lmp5XUxPGYY',
    serviceHref: '/video-production/',
      summary:
      'A moody motorcycle visualizer for Varii, shot at night on San Francisco streets in teal and sodium light.',
    credits: ['Directed by Gill'],
  },
]

export const allWorkProjects: WorkProject[] = [featuredWorkProject, ...workProjects]

export function getWorkProject(slug: string) {
  return allWorkProjects.find((project) => project.slug === slug)
}

// Client shows and sessions filmed at VibeShack, linked straight to YouTube.
export const shotAtVibeshack: ShotAtVibeshackItem[] = [
  {
    title: 'unPAUSED',
    detail: 'Toxins, stress, and your hormones',
    youtubeId: 'ReIQcS8L6Hs',
    image: '/studio-images/work-unpaused-haver-podcast-v20260708.jpg',
    hoverClip: '/studio-videos/work-hover-unpaused-v20260716.mp4',
    alt: 'unPAUSED podcast recording in The Executive at VibeShack Studios',
    objectPosition: '80% center',
  },
  {
    title: 'Second Nature',
    detail: 'The AI world has a human problem',
    youtubeId: 'QMXrpJteBXA',
    image: '/studio-images/work-second-nature-set-v20260716.jpg',
    hoverClip: '/studio-videos/work-hover-second-nature-v20260716.mp4',
    alt: 'Second Nature hosts in conversation on the white set at VibeShack Studios',
  },
  {
    title: 'Vegas Veteran Voices',
    detail: 'The man behind Terminal Lance',
    youtubeId: 'E893IZTGmrQ',
    image: '/studio-images/work-vegas-veteran-voices-v20260709.jpg',
    hoverClip: '/studio-videos/work-hover-vegas-veteran-v20260716.mp4',
    alt: 'Vegas Veteran Voices interview at VibeShack Studios',
  },
  {
    title: 'Scott Stephenson AI Show',
    detail: 'Protecting your IP from AI training',
    youtubeId: 'dKY24SpeYKo',
    image: '/studio-images/work-ai-show-host-v20260716.jpg',
    hoverClip: '/studio-videos/work-hover-ai-show-v20260716.mp4',
    alt: 'Scott Stephenson recording the AI Show at VibeShack Studios',
  },
  {
    title: 'Jason Tartick',
    detail: 'Ross Pomerantz, the BTS of Corporate Bro',
    youtubeId: '4zd17_NxABw',
    image: '/studio-images/work-tartick-corporate-bro-v20260709.jpg',
    hoverClip: '/studio-videos/work-hover-jason-tartick-v20260716.mp4',
    alt: 'Jason Tartick podcast conversation at VibeShack Studios',
  },
  {
    title: 'Gavriella',
    detail: 'Supernova, official music video',
    youtubeId: 'J4ZKUYv4JqY',
    image: '/studio-images/work-gavriella-tableau-v20260716.jpg',
    hoverClip: '/studio-videos/work-hover-gavriella-v20260716.mp4',
    alt: 'Gavriella and dancers in a white tableau from the Supernova music video',
  },
  {
    title: 'Varii',
    detail: 'Ballin Out, official video',
    youtubeId: '2nJD5lCXbuo',
    image: '/studio-images/work-ballin-out-court-v20260716.jpg',
    hoverClip: '/studio-videos/work-hover-ballin-out-v20260716.mp4',
    alt: 'Varii on the basketball court in the Ballin Out music video',
  },
]

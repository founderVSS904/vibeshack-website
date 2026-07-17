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
  alt: string
  objectPosition?: string
  year: string
  // Either a YouTube id for embedded projects or a local video path for
  // films hosted on the site itself.
  youtubeId?: string
  video?: string
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
  image: '/studio-images/work-body-is-tea-music-v20260708b.jpg',
  alt: 'Body Is Tea music video title card with dancers in a sunny driveway',
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
    image: '/studio-images/work-the-buzzer-silicon-mania-v20260708.jpg',
    alt: 'The Buzzer title card over the Silicon Mania pitch show set',
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
    image: '/studio-images/work-wing-battle-melindas-v20260708b.jpg',
    alt: "Melinda's Hot Sauce Wing Battle title card over grilled wings",
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
    image: '/studio-images/work-damian-stone-film-v20260709.jpg',
    alt: 'Damian Stone title card over an Oakland Ballers portrait',
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
    image: '/studio-images/work-damian-stone-feature-v20260709.jpg',
    alt: 'Damian Stone player feature title card over the Oakland ballpark',
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
    image: '/studio-images/work-evil-eye-varii-v20260709.jpg',
    alt: 'Evil Eye title in red over the San Francisco waterfront at night',
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
    image: '/studio-images/work-the-client-film-v20260716.jpg',
    alt: 'The Client title card over a neon-lit bar at VibeShack Studios',
    year: '2026',
    video: '/studio-videos/film-the-client-v20260716.mp4',
    serviceHref: '/video-production/',
    summary:
      'An action short made for the SF 48 Hour Film Competition: a client, a fixer, and a card reading in a neon-lit bar. Part of The Babysitters.',
    credits: ['A VibeShack Studios film', 'Directed by Tay and Victor Li', 'Cinematography by Kylan Philipina and Breton'],
  },
  {
    slug: 'remote',
    title: 'Remote',
    category: 'films',
    categoryLabel: 'Short Film',
    client: 'Zen Studios',
    image: '/studio-images/work-remote-film-v20260716.jpg',
    alt: 'A lone figure on a BART platform as the train stops in the Remote short film',
    year: '2026',
    video: '/studio-videos/film-remote-v20260716.mp4',
    serviceHref: '/video-production/',
    summary:
      'A night thriller that starts on a BART platform: a remote viewer, a blindfold, and a drive across the city that goes wrong.',
    credits: ['Directed by James Merkle', 'Starring Jeremy Tinaco', 'Produced by Tay'],
  },
  {
    slug: 'unforgiven',
    title: 'Unforgiven',
    category: 'films',
    categoryLabel: 'Short Film',
    client: 'VibeShack Studios',
    image: '/studio-images/work-unforgiven-film-v20260716.jpg',
    alt: 'Unforgiven title in red over a dim kitchen scene',
    year: '2026',
    video: '/studio-videos/film-unforgiven-v20260716.mp4',
    serviceHref: '/video-production/',
    summary:
      'A quiet domestic thriller in a San Francisco house: a man, a kitchen, and a confrontation that has been waiting a long time.',
    credits: ['Directed by Tay and Victor Li', 'Starring Elijah J. Roberts and Ashleigh Culiver', 'Produced by Gill'],
  },
  {
    slug: 'in-a-restless-moment',
    title: 'In a Restless Moment',
    category: 'films',
    categoryLabel: 'Short Film',
    client: 'Huey Lee',
    image: '/studio-images/work-restless-moment-film-v20260716.jpg',
    alt: 'In a Restless Moment title card over a woman waking in a dark hotel room',
    year: '2024',
    youtubeId: 't1dglFWDYKQ',
    serviceHref: '/video-production/',
    summary:
      'A quiet hotel-set short film: hair rollers and a tuxedo, an elevator ride down, and a candlelit dinner shot in warm, low light.',
    credits: ['Directed by Huey Lee', 'Filmed by Kylan Breton'],
  },
  {
    slug: 'betrayed',
    title: 'Betrayed',
    category: 'music-videos',
    categoryLabel: 'Visualizer',
    client: 'Varii',
    image: '/studio-images/work-betrayed-varii-v20260709.jpg',
    alt: 'Betrayed title card beside a motorcycle helmet at night',
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
    alt: 'unPAUSED podcast recording in The Executive at VibeShack Studios',
    objectPosition: '80% center',
  },
  {
    title: 'unPAUSED',
    detail: 'Your biological clock and fertility',
    youtubeId: 'EFNL3qdbuTY',
    image: '/studio-images/work-unpaused-clock-v20260709.jpg',
    alt: 'unPAUSED podcast host recording in The Executive at VibeShack Studios',
  },
  {
    title: 'Second Nature',
    detail: 'The AI world has a human problem',
    youtubeId: 'QMXrpJteBXA',
    image: '/studio-images/work-second-nature-insider-v20260709.jpg',
    alt: 'Second Nature podcast title frame on a white set at VibeShack Studios',
  },
  {
    title: 'Second Nature',
    detail: 'Why AI companies will fund conservation',
    youtubeId: 'wcw1iTPfsBM',
    image: '/studio-images/work-second-nature-conservation-v20260709.jpg',
    alt: 'Second Nature podcast two-shot on a white set at VibeShack Studios',
  },
  {
    title: 'Second Nature',
    detail: '400 carbon accounting companies',
    youtubeId: 'nkpMFBT1zV4',
    image: '/studio-images/work-second-nature-carbon-v20260709.jpg',
    alt: 'Second Nature podcast conversation at VibeShack Studios',
  },
  {
    title: 'Vegas Veteran Voices',
    detail: 'The man behind Terminal Lance',
    youtubeId: 'E893IZTGmrQ',
    image: '/studio-images/work-vegas-veteran-voices-v20260709.jpg',
    alt: 'Vegas Veteran Voices interview at VibeShack Studios',
  },
  {
    title: 'Scott Stephenson AI Show',
    detail: 'Protecting your IP from AI training',
    youtubeId: 'dKY24SpeYKo',
    image: '/studio-images/work-scott-stephenson-v20260709.jpg',
    alt: 'Scott Stephenson talk recorded at VibeShack Studios',
  },
  {
    title: 'Jason Tartick',
    detail: 'Ross Pomerantz, the BTS of Corporate Bro',
    youtubeId: '4zd17_NxABw',
    image: '/studio-images/work-tartick-corporate-bro-v20260709.jpg',
    alt: 'Jason Tartick podcast conversation at VibeShack Studios',
  },
  {
    title: 'Gavriella',
    detail: 'Supernova, official music video',
    youtubeId: 'J4ZKUYv4JqY',
    image: '/studio-images/work-supernova-gavriella-v20260709.jpg',
    alt: 'Gavriella Supernova music video frame',
  },
  {
    title: 'Varii',
    detail: 'Ballin Out, official video',
    youtubeId: '2nJD5lCXbuo',
    image: '/studio-images/work-ballin-out-varii-v20260709.jpg',
    alt: 'Varii Ballin Out music video frame',
  },
]

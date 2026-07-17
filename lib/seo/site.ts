export const siteUrl = 'https://www.vibeshackstudios.com'
export const peerspaceUrl = 'https://www.peerspace.com/pages/listings/683fde213c77922ff2b31a0f'

export const parentBrand = {
  name: 'VibeShack',
  descriptor: 'Media company and brand studio',
  description:
    'VibeShack is a media company and brand studio for creators, founders, and companies that need content, campaigns, and production support. VibeShack Studios is the San Francisco production arm of the company.',
  shortDescription:
    'VibeShack is the media company and brand studio. VibeShack Studios is the San Francisco production arm.',
}

export const founders = [
  {
    name: 'Emmanuel Tay',
    role: 'CEO, Brand and Systems Architect',
    sameAs: 'https://contra.com/emmanuel_tay_xq77ex4m',
  },
  {
    name: 'Prabhnoor Gill',
    role: 'President, Chief Operations Officer',
    sameAs: 'https://2025springshow.academyart.edu/student/prabhnoor-gill/',
  },
  {
    name: 'Akar Sharma',
    role: 'VP, Chief Financial Officer',
  },
]

export const peerspaceListings = [
  {
    name: 'White Cyc Studio for Photo, Video & Product Shoots',
    serviceType: 'White Cyc Studio Rental',
    href: 'https://www.peerspace.com/pages/listings/683fde213c77922ff2b31a0f',
    price: '$100/hr',
  },
  {
    name: 'Full Green Screen Studio for Video, Training & Commercials',
    serviceType: 'Green Screen Studio Rental',
    href: 'https://www.peerspace.com/pages/listings/689d6738fd3071ac60b894ab/',
    price: '$100/hr on Peerspace',
  },
  {
    name: 'Customizable Podcast Studio with 3 Cameras & Crew',
    serviceType: 'Podcast Studio Rental',
    href: 'https://www.peerspace.com/pages/listings/69cef07b46adc7aec8988aae',
    price: '$400/hr on Peerspace',
  },
  {
    name: 'Modern Podcast Studio with 3-Camera Setup & Pro Audio',
    serviceType: 'Podcast Studio Rental',
    href: 'https://www.peerspace.com/pages/listings/69699d2a7d5d350c77c55e6c',
    price: '$300/hr on Peerspace',
  },
  {
    name: 'Two-Person Podcast Studio with 3 Cameras & On-Site Tech',
    serviceType: 'Podcast Studio Rental',
    href: 'https://www.peerspace.com/pages/listings/69cee68582e51bbae5087589',
    price: '$300/hr on Peerspace',
  },
  {
    name: 'Premium Interview Podcast Studio with Walnut Set & 3 Cameras',
    serviceType: 'Podcast Studio Rental',
    href: 'https://www.peerspace.com/pages/listings/69699a9e7d5d350c77c55e32',
    price: '$300/hr on Peerspace',
  },
  {
    name: 'Sunset Podcast Studio with 4K Cameras & Pro Audio',
    serviceType: 'Podcast Studio Rental',
    href: 'https://www.peerspace.com/pages/listings/69a348681710c446c2a7e0aa',
    price: '$300/hr on Peerspace',
  },
  {
    name: 'Photo & Video Studio with HMU Room for Interviews & Portraits',
    serviceType: 'Photo and Video Studio Rental',
    href: 'https://www.peerspace.com/pages/listings/696b13947d5d350c77c56c90',
    price: '$75/hr on Peerspace',
  },
]

export const externalProfiles = [
  { label: 'Instagram @vibeshackhq', href: 'https://www.instagram.com/vibeshackhq/' },
  { label: 'Instagram @vibeshackstudios_', href: 'https://www.instagram.com/vibeshackstudios_' },
  { label: 'YouTube @VibeShackStudios', href: 'https://www.youtube.com/@VibeShackStudios' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/vibeshack-studios' },
  { label: 'Linktree', href: 'https://linktr.ee/Vibeshack_studios' },
  { label: 'Peerspace white cyc listing', href: peerspaceListings[0].href },
  { label: 'Peerspace green screen listing', href: peerspaceListings[1].href },
  { label: 'Peerspace podcast listing', href: peerspaceListings[2].href },
  { label: 'Peerspace sunset podcast listing', href: peerspaceListings[6].href },
  { label: 'Peerspace photo and video studio listing', href: peerspaceListings[7].href },
  { label: 'IMDbPro production company profile', href: 'https://pro.imdb.com/company/co1101816/' },
]

export const citationTargets = [
  'Google Business Profile',
  'Apple Business Connect',
  'Bing Places',
  'Yelp',
  'Peerspace',
  'Instagram',
  'YouTube',
  'LinkedIn',
  'IMDb / IMDbPro',
  'Local production directories',
]

export const business = {
  name: 'VibeShack Studios',
  legalName: 'VibeShack Studios LLC',
  tagline: 'The Dream Factory',
  description:
    "The San Francisco production arm of VibeShack, a media company and brand studio. VibeShack Studios offers professional podcast, green screen, photo, video, and white cyc production spaces in the Northern Waterfront. Open 24/7.",
  entityRelationship:
    'VibeShack is the media company and brand studio. VibeShack Studios is its San Francisco production arm at 950 Battery St, San Francisco, CA 94111.',
  email: 'founder@vibeshackstudios.com',
  phone: '+1 (845) 381-2289',
  address: {
    streetAddress: '950 Battery St',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94111',
    addressCountry: 'US',
  },
  neighborhood: 'Northern Waterfront',
  priceRange: '$100-$400/hr; custom quotes',
  geo: {
    latitude: 37.8009,
    longitude: -122.4003,
  },
  mapUrl: 'https://maps.google.com/?q=950+Battery+St+San+Francisco+CA+94111',
  logo: `${siteUrl}/brand/vibeshack/monogram-red-transparent.png`,
  image: `${siteUrl}/og-image.jpg`,
  sameAs: [
    ...externalProfiles.map((profile) => profile.href),
    ...founders.map((founder) => founder.sameAs).filter((href): href is string => Boolean(href)),
  ],
}

export const moneyPages = [
  {
    href: '/podcast-studio-san-francisco/',
    label: 'Podcast Studio San Francisco',
    keyword: 'podcast studio san francisco',
    description: 'Podcast sets with broadcast microphones, 4K cameras, and crew options.',
  },
  {
    href: '/commercials/',
    label: 'Commercial Video Production San Francisco',
    keyword: 'commercial video production san francisco',
    description: 'Launch ads, talking-head videos, product demos, founder videos, and campaign spots produced at VibeShack.',
  },
  {
    href: '/editorials/',
    label: 'Editorial Photoshoots San Francisco',
    keyword: 'editorial photoshoot san francisco',
    description: 'Fashion, beauty, portraits, lookbooks, cover art, campaign stills, and content-day photography.',
  },
  {
    href: '/branding/',
    label: 'Branding and Creative Direction',
    keyword: 'branding creative direction san francisco',
    description: 'Creative direction, launch systems, visual identity, content systems, and brand decks.',
  },
  {
    href: '/green-screen-studio-sf/',
    label: 'Green Screen Studio SF',
    keyword: 'green screen studio san francisco',
    description: 'Floor-to-ceiling green screen studio for video, interviews, and commercial shoots.',
  },
  {
    href: '/photo-services/',
    label: 'Photo Services San Francisco',
    keyword: 'photo services san francisco',
    description: 'Headshots, portraits, product photos, lookbooks, press images, and campaign stills produced at VibeShack.',
  },
  {
    href: '/video-production/',
    label: 'Video Production San Francisco',
    keyword: 'video production san francisco',
    description: 'Production-ready rooms for interviews, social video, brand content, green screen, and content days.',
  },
  {
    href: '/canvas-rental/',
    label: 'White Cyc Studio San Francisco',
    keyword: 'white cyc studio san francisco',
    description: 'Canvas Rental white cyc wall studio for photo, video, and clean content production.',
  },
  {
    href: '/rental-studios/',
    label: 'Rental Studios San Francisco',
    keyword: 'studio rental san francisco',
    description: 'Hourly production spaces for clients bringing their own crew.',
  },
  {
    href: '/our-work/',
    label: 'VibeShack Our Work',
    keyword: 'vibeshack portfolio',
    description: 'Portfolio proof for commercials, documentaries, editorials, podcasts, music videos, and branding.',
  },
]

type StudioOffer = {
  name: string
  serviceType: string
  href: string
  minPrice?: string
  maxPrice?: string
  unitText?: string
}

export const studioOffers: StudioOffer[] = [
  { name: 'Podcast Studio Rental', serviceType: 'Podcast Studio Rental', href: '/podcast-studio-san-francisco/', minPrice: '300', maxPrice: '400', unitText: 'hour' },
  { name: 'Commercial Video Production', serviceType: 'Commercial Video Production', href: '/commercials/' },
  { name: 'Editorial Photoshoots', serviceType: 'Editorial Photography Services', href: '/editorials/' },
  { name: 'Branding and Creative Direction', serviceType: 'Branding and Creative Direction', href: '/branding/' },
  { name: 'Green Screen Studio Rental', serviceType: 'Green Screen Studio Rental', href: '/green-screen-studio-sf/', minPrice: '100', maxPrice: '100', unitText: 'hour' },
  { name: 'Photo Services', serviceType: 'Photography Services', href: '/photo-services/' },
  { name: 'Video Production Services', serviceType: 'Video Production', href: '/video-production/' },
  { name: 'White Cyc Studio Rental', serviceType: 'White Cyc Studio Rental', href: '/canvas-rental/', minPrice: '100', maxPrice: '100', unitText: 'hour' },
  { name: 'Production Studio Rental', serviceType: 'Production Studio Rental', href: '/rental-studios/', minPrice: '100', maxPrice: '400', unitText: 'hour' },
]

export function absoluteUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

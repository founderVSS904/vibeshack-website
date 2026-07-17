export interface Studio {
  id: string
  name: string
  price: number
  tag: string | null
  description: string
  heroImage: string
  photos: string[]
  includes: string[]
  type: string
  prep: string[]
}

export interface AddOn {
  id: string
  name: string
  description: string
  price: number
}

export interface RecurringOption {
  id: string
  label: string
  discount: number
}

export const STUDIOS: Studio[] = [
  {
    id: 'the-executive',
    name: 'The Executive',
    price: 300,
    tag: 'Walnut Series',
    description: 'Wood slat walls. Leather seating. Three cameras. Cameraman included.',
    heroImage: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg',
    photos: ['/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg', '/studio-images/enhanced-executive-podcast-guest-closeup-v20260510.jpg'],
    includes: ['3-camera 4K setup', 'Broadcast microphones', 'Cameraman included', 'Walnut Series design', 'Hair & Makeup room', '6-12hr footage turnaround'],
    type: 'podcast',
    prep: [
      'Have your talking points or outline ready.',
      'Hair & Makeup room on-site.',
      "Wear what you'd wear on camera. Avoid busy patterns, fine stripes, or logos. Solid colors film best.",
      'Everything is set up and ready when you arrive.',
    ],
  },
  {
    id: 'the-wing',
    name: 'The Wing',
    price: 300,
    tag: 'Walnut Series',
    description: 'Wood slat walls. Leather seating. Three cameras. Cameraman included.',
    heroImage: '/studio-images/the-wing-hero.jpg',
    photos: ['/studio-images/the-wing-hero.jpg', '/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg', '/studio-images/the-wing-3.jpg'],
    includes: ['3-camera 4K setup', 'Broadcast microphones', 'Cameraman included', 'Walnut Series design', 'Intimate layout', '6-12hr footage turnaround'],
    type: 'podcast',
    prep: [
      'Great for interviews and co-hosted formats.',
      "Have your guest's name ready and we'll label their mic.",
      'Hair & Makeup room on-site for both host and guest.',
      "Arrive together or separately. Both seats will be ready.",
    ],
  },
  {
    id: 'encore',
    name: 'Encore',
    price: 300,
    tag: 'Vault Series',
    description: 'Three cameras. Broadcast audio. Cameraman included.',
    heroImage: '/studio-images/enhanced-encore-podcast-wide-v20260510.jpg',
    photos: ['/studio-images/enhanced-encore-podcast-wide-v20260510.jpg'],
    includes: ['3-camera 4K setup', 'Broadcast microphones', 'Cameraman included', 'Hair & Makeup room', '6-12hr footage turnaround'],
    type: 'podcast',
    prep: [
      'Have your talking points or outline ready.',
      'Hair & Makeup room on-site.',
      "Wear what you'd wear on camera. Avoid busy patterns, fine stripes, or logos. Solid colors film best.",
      'Everything is set up and ready when you arrive.',
    ],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    price: 300,
    tag: 'Creative Series',
    description: 'Programmable color backdrop. Pick your mood. Cameraman included.',
    heroImage: '/studio-images/sunset-hero-v20260509.jpg',
    photos: ['/studio-images/sunset-hero-v20260509.jpg'],
    includes: ['3-camera 4K setup', 'Broadcast microphones', 'Cameraman included', 'Programmable color backdrop', 'Two leather sofas', '6-12hr footage turnaround'],
    type: 'podcast',
    prep: [
      "Pick your backdrop color before you arrive and we'll have it set.",
      "Wear what you'd wear on camera. Avoid busy patterns, fine stripes, or logos. Solid colors film best.",
      'Have your talking points ready.',
      'Everything is set up when you walk in.',
    ],
  },
  {
    id: 'parlor',
    name: 'Parlor',
    price: 400,
    tag: 'Premium',
    description: 'Premium interview setup. Chesterfield seating. Full crew included.',
    heroImage: '/studio-images/parlor-production-v20260509.jpg',
    photos: ['/studio-images/parlor-hero.jpg', '/studio-images/parlor-side-v20260509.jpg', '/studio-images/parlor-angled-v20260509.jpg'],
    includes: ['Custom setup', 'Full 4K production', 'Cameraman + producer', 'Chesterfield seating', '6-12hr footage turnaround'],
    type: 'podcast',
    prep: [
      'Schedule a strategy call before your session.',
      'Bring any visuals, slides, or graphics you want on screen.',
      'Have your guest confirmed and briefed.',
      'Everything else is on us.',
    ],
  },
  {
    id: 'horizon',
    name: 'Horizon',
    price: 400,
    tag: 'Premium',
    description: 'Immersive setup. Warm sunset environment. Full crew included.',
    heroImage: '/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg',
    photos: ['/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg', '/studio-images/enhanced-horizon-orange-guest-closeup-v20260510.jpg', '/studio-images/enhanced-horizon-warm-guest-closeup-v20260510.jpg'],
    includes: ['Custom setup', 'Full 4K production', 'Cameraman + producer', 'Curated sunset environment', '6-12hr footage turnaround'],
    type: 'podcast',
    prep: [
      'Schedule a strategy call before your session.',
      'Bring any visuals, slides, or graphics you want on screen.',
      'Have your guest confirmed and briefed.',
      'Everything else is on us.',
    ],
  },
  {
    id: 'canvas-podcast',
    name: 'Canvas Podcast',
    price: 400,
    tag: 'Premium',
    description: 'Custom LED backdrop podcast studio. Full crew included.',
    heroImage: '/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg',
    photos: ['/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg', '/studio-images/enhanced-canvas-podcast-warm-panel-wide-v20260510.jpg', '/studio-images/enhanced-canvas-podcast-red-set-wide-v20260510.jpg'],
    includes: ['Custom LED backdrop', '3-camera 4K setup', 'Broadcast microphones', 'Full crew included', 'Premium lighting', '6-12hr footage turnaround'],
    type: 'podcast',
    prep: [
      'Send your desired background color or brand direction ahead of time.',
      'Have your talking points, rundown, or interview outline ready.',
      'Solid colors film best against the LED backdrop.',
      'Everything is set up and crewed when you arrive.',
    ],
  },
  {
    id: 'green-screen',
    name: 'Green Screen Studio',
    price: 100,
    tag: null,
    description: '750 square feet. Floor-to-ceiling. Lighting grid.',
    heroImage: '/studio-images/inside-green-screen-v20260509.jpg',
    photos: ['/studio-images/inside-green-screen-v20260509.jpg', '/studio-images/greenscreen-wide.jpg'],
    includes: ['750 sqft green screen', 'Full lighting grid', 'RED Komodo X available', 'Professional lighting', 'Floor-to-ceiling setup'],
    type: 'greenscreen',
    prep: [
      'Avoid wearing green or bright lime. It blends with the screen.',
      'Solid colors work best. Avoid fine patterns or stripes.',
      'Bring your shot list or storyboard if you have one.',
      'Lighting is pre-rigged. Walk in and start shooting.',
    ],
  },
  {
    id: 'canvas-rental',
    name: 'Canvas Rental',
    price: 100,
    tag: 'Creative Series',
    description: 'Seamless white cyc wall. Overhead lighting grid.',
    heroImage: '/studio-images/inside-canvas-cyc-v20260509.jpg',
    photos: ['/studio-images/inside-canvas-cyc-v20260509.jpg', '/studio-images/enhanced-canvas-podcast-white-cyc-duo-v20260510.jpg', '/studio-images/canvas-rental-space-v20260509.jpg'],
    includes: ['White cyc wall', 'Overhead lighting grid', 'Black floor mats', 'All equipment included'],
    type: 'photo',
    prep: [
      'White backdrop works with almost any outfit. Avoid all-white.',
      'Great for headshots, product shots, and clean video content.',
      'Bring any products or props you want featured.',
      'Setup is ready when you walk in.',
    ],
  },
]

export const ADDONS: AddOn[] = [
  { id: 'teleprompter', name: 'Teleprompter', description: 'Scroll your script hands-free, eye-level with the lens.', price: 25 },
]

export const RECURRING_OPTIONS: RecurringOption[] = [
  { id: 'weekly', label: 'Every week', discount: 10 },
  { id: 'biweekly', label: 'Every 2 weeks', discount: 7 },
  { id: 'monthly', label: 'Every month', discount: 5 },
]

export function getStudioById(id: string) {
  return STUDIOS.find((studio) => studio.id === id)
}

export function getAddOnById(id: string) {
  return ADDONS.find((addon) => addon.id === id)
}

export function getRecurringOptionById(id: string | null | undefined) {
  return id ? RECURRING_OPTIONS.find((option) => option.id === id) : undefined
}

export function calculateRecurringDiscountCents(baseSessionTotalCents: number, recurringId: string | null | undefined) {
  const option = getRecurringOptionById(recurringId)
  if (!option) return 0
  return Math.round((baseSessionTotalCents * option.discount) / 100)
}

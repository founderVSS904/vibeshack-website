export type TrustedLogo = {
  name: string
  src: string
  width: number
  height: number
  card?: 'dark'
  stripSrc?: string
  stripWidth?: number
  stripHeight?: number
  stripScale?: 'mark' | 'badge'
  stripLabel?: string
}

export const trustedLogos = [
  {
    name: 'BET',
    src: '/brand/trusted-by/clean/bet.png',
    width: 1100,
    height: 350,
  },
  {
    name: 'Front Office Sports',
    src: '/brand/trusted-by/clean/front-office-sports.png',
    width: 1100,
    height: 1100,
    stripSrc: '/brand/trusted-by/strip/front-office-sports.png',
    stripWidth: 696,
    stripHeight: 296,
    stripScale: 'mark',
  },
  {
    name: 'Hey AI Podcast',
    src: '/brand/trusted-by/clean/hey-ai-podcast.png',
    width: 1100,
    height: 1100,
    stripSrc: '/brand/trusted-by/strip/hey-ai-podcast.png',
    stripWidth: 1100,
    stripHeight: 830,
    stripScale: 'badge',
  },
  {
    name: 'Alex Fitness',
    src: '/brand/trusted-by/clean/alex-fitness.png',
    width: 723,
    height: 1100,
    stripScale: 'badge',
  },
  {
    name: 'Shagun',
    src: '/brand/trusted-by/clean/shagun.png',
    width: 1100,
    height: 604,
    stripScale: 'mark',
  },
  {
    name: '141 Studios',
    src: '/brand/trusted-by/clean/141-studios.png',
    width: 1100,
    height: 743,
    stripScale: 'mark',
  },
  {
    name: 'Dollars & Donuts Productions',
    src: '/brand/trusted-by/clean/dollars-donuts.png',
    width: 1100,
    height: 978,
    stripScale: 'badge',
    stripLabel: 'Dollars & Donuts',
  },
  {
    name: 'Saviynt',
    src: '/brand/trusted-by/clean/saviynt.png',
    width: 1100,
    height: 252,
  },
  {
    name: 'Owner',
    src: '/brand/trusted-by/clean/owner.png',
    width: 1100,
    height: 333,
  },
  {
    name: 'OpusClip',
    src: '/brand/trusted-by/clean/opusclip.svg',
    width: 1030,
    height: 240,
    stripSrc: '/brand/trusted-by/strip/opusclip.svg',
    stripWidth: 1030,
    stripHeight: 240,
  },
  {
    name: "Melinda's Hot Sauce",
    src: '/brand/trusted-by/clean/melindas-hot-sauce.png',
    width: 573,
    height: 640,
    stripScale: 'badge',
  },
  {
    name: 'Oxygen Conversation',
    src: '/brand/trusted-by/clean/oxygen-conversation.png',
    width: 1100,
    height: 1100,
    stripScale: 'mark',
  },
  {
    name: 'Silicon Mania',
    src: '/brand/trusted-by/clean/silicon-mania.png',
    width: 1100,
    height: 775,
    stripSrc: '/brand/trusted-by/strip/silicon-mania.png',
    stripWidth: 1091,
    stripHeight: 765,
    stripScale: 'badge',
  },
  {
    name: 'unPAUSED',
    src: '/brand/trusted-by/clean/unpaused.png',
    width: 1100,
    height: 177,
    card: 'dark',
  },
  {
    name: 'Vegas Veteran Voices',
    src: '/brand/trusted-by/clean/vegas-veteran-voices.png',
    width: 1100,
    height: 1064,
    stripScale: 'badge',
  },
] satisfies TrustedLogo[]

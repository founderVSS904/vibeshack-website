export type TrustedLogo = {
  name: string
  src: string
  width: number
  height: number
  card?: 'dark'
  stripCrop?: 'wide'
  stripScale?: 'mark'
  stripTreatment?: 'original' | 'invert'
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
    stripCrop: 'wide',
    stripScale: 'mark',
    stripTreatment: 'original',
  },
  {
    name: 'Hey AI Podcast',
    src: '/brand/trusted-by/clean/hey-ai-podcast.png',
    width: 1100,
    height: 1100,
    stripScale: 'mark',
    stripTreatment: 'original',
  },
  {
    name: 'Alex Fitness',
    src: '/brand/trusted-by/clean/alex-fitness.png',
    width: 723,
    height: 1100,
    stripScale: 'mark',
  },
  {
    name: 'Shagun',
    src: '/brand/trusted-by/clean/shagun.png',
    width: 1100,
    height: 604,
  },
  {
    name: '141 Studios',
    src: '/brand/trusted-by/clean/141-studios.png',
    width: 1100,
    height: 743,
  },
  {
    name: 'Dollars & Donuts Productions',
    src: '/brand/trusted-by/clean/dollars-donuts.png',
    width: 1100,
    height: 978,
    stripScale: 'mark',
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
    stripTreatment: 'invert',
  },
  {
    name: "Melinda's Hot Sauce",
    src: '/brand/trusted-by/clean/melindas-hot-sauce.png',
    width: 573,
    height: 640,
    stripScale: 'mark',
  },
  {
    name: 'Oxygen Conversation',
    src: '/brand/trusted-by/clean/oxygen-conversation.png',
    width: 1100,
    height: 1100,
    stripScale: 'mark',
    stripTreatment: 'invert',
  },
  {
    name: 'Silicon Mania',
    src: '/brand/trusted-by/clean/silicon-mania.png',
    width: 1100,
    height: 775,
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
    stripScale: 'mark',
  },
] satisfies TrustedLogo[]

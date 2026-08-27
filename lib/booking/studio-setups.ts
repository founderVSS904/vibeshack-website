export const WING_SETUPS = [
  {
    id: 'one-black-chair',
    label: '1 black chair',
    chairs: 1,
    width: 1448,
    height: 1086,
    image: '/studio-setups/the-wing/one-black-chair.webp',
    alt: 'One black leather chair in The Wing, with blue curtains, a leafy plant, and walnut slats.',
  },
  {
    id: 'one-brown-chair',
    label: '1 brown chair',
    chairs: 1,
    width: 1448,
    height: 1086,
    image: '/studio-setups/the-wing/one-brown-chair.webp',
    alt: 'One brown leather chair centered beneath The Wing’s round wall light, with a low table in front.',
  },
  {
    id: 'two-brown-chairs',
    label: '2 brown chairs',
    chairs: 2,
    width: 1448,
    height: 1086,
    image: '/studio-setups/the-wing/two-brown-chairs.webp',
    alt: 'Two brown leather chairs facing into a conversation setup beneath The Wing’s round wall light.',
  },
  {
    id: 'two-black-chairs',
    label: '2 black chairs',
    chairs: 2,
    width: 1448,
    height: 1086,
    image: '/studio-setups/the-wing/two-black-chairs.webp',
    alt: 'Two black leather chairs with a small glass table between them in The Wing.',
  },
] as const

export const EXECUTIVE_SETUPS = [
  {
    id: 'one-office-chair-desk',
    label: '1 black office chair with desk',
    chairs: 1,
    width: 1672,
    height: 941,
    image: '/studio-setups/the-executive/one-office-chair-desk.webp',
    alt: 'One black office chair behind a walnut desk in The Executive, with walnut slats and plants.',
  },
  {
    id: 'two-office-chairs-desk',
    label: '2 black office chairs with desk',
    chairs: 2,
    width: 1673,
    height: 879,
    image: '/studio-setups/the-executive/two-office-chairs-desk.webp',
    alt: 'Two black office chairs around a walnut desk in The Executive, with plants against the slatted wall.',
  },
  {
    id: 'three-black-armchairs',
    label: '3 black armchairs without desk',
    chairs: 3,
    width: 1688,
    height: 932,
    image: '/studio-setups/the-executive/three-black-armchairs.webp',
    alt: 'Three black leather armchairs in The Executive, without a desk, against walnut slats and plants.',
  },
] as const

export type StudioSetup = typeof WING_SETUPS[number] | typeof EXECUTIVE_SETUPS[number]
export type StudioSetupId = StudioSetup['id']
export type SetupStudioId = 'the-wing' | 'the-executive'

export function getStudioSetupCollection(studioId: string) {
  if (studioId === 'the-wing') return {
    studioName: 'The Wing',
    shortName: 'Wing',
    intro: 'Four setups, one studio. Choose the chair color and layout for your session.',
    countLabel: 'four',
    widePhotos: false,
    options: WING_SETUPS,
  }
  if (studioId === 'the-executive') return {
    studioName: 'The Executive',
    shortName: 'Executive',
    intro: 'Three setups, one studio. Choose the seating and desk arrangement for your session.',
    countLabel: 'three',
    widePhotos: true,
    options: EXECUTIVE_SETUPS,
  }
  return undefined
}

export function getStudioSetups(studioId: string): readonly StudioSetup[] {
  return getStudioSetupCollection(studioId)?.options || []
}

export function getStudioSetup(studioId: string, setupId: unknown) {
  return getStudioSetups(studioId).find((setup) => setup.id === setupId)
}

export class BookingSetupSelectionError extends Error {}

// Only new checkout requests require a choice. Older paid sessions and their
// resource locks must remain valid without inventing a chair arrangement.
export function validateBookingSetup(studioId: string, setupId: unknown): StudioSetupId | undefined {
  const options = getStudioSetups(studioId)
  if (options.length) {
    const setup = getStudioSetup(studioId, setupId)
    if (!setup) throw new BookingSetupSelectionError(`Choose a setup for ${getStudioSetupCollection(studioId)!.studioName} before continuing.`)
    return setup.id
  }
  if (setupId !== undefined && setupId !== null && setupId !== '') {
    throw new BookingSetupSelectionError('This setup is not available for the selected studio.')
  }
  return undefined
}

export function bookingSetupDescription(studioId: string, setupId: unknown) {
  const setup = getStudioSetup(studioId, setupId)
  if (setup) return `Setup: ${setup.label}`
  return getStudioSetups(studioId).length
    ? 'Setup not recorded. Please contact the studio to confirm the arrangement.'
    : ''
}

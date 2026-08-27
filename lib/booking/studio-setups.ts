export const WING_SETUPS = [
  {
    id: 'one-black-chair',
    label: '1 black chair',
    chairs: 1,
    image: '/studio-setups/the-wing/one-black-chair.webp',
    alt: 'One black leather chair in The Wing, with blue curtains, a leafy plant, and walnut slats.',
  },
  {
    id: 'one-brown-chair',
    label: '1 brown chair',
    chairs: 1,
    image: '/studio-setups/the-wing/one-brown-chair.webp',
    alt: 'One brown leather chair centered beneath The Wing’s round wall light, with a low table in front.',
  },
  {
    id: 'two-brown-chairs',
    label: '2 brown chairs',
    chairs: 2,
    image: '/studio-setups/the-wing/two-brown-chairs.webp',
    alt: 'Two brown leather chairs facing into a conversation setup beneath The Wing’s round wall light.',
  },
  {
    id: 'two-black-chairs',
    label: '2 black chairs',
    chairs: 2,
    image: '/studio-setups/the-wing/two-black-chairs.webp',
    alt: 'Two black leather chairs with a small glass table between them in The Wing.',
  },
] as const

export type StudioSetup = typeof WING_SETUPS[number]
export type StudioSetupId = StudioSetup['id']

export function getStudioSetups(studioId: string): readonly StudioSetup[] {
  return studioId === 'the-wing' ? WING_SETUPS : []
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
    if (!setup) throw new BookingSetupSelectionError('Choose a Wing setup before continuing.')
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

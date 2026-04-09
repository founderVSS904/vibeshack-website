#!/usr/bin/env node

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'o6atr16b',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const studios = [
  {
    _type: 'studio',
    id: 'podcast-sunset',
    name: 'The Executive',
    description: 'Wood slat walls. Leather seating. Three cameras. Cameraman included.',
    price: 300,
    tag: 'Walnut Series',
    type: 'podcast',
    series: 'walnut',
    order: 1,
    includes: ['3-camera 4K setup', 'Broadcast microphones', 'Cameraman included', 'Walnut Series design', 'Hair & Makeup room', '6-12hr footage turnaround'],
    prep: [
      'Have your talking points or outline ready.',
      'Hair & Makeup room on-site. Bring your own team or arrive ready.',
      'Wear what you would wear on camera. The lighting in this room is warm.',
      'We will be set up and ready when you walk in.',
    ],
  },
  {
    _type: 'studio',
    id: 'podcast-modern',
    name: 'Encore',
    description: 'Three cameras. Broadcast audio. Cameraman included.',
    price: 300,
    tag: 'Vault Series',
    type: 'podcast',
    series: 'vault',
    order: 2,
    includes: ['3-camera 4K setup', 'Broadcast microphones', 'Cameraman included', 'Hair & Makeup room', '6-12hr footage turnaround'],
    prep: [
      'Have your talking points or outline ready.',
      'Hair & Makeup room on-site.',
      'Bring your outline or notes.',
      'We will handle the rest.',
    ],
  },
  {
    _type: 'studio',
    id: 'podcast-cozy',
    name: 'The Wing',
    description: 'Intimate layout. Leather seating. Three cameras. Cameraman included.',
    price: 300,
    tag: 'Walnut Series',
    type: 'podcast',
    series: 'walnut',
    order: 3,
    includes: ['3-camera 4K setup', 'Broadcast microphones', 'Cameraman included', 'Walnut Series design', 'Hair & Makeup room', '6-12hr footage turnaround'],
    prep: [
      'Have your talking points or outline ready.',
      'Hair & Makeup room on-site.',
      'Intimate layout. Great for 2-4 people.',
      'Cameraman manages all setup.',
    ],
  },
  {
    _type: 'studio',
    id: 'sunset',
    name: 'Sunset',
    description: 'Programmable color backdrop. Four cameras. Cameraman included.',
    price: 300,
    tag: 'Creative Series',
    type: 'podcast',
    series: 'creative',
    order: 4,
    includes: ['4-camera 4K setup', 'Programmable color backdrop', 'Cameraman included', 'Creative Series design', '6-12hr footage turnaround'],
    prep: [
      'Bring your content ideas.',
      'The backdrop is fully programmable. Pick your color on arrival.',
      'Cameraman handles all technical setup.',
      'Hair & Makeup available.',
    ],
  },
  {
    _type: 'studio',
    id: 'white-backdrop',
    name: 'Canvas',
    description: 'White cyc wall. Lighting grid. Flexible rental space.',
    price: 100,
    tag: 'Creative Series',
    type: 'rental',
    series: 'creative',
    order: 5,
    includes: ['White cyc wall', 'Lighting grid', 'Flexible layout', 'Creative Series design'],
    prep: [
      'Bring your own camera equipment or rent from us.',
      'White cyc wall is endlessly versatile.',
      'Lighting grid gives you full control.',
      'Perfect for photo, video, or hybrid shoots.',
    ],
  },
  {
    _type: 'studio',
    id: 'photography',
    name: 'Photography Studio',
    description: 'Daylight windows. Backdrops. Lighting kit included.',
    price: 100,
    tag: 'Creative Series',
    type: 'rental',
    series: 'creative',
    order: 6,
    includes: ['Natural daylight', 'Professional backdrops', 'Lighting kit included', 'Creative Series design'],
    prep: [
      'Bring your camera or use ours.',
      'Daylight windows and adjustable backdrops.',
      'Lighting kit ready to go.',
      'Perfect for product, portrait, or lifestyle.',
    ],
  },
  {
    _type: 'studio',
    id: 'green-screen',
    name: 'Green Screen Studio',
    description: 'Infinite green wall. 4K cameras. Lighting rig.',
    price: 100,
    tag: 'Creative Series',
    type: 'rental',
    series: 'creative',
    order: 7,
    includes: ['Infinite green screen', '4K cameras available', 'Professional lighting rig', 'Creative Series design'],
    prep: [
      'Bring your footage or use ours.',
      'Green screen is fully lit and ready.',
      'We have 4K cameras available for rental.',
      'Perfect for VFX, compositing, or virtual backgrounds.',
    ],
  },
]

const addOns = [
  {
    _type: 'addOn',
    id: 'second-camera',
    name: 'Second Camera Angle',
    description: 'We add a second camera for more dynamic, multi-angle coverage.',
    price: 50,
    order: 1,
  },
  {
    _type: 'addOn',
    id: 'teleprompter',
    name: 'Teleprompter',
    description: 'Scroll your script hands-free, eye-level with the lens.',
    price: 25,
    order: 2,
  },
  {
    _type: 'addOn',
    id: 'strategy-call',
    name: 'Pre-Session Strategy Call',
    description: '30 minutes with our team to map out your content before you arrive.',
    price: 50,
    order: 3,
  },
  {
    _type: 'addOn',
    id: 'editing-hour',
    name: 'Editing Hour',
    description: 'One hour of post-production editing on your footage after the session.',
    price: 75,
    order: 4,
  },
]

async function populate() {
  try {
    console.log('Migrating studios to Sanity...')
    for (const studio of studios) {
      const result = await client.create(studio)
      console.log(`✓ ${result.name} ($${result.price}/hr)`)
    }

    console.log('\nMigrating add-ons to Sanity...')
    for (const addOn of addOns) {
      const result = await client.create(addOn)
      console.log(`✓ ${result.name} (+$${result.price})`)
    }

    console.log('\n✓ Migration complete!')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

populate()

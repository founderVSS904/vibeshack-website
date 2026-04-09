// This script migrates your hardcoded studio content into Sanity
// Run after Sanity project is set up with schema

import { createClient } from 'sanity'

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
  },
  {
    _type: 'studio',
    id: 'photography',
    name: 'Photography Studio',
    description: 'Daylight windows. Backdrops. Lighting kit included.',
    price: 100,
    tag: null,
    type: 'rental',
    series: 'creative',
    order: 6,
  },
  {
    _type: 'studio',
    id: 'green-screen',
    name: 'Green Screen Studio',
    description: 'Infinite green wall. 4K cameras. Lighting rig.',
    price: 100,
    tag: null,
    type: 'rental',
    series: 'creative',
    order: 7,
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

async function migrate() {
  try {
    console.log('Migrating studios to Sanity...')
    for (const studio of studios) {
      const result = await client.create(studio)
      console.log(`✓ Created: ${result.name}`)
    }

    console.log('\nMigrating add-ons to Sanity...')
    for (const addOn of addOns) {
      const result = await client.create(addOn)
      console.log(`✓ Created: ${result.name}`)
    }

    console.log('\n✅ Migration complete!')
  } catch (error) {
    console.error('Migration error:', error)
  }
}

migrate()

#!/usr/bin/env node

const fetch = require('node-fetch')

const projectId = 'o6atr16b'
const dataset = 'production'
const token = process.env.SANITY_API_TOKEN

// Studio schema definition
const schema = {
  name: 'studio',
  title: 'Studio',
  type: 'document',
  fields: [
    { name: 'id', title: 'ID', type: 'string' },
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'description', title: 'Description', type: 'string' },
    { name: 'price', title: 'Price', type: 'number' },
    { name: 'tag', title: 'Tag', type: 'string' },
    { name: 'type', title: 'Type', type: 'string' },
    { name: 'heroImage', title: 'Hero Image', type: 'image' },
    { name: 'photos', title: 'Photos', type: 'array', of: [{ type: 'image' }] },
    { name: 'includes', title: 'Includes', type: 'array', of: [{ type: 'string' }] },
    { name: 'prep', title: 'Prep', type: 'array', of: [{ type: 'string' }] },
    { name: 'series', title: 'Series', type: 'string' },
    { name: 'order', title: 'Order', type: 'number' },
  ],
}

const schemaUrl = `https://${projectId}.api.sanity.io/v2021-06-07/schemas/studio`

fetch(schemaUrl, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(schema),
})
  .then((res) => res.json())
  .then((data) => {
    console.log('Schema deployed:', data)
  })
  .catch((err) => {
    console.error('Error:', err)
  })

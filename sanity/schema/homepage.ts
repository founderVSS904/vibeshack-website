import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Hero tagline text',
    }),
    defineField({
      name: 'statement',
      title: 'Statement Section',
      type: 'text',
      description: 'The belief/philosophy statement',
    }),
    defineField({
      name: 'differentiators',
      title: 'Differentiators',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'n', type: 'string', title: 'Number' },
            { name: 'label', type: 'string', title: 'Label' },
            { name: 'sub', type: 'string', title: 'Subtext' },
          ],
        },
      ],
      description: '4 key differentiators (24/7, pricing, turnaround, etc.)',
    }),
    defineField({
      name: 'filmStripImages',
      title: 'Film Strip Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: '18 images for the marquee section',
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Button Text',
      type: 'string',
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA Link',
      type: 'string',
      description: 'e.g., "/book" or "/find-your-studio"',
    }),
  ],
})

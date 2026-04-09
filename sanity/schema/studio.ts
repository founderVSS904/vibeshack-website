import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'studio',
  title: 'Studio',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'Studio ID',
      type: 'string',
      description: 'Internal ID (e.g., "podcast-sunset", "white-backdrop")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Studio Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'One-line description for listings',
    }),
    defineField({
      name: 'price',
      title: 'Price per Hour',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tag',
      title: 'Tag',
      type: 'string',
      description: 'e.g., "Most Popular", "Walnut Series", "Creative Series"',
      options: {
        list: [
          { title: 'Most Popular', value: 'Most Popular' },
          { title: 'Walnut Series', value: 'Walnut Series' },
          { title: 'Vault Series', value: 'Vault Series' },
          { title: 'Creative Series', value: 'Creative Series' },
        ],
      },
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Podcast', value: 'podcast' },
          { title: 'Rental', value: 'rental' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photos',
      title: 'Studio Photos',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Multiple photos for the studio page',
    }),
    defineField({
      name: 'includes',
      title: 'What\'s Included',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of features/amenities',
    }),
    defineField({
      name: 'prep',
      title: 'Prep Tips',
      type: 'array',
      of: [{ type: 'string' }],
      description: '4-5 tips for visitors',
    }),
    defineField({
      name: 'series',
      title: 'Series',
      type: 'string',
      description: 'Series grouping for internal linking',
      options: {
        list: [
          { title: 'Walnut', value: 'walnut' },
          { title: 'Vault', value: 'vault' },
          { title: 'Creative', value: 'creative' },
        ],
      },
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      price: 'price',
    },
    prepare(selection) {
      return {
        title: `${selection.title} ($${selection.price}/hr)`,
      }
    },
  },
})

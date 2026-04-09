import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'addOn',
  title: 'Add-On',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'Add-On ID',
      type: 'string',
      description: 'e.g., "second-camera", "teleprompter"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
    }),
  ],
})

import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = '2024-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // ISR handles caching
})

export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
}: {
  query: string
  params?: Record<string, any>
  tags?: string[]
}): Promise<T> {
  try {
    const data = await client.fetch<T>(query, params, {
      next: {
        revalidate: 60,
        tags,
      },
    })
    return data
  } catch (error) {
    console.error('Sanity fetch error:', error)
    throw error
  }
}

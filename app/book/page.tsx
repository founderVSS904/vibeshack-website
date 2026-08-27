import { redirect } from 'next/navigation'
import { getStudioById } from '@/lib/booking/catalog'
import { getStudioSetup } from '@/lib/booking/studio-setups'
import BookPageClient from './BookPageClient'

type SearchParams = Record<string, string | string[] | undefined>

interface BookPageProps {
  searchParams?: Promise<SearchParams>
}

function getValues(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

function queryWithoutStudio(params: SearchParams) {
  const clean = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (key === 'studio' || !value) continue

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) clean.append(key, item)
      })
    } else {
      clean.set(key, value)
    }
  }

  return clean.toString()
}

export default async function BookPage({ searchParams }: BookPageProps) {
  const params = (await searchParams) || {}
  const studioValues = getValues(params.studio)
  const hasValidSingleStudio = studioValues.length === 1 && !!getStudioById(studioValues[0])

  if (studioValues.length > 0 && !hasValidSingleStudio) {
    const query = queryWithoutStudio(params)
    redirect(query ? `/book/?${query}` : '/book/')
  }

  const initialStudioId = hasValidSingleStudio ? studioValues[0] : ''
  const initialSetupId = typeof params.setup === 'string'
    ? getStudioSetup(initialStudioId, params.setup)?.id
    : undefined

  return (
    <BookPageClient
      initialStudioId={initialStudioId}
      initialSetupId={initialSetupId}
      hasSetupRequest={params.setup !== undefined}
    />
  )
}

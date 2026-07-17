import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Your Studio',
  description: 'Not sure which studio to book? Answer a few quick questions and get matched to a podcast, green screen, photo, or rental studio in San Francisco.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/find-your-studio/' },
}

export default function FindYourStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

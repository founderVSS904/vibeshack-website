import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Your Studio | VibeShack Studios SF',
  description: 'Not sure which studio to book? Answer a few quick questions and we\'ll match you to the perfect SF studio. Podcast, green screen, photography, and more. Book instantly.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/find-your-studio' },
}

export default function FindYourStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

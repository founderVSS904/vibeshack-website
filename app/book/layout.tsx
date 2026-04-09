import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Studio | VibeShack Studios',
  description: 'Book a podcast studio, green screen, or photography session in San Francisco. Instant confirmation. Starting at $100/hr.',
  alternates: {
    canonical: 'https://www.vibeshackstudios.com/book',
  },
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children
}

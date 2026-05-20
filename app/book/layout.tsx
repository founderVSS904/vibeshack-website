import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Studio',
  description: 'Book a podcast studio, green screen, white cyc, or photography studio rental in San Francisco. Instant confirmation. Starting at $100/hr.',
  alternates: {
    canonical: 'https://www.vibeshackstudios.com/book/',
  },
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="sr-only">Book a VibeShack Studio in San Francisco</h1>
      {children}
    </>
  )
}

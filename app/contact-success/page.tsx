import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Message Sent | VibeShack Studios",
  description: "Thanks for reaching out. We'll be in touch within 2 business hours.",
}

export default function ContactSuccessPage() {
  return (
    <section className="bg-black min-h-screen flex items-center justify-center pt-20">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
        <div className="text-brand-red text-6xl mb-6">✓</div>
        <h1 className="text-4xl font-black text-white mb-4">Message Sent.</h1>
        <p className="text-gray-500 text-lg mb-10 leading-relaxed">
          We typically respond within 2 business hours. Or book directly below.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/book"
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors"
          >
            Book Your Session
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white font-bold text-sm tracking-wide rounded hover:border-white/60 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-black mb-4 text-brand-red" style={{letterSpacing: '-0.04em'}}>
          Oops
        </h1>
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-400 mb-2">{error.message || 'An unexpected error occurred'}</p>
        <p className="text-gray-500 text-sm mb-8">Our team has been notified. Please try again.</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="inline-block bg-white text-black font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-block bg-white/10 text-white font-bold py-3 px-6 rounded-full hover:bg-white/20 transition-colors border border-white/20"
          >
            Back to Home
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-500 text-sm">Need help?</p>
          <a href="mailto:founder@vibeshackstudios.com" className="text-white hover:text-gray-300 transition-colors">
            Contact support
          </a>
        </div>
      </div>
    </div>
  )
}

'use client'
export default function BookError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="bg-black min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <p className="text-brand-red text-xs uppercase tracking-widest mb-6">Booking unavailable</p>
        <h1 className="text-white font-black text-4xl mb-4" style={{letterSpacing: '-0.04em'}}>
          Something went wrong.
        </h1>
        <p className="text-gray-500 mb-8">We&apos;re having trouble loading the booking system. Please try again.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="px-8 py-4 bg-brand-red text-white font-bold text-sm rounded-full hover:bg-red-700 transition-colors">
            Try Again
          </button>
          <a href="mailto:founder@vibeshackstudios.com" className="px-8 py-4 border border-white/20 text-white font-bold text-sm rounded-full hover:border-white/40 transition-colors">
            Email Us
          </a>
        </div>
      </div>
    </main>
  )
}

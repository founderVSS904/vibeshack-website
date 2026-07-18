'use client'
export default function BookError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="bg-black min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <p className="mb-6 font-mono text-xs font-bold uppercase tracking-[0.2em] text-brand-red">Booking unavailable</p>
        <h1 className="mb-4 text-4xl text-white">
          Something went wrong.
        </h1>
        <p className="text-gray-500 mb-8">We&apos;re having trouble loading the booking system. Please try again.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
            Try again
          </button>
          <a href="mailto:founder@vibeshackstudios.com" className="rounded-lg border border-white/15 px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-white/40">
            Email us
          </a>
        </div>
      </div>
    </main>
  )
}

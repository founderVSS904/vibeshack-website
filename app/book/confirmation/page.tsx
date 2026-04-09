'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white text-2xl font-bold mb-4">Something went wrong.</p>
          <a href="/book" className="text-brand-red hover:underline text-sm">← Back to booking</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full">

        {/* Check */}
        <div className="w-16 h-16 rounded-full border border-brand-red flex items-center justify-center mb-10">
          <svg className="w-7 h-7 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mb-3">VibeShack Studios · SF</p>
        <h1 className="text-white font-black leading-none mb-3" style={{fontSize: 'clamp(3rem, 7vw, 5rem)', letterSpacing: '-0.05em'}}>
          You&apos;re booked.
        </h1>
        <p className="text-gray-500 text-lg mb-14">Confirmation sent to your email.</p>

        {/* What to expect */}
        <div className="space-y-0 mb-14">
          {[
            { n: '01', title: 'Check your email', body: 'Full booking details and receipt are on their way. Check your spam if you don\'t see it.' },
            { n: '02', title: 'Get to the studio', body: '950 Battery St, SF 94111 · Northern Waterfront. Street parking on Battery St. 10 min walk from the Ferry Building.' },
            { n: '03', title: 'Walk in ready to work', body: "Everything is set up before you arrive. Cameras on. Lights calibrated. Mics live. Just show up." },
            { n: '04', title: 'Free cancellation', body: 'Plans change. Cancel up to 48 hours before your session for a full refund. No questions asked.' },
          ].map(({ n, title, body }) => (
            <div key={n} className="flex gap-6 py-5 border-b border-white/8">
              <span className="text-gray-700 font-black text-sm w-8 flex-shrink-0 mt-0.5">{n}</span>
              <div>
                <p className="text-white font-bold text-sm mb-1">{title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 items-center">
          <a href="/book"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-100 transition-colors">
            Book another session
          </a>
          <a href="/" className="text-gray-600 hover:text-white transition-colors text-sm">← Back to home</a>
        </div>

      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-600 text-sm tracking-widest uppercase animate-pulse">Loading…</div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}

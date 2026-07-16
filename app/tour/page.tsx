import type { Metadata } from 'next'
import TourBookingForm from './TourBookingForm'

export const metadata: Metadata = {
  title: 'Book a Free Studio Tour | VibeShack Studios SF',
  description: 'Book a free VibeShack Studios tour online. Tour availability is checked against the live studio calendar at 950 Battery St, San Francisco.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/tour/' },
}

export default function TourPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">

        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mb-3">VibeShack Studios · SF Northern Waterfront</p>
          <h1 className="text-white font-black leading-none mb-4"
            style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.05em'}}>
            See it before<br /><span className="text-brand-red">you book.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Choose a live tour time, get added to the studio calendar, and come walk the rooms before you book. No commitment required.
          </p>
        </div>

        <div className="mb-14 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* What to expect */}
          <div className="border-t border-white/[0.08] pt-10 space-y-5">
          {[
            { n: '01', title: 'Walk every studio', body: 'See the full space — all the rooms, the gear, the setup. No surprises when you book.' },
            { n: '02', title: 'Ask anything', body: 'Camera specs, lighting options, pricing, availability. Our team will be on-site to answer.' },
            { n: '03', title: 'No sales pressure', body: 'If you like what you see, book. If not, no problem. The tour is free either way.' },
          ].map(({ n, title, body }) => (
            <div key={n} className="flex gap-6 pb-5 border-b border-white/[0.08]">
              <span className="text-gray-700 font-black text-sm w-8 flex-shrink-0">{n}</span>
              <div>
                <p className="text-white font-bold text-sm mb-1">{title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
          </div>
          <div className="border-t border-white/[0.08] pt-10">
            <p className="text-gray-600 text-xs uppercase tracking-widest mb-5">How it works</p>
            <div className="space-y-4 text-sm leading-relaxed text-gray-500">
              <p>Tour bookings use a separate free-tour flow, but the available times are checked against the live studio calendar before they are shown.</p>
              <p>Once you book, the tour is added to Google Calendar and you receive a confirmation with the time and address.</p>
              <p>Already know the exact room and time you want? <a href="/book/" className="text-brand-red hover:text-white transition-colors">Book a paid studio session directly</a>.</p>
            </div>
          </div>
        </div>

        <TourBookingForm />

        {/* Address */}
        <div className="mt-12 pt-10 border-t border-white/[0.08]">
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-3">Location</p>
          <p className="text-white font-bold">950 Battery St</p>
          <p className="text-gray-500 text-sm">San Francisco, CA 94111</p>
          <p className="text-gray-500 text-sm">Northern Waterfront · Open 24/7</p>
          <a href="https://maps.google.com/?q=950+Battery+St+San+Francisco+CA+94111"
            target="_blank" rel="noopener noreferrer"
            className="inline-block mt-4 text-brand-red hover:text-white text-sm font-semibold transition-colors">
            Get directions →
          </a>
        </div>

      </div>
    </div>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Free Studio Tour | VibeShack Studios SF',
  description: 'See the studios before you book. Free tours available 24/7 at VibeShack Studios, 950 Battery St, San Francisco.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/tour' },
}

export default function TourPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-6 sm:px-10">

        {/* Header */}
        <div className="mb-14">
          <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mb-3">VibeShack Studios · SF Northern Waterfront</p>
          <h1 className="text-white font-black leading-none mb-4"
            style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.05em'}}>
            See it before<br /><span className="text-brand-red">you book.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Free studio tours available 24/7. Walk through every space, ask questions, get a feel for the room. No commitment required.
          </p>
        </div>

        {/* What to expect */}
        <div className="border-t border-white/8 pt-10 mb-12 space-y-5">
          {[
            { n: '01', title: 'Walk every studio', body: 'See the full space — all the rooms, the gear, the setup. No surprises when you book.' },
            { n: '02', title: 'Ask anything', body: 'Camera specs, lighting options, pricing, availability. Our team will be on-site to answer.' },
            { n: '03', title: 'No sales pressure', body: 'If you like what you see, book. If not, no problem. The tour is free either way.' },
          ].map(({ n, title, body }) => (
            <div key={n} className="flex gap-6 pb-5 border-b border-white/8">
              <span className="text-gray-700 font-black text-sm w-8 flex-shrink-0">{n}</span>
              <div>
                <p className="text-white font-bold text-sm mb-1">{title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact options */}
        <div className="space-y-4">
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-6">Schedule your tour</p>

          {/* Email option */}
          <a href="mailto:founder@vibeshackstudios.com?subject=Studio%20Tour%20Request&body=Hi%2C%20I%27d%20love%20to%20schedule%20a%20free%20studio%20tour.%20I%27m%20available%3A%0A%0A(your%20preferred%20dates%2Ftimes)%0A%0AThanks"
            className="flex items-center justify-between w-full p-5 border border-white/10 rounded-2xl hover:border-white/30 transition-all group">
            <div>
              <p className="text-white font-bold text-sm">Email us</p>
              <p className="text-gray-500 text-xs mt-0.5">founder@vibeshackstudios.com · We respond same day</p>
            </div>
            <svg className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </a>

          {/* Book a session instead */}
          <div className="pt-6 border-t border-white/8">
            <p className="text-gray-600 text-xs mb-4">Already know you want to book?</p>
            <a href="/book"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-100 transition-colors">
              Book a session directly →
            </a>
          </div>
        </div>

        {/* Address */}
        <div className="mt-12 pt-10 border-t border-white/8">
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

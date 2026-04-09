import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-black text-white" style={{
          fontSize: 'clamp(12rem, 35vw, 28rem)',
          letterSpacing: '-0.06em',
          opacity: 0.025,
          lineHeight: 1,
        }}>404</span>
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Label */}
        <p className="text-gray-600 text-xs tracking-[0.3em] uppercase mb-8">VibeShack Studios · Error</p>

        {/* Big red 404 */}
        <div className="font-black text-brand-red mb-6" style={{
          fontSize: 'clamp(5rem, 15vw, 9rem)',
          letterSpacing: '-0.06em',
          lineHeight: 1,
        }}>404</div>

        {/* Headline */}
        <h1 className="text-white font-black leading-tight mb-4" style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          letterSpacing: '-0.04em',
        }}>
          Nothing here.
        </h1>

        <p className="text-gray-500 text-base leading-relaxed mb-12 max-w-sm mx-auto">
          This page doesn&apos;t exist — but your next session does. Let&apos;s get you back on track.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded-full hover:bg-gray-100 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            Back to Home
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold border border-white/20 rounded-full hover:border-white/50 hover:bg-white/5 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            Book a Session
          </Link>
        </div>

        {/* Bottom divider */}
        <div className="mt-16 pt-8 border-t border-white/8">
          <p className="text-gray-700 text-xs tracking-wide">950 Battery St · San Francisco · Open 24/7</p>
        </div>
      </div>
    </div>
  )
}

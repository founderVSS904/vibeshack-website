import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16">

        {/* Top row */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-16 mb-16">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="mb-8">
              <Link href="/" className="inline-block mb-3">
                <span className="text-brand-red font-black" style={{fontSize: '1.75rem', letterSpacing: '-0.04em'}}>VibeShack</span>
              </Link>
              <p className="text-white text-xs tracking-[0.15em] uppercase font-bold">
                The Dream Factory
              </p>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              Professional studios. Northern Waterfront. 24/7.
            </p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>950 Battery St</p>
              <p>San Francisco, CA 94111</p>
              <a href="mailto:founder@vibeshackstudios.com"
                className="block hover:text-white transition-colors duration-200">
                founder@vibeshackstudios.com
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            {/* Podcast Studios */}
            <div>
              <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-5 font-bold">Podcast Studios</p>
              <ul className="space-y-3">
                {[
                  { href: '/podcast-studio-san-francisco', label: 'All Podcast Studios' },
                  { href: '/the-executive', label: 'The Executive' },
                  { href: '/the-wing', label: 'The Wing' },
                  { href: '/encore', label: 'Encore' },
                  { href: '/sunset-studio', label: 'Sunset' },
                  { href: '/canvas-podcast', label: 'Canvas Podcast' },
                  { href: '/premier', label: 'Premier' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rental Studios */}
            <div>
              <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-5 font-bold">Rental Studios</p>
              <ul className="space-y-3">
                {[
                  { href: '/rental-studios', label: 'All Rental Studios' },
                  { href: '/canvas-rental', label: 'Canvas Rental' },
                  { href: '/green-screen-studio-sf', label: 'Green Screen' },
                  { href: '/photography-studio-san-francisco', label: 'Photography' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-5 font-bold">Company</p>
              <ul className="space-y-3">
                {[
                  { href: '/about', label: 'About' },
                  { href: '/contact', label: 'Contact' },
                  { href: '/book', label: 'Book a Session' },
                  { href: '/made-at-vibeshack', label: 'Shot Here' },
                  { href: '/terms', label: 'Terms & Services' },
                  { href: '/privacy', label: 'Privacy Policy' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Follow */}
            <div>
              <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-5 font-bold">Follow</p>
              <ul className="space-y-3">
                <li>
                  <a href="https://www.instagram.com/vibeshackstudios_" target="_blank" rel="noopener noreferrer"
                    className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">@vibeshackstudios_</a>
                </li>
                <li>
                  <a href="https://www.instagram.com/vibeshackhq" target="_blank" rel="noopener noreferrer"
                    className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">@vibeshackhq</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/5 pt-12 text-center">
          <span className="block text-brand-red font-black mb-4" style={{fontSize: '1.5rem', letterSpacing: '-0.04em'}}>VibeShack</span>
          <p className="text-white text-xs tracking-[0.15em] uppercase font-bold mb-6">The Dream Factory</p>
          <p className="text-gray-700 text-xs mt-2">© 2026 VibeShack Studios · San Francisco</p>

        </div>
        {/* SEO keyword block */}
        <div className="border-t border-white/5 pt-10 mt-4">
          <p className="text-gray-700 text-xs leading-relaxed text-center max-w-4xl mx-auto">
            VibeShack Studios — San Francisco Podcast Studio · Green Screen Studio San Francisco · Photography Studio SF · Video Production Studio San Francisco · Studio Rental San Francisco · Content Creator Studio SF Bay Area · Podcast Recording Studio San Francisco · Production Studio Northern Waterfront · Green Screen Rental SF · Photo Studio Rental San Francisco · YouTube Studio San Francisco · TikTok Studio SF · Broadcast Studio San Francisco · 4K Video Studio SF · Professional Studio Rental Bay Area · VibeShack Studios 950 Battery St San Francisco CA 94111
          </p>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'
import { comparisons } from '@/lib/seo/comparisons'
import { studioGuides } from '@/lib/seo/studioGuides'
import { business, peerspaceUrl } from '@/lib/seo/site'
import { useCases } from '@/lib/seo/useCases'
import { BrandMark } from '@/components/BrandMark'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16">

        {/* Top row */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-16 mb-16">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="mb-8">
              <Link href="/" aria-label="VibeShack Studios home" className="inline-block mb-4 transition-opacity duration-200 hover:opacity-80">
                <BrandMark variant="lockup" className="h-auto w-56 max-w-full" />
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
              <a href={`tel:${business.phone.replace(/[^\d+]/g, '')}`}
                className="block hover:text-white transition-colors duration-200">
                {business.phone}
              </a>
              <a href="mailto:founder@vibeshackstudios.com"
                className="block hover:text-white transition-colors duration-200">
                founder@vibeshackstudios.com
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 lg:gap-16">
            {/* Podcast Studios */}
            <div>
              <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-5 font-bold">Podcast Studios</p>
              <ul className="space-y-3">
                {[
                  { href: '/podcast-studio-san-francisco/', label: 'All Podcast Studios' },
                  { href: '/the-executive/', label: 'The Executive' },
                  { href: '/the-wing/', label: 'The Wing' },
                  { href: '/encore/', label: 'Encore' },
                  { href: '/sunset-studio/', label: 'Sunset' },
                  { href: '/canvas-podcast/', label: 'Canvas Podcast' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} prefetch={href === '/book/' ? false : undefined} className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services and rentals */}
            <div className="border-l border-white/20 pl-8">
              <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-5 font-bold">Services</p>
              <ul className="space-y-3">
                {[
                  { href: '/services/', label: 'All Services' },
                  { href: '/commercials/', label: 'Commercials' },
                  { href: '/editorials/', label: 'Editorials' },
                  { href: '/branding/', label: 'Branding' },
                  { href: '/our-work/', label: 'Our Work' },
                  { href: '/rental-studios/', label: 'All Rental Studios' },
                  { href: '/video-production/', label: 'Video Production' },
                  { href: '/photo-services/', label: 'Photo Services' },
                  { href: '/photography-studio-san-francisco/', label: 'Photography Studio Rental' },
                  { href: '/canvas-rental/', label: 'Canvas Rental' },
                  { href: '/green-screen-studio-sf/', label: 'Green Screen' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Studio Guides */}
            <div>
              <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-5 font-bold">Studio Guides</p>
              <ul className="space-y-3">
                <li>
                  <Link href="/studio-guides/" className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">All Guides</Link>
                </li>
                <li>
                  <Link href="/use-cases/" className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">Use Cases</Link>
                </li>
                <li>
                  <Link href="/compare/" className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">Compare Studios</Link>
                </li>
                {studioGuides.slice(0, 4).map((guide) => (
                  <li key={guide.slug}>
                    <Link href={`/studio-guides/${guide.slug}/`} className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">{guide.shortTitle}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-5 font-bold">Company</p>
              <ul className="space-y-3">
                {[
                  { href: '/about/', label: 'About' },
                  { href: '/contact/', label: 'Contact' },
                  { href: '/book/', label: 'Book a Session' },
                  { href: '/tour/', label: 'Book a Tour' },
                  { href: '/our-work/', label: 'Our Work' },
                  { href: '/made-at-vibeshack/', label: 'Trusted By' },
                  { href: '/press/', label: 'Press & Media' },
                  { href: '/terms/', label: 'Terms & Services' },
                  { href: '/privacy/', label: 'Privacy Policy' },
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
                  <a href="https://www.instagram.com/vibeshackhq/" target="_blank" rel="noopener noreferrer"
                    className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">@vibeshackhq</a>
                </li>
                <li>
                  <a href="https://www.instagram.com/vibeshackstudios_" target="_blank" rel="noopener noreferrer"
                    className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">@vibeshackstudios_</a>
                </li>
                <li>
                  <a href={peerspaceUrl} target="_blank" rel="noopener noreferrer"
                    className="text-gray-500 text-sm hover:text-white hover:underline transition-colors duration-200">Peerspace</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/5 pt-12 mb-12">
          <div>
            <p className="text-gray-500 text-xs tracking-[0.2em] uppercase mb-4 font-bold">Popular Use Cases</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {useCases.slice(0, 5).map((useCase) => (
                <Link key={useCase.slug} href={`/use-cases/${useCase.slug}/`} className="text-gray-600 text-sm hover:text-white hover:underline transition-colors duration-200">{useCase.shortTitle}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-xs tracking-[0.2em] uppercase mb-4 font-bold">Decision Guides</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {comparisons.map((comparison) => (
                <Link key={comparison.slug} href={`/compare/${comparison.slug}/`} className="text-gray-600 text-sm hover:text-white hover:underline transition-colors duration-200">{comparison.shortTitle}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/5 pt-12 text-center">
          <BrandMark variant="wordmark" className="mx-auto mb-5 h-[18px] w-auto" />
          <p className="text-white text-xs tracking-[0.15em] uppercase font-bold mb-6">The Dream Factory</p>
          <p className="text-gray-700 text-xs mt-2">© 2026 VibeShack Studios · San Francisco</p>

        </div>
      </div>
    </footer>
  )
}

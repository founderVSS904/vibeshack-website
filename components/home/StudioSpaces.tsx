import Image from 'next/image'
import Link from 'next/link'

// Same layout and hover behavior as the classic homepage studio grid:
// .studio-grid-card lift, .homepage-studio-thumb-img zoom, gradient fade.
const studios = [
  { src: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg', label: 'The Executive', href: '/the-executive/', alt: 'The Executive podcast table in use at VibeShack Studios SF' },
  { src: '/studio-images/sunset-hero-v20260509.jpg', label: 'Sunset', href: '/sunset-studio/', alt: 'Sunset, a warm programmable podcast set in use at VibeShack Studios SF' },
  { src: '/studio-images/enhanced-encore-podcast-wide-v20260510.jpg', label: 'Encore', href: '/encore/', alt: 'Encore, a modern podcast studio with professional lighting at VibeShack Studios SF' },
  { src: '/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg', label: 'The Wing', href: '/the-wing/', alt: 'The Wing, a cozy Walnut Series podcast studio at VibeShack Studios SF' },
  { src: '/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg', label: 'Canvas Podcast', href: '/canvas-podcast/', alt: 'Canvas Podcast, a white cyc podcast stage with blue lighting at VibeShack Studios SF' },
  { src: '/studio-images/inside-green-screen-v20260509.jpg', label: 'Green Screen', href: '/green-screen-studio-sf/', alt: 'Green screen production stage at VibeShack Studios SF' },
  { src: '/studio-images/inside-photography-red-v20260509.jpg', label: 'Photography Studio', href: '/photography-studio-san-francisco/', alt: 'Photography studio rental room with red backdrop at VibeShack Studios SF' },
  { src: '/studio-images/parlor-production-v20260509.jpg', label: 'Parlor', href: '/parlor/', alt: 'Parlor, a premium interview session with Chesterfield seating at VibeShack Studios SF' },
  { src: '/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg', label: 'Horizon', href: '/horizon/', alt: 'Horizon, an immersive creative podcast space in use at VibeShack Studios SF' },
  { src: '/studio-images/enhanced-canvas-podcast-white-cyc-duo-v20260510.jpg', label: 'Canvas Rental', href: '/canvas-rental/', alt: 'Canvas Rental, a white cyc podcast setup in use at VibeShack Studios SF' },
]

export function StudioSpaces() {
  return (
    <section className="bg-black pb-4 pt-16 sm:pt-24" aria-label="VibeShack studios">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 sm:gap-5">
          {studios.map(({ src, label, href, alt }) => (
            <div key={label} className="studio-grid-card">
              <Link href={href} className="homepage-studio-link relative overflow-hidden rounded-lg group block h-[170px] sm:h-[190px] lg:h-[220px]">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="homepage-studio-thumb-img object-cover"
                  sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                  quality={72}
                  fetchPriority="low"
                />
                <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-60" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
                <p className="absolute bottom-4 left-4 text-white text-sm font-semibold tracking-wide">{label}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

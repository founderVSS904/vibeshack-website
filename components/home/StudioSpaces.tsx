import Image from 'next/image'
import Link from 'next/link'

// Same layout and hover behavior as the classic homepage studio grid:
// .studio-grid-card lift, .homepage-studio-thumb-img zoom, gradient fade.
// Canvas Podcast sits where Premier used to; Premier is gone from the lineup.
const studios = [
  { src: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg', label: 'The Executive', href: '/the-executive/', alt: 'The Executive — Podcast table setup in use — VibeShack Studios SF' },
  { src: '/studio-images/sunset-hero-v20260509.jpg', label: 'Sunset', href: '/sunset-studio/', alt: 'Sunset — Warm programmable podcast set in use — VibeShack Studios SF' },
  { src: '/studio-images/enhanced-encore-podcast-wide-v20260510.jpg', label: 'Encore', href: '/encore/', alt: 'Encore — Modern podcast studio with professional lighting — VibeShack Studios SF' },
  { src: '/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg', label: 'The Wing', href: '/the-wing/', alt: 'The Wing — Cozy podcast studio in Walnut Series — VibeShack Studios SF' },
  { src: '/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg', label: 'Canvas Podcast', href: '/canvas-podcast/', alt: 'Canvas Podcast — White cyc podcast stage with blue lighting — VibeShack Studios SF' },
  { src: '/studio-images/inside-green-screen-v20260509.jpg', label: 'Green Screen', href: '/green-screen-studio-sf/', alt: 'Green screen production stage — VibeShack Studios SF' },
  { src: '/studio-images/inside-photography-red-v20260509.jpg', label: 'Photography Studio', href: '/photography-studio-san-francisco/', alt: 'Photography studio rental room with red backdrop — VibeShack Studios SF' },
  { src: '/studio-images/parlor-production-v20260509.jpg', label: 'Parlor', href: '/parlor/', alt: 'Parlor — Premium interview session with Chesterfield seating — VibeShack Studios SF' },
  { src: '/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg', label: 'Horizon', href: '/horizon/', alt: 'Horizon — Immersive creative podcast space in use — VibeShack Studios SF' },
  { src: '/studio-images/enhanced-canvas-podcast-white-cyc-duo-v20260510.jpg', label: 'Canvas Rental', href: '/canvas-rental/', alt: 'Canvas Rental — White cyc podcast setup in use — VibeShack Studios SF' },
]

export function StudioSpaces() {
  return (
    <section className="bg-black pb-4 pt-16 sm:pt-24" aria-label="VibeShack studios">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 sm:gap-5">
          {studios.map(({ src, label, href, alt }) => (
            <div key={label} className="studio-grid-card card-lift">
              <Link href={href} className="homepage-studio-link relative overflow-hidden rounded-xl group block h-[170px] sm:h-[190px] lg:h-[220px]">
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

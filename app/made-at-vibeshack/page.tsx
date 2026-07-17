import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ShotHereLogoCarousel } from '@/components/ShotHereLogoCarousel'
import { siteUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'Brands That Trust Us',
  description: 'Brands, creators, production teams, and media companies trust VibeShack Studios in San Francisco for podcasts, campaigns, interviews, and content days.',
  alternates: { canonical: `${siteUrl}/made-at-vibeshack/` },
  openGraph: {
    type: 'website',
    siteName: 'VibeShack Studios',
    title: 'Brands That Trust Us | VibeShack Studios SF',
    description: 'Brands, creators, production teams, and media companies trust VibeShack Studios in San Francisco for podcasts, campaigns, interviews, and content days.',
    url: `${siteUrl}/made-at-vibeshack/`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Work made at VibeShack Studios San Francisco' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brands That Trust Us | VibeShack Studios SF',
    description: 'Brands, creators, production teams, and media companies trust VibeShack Studios in San Francisco for podcasts, campaigns, interviews, and content days.',
    images: ['/og-image.jpg'],
  },
}

const photographyWall = [
  {
    src: '/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260716.jpg',
    alt: 'Editorial fashion photography created at VibeShack Studios',
    label: 'Editorial campaign',
    className: 'md:col-span-2 md:row-span-2',
  },
  {
    src: '/studio-images/enhanced-photography-headshot-black-blazer-v20260510.jpg',
    alt: 'Professional headshot photography created at VibeShack Studios',
    label: 'Headshot session',
    className: '',
  },
  {
    src: '/studio-images/enhanced-photography-editorial-male-portrait-v20260510.jpg',
    alt: 'Editorial male portrait photography created at VibeShack Studios',
    label: 'Editorial portrait',
    className: '',
  },
  {
    src: '/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg',
    alt: 'Behind the scenes studio production lighting at VibeShack Studios',
    label: 'Lighting setup',
    className: '',
  },
  {
    src: '/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg',
    alt: 'Blue stage podcast production created at VibeShack Studios',
    label: 'Production setup',
    className: '',
  },
]

export default function MadeAtVibeShackPage() {
  return (
    <>
      <section className="relative min-h-[70vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg" alt="Production work made at VibeShack Studios"
          fill sizes="100vw" className="object-cover" style={{opacity: 0.5}} priority />
        <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'}} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-40 w-full">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-500 mb-4">VibeShack Studios · SF</p>
          <h1 className="font-black text-white leading-none mb-4" style={{fontSize: 'clamp(3rem, 6vw, 6rem)', letterSpacing: 0}}>
            Brands<br/><span className="text-brand-red">Trust Us.</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-md">
            The studios behind podcasts, campaigns, interviews, and creative work.
          </p>
        </div>
      </section>

      <ShotHereLogoCarousel />

      <section className="bg-zinc-950 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <span className="number-label mb-6 block w-fit">Photography Made Here</span>
            <h2 className="text-4xl font-black leading-none text-white sm:text-5xl" style={{ letterSpacing: 0 }}>
              Finished work, not empty rooms.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-gray-500 sm:text-base">
              A small look at what the studios can actually produce: movement, portraits, clean cyc work, and color-driven editorial images.
            </p>
          </div>

          <div className="grid auto-rows-[320px] grid-cols-1 gap-3 md:grid-cols-4">
            {photographyWall.map((photo) => (
              <figure key={photo.src} className={`group relative overflow-hidden rounded-lg bg-black ${photo.className}`}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={photo.className ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 100vw'}
                  className="object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <figcaption className="absolute bottom-4 left-4 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                  {photo.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
          
          {/* Badge display */}
          <div className="flex flex-col md:flex-row gap-16 items-start mb-20">
            <div className="flex-shrink-0">
              <div className="bg-zinc-900 rounded-lg p-10 flex items-center justify-center" style={{minWidth: '280px'}}>
                <Image src="/brand/vibeshack/lockup-red-white-transparent.png" alt="Made at VibeShack badge" width={568} height={192} className="w-56" />
              </div>
              <p className="text-gray-600 text-xs mt-4 text-center tracking-wide">The Creative Standard</p>
            </div>
            <div className="pt-4">
              <h2 className="text-white font-black text-2xl mb-4" style={{letterSpacing: 0}}>Attribution that travels.</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                When you create at VibeShack, you can credit the studio clearly across show notes, YouTube descriptions, press notes, and social posts. It gives your audience a clean signal for where the work was produced.
              </p>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-600 mb-2">How to use it</p>
              <div className="divide-y divide-white/[0.08]">
                {[
                  { platform: 'Podcast show notes', text: 'Add "Recorded at VibeShack Studios, San Francisco" to every episode description.' },
                  { platform: 'YouTube', text: 'Add to your video description or as a lower-third in your intro.' },
                  { platform: 'Instagram', text: 'Drop in your bio or story highlights.' },
                  { platform: 'LinkedIn', text: 'Add to your show or channel description.' },
                ].map(({ platform, text }) => (
                  <div key={platform} className="py-4">
                    <p className="text-white font-semibold text-sm mb-1">{platform}</p>
                    <p className="text-gray-600 text-xs leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Copy text section */}
          <div className="border-t border-white/[0.08] pt-16">
            <h2 className="text-white font-black text-xl mb-8" style={{letterSpacing: 0}}>Attribution copy.</h2>
            <div className="space-y-6">
              {[
                { label: 'Short', text: 'Created at VibeShack Studios · San Francisco · vibeshackstudios.com' },
                { label: 'Standard', text: 'Produced at VibeShack Studios in San Francisco. The Creative Standard. vibeshackstudios.com' },
                { label: 'Full', text: 'Created at VibeShack Studios, 950 Battery St, San Francisco. Professional podcast, video, and photography studios. Open 24/7. vibeshackstudios.com' },
              ].map(({ label, text }) => (
                <div key={label} className="bg-zinc-950 rounded-lg p-6">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-600 mb-3">{label}</p>
                  <p className="text-gray-300 text-sm leading-relaxed font-mono">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="border-t border-white/[0.08] pt-16 text-center">
            <p className="text-gray-500 text-sm mb-6">Ready to join the wall?</p>
            <Link href="/book/" prefetch={false} className="group inline-flex items-center gap-2.5 rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              Book Your Session
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

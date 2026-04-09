import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Podcast Studios San Francisco | VibeShack Studios',
  description: 'SF\'s best podcast studios. The Executive, The Wing, Encore, Sunset, Canvas. $300/hr, cameraman included. Northern Waterfront. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/podcast-studio-san-francisco' },
  openGraph: {
    title: 'Podcast Studios SF | VibeShack Studios',
    description: 'Six podcast studios in SF. All with 3-camera 4K, broadcast audio, and cameraman included. $300/hr. Open 24/7.',
    url: 'https://www.vibeshackstudios.com/podcast-studio-san-francisco',
  },
}

const studios = [
  {
    name: 'The Executive',
    href: '/sunset-room',
    bookHref: '/book?studio=sunset',
    img: '/studio-images/the-executive-hero.jpg',
    series: 'Walnut Series',
    seriesColor: '#fcd34d',
    seriesBg: 'rgba(120,53,15,0.5)',
    desc: 'Wood slat walls. Leather seating. Three cameras. Cameraman included.',
    price: '$300',
  },
  {
    name: 'The Wing',
    href: '/cozy-podcast',
    bookHref: '/book?studio=the-wing',
    img: '/studio-images/the-wing-1.jpg',
    series: 'Walnut Series',
    seriesColor: '#fcd34d',
    seriesBg: 'rgba(120,53,15,0.5)',
    desc: 'Intimate format. Wood slat walls. Three cameras. Cameraman included.',
    price: '$300',
  },
  {
    name: 'Encore',
    href: '/encore',
    bookHref: '/book?studio=encore',
    img: '/studio-images/encore-wide.jpg',
    series: 'Vault Series',
    seriesColor: '#e9d5ff',
    seriesBg: 'rgba(88,28,135,0.4)',
    desc: 'Black acoustic studio. White cyc backdrop. Three cameras. Cameraman included.',
    price: '$300',
  },
  {
    name: 'Sunset',
    href: '/sunset-studio',
    bookHref: '/book?studio=sunset',
    img: '/studio-images/sunset-red.jpg',
    series: 'Creative Series',
    seriesColor: '#99f6e4',
    seriesBg: 'rgba(13,148,136,0.3)',
    desc: 'Programmable color backdrop. Pick your mood. Three cameras. Cameraman included.',
    price: '$300',
  },
  {
    name: 'Canvas',
    href: '/white-backdrop-studio',
    bookHref: '/book?studio=canvas-rental',
    img: '/studio-images/podcast-cyc-duo.jpg',
    series: 'Creative Series',
    seriesColor: '#99f6e4',
    seriesBg: 'rgba(13,148,136,0.3)',
    desc: 'White cyc wall. Clean, minimal backdrop. Three cameras. Cameraman included.',
    price: '$300',
  },
]

export default function PodcastStudiosPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/the-executive-hero.jpg"
          alt="VibeShack Podcast Studios San Francisco"
          fill
          className="object-cover"
          style={{opacity: 0.75, objectPosition: 'center 40%'}}
          priority />
        <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, transparent 70%)'}} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mb-4">VibeShack Studios · SF Northern Waterfront</p>
          <h1 data-reveal="up" className="font-black text-white leading-none mb-4" style={{fontSize: 'clamp(3rem, 8vw, 6rem)', letterSpacing: '-0.05em'}}>
            Podcast<br /><span className="text-brand-red">Studios.</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-xl" data-reveal="fade">
            Six rooms. All 3-camera 4K. Broadcast audio. Cameraman included. $300/hr.
          </p>
        </div>
      </section>

      {/* Studio cards */}
      <section className="bg-black pb-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-4">
          <div className="space-y-3">
            {studios.map((s, i) => (
              <a key={s.name} href={s.href}
                className="relative block overflow-hidden rounded-2xl group studio-card" data-tilt
                style={{height: '420px'}}>
                <Image src={s.img} alt={s.name}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out" />
                <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)'}} />

                {/* Series badge */}
                {s.series && (
                  <div className="absolute top-5 left-5">
                    <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                      style={{background: s.seriesBg!, color: s.seriesColor!}}>
                      {s.series}
                    </span>
                  </div>
                )}

                {/* Index number */}
                <div className="absolute top-5 right-5">
                  <span className="text-gray-600 font-black text-sm">0{i + 1}</span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 flex items-end justify-between">
                  <div>
                    <h2 data-reveal="up" className="text-white font-black mb-1" style={{fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.04em'}}>{s.name}</h2>
                    <p className="text-gray-400 text-sm max-w-md">{s.desc}</p>
                  </div>
                  <div className="flex-shrink-0 ml-8 text-right">
                    <p className="text-white font-black text-2xl">{s.price}</p>
                    <p className="text-gray-500 text-xs">per hour</p>
                    <a href={s.bookHref}
                      className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-white text-black font-bold text-xs rounded-full hover:bg-gray-100 transition-colors">
                      Book →
                    </a>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* What's included in every room */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="number-label mb-8 block">Every Room</span>
              <h2 data-reveal="up" className="font-black text-white leading-none mb-8" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Same standard.<br /><span className="text-brand-red">Every room.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {[
                  '3-camera 4K setup',
                  'Broadcast-grade microphones',
                  'Cameraman included',
                  'Professional lighting',
                  'Hair & Makeup room on-site',
                  'Open 24/7',
                  '6–12hr footage turnaround',
                  '$300/hr · 1 hour minimum',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 py-3.5">
                    <svg className="w-3 h-3 text-brand-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    <span className="text-gray-400 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                '/studio-images/the-executive-hero.jpg',
                '/studio-images/encore-wide.jpg',
                '/studio-images/sunset-blue.jpg',
                '/studio-images/the-wing-2.jpg',
              ].map((src, i) => (
                <div key={i} className="overflow-hidden rounded-xl relative" style={{height: '180px'}}>
                  <Image src={src} alt="VibeShack Podcast Studios" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h2 data-reveal="up" className="font-black text-white leading-tight mb-6" style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em'}}>
            Not sure which room?<br /><span className="text-brand-red">We&apos;ll help you choose.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10" data-reveal="fade">Free studio tours available 24/7.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/book" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded-full hover:bg-gray-100 transition-colors">
              Book a Session →
            </a>
            <a href="/find-your-studio" className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white font-semibold text-sm rounded-full hover:border-white/40 transition-colors">
              Find your studio
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

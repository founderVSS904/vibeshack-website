import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Rental Studios San Francisco | VibeShack Studios',
  description: 'Rent a professional studio in SF. Canvas, Photography Studio, Green Screen. $100/hr. Bring your own crew or equipment. SF Northern Waterfront. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/rental-studios' },
  openGraph: {
    title: 'Rental Studios SF | VibeShack Studios',
    description: 'Canvas, Photography, Green Screen. $100/hr. Your crew, our space. Open 24/7.',
    url: 'https://www.vibeshackstudios.com/rental-studios',
  },
}

const studios = [
  {
    name: 'Canvas Rental',
    href: '/white-backdrop-studio',
    bookHref: '/book?studio=canvas-rental',
    img: '/studio-images/podcast-cyc-duo.jpg',
    series: 'Creative Series',
    seriesColor: '#99f6e4',
    seriesBg: 'rgba(13,148,136,0.3)',
    desc: 'Seamless white cyc wall. Overhead lighting grid. Podcast and photo ready.',
    price: '$100',
  },
  {
    name: 'Photography Studio',
    href: '/photography-studio-san-francisco',
    bookHref: '/book?studio=photography',
    img: '/studio-images/photography-hero.jpg',
    series: 'Creative Series',
    seriesColor: '#99f6e4',
    seriesBg: 'rgba(13,148,136,0.3)',
    desc: 'Professional lighting. White backdrop. Hair & Makeup room on-site.',
    price: '$100',
  },
  {
    name: 'Green Screen',
    href: '/green-screen-studio-sf',
    bookHref: '/book?studio=green-screen',
    img: '/studio-images/greenscreen-wide.jpg',
    series: 'Creative Series',
    seriesColor: '#99f6e4',
    seriesBg: 'rgba(13,148,136,0.3)',
    desc: '750 sqft floor-to-ceiling green screen. Full lighting grid.',
    price: '$100',
  },
]

export default function RentalStudiosPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/greenscreen-wide.jpg"
          alt="VibeShack Rental Studios San Francisco"
          fill className="object-cover object-bottom md:object-center"
          style={{opacity: 0.7}} priority />
        <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, transparent 70%)'}} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mb-4">VibeShack Studios · SF Northern Waterfront</p>
          <h1 data-reveal="up" className="font-black text-white leading-none mb-4" style={{fontSize: 'clamp(3rem, 8vw, 6rem)', letterSpacing: '-0.05em'}}>
            Rental<br /><span className="text-brand-red">Studios.</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-xl" data-reveal="fade">
            Bring your crew. We provide the space, the gear, and the setup. $100/hr.
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
                  fill className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out" />
                <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)'}} />

                {/* Series badge */}
                <div className="absolute top-5 left-5">
                  <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                    style={{background: s.seriesBg, color: s.seriesColor}}>
                    {s.series}
                  </span>
                </div>

                {/* Index */}
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

      {/* What's included */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="number-label mb-8 block">Every Rental</span>
              <h2 data-reveal="up" className="font-black text-white leading-none mb-8" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Your crew.<br /><span className="text-brand-red">Our space.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {[
                  'All equipment included',
                  'Space set up and ready on arrival',
                  'You bring your own crew or shoot solo',
                  'Hair & Makeup room on-site',
                  'Open 24/7',
                  '$100/hr · 1 hour minimum',
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
                '/studio-images/greenscreen-shoot-1.jpg',
                '/studio-images/drive-photo-hero.jpg',
                '/studio-images/podcast-cyc-duo.jpg',
                '/studio-images/greenscreen-empty.jpg',
              ].map((src, i) => (
                <div key={i} className="overflow-hidden rounded-xl">
                  <Image src={src} alt="VibeShack Rental Studios" width={400} height={180} className="w-full object-cover" style={{height: '180px'}} />
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
            Need a cameraman too?<br /><span className="text-brand-red">We&apos;ve got you.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10" data-reveal="fade">Upgrade to a Podcast Studio and we handle the whole production.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/book?studio=canvas-rental" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded-full hover:bg-gray-100 transition-colors">
              Book a Rental →
            </a>
            <a href="/podcast-studio-san-francisco" className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white font-semibold text-sm rounded-full hover:border-white/40 transition-colors">
              View Podcast Studios
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

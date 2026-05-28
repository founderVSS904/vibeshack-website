import type { Metadata } from 'next'
import Image from 'next/image'
import { faqSchema, studioServiceSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Rental Studios San Francisco',
  description: 'Rent green screen, photography, and white cyc studios in San Francisco. Bring your crew or shoot solo. From $100/hr. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/rental-studios/' },
  openGraph: {
    title: 'Rental Studios SF | VibeShack Studios',
    description: 'Canvas, Photography, Green Screen. $100/hr. Your crew, our space. Open 24/7.',
    url: 'https://www.vibeshackstudios.com/rental-studios',
  },
}

const studios = [
  {
    name: 'Canvas',
    href: '/canvas-rental/',
    bookHref: '/book/?studio=canvas-rental',
    img: '/studio-images/inside-canvas-cyc-v20260509.jpg',
    series: 'Creative Series',
    seriesColor: '#99f6e4',
    seriesBg: 'rgba(13,148,136,0.3)',
    desc: 'Seamless white cyc wall. Overhead lighting grid. Podcast and photo ready.',
    price: '$100',
  },
  {
    name: 'Photography Studio',
    href: '/photography-studio-san-francisco/',
    bookHref: '/book/?studio=photography',
    img: '/studio-images/inside-photography-red-v20260509.jpg',
    series: 'Creative Series',
    seriesColor: '#99f6e4',
    seriesBg: 'rgba(13,148,136,0.3)',
    desc: 'Professional lighting. White backdrop. Hair & Makeup room on-site.',
    price: '$100',
  },
  {
    name: 'Green Screen',
    href: '/green-screen-studio-sf/',
    bookHref: '/book/?studio=green-screen',
    img: '/studio-images/inside-green-screen-v20260509.jpg',
    series: 'Creative Series',
    seriesColor: '#99f6e4',
    seriesBg: 'rgba(13,148,136,0.3)',
    desc: '750 sqft floor-to-ceiling green screen. Full lighting grid.',
    price: '$100',
  },
]

const rentalFaqs = [
  {
    question: 'What rental studios are available at VibeShack?',
    answer: 'You can rent Canvas, the Photography Studio, and the Green Screen Studio. They are built for photo, video, product, social, and creator shoots.',
  },
  {
    question: 'Can I bring my own crew and equipment?',
    answer: 'Yes. Rental studios are designed for clients who want the space, lighting, and setup while bringing their own crew or working solo.',
  },
  {
    question: 'How much do rental studios cost?',
    answer: 'Rental studios start at $100 per hour with no minimums. Podcast production rooms start at $300 per hour.',
  },
  {
    question: 'Are rental studios available 24/7?',
    answer: 'Yes. VibeShack is open 24/7, including late nights and weekends, subject to availability.',
  },
]

const rentalServiceSchema = studioServiceSchema({
  name: 'Production Studio Rental in San Francisco',
  description: 'Green screen, photography, white cyc, and creative studio rentals in San Francisco for photo, video, product, and content shoots.',
  url: 'https://www.vibeshackstudios.com/rental-studios/',
  image: 'https://www.vibeshackstudios.com/studio-images/inside-canvas-cyc-v20260509.jpg',
  price: '100',
  serviceType: 'Production Studio Rental',
})

export default function RentalStudiosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(rentalFaqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(rentalServiceSchema) }}
      />
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/inside-canvas-cyc-v20260509.jpg"
          alt="VibeShack Rental Studios San Francisco"
          fill className="object-cover"
          style={{opacity: 0.7, objectPosition: 'center'}} priority />
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
              <div key={s.name}
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
                    <a href={s.href} data-reveal="up" className="text-white font-black mb-1 inline-block hover:text-gray-200 transition-colors" style={{fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.04em'}}>{s.name}</a>
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
              </div>
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

      {/* FAQ */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-end justify-between mb-16">
            <h2 className="font-black text-white leading-none" style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em'}}>
              Rental studio<br /><span className="text-brand-red">questions.</span>
            </h2>
            <span className="number-label">FAQ</span>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {rentalFaqs.map(({ question, answer }) => (
              <div key={question} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16 py-8">
                <p className="text-white font-semibold text-base">{question}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{answer}</p>
              </div>
            ))}
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
            <a href="/book/?studio=canvas-rental" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded-full hover:bg-gray-100 transition-colors">
              Book a Rental →
            </a>
            <a href="/podcast-studio-san-francisco/" className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white font-semibold text-sm rounded-full hover:border-white/40 transition-colors">
              View Podcast Studios
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

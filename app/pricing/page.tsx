import type { Metadata } from 'next'
import { faqSchema, studioServiceSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Studio Pricing',
  description:
    'Studio rentals from $100/hr, podcast rooms from $300/hr, Canvas Podcast $400/hr, and photo or video services quoted by request in San Francisco.',
  alternates: {
    canonical: 'https://www.vibeshackstudios.com/pricing/',
  },
  openGraph: {
    title: 'Studio Pricing | VibeShack Studios San Francisco',
    description:
      'Studios from $100-$400/hr, plus photo and video production services quoted by request. Professional production studios in San Francisco.',
    url: 'https://www.vibeshackstudios.com/pricing/',
    images: [
      {
        url: 'https://www.vibeshackstudios.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VibeShack Studios Pricing | San Francisco',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Studio Pricing | VibeShack Studios San Francisco',
    description: 'Studios from $100-$400/hr. Photo and video services quoted by request.',
    images: ['https://www.vibeshackstudios.com/og-image.jpg'],
  },
}

const studios = [
  { name: 'The Executive', price: '$300', note: 'cameraman included · Walnut Series', href: '/the-executive/', category: 'Podcast' },
  { name: 'The Wing', price: '$300', note: 'cameraman included · Walnut Series', href: '/the-wing/', category: 'Podcast' },
  { name: 'Encore', price: '$300', note: 'cameraman included · Vault Series', href: '/encore/', category: 'Podcast' },
  { name: 'Premier', price: '$300', note: 'cameraman included · Vault Series', href: '/premier/', category: 'Podcast' },
  { name: 'Sunset', price: '$300', note: 'cameraman included · Creative Series', href: '/sunset-studio/', category: 'Podcast' },
  { name: 'Parlor', price: '$400', note: 'full crew included · Premium', href: '/parlor/', category: 'Podcast' },
  { name: 'Horizon', price: '$400', note: 'full crew included · Premium', href: '/horizon/', category: 'Podcast' },
  { name: 'Canvas Podcast', price: '$400', note: 'LED backdrop · full crew included', href: '/canvas-podcast/', category: 'Podcast' },
  { name: 'Green Screen', price: '$100', note: 'floor-to-ceiling · Creative Series', href: '/green-screen-studio-sf/', category: 'Rental' },
  { name: 'Photography Studio', price: '$100', note: 'room-only rental · Creative Series', href: '/photography-studio-san-francisco/', category: 'Rental' },
  { name: 'Canvas Rental', price: '$100', note: 'white backdrop · Creative Series', href: '/canvas-rental/', category: 'Rental' },
]

const productionServices = [
  { name: 'Photo Services', price: 'Contact us', note: 'headshots · portraits · products · campaigns', href: '/photo-services/' },
  { name: 'Video Production', price: 'Contact us', note: 'social content · music videos · commercials · brand films', href: '/video-production/' },
]

const pricingFaqs = [
  { question: 'Are there hourly minimums?', answer: 'No minimums. Book one hour, several hours, or a full day.' },
  { question: 'What does the rate include?', answer: 'The rate includes the studio and the equipment listed on each studio page. Podcast rooms include crew options and production setup.' },
  { question: 'How are photo and video services priced?', answer: 'Photo and video services are quoted after the brief, shot list, deliverables, crew needs, usage, and timeline are clear.' },
  { question: 'How do I book?', answer: 'Book directly on the website. Choose your studio, pick a date and time, add any options, and confirm online.' },
  { question: 'Can I book multiple studios in one day?', answer: 'Yes. You can book multiple studios for the same day, such as a podcast room plus photography studio rental time.' },
  { question: 'Is there a cancellation policy?', answer: 'Free cancellation up to 48 hours before your session. Cancellations within 48 hours are subject to a 50% charge.' },
  { question: 'Do you offer monthly rates?', answer: 'Yes. Contact us for recurring bookings or blocks of hours with priority access to the calendar.' },
  { question: 'Is parking available?', answer: 'Street parking is available on Battery St. The studio is also about a 10-minute walk from the Ferry Building.' },
  { question: 'Can I bring my own equipment?', answer: 'Yes. You can bring your own gear and use our studios as your production space.' },
]

const pricingServiceSchema = studioServiceSchema({
  name: 'Studio Rental Pricing in San Francisco',
  description: 'Hourly pricing for VibeShack Studios podcast rooms, green screen, photography studio rental, Canvas Podcast, white cyc rentals, and production service quote requests in San Francisco.',
  url: 'https://www.vibeshackstudios.com/pricing/',
  image: 'https://www.vibeshackstudios.com/og-image.jpg',
  price: '100',
  serviceType: 'Studio Rental Pricing',
})

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(pricingFaqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingServiceSchema) }}
      />
      {/* Hero */}
      <section className="bg-black pt-32 sm:pt-48 pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Pricing</span>
          <h1
            className="font-black text-white leading-none mb-6"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.05em' }}
          >
            Simple,<br />
            <span className="transparent-word">Transparent</span><br />
            Pricing.
          </h1>
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-xl">
            Every studio. No minimums. Book by the hour, 24/7.
          </p>
        </div>
      </section>

      {/* Studio Rate List */}
      <section className="pb-16 bg-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Podcast Studios — grouped */}
          <div className="mb-1">
            <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mb-4">Podcast Studios</p>
            <div className="divide-y divide-white/8 border-t border-white/8">
              {studios.filter(s => s.category === 'Podcast').map((studio) => (
                <a
                  key={studio.name}
                  href={studio.href}
                  className="flex flex-col gap-2 py-5 group sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="flex min-w-0 items-center gap-2 text-white text-base group-hover:text-gray-300 transition-colors">
                    {studio.name}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 text-sm">→</span>
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-1 gap-y-1 sm:block sm:text-right">
                    <span className="text-white font-black text-lg" style={{ letterSpacing: '-0.02em' }}>{studio.price}</span>
                    <span className="text-gray-500 text-sm">/hr</span>
                    {studio.note && <span className="text-gray-600 text-xs ml-3 hidden sm:inline">{studio.note}</span>}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Rental Studios — grouped */}
          <div className="mt-10">
            <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mb-4">Rental Studios</p>
            <div className="divide-y divide-white/8 border-t border-white/8">
              {studios.filter(s => s.category === 'Rental').map((studio) => (
                <a
                  key={studio.name}
                  href={studio.href}
                  className="flex flex-col gap-2 py-5 group sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="flex min-w-0 items-center gap-2 text-white text-base group-hover:text-gray-300 transition-colors">
                    {studio.name}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 text-sm">→</span>
                  </span>
                  <div className="flex items-baseline gap-x-1 sm:block sm:text-right">
                    <span className="text-white font-black text-lg" style={{ letterSpacing: '-0.02em' }}>{studio.price}</span>
                    <span className="text-gray-500 text-sm">/hr</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Production Services — scoped */}
          <div className="mt-10">
            <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mb-4">Production Services</p>
            <div className="divide-y divide-white/8 border-t border-white/8">
              {productionServices.map((service) => (
                <a
                  key={service.name}
                  href={service.href}
                  className="flex flex-col gap-2 py-5 group sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="flex min-w-0 items-center gap-2 text-white text-base group-hover:text-gray-300 transition-colors">
                    {service.name}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 text-sm">→</span>
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-1 gap-y-1 sm:block sm:text-right">
                    <span className="text-white font-black text-lg" style={{ letterSpacing: '-0.02em' }}>{service.price}</span>
                    {service.note && <span className="text-gray-600 text-xs ml-3 hidden sm:inline">{service.note}</span>}
                  </div>
                </a>
              ))}
            </div>
            <p className="mt-4 text-gray-600 text-xs leading-relaxed">
              Production service pricing covers help making the final assets. Room-only rental is separate and stays hourly.
            </p>
          </div>
          <div className="mt-12 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <a href="/book/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
              Book Your Session
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="/contact/" className="text-gray-600 hover:text-white text-sm transition-colors">Questions →</a>
          </div>
        </div>
      </section>

      {/* Block Bookings */}
      <section className="py-32 bg-zinc-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Block Bookings</span>
          <h2
            className="font-black text-white leading-tight mb-16"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}
          >
            Book more,<br />
            <span className="text-brand-red">save more.</span>
          </h2>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {[
              { duration: '2 Hours', price: '$250', note: 'Green Screen or Photography Studio' },
              { duration: '4 Hours', price: '$450', note: 'Green Screen or Photography Studio' },
              { duration: 'Full Day', price: 'Contact us', note: 'Best rate, any studio' },
            ].map(({ duration, price, note }) => (
              <div key={duration} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="block text-white font-black text-xl sm:inline" style={{ letterSpacing: '-0.02em' }}>{duration}</span>
                  <span className="mt-1 block text-gray-500 text-sm sm:ml-4 sm:inline">{note}</span>
                </div>
                <div className="flex items-center justify-between gap-5 sm:justify-end sm:gap-8">
                  <span className="text-brand-red font-black text-2xl" style={{ letterSpacing: '-0.03em' }}>{price}</span>
                  <a
                    href="/book/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white font-bold text-xs tracking-wide rounded hover:bg-red-700 transition-colors"
                  >
                    Book
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Add-Ons */}
      <section className="py-32 bg-zinc-950 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Add-Ons</span>
          <h2
            className="font-black text-white leading-tight mb-16"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.04em' }}
          >
            Enhance your session.
          </h2>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {[
              { name: 'Audio Technician', price: 'Contact for rate', desc: 'Professional audio engineering for podcast and video sessions.' },
              { name: 'Live Switching', price: 'Contact for rate', desc: 'Real-time multi-camera switching for live streams and events.' },
              { name: 'Teleprompter', price: '$25', desc: 'Professional teleprompter for smooth reads and scripted content.' },
            ].map(({ name, price, desc }) => (
              <div key={name} className="flex items-start justify-between gap-8 py-6">
                <div>
                  <p className="text-white font-bold text-base mb-1">{name}</p>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
                <span className="text-brand-red font-bold text-sm flex-shrink-0">{price}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-sm mt-8">
            Add to your booking:{' '}
            <a href="mailto:founder@vibeshackstudios.com" className="text-brand-red hover:underline">
              founder@vibeshackstudios.com
            </a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-end justify-between mb-20">
            <h2 className="font-black text-white leading-none" style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em'}}>
              Questions.
            </h2>
            <span className="number-label">FAQ</span>
          </div>
          <div className="divide-y divide-white/8">
            {pricingFaqs.map(({ question, answer }) => (
              <div key={question} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16 py-8">
                <p className="text-white font-semibold text-base">{question}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-zinc-950 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h2
            className="font-black text-white leading-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em' }}
          >
            Every studio.<br />
            <span className="text-brand-red">Book yours.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10">No minimums. Available 24/7. Northern Waterfront, San Francisco.</p>
          <a
            href="/book/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors"
          >
            Book Your Session
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>
    </>
  )
}

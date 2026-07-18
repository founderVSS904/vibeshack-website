import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { faqSchema, studioServiceSchema } from '@/lib/schemas'
import { siteUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'Rental Studios San Francisco',
  description: 'Rent green screen and white cyc studios in San Francisco. Bring your crew or shoot solo. From $100/hr. Open 24/7.',
  alternates: { canonical: `${siteUrl}/rental-studios/` },
  openGraph: {
    title: 'Rental Studios SF | VibeShack Studios',
    description: 'Canvas and Green Screen studio rentals from $100/hr. Bring your crew or shoot solo. Open 24/7.',
    url: `${siteUrl}/rental-studios/`,
    images: [
      {
        url: '/studio-images/canvas-rental-hero-enhanced-4k-v20260718.jpg',
        width: 1200,
        height: 630,
        alt: 'Canvas white cyc rental studio at VibeShack Studios SF',
      },
    ],
  },
}

const studios = [
  {
    name: 'Canvas',
    href: '/canvas-rental/',
    bookHref: '/book/?studio=canvas-rental',
    image: '/studio-images/canvas-rental-hero-enhanced-4k-v20260718.jpg',
    alt: 'Canvas white cyc rental studio at VibeShack Studios San Francisco',
    eyebrow: 'White cyc / Open floor',
    description: 'A seamless white cyc, open production floor, and overhead lighting grid for photo, video, product, and content shoots.',
    price: '$100',
    position: 'center',
  },
  {
    name: 'Green Screen',
    href: '/green-screen-studio-sf/',
    bookHref: '/book/?studio=green-screen',
    image: '/studio-images/inside-green-screen-v20260509.jpg',
    alt: 'Floor-to-ceiling green screen rental studio at VibeShack Studios San Francisco',
    eyebrow: 'Green cyc / Lighting grid',
    description: 'A floor-to-ceiling green cyc built for compositing, product demos, social content, music videos, and virtual environments.',
    price: '$100',
    position: 'center',
  },
]

const rentalEssentials = [
  {
    number: '01',
    title: 'Lighting-ready',
    body: 'A studio lighting grid and room setup prepared before your session begins.',
  },
  {
    number: '02',
    title: 'Your crew or solo',
    body: 'Bring your team and camera package, or use the room for a simple self-directed shoot.',
  },
  {
    number: '03',
    title: 'Support space',
    body: 'Hair and makeup space is available on-site so talent can get ready without leaving the studio.',
  },
  {
    number: '04',
    title: 'Available 24/7',
    body: 'Book daytime, late-night, or weekend hours based on live studio availability.',
  },
]

const rentalFaqs = [
  {
    question: 'What rental studios are available at VibeShack?',
    answer: 'You can rent Canvas and the Green Screen Studio for photo, video, product, social, and creator shoots.',
  },
  {
    question: 'Can I bring my own crew and equipment?',
    answer: 'Yes. Rental studios are designed for clients who want the space, lighting, and setup while bringing their own crew or working solo.',
  },
  {
    question: 'How much do rental studios cost?',
    answer: 'Canvas and Green Screen start at $100 per hour with a one-hour minimum. Your booking total is based on the room and time selected.',
  },
  {
    question: 'Are rental studios available 24/7?',
    answer: 'Yes. VibeShack is open 24/7, including late nights and weekends, subject to live availability.',
  },
]

const rentalServiceSchema = studioServiceSchema({
  name: 'Production Studio Rental in San Francisco',
  description: 'Green screen, white cyc, and creative studio rentals in San Francisco for photo, video, product, and content shoots.',
  url: `${siteUrl}/rental-studios/`,
  image: `${siteUrl}/studio-images/canvas-rental-hero-enhanced-4k-v20260718.jpg`,
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

      <section className="bg-black pt-20">
        <div className="relative h-[calc(100svh-5rem)] min-h-[600px] max-h-[820px] overflow-hidden bg-[#050505]">
          <Image
            src="/studio-images/canvas-rental-hero-enhanced-4k-v20260718.jpg"
            alt="Canvas white cyc rental studio at VibeShack Studios San Francisco"
            fill
            priority
            quality={90}
            sizes="(min-width: 768px) 72vw, 100vw"
            className="object-cover md:left-auto md:w-[72%]"
            style={{ objectPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.99)_28%,rgba(5,5,5,0.72)_52%,rgba(5,5,5,0.08)_86%),linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.02)_42%,rgba(0,0,0,0.88)_100%)]" />

          <div className="absolute inset-x-5 top-6 z-10 sm:inset-x-10 sm:top-9 lg:inset-x-16 xl:inset-x-24 2xl:inset-x-32">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
              VibeShack / Studio rental / San Francisco
            </p>
          </div>

          <div className="absolute inset-x-5 bottom-10 z-10 max-w-3xl sm:inset-x-10 sm:bottom-12 lg:inset-x-16 lg:bottom-16 xl:inset-x-24 2xl:inset-x-32">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
              White cyc / Green screen / 24-hour access
            </p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] text-white sm:text-7xl lg:text-8xl">
              Rental studios
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-6 text-white/70 sm:mt-6 sm:text-lg sm:leading-7">
              Bring your crew or shoot solo. Choose Canvas or Green Screen and book the room by the hour.
            </p>

            <div className="mt-7 sm:mt-8">
              <Link href="/book/" prefetch={false} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-red px-5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-red-700 sm:min-h-12 sm:px-6 sm:text-[10px] sm:tracking-[0.15em]">
                Book a rental
              </Link>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-white/45">
                Rooms start at <span className="font-bold text-brand-red">$100/hr</span> with a one-hour minimum.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-red">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-16">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">Ready to shoot?</p>
            <h2 className="brand-sans mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Choose the room. Pick the time.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">
              Check live availability and reserve Canvas or Green Screen directly.
            </p>
          </div>
          <Link href="/book/" prefetch={false} className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-7 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-white/85">
            Book a rental
          </Link>
        </div>
      </section>

      <section className="bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="mb-14 max-w-3xl">
            <p className="number-label mb-6">Choose your room</p>
            <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-6xl">
              Two spaces. One simple rate.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
              Start with the background your project needs. Both rooms are designed for self-directed photo, video, product, and creator shoots.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {studios.map(({ name, href, bookHref, image, alt, eyebrow, description, price, position }) => (
              <article key={name} className="group relative h-[500px] overflow-hidden bg-zinc-950 sm:h-[580px]">
                <Image
                  src={image}
                  alt={alt}
                  fill
                  quality={85}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  style={{ objectPosition: position }}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_20%,rgba(0,0,0,0.92)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">{eyebrow}</p>
                  <div className="mt-4 flex items-end justify-between gap-5">
                    <h3 className="brand-sans text-3xl font-semibold text-white sm:text-4xl">{name}</h3>
                    <p className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
                      <span className="text-lg text-brand-red">{price}</span> / hour
                    </p>
                  </div>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/60">{description}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-5">
                    <Link href={bookHref} prefetch={false} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-red px-5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-red-700">
                      Book {name}
                    </Link>
                    <Link href={href} className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/55 transition-colors hover:text-white">
                      View studio →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div>
              <p className="number-label mb-6">Every rental</p>
              <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Bring the crew. The room is ready.
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-gray-500">
                Rental sessions are for clients who want a prepared production space while keeping control of the shoot.
              </p>
            </div>

            <div className="grid gap-x-8 sm:grid-cols-2">
              {rentalEssentials.map(({ number, title, body }) => (
                <div key={number} className="border-t border-white/10 py-7">
                  <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-brand-red">{number}</p>
                  <h3 className="brand-sans mt-4 text-xl font-semibold text-white sm:text-2xl">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 sm:px-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:px-16">
          <div>
            <p className="number-label mb-6">FAQ</p>
            <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-5xl">Before you book.</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-gray-500">
              Start with the room and time you need. If the project requires a produced shoot, contact us before booking.
            </p>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {rentalFaqs.map(({ question, answer }) => (
              <details key={question} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-white marker:hidden [&::-webkit-details-marker]:hidden">
                  {question}
                  <span className="text-2xl font-light text-white/35 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-500">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-black py-32 sm:py-40">
        <Image
          src="/studio-images/inside-green-screen-v20260509.jpg"
          alt="Green screen rental studio at VibeShack Studios San Francisco"
          fill
          loading="lazy"
          quality={85}
          className="object-cover opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.38)_44%,rgba(0,0,0,0.94)_100%)]" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-10 lg:px-16">
          <p className="number-label mb-6">Ready</p>
          <h2 className="brand-sans mb-6 text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Choose the room. Pick the time.
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/60">
            Canvas and Green Screen are available around the clock, with live availability shown during booking.
          </p>
          <div className="flex justify-center">
            <Link href="/book/" prefetch={false} className="inline-flex items-center justify-center rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              Book a rental
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

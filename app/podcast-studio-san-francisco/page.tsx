import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { faqSchema, studioServiceSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Podcast Studios San Francisco',
  description: 'Seven podcast studios in San Francisco with 3-camera 4K, broadcast audio, and crew options. From $300/hr. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/podcast-studio-san-francisco/' },
  openGraph: {
    title: 'Podcast Studios SF | VibeShack Studios',
    description: 'Seven podcast studios in SF with 3-camera 4K, broadcast audio, and crew options. Open 24/7.',
    url: 'https://www.vibeshackstudios.com/podcast-studio-san-francisco',
    images: ['/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg'],
  },
}

const studios = [
  {
    name: 'Executive',
    fullName: 'The Executive',
    href: '/the-executive/',
    bookHref: '/book/?studio=the-executive',
    img: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg',
    series: 'Walnut Series',
    desc: 'Boardroom table, wood slat walls, and a polished interview look.',
    price: '$300/hr',
  },
  {
    name: 'Wing',
    fullName: 'The Wing',
    href: '/the-wing/',
    bookHref: '/book/?studio=the-wing',
    img: '/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg',
    series: 'Walnut Series',
    desc: 'Warm two-person conversation set with a close, natural feel.',
    price: '$300/hr',
  },
  {
    name: 'Encore',
    fullName: 'Encore',
    href: '/encore/',
    bookHref: '/book/?studio=encore',
    img: '/studio-images/enhanced-encore-podcast-wide-v20260510.jpg',
    series: 'Vault Series',
    desc: 'Black acoustic room with a clean, cinematic podcast setup.',
    price: '$300/hr',
  },
  {
    name: 'Sunset',
    fullName: 'Sunset',
    href: '/sunset-studio/',
    bookHref: '/book/?studio=sunset',
    img: '/studio-images/sunset-hero-v20260509.jpg',
    series: 'Creative Series',
    desc: 'Programmable color backdrop for a show with its own mood.',
    price: '$300/hr',
  },
  {
    name: 'Parlor',
    fullName: 'Parlor',
    href: '/parlor/',
    bookHref: '/book/?studio=parlor',
    img: '/studio-images/parlor-production-v20260509.jpg',
    series: 'Premium',
    desc: 'Lounge-style interview setup with premium seating and crew.',
    price: '$400/hr',
  },
  {
    name: 'Horizon',
    fullName: 'Horizon',
    href: '/horizon/',
    bookHref: '/book/?studio=horizon',
    img: '/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg',
    series: 'Premium',
    desc: 'Immersive warm set for conversations with a show-level look.',
    price: '$400/hr',
  },
  {
    name: 'Canvas Podcast',
    fullName: 'Canvas Podcast',
    href: '/canvas-podcast/',
    bookHref: '/book/?studio=canvas-podcast',
    img: '/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg',
    series: 'Premium',
    desc: 'Custom LED backdrop, cinema lighting, and room to scale.',
    price: '$400/hr',
  },
]

const heroStats = [
  {
    label: 'Cameras',
    value: '3',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path d="M4 7.5h3l1.5-2h7l1.5 2h3v10H4v-10Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 10a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    label: 'Recording',
    value: '4K',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path d="M4 12h2m2-5v10m3-7v4m3-9v14m3-11v8m3-4h1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Crew Ready',
    value: 'Crew',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 19c.6-3 2.3-5 5-5s4.4 2 5 5m-3 0c.6-3 2.3-5 5-5s4.4 2 5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

const included = [
  '3-camera 4K production setup',
  'Broadcast microphones and studio audio',
  'Professional lighting in every room',
  'Crew options for camera and production',
  'Hair and makeup room on-site',
  'Open 24/7 by booking',
]

const podcastFaqs = [
  {
    question: 'How much does a podcast studio cost at VibeShack?',
    answer: 'Most podcast studios are $300 per hour. Parlor, Horizon, and Canvas Podcast are $400 per hour. Rates include the studio setup and crew options listed on each room page.',
  },
  {
    question: 'Can I book a podcast studio at night or on weekends?',
    answer: 'Yes. VibeShack is open 24/7, so you can book podcast studio time during the day, at night, or on weekends.',
  },
  {
    question: 'Do the podcast studios include cameras and audio?',
    answer: 'Yes. Podcast rooms include 3-camera 4K production setups, broadcast microphones, lighting, and studio-ready audio routing.',
  },
  {
    question: 'Where are the podcast studios located?',
    answer: 'VibeShack Studios is at 950 Battery St in San Francisco, near the Northern Waterfront and a short walk from the Ferry Building.',
  },
]

const podcastServiceSchema = studioServiceSchema({
  name: 'Podcast Studio Rental in San Francisco',
  description: 'Podcast studios in San Francisco with 3-camera 4K production, broadcast audio, lighting, and crew options.',
  url: 'https://www.vibeshackstudios.com/podcast-studio-san-francisco/',
  image: 'https://www.vibeshackstudios.com/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg',
  price: '300',
  serviceType: 'Podcast Studio Rental',
})

export default function PodcastStudiosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(podcastFaqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(podcastServiceSchema) }}
      />

      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-black pt-20 text-white">
        <Image
          src="/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg"
          alt="Podcast recording in The Executive at VibeShack Studios"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          style={{ objectPosition: 'center 42%' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_40%,rgba(0,64,255,0.26),transparent_17%),linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.56)_28%,rgba(0,0,0,0.08)_58%,rgba(0,0,0,0.58)_100%),linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.18)_44%,#000_100%)]" />
        <div className="absolute inset-y-20 left-0 hidden w-24 bg-[linear-gradient(90deg,rgba(0,0,0,0.92),transparent)] lg:block" />
        <div className="absolute inset-y-20 right-0 hidden w-32 bg-[linear-gradient(270deg,rgba(0,0,0,0.9),transparent)] lg:block" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-1 flex-col justify-end px-6 pb-0 pt-16 sm:px-10 lg:px-16">
          <div className="grid flex-1 items-end gap-8 pb-6 lg:grid-cols-[minmax(0,0.62fr)_minmax(360px,0.38fr)] lg:pb-10">
            <div className="max-w-4xl">
              <p className="mb-5 text-xs font-black uppercase tracking-[0.26em] text-white/60">
                VibeShack Studios / SF Northern Waterfront
              </p>
              <h1 className="max-w-5xl font-black uppercase leading-[0.84] text-white" style={{ fontSize: 'clamp(4.25rem, 10.2vw, 10.8rem)', letterSpacing: 0 }}>
                Podcast<br />
                <span className="text-brand-red">Studios</span>
              </h1>
              <div className="mt-6 h-1 w-20 bg-brand-red" />
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-2xl">
                3-camera 4K. Broadcast audio. Crew ready.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href="/book/?service=podcast"
                  prefetch={false}
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-brand-red px-7 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-700"
                >
                  Book a Session
                </Link>
                <Link
                  href="#rooms"
                  className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/70 px-7 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Compare Rooms
                </Link>
              </div>
            </div>

            <aside className="rounded-md border border-white/20 bg-black/50 p-5 shadow-2xl backdrop-blur-md lg:self-end">
              <div className="grid grid-cols-3 divide-x divide-white/20 border-b border-white/10 pb-5">
                {heroStats.map(({ label, value, icon }) => (
                  <div key={label} className="flex flex-col items-center gap-2 px-2 text-center">
                    <span className="text-white/90">{icon}</span>
                    <span className="text-3xl font-black leading-none text-white">{value}</span>
                    <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-white/70">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/70">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                  <path d="M12 21s7-6.1 7-12A7 7 0 1 0 5 9c0 5.9 7 12 7 12Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                San Francisco, CA
              </div>
            </aside>
          </div>

          <div id="rooms" className="border-t border-white/10 bg-black/80 py-5 backdrop-blur-md">
            <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
              <div>
                <h2 className="text-lg font-black uppercase tracking-[0.03em] text-white">Choose your room</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/60">Each studio. Each vibe. Built for your show.</p>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {studios.map((studio) => (
                  <Link
                    key={studio.name}
                    href={studio.href}
                    className="group relative h-[118px] w-[214px] shrink-0 overflow-hidden rounded border border-white/10 bg-zinc-950 transition-colors hover:border-brand-red"
                  >
                    <Image
                      src={studio.img}
                      alt={`${studio.fullName} podcast studio`}
                      width={428}
                      height={236}
                      loading="eager"
                      unoptimized
                      sizes="214px"
                      className="h-full w-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-black uppercase tracking-[0.04em] text-white">{studio.name}</span>
                      <span aria-hidden="true" className="text-lg text-white/90 transition-transform group-hover:translate-x-1">-&gt;</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-black text-white">
        <section className="border-b border-white/10 py-20 sm:py-24">
          <div className="mx-auto grid max-w-[1536px] gap-10 px-6 sm:px-10 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)] lg:px-16">
            <div>
              <p className="number-label mb-6">Every Room</p>
              <h2 className="text-4xl font-black leading-tight text-white sm:text-5xl">
                The studio is already wired.
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/60">
                Walk in with a topic. Leave with clean multi-camera footage, broadcast-ready sound, and a set that looks like a real show.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {included.map((item) => (
                <div key={item} className="flex items-center gap-3 border-t border-white/10 py-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-red text-xs font-black text-white">✓</span>
                  <span className="text-sm font-semibold text-white/75">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-20 sm:py-24" aria-label="Podcast studio room details">
          <div className="mx-auto max-w-[1536px] px-6 sm:px-10 lg:px-16">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="number-label mb-5">Rooms</p>
                <h2 className="text-3xl font-black leading-tight text-white sm:text-5xl">
                  Pick the visual language of your show.
                </h2>
              </div>
              <Link href="/find-your-studio/" className="text-sm font-bold text-white/60 transition-colors hover:text-white">
                Find your studio -&gt;
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {studios.map((studio) => (
                <article key={studio.name} className="group overflow-hidden rounded-md border border-white/10 bg-zinc-950">
                  <Link href={studio.href} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={studio.img}
                        alt={`${studio.fullName} at VibeShack Studios`}
                        fill
                        loading="lazy"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                        sizes="(min-width: 1280px) 32vw, (min-width: 768px) 50vw, 100vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <p className="absolute left-4 top-4 text-xs font-black uppercase tracking-[0.16em] text-white/80">{studio.series}</p>
                    </div>
                  </Link>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-black text-white">{studio.fullName}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-white/60">{studio.desc}</p>
                      </div>
                      <p className="shrink-0 text-sm font-black text-brand-red">{studio.price}</p>
                    </div>
                    <div className="mt-5 flex items-center gap-4">
                      <Link href={studio.bookHref} prefetch={false} className="rounded bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-black transition-colors hover:bg-zinc-200">
                        Book
                      </Link>
                      <Link href={studio.href} className="text-xs font-bold uppercase tracking-[0.1em] text-white/50 transition-colors hover:text-white">
                        View room
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-20 sm:py-24">
          <div className="mx-auto max-w-[1536px] px-6 sm:px-10 lg:px-16">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-black leading-tight text-white sm:text-5xl">
                Podcast studio questions.
              </h2>
              <span className="number-label">FAQ</span>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {podcastFaqs.map(({ question, answer }) => (
                <div key={question} className="grid grid-cols-1 gap-4 py-8 md:grid-cols-2 md:gap-16">
                  <p className="text-base font-semibold text-white">{question}</p>
                  <p className="text-sm leading-relaxed text-white/60">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 text-center sm:py-28">
          <div className="mx-auto max-w-4xl px-6">
            <p className="number-label mb-6">Ready</p>
            <h2 className="text-4xl font-black leading-tight text-white sm:text-6xl">
              Not sure which room? We will help you choose.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60">
              Book a session if you already know the room, or book a tour and we will match your show to the right set.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href="/book/?service=podcast" prefetch={false} className="inline-flex min-h-12 items-center justify-center rounded bg-brand-red px-7 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-700">
                Book a Session
              </Link>
              <Link href="/tour/" className="inline-flex min-h-12 items-center justify-center rounded border border-white/20 px-7 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors hover:border-white/50 hover:bg-white/10">
                Book a Tour
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

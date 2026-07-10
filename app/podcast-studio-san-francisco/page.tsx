import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PodcastPageMotion from '@/components/PodcastPageMotion'
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
    id: 'executive',
    name: 'Executive',
    fullName: 'The Executive',
    href: '/the-executive/',
    bookHref: '/book/?studio=the-executive',
    img: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg',
    thumb: '/studio-images/the-executive-hero.jpg',
    series: 'Walnut Series',
    desc: 'Boardroom table, wood slat walls, and a polished interview look.',
    line: 'A flagship table set for serious interviews, founder shows, and brand conversations.',
    price: '$300/hr',
    specs: ['Boardroom table', 'Wood slat wall', '3-camera ready'],
  },
  {
    id: 'wing',
    name: 'Wing',
    fullName: 'The Wing',
    href: '/the-wing/',
    bookHref: '/book/?studio=the-wing',
    img: '/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg',
    thumb: '/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg',
    series: 'Walnut Series',
    desc: 'Warm two-person conversation set with a close, natural feel.',
    line: 'A smaller walnut room for intimate shows that should feel close and human.',
    price: '$300/hr',
    specs: ['Two-person set', 'Warm leather seating', 'Broadcast audio'],
  },
  {
    id: 'encore',
    name: 'Encore',
    fullName: 'Encore',
    href: '/encore/',
    bookHref: '/book/?studio=encore',
    img: '/studio-images/enhanced-encore-podcast-wide-v20260510.jpg',
    thumb: '/studio-images/parlor-hero.jpg',
    series: 'Vault Series',
    desc: 'Black acoustic room with a clean, cinematic podcast setup.',
    line: 'A controlled black room for clean contrast, crisp audio, and direct-to-camera clarity.',
    price: '$300/hr',
    specs: ['Acoustic room', 'Minimal black set', 'Clean interview angles'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    fullName: 'Sunset',
    href: '/sunset-studio/',
    bookHref: '/book/?studio=sunset',
    img: '/studio-images/sunset-hero-v20260509.jpg',
    thumb: '/studio-images/horizon-hero.jpg',
    series: 'Creative Series',
    desc: 'Programmable color backdrop for a show with its own mood.',
    line: 'Color-backed podcast energy for creator shows, social clips, and visual-first episodes.',
    price: '$300/hr',
    specs: ['Programmable color', 'Creator set', 'Short-form friendly'],
  },
  {
    id: 'parlor',
    name: 'Parlor',
    fullName: 'Parlor',
    href: '/parlor/',
    bookHref: '/book/?studio=parlor',
    img: '/studio-images/parlor-production-v20260509.jpg',
    thumb: '/studio-images/parlor-production-v20260509.jpg',
    series: 'Signature Series',
    desc: 'Lounge-style interview setup with premium seating and crew.',
    line: 'A premium lounge set for conversations that need polish without feeling corporate.',
    price: '$400/hr',
    specs: ['Chesterfield seating', 'Premium lounge look', 'Crew options'],
  },
  {
    id: 'horizon',
    name: 'Horizon',
    fullName: 'Horizon',
    href: '/horizon/',
    bookHref: '/book/?studio=horizon',
    img: '/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg',
    thumb: '/studio-images/sunset-blue.jpg',
    series: 'Signature Series',
    desc: 'Immersive warm set for conversations with a show-level look.',
    line: 'A warm immersive set built for episodes that should feel like their own world.',
    price: '$400/hr',
    specs: ['Immersive wall', 'Warm sunset palette', 'Wide conversation setup'],
  },
  {
    id: 'canvas-podcast',
    name: 'Canvas Podcast',
    fullName: 'Canvas Podcast',
    href: '/canvas-podcast/',
    bookHref: '/book/?studio=canvas-podcast',
    img: '/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg',
    thumb: '/studio-images/the-wing-hero.jpg',
    series: 'Signature Series',
    desc: 'Custom LED backdrop, cinema lighting, and room to scale.',
    line: 'The large-format podcast room when the show needs scale, custom visuals, and crew.',
    price: '$400/hr',
    specs: ['Custom LED backdrop', 'Cinema lighting', 'Room to scale'],
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
    label: 'Crew Optional',
    value: 'Crew',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 19c.6-3 2.3-5 5-5s4.4 2 5 5m-3 0c.6-3 2.3-5 5-5s4.4 2 5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

const productionStack = [
  {
    title: 'Three angles without the setup day.',
    eyebrow: '3 Cameras',
    body: 'Host, guest, and wide coverage are already planned around the room so the edit has rhythm from the first take.',
    img: '/studio-images/instagram-podcast-studio-cameras.jpg',
  },
  {
    title: 'Audio that makes the room disappear.',
    eyebrow: 'Broadcast Audio',
    body: 'Studio microphones, clean routing, and treated rooms keep the conversation present without sounding like a rented office.',
    img: '/studio-images/enhanced-executive-podcast-guest-closeup-v20260510.jpg',
  },
  {
    title: 'Lighting matched to the set.',
    eyebrow: 'Look',
    body: 'Each room is lit around its own visual language: walnut, black acoustic, color, lounge, or immersive LED.',
    img: '/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg',
  },
  {
    title: 'Crew when the show needs hands.',
    eyebrow: 'Crew Optional',
    body: 'Bring your own operator or add support for camera, production flow, and session confidence.',
    img: '/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg',
  },
]

const deliverables = [
  {
    title: 'Clean multi-camera footage',
    body: 'Files that already make sense in the edit, not a pile of disconnected angles.',
  },
  {
    title: 'Broadcast-ready sound',
    body: 'Dialogue captured like the show matters, because it does.',
  },
  {
    title: 'A room with a point of view',
    body: 'Every set tells the audience what kind of conversation they are watching.',
  },
  {
    title: 'A repeatable production day',
    body: 'Book it again and the show keeps its look, cadence, and standard.',
  },
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
      <PodcastPageMotion />

      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-black pt-20 text-white">
        <Image
          src="/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg"
          alt="Podcast recording in The Executive at VibeShack Studios"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          style={{ objectPosition: 'center center' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_95%_38%,rgba(0,46,255,0.3),transparent_17%),linear-gradient(90deg,rgba(0,0,0,0.66)_0%,rgba(0,0,0,0.22)_34%,rgba(0,0,0,0.06)_64%,rgba(0,0,0,0.68)_100%),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.1)_47%,rgba(0,0,0,0.84)_100%)]" />
        <div className="absolute inset-y-20 left-0 hidden w-24 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),transparent)] lg:block" />
        <div className="absolute inset-y-20 right-0 hidden w-36 bg-[linear-gradient(270deg,rgba(0,0,0,0.94),transparent)] lg:block" />

        <div className="relative z-10 mx-auto flex w-full flex-1 flex-col justify-end px-6 pb-0 pt-16 sm:px-10 lg:px-[110px]">
          <div className="grid flex-1 items-end gap-8 pb-6 lg:grid-cols-1 lg:pb-[33px]">
            <div className="max-w-[650px]">
              <h1 className="font-black uppercase leading-[0.91] text-white" style={{ fontSize: 'clamp(4.25rem, 6vw, 6.5rem)', letterSpacing: 0 }}>
                <span className="inline-block origin-left scale-x-[1.21]">Podcast</span><br />
                <span className="inline-block origin-left scale-x-[1.2] text-brand-red">Studios</span>
              </h1>
              <div className="mt-4 h-[4px] w-[72px] bg-brand-red" />
              <p className="mt-4 max-w-[620px] text-lg leading-[1.2] text-white/90 sm:text-[26px]">
                3-camera 4K. Broadcast audio. Crew ready.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-[18px]">
                <Link
                  href="/book/?service=podcast"
                  prefetch={false}
                  className="inline-flex h-[52px] w-[216px] items-center justify-center rounded-md bg-brand-red text-[15px] font-black uppercase tracking-[0.03em] text-white transition-colors hover:bg-red-700"
                >
                  Book a Session
                </Link>
                <Link
                  href="#rooms"
                  className="inline-flex h-[52px] w-[228px] items-center justify-center rounded-md border border-white/80 text-[15px] font-black uppercase tracking-[0.03em] text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Compare Rooms
                </Link>
              </div>
            </div>

            <aside className="rounded-md border border-white/20 bg-black/55 px-5 py-6 shadow-2xl backdrop-blur-md lg:absolute lg:bottom-[188px] lg:right-[68px] lg:w-[510px]">
              <div className="grid grid-cols-3 divide-x divide-white/20 border-b border-white/20 pb-4">
                {heroStats.map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center justify-center gap-3 px-2 text-left">
                    <span className="text-white/90">{icon}</span>
                    <span>
                      <span className="block text-[28px] font-black uppercase leading-none text-white">{value}</span>
                      <span className="block text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-white/80">{label}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-white/80">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                  <path d="M12 21s7-6.1 7-12A7 7 0 1 0 5 9c0 5.9 7 12 7 12Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                San Francisco, CA
              </div>
            </aside>
          </div>

          <div id="rooms" className="relative left-1/2 w-screen -translate-x-1/2 border-t border-white/10 bg-black/80 py-[17px] backdrop-blur-md">
            <div className="relative mx-auto grid gap-5 px-6 sm:px-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center lg:px-[110px]">
              <div>
                <h2 className="text-[18px] font-black uppercase tracking-[0.02em] text-white">Choose your room</h2>
                <p className="mt-3 text-[15px] leading-[1.35] text-white/70">Each studio. Each vibe.<br className="hidden lg:block" /> Built for your show.</p>
              </div>
              <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {studios.map((studio) => (
                  <Link
                    key={studio.name}
                    href={studio.href}
                    className="group relative h-[136px] w-[196px] shrink-0 overflow-hidden rounded border border-white/10 bg-zinc-950 transition-colors hover:border-brand-red"
                  >
                    <Image
                      src={studio.thumb}
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
              <span aria-hidden="true" className="absolute right-8 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl leading-none text-white/90 backdrop-blur 2xl:flex">
                &rsaquo;
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-black text-white">
        <section className="border-b border-white/10 px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-[1420px]">
            <div data-podcast-reveal className="max-w-5xl">
              <p className="number-label mb-7">Built Like A Show</p>
              <h2 className="text-5xl font-black leading-[0.92] text-white sm:text-7xl lg:text-8xl">
                Pick a room with a point of view.
              </h2>
              <p className="mt-8 max-w-3xl text-xl leading-relaxed text-white/60 sm:text-2xl">
                Each podcast room has its own visual language. The cameras, microphones, lighting, and room tone are already built around it.
              </p>
            </div>
          </div>
        </section>

        <nav className="podcast-room-nav sticky top-20 z-30 border-y border-white/10 bg-black/80 px-4 py-3 backdrop-blur-xl" aria-label="Podcast room sections">
          <div className="mx-auto flex max-w-[1420px] gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {studios.map((studio) => (
              <a
                key={studio.id}
                href={`#room-${studio.id}`}
                data-room-link={studio.id}
                className="shrink-0 rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white/50 transition-colors hover:border-white/40 hover:text-white"
              >
                {studio.name}
              </a>
            ))}
          </div>
        </nav>

        <section className="space-y-5 px-4 py-5 sm:px-6 lg:px-8" aria-label="Podcast studio room details">
          {studios.map((studio, index) => (
            <article
              key={studio.id}
              id={`room-${studio.id}`}
              data-room-panel={studio.id}
              className="podcast-room-panel group mx-auto grid max-w-[1660px] overflow-hidden rounded-lg border border-white/10 bg-zinc-950 lg:min-h-[760px] lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]"
            >
              <div className={`relative min-h-[420px] overflow-hidden lg:min-h-full ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <Image
                  src={studio.img}
                  alt={`${studio.fullName} at VibeShack Studios`}
                  fill
                  loading="eager"
                  className="podcast-room-media object-cover"
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  style={{ objectPosition: index === 2 ? 'center 38%' : 'center' }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_42%,rgba(0,0,0,0.55)_100%)] lg:bg-[linear-gradient(90deg,rgba(0,0,0,0)_42%,rgba(0,0,0,0.18)_100%)]" />
                <p className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/80 backdrop-blur">
                  {studio.series}
                </p>
              </div>

              <div className="flex min-h-[420px] flex-col justify-between p-7 sm:p-10 lg:p-14">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-red">{studio.price}</p>
                  <h3 className="mt-6 text-6xl font-black leading-[0.88] text-white sm:text-7xl lg:text-8xl">
                    {studio.fullName}
                  </h3>
                  <p className="mt-7 max-w-xl text-xl leading-relaxed text-white/70 sm:text-2xl">
                    {studio.line}
                  </p>
                </div>

                <div className="mt-12">
                  <div className="grid gap-3 sm:grid-cols-3" data-podcast-reveal data-delay="120">
                    {studio.specs.map((spec) => (
                      <div key={spec} className="border-t border-white/20 pt-4">
                        <p className="text-sm font-semibold leading-snug text-white/70">{spec}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <Link href={studio.bookHref} prefetch={false} className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-black uppercase tracking-[0.08em] text-black transition-colors hover:bg-zinc-200">
                      Book
                    </Link>
                    <Link href={studio.href} className="inline-flex h-12 items-center justify-center rounded-md border border-white/20 px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors hover:border-white/50 hover:bg-white/10">
                      View Room
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-[1420px]">
            <div data-podcast-reveal className="mb-12 max-w-4xl">
              <p className="number-label mb-7">Production Stack</p>
              <h2 className="text-5xl font-black leading-[0.92] text-white sm:text-7xl">
                The technical parts are already solved.
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {productionStack.map((item, index) => (
                <article key={item.title} data-podcast-reveal data-delay={String(index * 80)} className="podcast-feature-panel overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={item.img}
                      alt={`${item.eyebrow} at VibeShack Studios`}
                      fill
                      loading="lazy"
                      className="object-cover"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  </div>
                  <div className="p-7 sm:p-10">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-red">{item.eyebrow}</p>
                    <h3 className="mt-5 text-4xl font-black leading-[0.95] text-white sm:text-5xl">{item.title}</h3>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto grid max-w-[1420px] gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div data-podcast-reveal className="lg:sticky lg:top-36 lg:self-start">
              <p className="number-label mb-7">What You Leave With</p>
              <h2 className="text-5xl font-black leading-[0.92] text-white sm:text-7xl">
                The episode feels finished before the edit starts.
              </h2>
            </div>
            <div className="divide-y divide-white/10">
              {deliverables.map((item, index) => (
                <div key={item.title} data-podcast-reveal data-delay={String(index * 80)} className="py-9 first:pt-0">
                  <h3 className="text-4xl font-black leading-tight text-white sm:text-5xl">{item.title}</h3>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/60">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 sm:px-10 sm:py-28 lg:px-16">
          <div className="mx-auto max-w-[1100px]">
            <div data-podcast-reveal className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-4xl font-black leading-tight text-white sm:text-6xl">
                Podcast studio questions.
              </h2>
              <span className="number-label">FAQ</span>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {podcastFaqs.map(({ question, answer }) => (
                <details key={question} className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold text-white marker:hidden [&::-webkit-details-marker]:hidden">
                    {question}
                    <span className="text-2xl font-light text-white/40 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/60">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden px-6 py-28 text-center sm:px-10 sm:py-36 lg:px-16">
          <Image
            src="/studio-images/drive-podcast-hero.jpg"
            alt="Podcast studio setup at VibeShack Studios"
            fill
            loading="lazy"
            className="object-cover opacity-45"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#000_0%,rgba(0,0,0,0.62)_42%,#000_100%)]" />
          <div data-podcast-reveal className="relative z-10 mx-auto max-w-5xl">
            <p className="number-label mb-7">Ready</p>
            <h2 className="text-5xl font-black leading-[0.92] text-white sm:text-7xl lg:text-8xl">
              Pick the room. Bring the conversation.
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-white/70">
              We will make the production feel simple from the moment you walk in.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/book/?service=podcast" prefetch={false} className="inline-flex min-h-[52px] items-center justify-center rounded-md bg-brand-red px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-700">
                Book a Session
              </Link>
              <Link href="#room-executive" className="inline-flex min-h-[52px] items-center justify-center rounded-md border border-white/25 px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors hover:border-white/50 hover:bg-white/10">
                Compare Rooms
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

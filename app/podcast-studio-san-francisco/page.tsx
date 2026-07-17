import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PodcastPageMotion from '@/components/PodcastPageMotion'
import PodcastSetSelector, { type PodcastSet } from '@/components/PodcastSetSelector'
import { faqSchema, studioServiceSchema } from '@/lib/schemas'
import { shotAtVibeshack } from '@/lib/seo/workProjects'

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

const studios: PodcastSet[] = [
  {
    id: 'executive',
    name: 'Executive',
    fullName: 'The Executive',
    href: '/the-executive/',
    bookHref: '/book/?studio=the-executive',
    img: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg',
    thumb: '/studio-images/the-executive-hero.jpg',
    series: 'Walnut Series',
    line: 'A walnut boardroom table, balanced sightlines, and a composed frame for founder interviews and branded conversations.',
    bestFor: 'Founder interviews, executive conversations, and branded shows with a composed editorial look.',
    price: '$300/hr',
    specs: ['Boardroom table', 'Wood slat wall', '3-camera ready'],
    position: 'center 48%',
  },
  {
    id: 'wing',
    name: 'Wing',
    fullName: 'The Wing',
    href: '/the-wing/',
    bookHref: '/book/?studio=the-wing',
    img: '/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg',
    thumb: '/studio-images/the-wing-hero.jpg',
    series: 'Walnut Series',
    line: 'Warm leather, close eyelines, and a tighter frame for two-person shows that should feel personal.',
    bestFor: 'Two-person podcasts, close interviews, and conversations that should feel warm and direct.',
    price: '$300/hr',
    specs: ['Two-person set', 'Warm leather seating', 'Broadcast audio'],
    position: 'center 44%',
  },
  {
    id: 'encore',
    name: 'Encore',
    fullName: 'Encore',
    href: '/encore/',
    bookHref: '/book/?studio=encore',
    img: '/studio-images/enhanced-encore-podcast-wide-v20260510.jpg',
    thumb: '/studio-images/encore-thumbnail-v1775092451.jpg',
    series: 'Vault Series',
    line: 'A clean white backdrop inside a fully treated studio, with simple sightlines that keep attention on the conversation.',
    bestFor: 'Clean interviews, direct-to-camera episodes, and shows that need a neutral visual system.',
    price: '$300/hr',
    specs: ['Acoustic treatment', 'Clean white backdrop', 'Direct interview angles'],
    position: 'center 48%',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    fullName: 'Sunset',
    href: '/sunset-studio/',
    bookHref: '/book/?studio=sunset',
    img: '/studio-images/sunset-hero-v20260509.jpg',
    thumb: '/studio-images/sunset-studio-thumbnail.jpg',
    series: 'Creative Series',
    line: 'Programmable color turns the backdrop into part of the show, from restrained brand tones to saturated creator looks.',
    bestFor: 'Creator shows, social-first episodes, and formats with a strong color identity.',
    price: '$300/hr',
    specs: ['Programmable color', 'Creator set', 'Short-form friendly'],
    position: 'center 46%',
  },
  {
    id: 'parlor',
    name: 'Parlor',
    fullName: 'Parlor',
    href: '/parlor/',
    bookHref: '/book/?studio=parlor',
    img: '/studio-images/parlor-production-v20260509.jpg',
    thumb: '/studio-images/parlor-hero.jpg',
    series: 'Signature Series',
    line: 'Chesterfield seating and a relaxed lounge layout give longer conversations space to breathe.',
    bestFor: 'Long-form guest interviews, relaxed panels, and conversations with a more intimate pace.',
    price: '$400/hr',
    specs: ['Chesterfield seating', 'Signature lounge look', 'Crew options'],
    position: 'center 54%',
  },
  {
    id: 'horizon',
    name: 'Horizon',
    fullName: 'Horizon',
    href: '/horizon/',
    bookHref: '/book/?studio=horizon',
    img: '/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg',
    thumb: '/studio-images/horizon-hero.jpg',
    series: 'Signature Series',
    line: 'A warm panoramic background and wide seating plan for conversations that need scale without losing intimacy.',
    bestFor: 'Premium guest shows, editorial conversations, and wider multi-person compositions.',
    price: '$400/hr',
    specs: ['Immersive wall', 'Warm sunset palette', 'Wide conversation setup'],
    position: 'center 48%',
  },
  {
    id: 'canvas-podcast',
    name: 'Canvas Podcast',
    fullName: 'Canvas Podcast',
    href: '/canvas-podcast/',
    bookHref: '/book/?studio=canvas-podcast',
    img: '/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg',
    thumb: '/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg',
    series: 'Signature Series',
    line: 'Our largest podcast set, with a custom LED backdrop, cinema lighting, and space for full art direction.',
    bestFor: 'Custom visual podcasts, larger productions, and shows that need a fully directed environment.',
    price: '$400/hr',
    specs: ['Custom LED backdrop', 'Cinema lighting', 'Large-format set'],
    position: 'center 48%',
  },
]

const studioFacts = [
  ['3', 'camera capture'],
  ['4K', 'recording'],
  ['Broadcast', 'audio'],
  ['Crew', 'available'],
]

const productionStack = [
  {
    title: 'Three angles without the setup day.',
    eyebrow: '3 Cameras',
    body: 'Host, guest, and wide coverage are blocked before you arrive, giving the edit a natural rhythm from take one.',
    img: '/studio-images/instagram-podcast-studio-cameras.jpg',
  },
  {
    title: 'Audio that stays close and clear.',
    eyebrow: 'Broadcast Audio',
    body: 'Broadcast microphones, clean routing, and treated acoustics keep every voice consistent from the first minute to the last.',
    img: '/studio-images/enhanced-executive-podcast-guest-closeup-v20260510.jpg',
  },
  {
    title: 'Lighting matched to the set.',
    eyebrow: 'Look',
    body: 'Every set has a lighting plan tuned for skin tone, background separation, and a look you can repeat next episode.',
    img: '/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg',
  },
  {
    title: 'Crew when the show needs hands.',
    eyebrow: 'Crew Optional',
    body: 'Run it yourself or add an operator for cameras, audio checks, and keeping the session moving.',
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
    title: 'A visual identity',
    body: 'The set tells the audience what kind of conversation they are watching before anyone speaks.',
  },
  {
    title: 'A repeatable production day',
    body: 'Book it again and the show keeps its look, cadence, and standard.',
  },
]

const podcastFaqs = [
  {
    question: 'How much does a podcast studio cost at VibeShack?',
    answer: 'Most podcast studios are $300 per hour. Parlor, Horizon, and Canvas Podcast are $400 per hour. Each set page lists the included production setup and available crew options.',
  },
  {
    question: 'Can I book a podcast studio at night or on weekends?',
    answer: 'Yes. VibeShack is open 24/7, so you can book podcast studio time during the day, at night, or on weekends.',
  },
  {
    question: 'Do the podcast studios include cameras and audio?',
    answer: 'Yes. Podcast sets include 3-camera 4K production setups, broadcast microphones, lighting, and studio-ready audio routing.',
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

      <section className="podcast-hero relative isolate flex min-h-[82svh] items-end overflow-hidden bg-black pt-20 text-white">
        <Image
          src="/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg"
          alt="Podcast recording in The Executive at VibeShack Studios"
          fill
          priority
          quality={90}
          className="podcast-hero-image object-cover object-[83%_center] sm:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.76)_0%,rgba(0,0,0,0.38)_38%,rgba(0,0,0,0.06)_72%),linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.08)_48%,rgba(0,0,0,0.88)_100%)]" />

        <div className="relative z-10 mx-auto w-full max-w-[1680px] px-6 pb-12 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
          <div className="podcast-hero-copy max-w-[760px]">
            <p className="mb-6 text-sm font-semibold text-white/70">San Francisco / Open 24/7</p>
            <h1 className="font-black uppercase leading-[0.88] text-white" style={{ fontSize: 'clamp(4.1rem, 9vw, 8.8rem)', letterSpacing: 0 }}>
              Podcast<br />
              <span className="text-brand-red">Studios</span>
            </h1>
            <p className="mt-7 max-w-[660px] text-lg leading-relaxed text-white/80 sm:text-2xl">
              Seven distinct podcast sets with 3-camera 4K, broadcast audio, and production crew available.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                href="/book/?service=podcast"
                prefetch={false}
                className="inline-flex items-center justify-center rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700"
              >
                Book a session
              </Link>
              <Link href="#sets" className="text-sm font-semibold text-white/70 transition-colors hover:text-white">
                Explore the sets <span className="ml-2" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="podcast-page bg-black text-white">
        <section className="border-y border-white/10">
          <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4">
            {studioFacts.map(([value, label], index) => (
              <div key={label} className={`px-6 py-7 sm:px-7 ${index % 2 === 1 ? 'border-l border-white/10' : ''} ${index > 1 ? 'border-t border-white/10 sm:border-t-0' : ''} ${index > 0 ? 'sm:border-l sm:border-white/10' : ''}`}>
                <p className="text-2xl font-semibold text-white sm:text-3xl">{value}</p>
                <p className="mt-1 text-xs text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="sets" className="scroll-mt-20 px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div data-podcast-reveal className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.58fr)] lg:items-end lg:gap-16">
              <div>
                <p className="number-label mb-6">Seven sets</p>
                <h2 className="brand-sans max-w-4xl text-4xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
                  Choose the frame that already feels like your show.
                </h2>
              </div>
              <p className="max-w-xl text-lg leading-relaxed text-white/55">
                Warm walnut, clean white, saturated color, or a fully directed canvas. Every set is camera-ready, so your production time stays focused on the conversation.
              </p>
            </div>
            <PodcastSetSelector sets={studios} />
          </div>
        </section>

        <section className="border-y border-white/10 bg-zinc-950 px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div data-podcast-reveal className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="number-label mb-6">Made here</p>
                <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-6xl">See how the sets translate on screen.</h2>
              </div>
              <Link href="/our-work/" className="shrink-0 text-sm font-semibold text-white/55 transition-colors hover:text-white">
                View all work <span className="ml-2" aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {shotAtVibeshack.slice(0, 3).map((item, index) => (
                <a
                  key={item.youtubeId}
                  href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  data-podcast-reveal
                  data-delay={String(index * 80)}
                  className="podcast-work-card group block"
                >
                  <span className="relative block aspect-[16/10] overflow-hidden rounded-lg bg-black">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      loading="lazy"
                      quality={85}
                      className="object-cover"
                      style={{ objectPosition: item.objectPosition || 'center' }}
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                    <span className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/25" />
                    <span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white text-black transition-transform duration-300 group-hover:scale-105" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <path d="M8.5 6.8v10.4L17 12 8.5 6.8Z" />
                      </svg>
                    </span>
                  </span>
                  <span className="mt-5 block text-xl font-semibold text-white">{item.title}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-white/45">{item.detail}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div data-podcast-reveal className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] lg:items-start lg:gap-16">
              <div className="lg:sticky lg:top-28">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg sm:aspect-[16/10]">
                  <Image
                    src="/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg"
                    alt="VibeShack production crew preparing a studio set"
                    fill
                    loading="lazy"
                    quality={90}
                    className="podcast-production-image object-cover"
                    sizes="(min-width: 1024px) 56vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                </div>
              </div>

              <div>
                <p className="number-label mb-6">Production built in</p>
                <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-6xl">
                  Walk in ready to record.
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/55">
                  The camera positions, audio path, and lighting logic are already part of the room. Add an operator when the session needs hands.
                </p>
                <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
                  {productionStack.map((item, index) => (
                    <div key={item.title} data-podcast-reveal data-delay={String(index * 70)} className="py-7">
                      <p className="text-xs font-semibold text-brand-red">{item.eyebrow}</p>
                      <h3 className="brand-sans mt-3 text-2xl font-semibold leading-tight text-white">{item.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/45 sm:text-base">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div data-podcast-reveal className="lg:sticky lg:top-32 lg:self-start">
              <p className="number-label mb-6">What you leave with</p>
              <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-6xl">
                Footage that is ready for the edit.
              </h2>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {deliverables.map((item, index) => (
                <div key={item.title} data-podcast-reveal data-delay={String(index * 70)} className="py-7 sm:grid sm:grid-cols-[0.78fr_1.22fr] sm:gap-10">
                  <h3 className="brand-sans text-xl font-semibold leading-tight text-white sm:text-2xl">{item.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-white/45 sm:mt-0">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 sm:px-10 sm:py-28 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div data-podcast-reveal className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-6xl">
                Before you book.
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
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/55">{answer}</p>
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
            quality={90}
            className="object-cover opacity-50"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#000_0%,rgba(0,0,0,0.6)_42%,#000_100%)]" />
          <div data-podcast-reveal className="relative z-10 mx-auto max-w-4xl">
            <p className="number-label mb-6">Ready</p>
            <h2 className="brand-sans text-5xl font-semibold leading-[1.02] text-white sm:text-7xl">
              Your show deserves a set of its own.
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/65">
              Choose the look, reserve the time, and arrive ready to record in San Francisco.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-6">
              <Link href="/book/?service=podcast" prefetch={false} className="inline-flex items-center justify-center rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
                Book a session
              </Link>
              <Link href="#sets" className="self-center text-sm font-semibold text-white/65 transition-colors hover:text-white">
                Compare sets <span className="ml-2" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

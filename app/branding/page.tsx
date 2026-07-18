import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { absoluteUrl, siteUrl } from '@/lib/seo/site'
import { breadcrumbSchema, faqSchema, studioServiceSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Branding and Creative Direction SF',
  description:
    'Branding and creative direction for founders and launches. Lookbooks, packaging visuals, media kits, pitch decks, and visual identity in San Francisco.',
  alternates: { canonical: `${siteUrl}/branding/` },
  openGraph: {
    title: 'Branding | VibeShack Studios SF',
    description:
      'Creative direction, visual identity, launch assets, content systems, media kits, and brand decks from VibeShack Studios.',
    url: `${siteUrl}/branding/`,
    images: ['/studio-images/home-branding-pure-magic-v20260716.jpg'],
  },
}

const engagementSteps = [
  {
    number: '01',
    title: 'Send the context',
    body: 'Share the offer, audience, launch date, current materials, references, and what the brand needs to help you sell.',
  },
  {
    number: '02',
    title: 'Shape the system',
    body: 'We define the visual direction, message, image language, and rules that make the brand feel like one clear world.',
  },
  {
    number: '03',
    title: 'Make the assets',
    body: 'The system moves into the launch pieces you need: decks, campaigns, product visuals, social, photography, and video.',
  },
]

const deliverableGroups = [
  {
    title: 'Creative direction',
    body: 'A focused visual world with references, color, type, image behavior, layout principles, and a clear creative point of view.',
  },
  {
    title: 'Working brand system',
    body: 'Identity rules and repeatable formats your team can use across the website, content, sales material, and launch moments.',
  },
  {
    title: 'Launch-ready assets',
    body: 'Campaign concepts, decks, media kits, social formats, product imagery, and a production plan for the work that needs to ship.',
  },
]

const proofStories = [
  {
    src: '/studio-images/photo-gallery-black-white-sunglasses-v20260716.jpg',
    alt: 'Black and white editorial portrait created for a visual identity system',
    number: '02',
    title: 'Image direction',
    body: 'A repeatable visual point of view for portraits, campaigns, and founder content.',
    position: 'center 38%',
  },
  {
    src: '/studio-images/photo-gallery-pink-profile-v20260520.jpg',
    alt: 'Pink profile portrait created at VibeShack Studios',
    number: '03',
    title: 'Campaign language',
    body: 'Color, styling, and image choices designed to feel like the same brand everywhere.',
    position: 'center',
  },
]

const brandingFaqs = [
  {
    question: 'Do you only design logos?',
    answer: 'No. The work can include creative direction, visual identity, launch systems, campaign concepts, decks, media kits, content formats, product visuals, and the production plan needed to bring the brand to life.',
  },
  {
    question: 'Can VibeShack also produce the photos and video?',
    answer: 'Yes. VibeShack has studios for photography, video, podcasts, commercials, and content production, so the brand system can move directly into finished assets without a separate production handoff.',
  },
  {
    question: 'How much does a branding project cost?',
    answer: 'Branding is quoted after the brief. The scope depends on the current brand, business goals, deliverables, revision needs, usage, and timeline.',
  },
  {
    question: 'Can you refresh an existing brand?',
    answer: 'Yes. A refresh can clarify what already works, tighten the visual system, and build the missing launch or content assets without starting from zero.',
  },
  {
    question: 'How do I start a brand project?',
    answer: 'Use the Start a brand project button and share the business, audience, timeline, current materials, and what needs to change. We will reply with the clearest next step.',
  },
]

const brandingServiceSchema = studioServiceSchema({
  name: 'Branding and Creative Direction in San Francisco',
  description:
    'Branding, creative direction, visual systems, lookbooks, packaging visuals, launch creative, content systems, media kits, and brand deck services for founders, creators, and companies.',
  url: `${siteUrl}/branding/`,
  image: `${siteUrl}/studio-images/home-branding-pure-magic-v20260716.jpg`,
  serviceType: 'Branding and Creative Direction',
})

const breadcrumbs = breadcrumbSchema([
  { name: 'VibeShack Studios', url: absoluteUrl('/') },
  { name: 'Services', url: absoluteUrl('/services/') },
  { name: 'Branding', url: absoluteUrl('/branding/') },
])

export default function BrandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(brandingFaqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandingServiceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section className="bg-black pt-20">
        <div className="relative overflow-hidden bg-[#050505] md:h-[calc(100svh-5rem)] md:min-h-[600px] md:max-h-[820px]">
          <div className="relative aspect-video w-full md:absolute md:inset-0 md:aspect-auto">
            <Image
              src="/studio-images/home-branding-pure-magic-v20260716.jpg"
              fill
              className="object-cover md:left-auto md:w-[68%]"
              alt="Pure Magic product branding photographed at VibeShack Studios"
              priority
              quality={90}
              sizes="(min-width: 768px) 68vw, 100vw"
              style={{ objectPosition: 'center center' }}
            />
            <video
              className="absolute inset-y-0 right-0 h-full w-full object-cover motion-reduce:hidden md:w-[68%]"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/studio-images/home-branding-pure-magic-v20260716.jpg"
              aria-hidden="true"
              tabIndex={-1}
              disablePictureInPicture
            >
              <source src="/studio-videos/home-tile-branding-loop-v20260709e.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_32%,rgba(0,0,0,0)_72%,rgba(0,0,0,0.4)_100%)] md:bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.99)_29%,rgba(5,5,5,0.72)_50%,rgba(5,5,5,0.06)_86%),linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.02)_40%,rgba(0,0,0,0.86)_100%)]" />
          </div>

          <div className="absolute inset-x-5 top-6 z-10 sm:inset-x-10 sm:top-9 lg:inset-x-16 xl:inset-x-24 2xl:inset-x-32">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
              VibeShack / Branding / San Francisco
            </p>
          </div>

          <div className="relative z-10 max-w-3xl px-5 pb-12 pt-8 sm:px-10 md:absolute md:inset-x-10 md:bottom-12 md:px-0 md:pb-0 md:pt-0 lg:inset-x-16 lg:bottom-16 xl:inset-x-24 2xl:inset-x-32">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
              Strategy / Identity / Launch / Content systems
            </p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] text-white sm:text-7xl lg:text-8xl">
              Branding
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-6 text-white/70 sm:mt-6 sm:text-lg sm:leading-7">
              Tell us what the brand needs to do. We will shape the identity, launch system, and production assets around the brief.
            </p>

            <div className="mt-7 sm:mt-8">
              <Link href="/contact/?service=branding" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-red px-5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-red-700 sm:min-h-12 sm:px-6 sm:text-[10px] sm:tracking-[0.15em]">
                Start a brand project
              </Link>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-white/45">
                Share the audience, offer, timeline, and what needs to change. We will reply with the next step.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-red">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-16">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">Ready to make it clear?</p>
            <h2 className="brand-sans mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Give the brand one clear system.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">
              Send the context, goals, and launch date. We will shape the right direction and asset plan.
            </p>
          </div>
          <Link href="/contact/?service=branding" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-7 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-white/85">
            Start a brand project
          </Link>
        </div>
      </section>

      <section className="bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="max-w-3xl">
            <p className="number-label mb-6">How it works</p>
            <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-6xl">
              From context to brand system.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
              You do not need a finished strategy before contacting us. Start with the business, the audience, and what the brand needs to help you accomplish.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {engagementSteps.map(({ number, title, body }) => (
              <div key={number} className="border-t border-white/10 pt-7">
                <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-brand-red">{number}</p>
                <h3 className="brand-sans mt-5 text-2xl font-semibold text-white">{title}</h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 sm:px-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20 lg:px-16">
          <div>
            <p className="number-label mb-6">What ships</p>
            <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-5xl">
              More than a logo file.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-gray-500">
              The work is built to be used across the places where people meet, understand, and buy the brand.
            </p>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {deliverableGroups.map(({ title, body }, index) => (
              <div key={title} className="grid gap-4 py-7 sm:grid-cols-[56px_0.4fr_0.6fr] sm:gap-7">
                <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-white/25">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="brand-sans text-xl font-semibold text-white sm:text-2xl">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="mb-14 grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-20">
            <div>
              <p className="number-label mb-6">Selected proof</p>
              <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-5xl">
                A system people can see.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-gray-500 lg:pb-1">
              Creative direction gets stronger when it can move into packaging, portraits, campaigns, and finished launch content.
            </p>
          </div>

          <figure className="group relative h-[440px] overflow-hidden bg-zinc-950 sm:h-[520px] lg:h-[600px]">
            <Image
              src="/studio-images/home-branding-pure-magic-v20260716.jpg"
              alt="Pure Magic product branding photographed at VibeShack Studios"
              fill
              quality={90}
              className="object-cover object-[76%_center] transition-transform duration-700 ease-out group-hover:scale-[1.015] sm:object-right"
              sizes="(min-width: 1280px) 1180px, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.6)_38%,rgba(0,0,0,0.05)_75%),linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.8)_100%)]" />
            <figcaption className="absolute inset-x-0 bottom-0 p-7 sm:p-10 lg:p-12">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-brand-red">01 / Product system</p>
              <h3 className="brand-sans mt-4 text-3xl font-semibold text-white sm:text-4xl">Pure Magic</h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
                Packaging, product imagery, and a repeatable visual language built to hold together across a full line.
              </p>
            </figcaption>
          </figure>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {proofStories.map(({ src, alt, number, title, body, position }) => (
              <figure key={src} className="group relative h-[440px] overflow-hidden bg-zinc-950 sm:h-[520px]">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  quality={85}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  style={{ objectPosition: position }}
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-brand-red">{number}</p>
                  <h3 className="brand-sans mt-3 text-2xl font-semibold text-white sm:text-3xl">{title}</h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">{body}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 sm:px-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:px-16">
          <div>
            <p className="number-label mb-6">FAQ</p>
            <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-5xl">Before you send the brief.</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-gray-500">
              If the brand is still early or the problem is hard to name, that is fine. Share what you know and we will help identify the next decision.
            </p>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {brandingFaqs.map(({ question, answer }) => (
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
          src="/studio-images/photo-gallery-black-white-sunglasses-v20260716.jpg"
          alt="Black and white editorial portrait created at VibeShack Studios"
          fill
          loading="lazy"
          quality={85}
          className="object-cover object-[center_42%] opacity-65 sm:object-[center_38%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.42)_44%,rgba(0,0,0,0.94)_100%)]" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-10 lg:px-16">
          <p className="number-label mb-6">Your next step</p>
          <h2 className="brand-sans mb-6 text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Tell us what the brand needs to do.
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/60">
            Share the business, audience, timeline, current materials, and what needs to change. We will come back with the clearest path.
          </p>
          <div className="flex justify-center">
            <Link href="/contact/?service=branding" className="inline-flex items-center justify-center rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              Start a brand project
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

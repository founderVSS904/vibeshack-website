import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import SelectedFilmGallery, { type SelectedFilm } from '@/components/SelectedFilmGallery'
import VideoFormatSelector, { type VideoFormat } from '@/components/VideoFormatSelector'
import { absoluteUrl, siteUrl } from '@/lib/seo/site'
import { allWorkProjects } from '@/lib/seo/workProjects'
import { breadcrumbSchema, faqSchema, studioServiceSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Video Production SF',
  description:
    'San Francisco video production for product launch commercials, social content, micro documentaries, music videos, talking-head videos, commercials, and product demos.',
  alternates: {
    canonical: `${siteUrl}/video-production/`,
  },
  openGraph: {
    title: 'Video Production San Francisco | VibeShack Studios',
    description:
      'Plan product launch commercials, social content, documentaries, music videos, talking-head videos, product demos, interviews, and campaign video days at VibeShack Studios.',
    url: `${siteUrl}/video-production/`,
    images: ['/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg'],
  },
}

const serviceTabs = [
  { href: '/commercials/', label: 'Commercials', active: false },
  { href: '/photo-services/', label: 'Photo Services', active: false },
  { href: '/video-production/', label: 'Video Production', active: true },
  { href: '/branding/', label: 'Branding', active: false },
  { href: '/podcast-studio-san-francisco/', label: 'Podcast', active: false },
  { href: '/green-screen-studio-sf/', label: 'Green Screen', active: false },
  { href: '/canvas-rental/', label: 'White Cyc', active: false },
]

const selectedFilmSlugs = ['damian-stone', 'body-is-tea', 'the-buzzer']
const selectedFilms: SelectedFilm[] = selectedFilmSlugs.flatMap((slug) => {
  const project = allWorkProjects.find((item) => item.slug === slug)
  // The gallery embeds YouTube, so only projects with a YouTube home qualify.
  return project?.youtubeId ? [{ ...project, youtubeId: project.youtubeId }] : []
})

const videoFacts = [
  ['From $100/hr', 'studio rental'],
  ['Scoped', 'crew and production'],
  ['24/7', 'studio access'],
]

const videoFormats: VideoFormat[] = [
  {
    eyebrow: '01 / Social',
    title: 'Social media content',
    image: '/studio-images/usecase-brand-content-v20260509.jpg',
    alt: 'Set prepared for social media content production at VibeShack Studios San Francisco',
    objectPosition: 'center center',
    pressure: 'You need more than one good clip: hooks, vertical cuts, thumbnails, transitions, stills, and enough variation to feed the campaign.',
    bestRoom: 'We plan the set around the platform: warm stages for talking-head content, white cyc for movement, green screen for edits, and a photo/video studio for fast changes.',
  },
  {
    eyebrow: '02 / Commercials',
    title: 'Commercials and launch ads',
    image: '/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg',
    alt: 'Behind the scenes lighting setup for commercial video production at VibeShack Studios',
    objectPosition: 'center 42%',
    pressure: 'Commercials need control: clean sound, consistent light, camera movement, product angles, and room for alternate takes without resetting the whole day.',
    bestRoom: 'Canvas, Green Screen, Photography Studio, or a warm interview set depending on whether the spot needs product clarity, performance, or brand presence.',
  },
  {
    eyebrow: '03 / Documentary',
    title: 'Documentaries and micro docs',
    image: '/studio-images/work-beyond-map-documentary-v20260623.png',
    alt: 'Cinematic micro documentary concept image for VibeShack Studios video production',
    objectPosition: 'center 38%',
    pressure: 'A 10-minute story still needs structure: a clear subject, emotional arc, interview spine, supporting visuals, and a reason for the viewer to stay.',
    bestRoom: 'Use warm sets for interviews, controlled studio space for portrait moments, and planned B-roll days when the story needs outside context.',
  },
  {
    eyebrow: '04 / Music',
    title: 'Music videos and artist visuals',
    image: '/studio-images/canvas-rental-music-v1775095665.jpg',
    alt: 'Minimal white cyc music video visual made at VibeShack Studios San Francisco',
    objectPosition: 'center center',
    pressure: 'Artist visuals need atmosphere, negative space, lighting options, and enough visual range to create covers, teasers, performance clips, and full video scenes.',
    bestRoom: 'Canvas works for clean performance visuals, green screen works for world-building, and warm sets can carry intimate acoustic or interview-style artist content.',
  },
  {
    eyebrow: '05 / Brand',
    title: 'Founder videos and brand films',
    image: '/studio-images/enhanced-horizon-warm-guest-closeup-v20260510.jpg',
    alt: 'Founder-style on-camera interview setup for brand films at VibeShack Studios',
    objectPosition: 'center center',
    pressure: 'The person on camera has to feel credible, human, and visually aligned with the brand. The wrong background can make good messaging feel small.',
    bestRoom: 'Horizon, Parlor, Sunset, or The Executive when you want a more finished editorial interview or founder-led brand piece.',
  },
  {
    eyebrow: '06 / Product',
    title: 'Product demos and explainers',
    image: '/studio-images/guide-green-screen-prep-v20260509.jpg',
    alt: 'Green screen studio for product demo and explainer video production at VibeShack Studios',
    objectPosition: 'center center',
    pressure: 'The viewer has to understand the product quickly. That means clean audio, deliberate framing, visual inserts, screen moments, and no distracting background noise.',
    bestRoom: 'Green Screen for compositing, Canvas for clean product clarity, or Photography Studio when you need controlled light and tabletop-style setups.',
  },
]

const productionRules = [
  ['Define the deliverables', 'A commercial, a reel package, a music video, and a founder film should not be planned the same way. Define format, aspect ratios, length, usage, and must-have shots before choosing the studio.'],
  ['Design the visual language', 'White cyc feels clean and flexible. Green screen creates worlds. Warm sets feel human and premium. Black curtains and controlled light feel cinematic. Pick the set for the story, not for availability.'],
  ['Protect sound and pacing', 'If anyone speaks on camera, sound is part of the image. Build the schedule around mics, camera resets, lighting moves, wardrobe changes, props, and social cutaways.'],
  ['Capture more than the hero take', 'A strong production day leaves with the main video plus thumbnails, stills, cutdowns, behind-the-scenes, vertical clips, and extra hooks when the campaign needs them.'],
]

const recommendedRooms = [
  {
    href: '/canvas-rental/',
    title: 'White Cyc / Canvas',
    image: '/studio-images/enhanced-canvas-podcast-white-cyc-duo-v20260510.jpg',
    alt: 'White cyc studio for commercials and social video production at VibeShack Studios San Francisco',
    fit: 'Commercials, music videos, social cutdowns, product movement, clean performance visuals, and full-body framing.',
    price: '$100/hr',
  },
  {
    href: '/green-screen-studio-sf/',
    title: 'Green Screen',
    image: '/studio-images/guide-green-screen-prep-v20260509.jpg',
    alt: 'Green screen studio for explainer and commercial video production at VibeShack Studios San Francisco',
    fit: 'Virtual sets, training videos, app walkthroughs, product explainers, commercial compositing, and scripted scenes.',
    price: '$100/hr',
  },
  {
    href: '/photography-studio-san-francisco/',
    title: 'Photo / Video Studio',
    image: '/studio-images/inside-photography-red-v20260509.jpg',
    alt: 'Flexible photo and video production room at VibeShack Studios San Francisco',
    fit: 'Product demos, head-and-shoulder video, wardrobe changes, beauty content, creator shoots, and fast social setups.',
    price: '$100/hr',
  },
  {
    href: '/horizon/',
    title: 'Warm Interview Sets',
    image: '/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg',
    alt: 'Horizon warm sunset studio for brand video production at VibeShack Studios San Francisco',
    fit: 'Founder videos, brand films, interviews, testimonials, executive thought leadership, and premium talking-head content.',
    price: '$400/hr',
  },
]

const productionPricing = [
  {
    label: 'Studio-only video space',
    price: 'from $100/hr',
    detail:
      'For crews who already have the operator, shot list, lighting plan, talent, and post-production handled.',
  },
  {
    label: 'Scoped production support',
    price: 'Quoted',
    detail:
      'Scoped in-studio video support for social clips, short interviews, product demos, or creator content where the brief is contained.',
  },
  {
    label: 'Music videos, commercials, content days',
    price: 'Quoted',
    detail:
      'Larger shoots are quoted after the brief because direction, crew size, set changes, editing, usage, and deliverables change the actual production load.',
  },
]

const deliverables = [
  '15s, 30s, and 60s ad cuts',
  'Vertical Reels, TikToks, and Shorts',
  '5 to 10 minute micro documentaries',
  'Music video scenes and artist teasers',
  'Founder videos and brand story films',
  'Product demos and launch explainers',
  'Green screen plates and composited scenes',
  'Interview clips and testimonial edits',
  'Thumbnail frames, stills, and BTS assets',
]

const videoFaqs = [
  {
    question: 'Is VibeShack a full-service video production company?',
    answer: 'VibeShack is a production studio with purpose-built sets. Book the studio, bring your own crew, or contact us to scope cameras, lighting, crew, and creative support.',
  },
  {
    question: 'What video formats work best at VibeShack?',
    answer: 'The spaces work well for social media content, commercials, music videos, founder videos, interviews, product demos, training content, green screen videos, video podcasts, and brand content days.',
  },
  {
    question: 'How much does video production cost?',
    answer: 'Studio-only video rentals start at $100 per hour. Scoped in-studio video production is quoted after the brief because concept, crew, camera needs, editing, usage, timeline, and deliverables change the scope.',
  },
  {
    question: 'Can we shoot social content, photos, and video in one day?',
    answer: 'Often, yes. The cleanest approach is to define the priority deliverables first, then build the schedule around wardrobe changes, set changes, lighting moves, product shots, interview moments, and vertical cutdowns.',
  },
  {
    question: 'How do I book the studio?',
    answer: 'Studio-only bookings use the live availability calendar on this site. For production support, send the brief first so we can confirm the studio, crew, and scope before you book.',
  },
]

const videoServiceSchema = studioServiceSchema({
  name: 'Video Production Services in San Francisco',
  description:
    'Video production services and studio spaces in San Francisco for product launch commercials, social media content, micro documentaries, music videos, talking-head videos, commercials, product demos, green screen, video podcasts, and brand content.',
  url: `${siteUrl}/video-production/`,
  image: `${siteUrl}/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg`,
  serviceType: 'Video Production Services',
})

const breadcrumbs = breadcrumbSchema([
  { name: 'VibeShack Studios', url: absoluteUrl('/') },
  { name: 'Services', url: absoluteUrl('/services/') },
  { name: 'Video Production Studio San Francisco', url: absoluteUrl('/video-production/') },
])

export default function VideoProductionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(videoFaqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <section className="relative flex min-h-[82svh] items-end overflow-hidden bg-black">
        <div className="absolute inset-0">
          <Image
            src="/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg"
            fill
            className="video-hero-image object-cover"
            alt="Behind the scenes video production lighting setup at VibeShack Studios San Francisco"
            priority
            quality={90}
            sizes="100vw"
            style={{ objectPosition: 'center 42%' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.54)_44%,rgba(0,0,0,0.12)_78%),linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.08)_48%,rgba(0,0,0,0.9)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1680px] px-6 pb-10 pt-28 sm:px-10 sm:pb-12 lg:px-16 lg:pb-14">
          <div className="video-hero-copy max-w-[830px]">
            <p className="mb-6 text-sm font-semibold text-white/70">950 Battery St / San Francisco</p>
            <h1 className="font-black uppercase leading-[0.88] text-white" style={{ fontSize: 'clamp(4.1rem, 9vw, 8.8rem)', letterSpacing: 0 }}>
              Video<br />
              <span className="text-brand-red">Production</span>
            </h1>
            <p className="mt-6 max-w-[700px] text-lg leading-relaxed text-white/75 sm:text-2xl">
              Commercials, music videos, branded content, and documentaries produced at VibeShack Studios.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-6">
              <Link href="/contact/?service=video-production" className="inline-flex items-center justify-center rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
                Discuss a project
              </Link>
              <Link href="#selected-films" className="text-sm font-semibold text-white/70 transition-colors hover:text-white">
                View selected work <span className="ml-2" aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="mt-8 grid max-w-3xl grid-cols-3 border-t border-white/15">
              {videoFacts.map(([value, label], index) => (
                <div key={label} className={`px-3 py-4 sm:px-5 sm:py-5 ${index > 0 ? 'border-l border-white/10' : ''} first:pl-0`}>
                  <p className="text-sm font-semibold text-white sm:text-base">{value}</p>
                  <p className="mt-1 text-xs text-white/45">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black" data-carousel>
        <div className="scrollbar-hide mx-auto max-w-7xl overflow-x-auto px-6 sm:px-10 lg:px-16">
          <div className="flex min-w-max" role="list" aria-label="Service pages">
            {serviceTabs.map(({ href, label, active }) => (
              <Link
                key={href}
                href={href}
                role="listitem"
                className={`relative px-5 py-4 text-sm font-medium transition-colors after:absolute after:inset-x-5 after:bottom-0 after:h-[2px] after:bg-brand-red after:content-[''] after:transition-transform ${
                  active
                    ? 'text-white after:scale-x-100'
                    : 'text-white/40 after:scale-x-0 hover:text-white/80'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="selected-films" className="scroll-mt-32 border-t border-white/5 bg-black py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="mb-12 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)] lg:items-end lg:gap-16">
            <div>
              <p className="number-label mb-6">Selected work</p>
              <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl" style={{ letterSpacing: 0 }}>
                Recent productions.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg">
              Films for Oakland Ballers, Varii x Josh Sidhu, and Silicon Mania. Select a project to watch it here.
            </p>
          </div>

          <SelectedFilmGallery films={selectedFilms} />
        </div>
      </section>

      <section id="formats" className="scroll-mt-28 border-t border-white/5 bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.58fr)] lg:items-end lg:gap-16">
            <div>
              <p className="number-label mb-6">Formats</p>
              <h2 className="brand-sans max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Built around the brief.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg">
              The shot list, crew, set, and schedule change with the deliverable. Choose the closest format to see how we would plan it.
            </p>
          </div>

          <VideoFormatSelector formats={videoFormats} />
        </div>
      </section>

      <section className="border-t border-white/5 bg-zinc-950 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="grid gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div>
              <p className="number-label mb-6">Production planning</p>
              <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Plan from the deliverables back.
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-gray-500">
                We lock the primary deliverable first, then schedule vertical coverage, stills, thumbnails, and cutdowns around it.
              </p>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {productionRules.map(([title, body], index) => (
                <div key={title} className="grid gap-3 py-6 sm:grid-cols-[48px_0.38fr_0.62fr] sm:gap-6">
                  <p className="text-xs tabular-nums text-white/25">{String(index + 1).padStart(2, '0')}</p>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-sm leading-relaxed text-gray-500">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 border-t border-white/10 pt-10 sm:mt-24 sm:pt-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h3 className="brand-sans text-3xl font-semibold text-white sm:text-4xl">Typical deliverables</h3>
              <p className="max-w-lg text-sm leading-relaxed text-gray-500">Final deliverables are scoped to the brief, platform, and campaign plan.</p>
            </div>
            <div className="mt-9 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {deliverables.map((deliverable) => (
                <div key={deliverable} className="border-t border-white/10 py-5">
                  <p className="text-sm font-semibold leading-snug text-white/80">{deliverable}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-black py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
            <div>
              <p className="number-label mb-6">Studios and sets</p>
              <h2 className="brand-sans max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                The set follows the shot list.
              </h2>
            </div>
            <Link href="/find-your-studio/" className="text-gray-600 hover:text-white text-sm transition-colors">Find your studio</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {recommendedRooms.map(({ href, title, image, alt, fit, price }) => (
              <Link key={href} href={href} className="group block overflow-hidden rounded-lg border border-white/10 bg-zinc-950 hover:border-white/25 transition-colors">
                <div className="relative h-72 overflow-hidden">
                  <Image src={image} alt={alt} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" sizes="(min-width: 1024px) 25vw, 100vw" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)' }} />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                    <h3 className="text-white font-black text-2xl leading-none" style={{ letterSpacing: 0 }}>{title}</h3>
                    <p className="text-white text-sm font-bold">{price}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-500 text-sm leading-relaxed">{fit}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-zinc-950 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="grid items-start gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <p className="number-label mb-6">Pricing</p>
              <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Quoted to the production scope.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-500">
                Studio-only space starts at $100/hr. Production support is quoted after the brief because crew, cameras, set changes, editing, usage, and deliverables change the actual workload.
              </p>
              <div className="mt-9 divide-y divide-white/10 border-y border-white/10">
                {productionPricing.map(({ label, price, detail }) => (
                  <div key={label} className="py-6">
                    <div className="flex items-baseline justify-between gap-6">
                      <p className="font-semibold leading-tight text-white">{label}</p>
                      <p className="whitespace-nowrap text-sm font-semibold text-brand-red">{price}</p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="number-label mb-6">FAQ</p>
              <h3 className="brand-sans text-3xl font-semibold text-white sm:text-4xl">Common questions.</h3>
              <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
                {videoFaqs.map(({ question, answer }) => (
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
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-t border-white/10 bg-black py-32">
        <Image
          src="/studio-images/work-body-is-tea-music-v20260708b.jpg"
          alt="Body Is Tea music video produced by VibeShack Studios"
          fill
          loading="lazy"
          quality={85}
          className="object-cover opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#000_0%,rgba(0,0,0,0.5)_42%,#000_100%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <p className="number-label mb-6">Start a project</p>
          <h2 className="brand-sans mb-6 text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Tell us what you are making.
          </h2>
          <p className="mb-10 text-lg text-white/60">
            Send the brief. We will recommend the studio, crew, and production scope that fit it.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/contact/?service=video-production" className="inline-flex items-center justify-center rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              Discuss the project
            </Link>
            <Link href="/book/" prefetch={false} className="self-center text-sm font-semibold text-white/60 transition-colors hover:text-white">
              Book the studio
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

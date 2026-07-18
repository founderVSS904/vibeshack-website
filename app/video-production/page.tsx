import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { absoluteUrl, siteUrl } from '@/lib/seo/site'
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

const engagementSteps = [
  {
    number: '01',
    title: 'Send the brief',
    body: 'Share the goal, audience, timeline, references, and the videos you need to leave with.',
  },
  {
    number: '02',
    title: 'Build the production plan',
    body: 'We shape the right set, crew, camera plan, schedule, and post-production scope around the brief.',
  },
  {
    number: '03',
    title: 'Produce and deliver',
    body: 'The shoot is organized around the final campaign so the master, cutdowns, and supporting assets work together.',
  },
]

const deliverableGroups = [
  {
    title: 'Hero content',
    body: 'Commercials, music videos, founder films, product stories, and campaign videos built around one clear idea.',
  },
  {
    title: 'Platform cutdowns',
    body: 'Vertical edits, short hooks, 15-second, 30-second, and 60-second versions prepared for the channels that matter.',
  },
  {
    title: 'Supporting assets',
    body: 'Interview clips, thumbnails, still frames, teasers, and behind-the-scenes content captured during the same production.',
  },
]

const videoFaqs = [
  {
    question: 'Is VibeShack a full-service video production company?',
    answer: 'VibeShack is a San Francisco production studio with purpose-built sets and support for cameras, lighting, crew, and creative planning. Send the brief and we will shape the right production scope.',
  },
  {
    question: 'What video formats work best at VibeShack?',
    answer: 'The spaces work well for social media content, commercials, music videos, founder videos, interviews, product demos, training content, green screen videos, video podcasts, and brand content days.',
  },
  {
    question: 'How much does video production cost?',
    answer: 'Every production is quoted after the brief. The scope reflects the concept, crew, camera plan, editing, usage, timeline, and final deliverables.',
  },
  {
    question: 'Can we shoot social content, photos, and video in one day?',
    answer: 'Often, yes. The cleanest approach is to define the priority deliverables first, then build the schedule around wardrobe changes, set changes, lighting moves, product shots, interview moments, and vertical cutdowns.',
  },
  {
    question: 'How do I start a video project?',
    answer: 'Use the Start a video project button and send the brief first. We will confirm the right studio, crew, schedule, and production scope before anything is booked.',
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

      <section className="bg-black pt-20">
        <div className="relative h-[calc(100svh-5rem)] min-h-[600px] max-h-[820px] overflow-hidden bg-[#050505]">
          <Image
            src="/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg"
            fill
            className="object-cover md:left-auto md:w-[72%]"
            alt="Behind the scenes video production lighting setup at VibeShack Studios San Francisco"
            priority
            quality={90}
            sizes="(min-width: 768px) 72vw, 100vw"
            style={{ objectPosition: 'center center' }}
          />
          <video
            className="absolute inset-y-0 right-0 h-full w-full object-cover motion-reduce:hidden md:w-[72%]"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg"
            aria-hidden="true"
            tabIndex={-1}
            disablePictureInPicture
          >
            <source src="/studio-videos/home-tile-video-production-loop-v20260714b.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.98)_28%,rgba(5,5,5,0.74)_50%,rgba(5,5,5,0.1)_84%),linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.02)_40%,rgba(0,0,0,0.82)_100%)]" />

          <div className="absolute inset-x-5 top-6 z-10 sm:inset-x-10 sm:top-9 lg:inset-x-16 xl:inset-x-24 2xl:inset-x-32">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">VibeShack / Video production / San Francisco</p>
          </div>

          <div className="absolute inset-x-5 bottom-10 z-10 max-w-3xl sm:inset-x-10 sm:bottom-12 lg:inset-x-16 lg:bottom-16 xl:inset-x-24 2xl:inset-x-32">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Commercials / Brand films / Social / Music videos</p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] text-white sm:text-7xl lg:text-8xl">
              Video production
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-6 text-white/70 sm:mt-6 sm:text-lg sm:leading-7">
              Tell us what you are making. We will shape the studio, crew, schedule, and post-production plan around the brief.
            </p>

            <div className="mt-7 sm:mt-8">
              <Link href="/contact/?service=video-production" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-red px-5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-red-700 sm:min-h-12 sm:px-6 sm:text-[10px] sm:tracking-[0.15em]">
                Start a video project
              </Link>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-white/45">
                Share your goal, timeline, and deliverables. We will reply with the next step.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-red">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-16">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">Ready to scope it?</p>
            <h2 className="brand-sans mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Have a brief? Let&apos;s build the production.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">
              Send the goal, audience, timeline, and deliverables. We will turn them into a clear production plan.
            </p>
          </div>
          <Link href="/contact/?service=video-production" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-7 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-white/85">
            Start a video project
          </Link>
        </div>
      </section>

      <section className="bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="max-w-3xl">
            <p className="number-label mb-6">How it works</p>
            <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-6xl">
              From brief to production.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
              You do not need to solve the studio, crew, camera plan, and schedule before contacting us. Start with what the video needs to accomplish.
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
            <p className="number-label mb-6">Built for the campaign</p>
            <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-5xl">
              More than one finished file.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-gray-500">
              We plan the production around the full content package so the shoot can support the campaign after the hero video goes live.
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
        <div className="mx-auto grid max-w-7xl gap-14 px-6 sm:px-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:px-16">
          <div>
            <p className="number-label mb-6">FAQ</p>
            <h2 className="brand-sans text-4xl font-semibold leading-tight text-white sm:text-5xl">Before you send the brief.</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-gray-500">
              If the project is still early, that is fine. Share what you know and we will help identify the next decision.
            </p>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
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
      </section>

      <section className="relative isolate overflow-hidden bg-black py-32 sm:py-40">
        <Image
          src="/studio-images/work-chilled-teyo-v20260716.jpg"
          alt="Cinematic rooftop scene from a video produced by VibeShack Studios"
          fill
          loading="lazy"
          quality={85}
          className="object-cover object-[65%_center] opacity-75 sm:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.28)_42%,rgba(0,0,0,0.92)_100%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <p className="number-label mb-6">Your next step</p>
          <h2 className="brand-sans mb-6 text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Tell us what has to ship.
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/60">
            Share the goal, audience, timeline, references, and deliverables. We will come back with the production path.
          </p>
          <div className="flex justify-center">
            <Link href="/contact/?service=video-production" className="inline-flex items-center justify-center rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              Start a video project
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

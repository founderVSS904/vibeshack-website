import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { absoluteUrl } from '@/lib/seo/site'
import { breadcrumbSchema, faqSchema, studioServiceSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Video Production SF',
  description:
    'San Francisco video production for social content, music videos, commercials, founder videos, and product demos. Contact us for a scoped quote.',
  alternates: {
    canonical: 'https://www.vibeshackstudios.com/video-production/',
  },
  openGraph: {
    title: 'Video Production San Francisco | VibeShack Studios',
    description:
      'Plan social content, music videos, commercials, founder films, product demos, green screen, interviews, and campaign video days at VibeShack Studios. Contact us for a scoped quote.',
    url: 'https://www.vibeshackstudios.com/video-production/',
    images: ['/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg'],
  },
}

const serviceTabs = [
  { href: '/photo-services/', label: 'Photo Services', active: false },
  { href: '/video-production/', label: 'Video Production', active: true },
  { href: '/podcast-studio-san-francisco/', label: 'Podcast', active: false },
  { href: '/green-screen-studio-sf/', label: 'Green Screen', active: false },
  { href: '/canvas-rental/', label: 'White Cyc', active: false },
]

const videoFormats = [
  {
    eyebrow: '01 / Social',
    title: 'Social media content',
    image: '/studio-images/usecase-brand-content-v20260509.jpg',
    alt: 'Set prepared for social media content production at VibeShack Studios San Francisco',
    objectPosition: 'center center',
    pressure: 'You need more than one good clip: hooks, vertical cuts, thumbnails, transitions, stills, and enough variation to feed the campaign.',
    bestRoom: 'We plan the room around the platform: warm sets for talking-head content, white cyc for movement, green screen for edits, and photo/video rooms for fast changes.',
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
    eyebrow: '03 / Music',
    title: 'Music videos and artist visuals',
    image: '/studio-images/canvas-rental-music-v1775095665.jpg',
    alt: 'Minimal white cyc music video visual made at VibeShack Studios San Francisco',
    objectPosition: 'center center',
    pressure: 'Artist visuals need atmosphere, negative space, lighting options, and enough visual range to create covers, teasers, performance clips, and full video scenes.',
    bestRoom: 'Canvas works for clean performance visuals, green screen works for world-building, and warm rooms can carry intimate acoustic or interview-style artist content.',
  },
  {
    eyebrow: '04 / Brand',
    title: 'Founder videos and brand films',
    image: '/studio-images/enhanced-horizon-warm-guest-closeup-v20260510.jpg',
    alt: 'Founder-style on-camera interview setup for brand films at VibeShack Studios',
    objectPosition: 'center center',
    pressure: 'The person on camera has to feel credible, human, and visually aligned with the brand. The wrong background can make good messaging feel small.',
    bestRoom: 'Horizon, Parlor, Sunset, The Executive, or Premier when you want a more finished editorial interview or founder-led brand piece.',
  },
  {
    eyebrow: '05 / Product',
    title: 'Product demos and explainers',
    image: '/studio-images/guide-green-screen-prep-v20260509.jpg',
    alt: 'Green screen studio for product demo and explainer video production at VibeShack Studios',
    objectPosition: 'center center',
    pressure: 'The viewer has to understand the product quickly. That means clean audio, deliberate framing, visual inserts, screen moments, and no distracting background noise.',
    bestRoom: 'Green Screen for compositing, Canvas for clean product clarity, or Photography Studio when you need controlled light and tabletop-style setups.',
  },
]

const productionRules = [
  ['Start with the deliverables', 'A commercial, a reel package, a music video, and a founder film should not be planned the same way. Define format, aspect ratios, length, usage, and must-have shots before choosing the room.'],
  ['Design the visual language', 'White cyc feels clean and flexible. Green screen creates worlds. Warm sets feel human and premium. Black curtains and controlled light feel cinematic. Pick the room for the story, not just availability.'],
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
    title: 'Photo / Video Room',
    image: '/studio-images/drive-video-studio.jpg',
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
    label: 'Room-only video space',
    price: 'from $100/hr',
    detail:
      'For crews who already have the operator, shot list, lighting plan, talent, and post-production handled.',
  },
  {
    label: 'Scoped production support',
    price: 'Contact us',
    detail:
      'Scoped in-studio video support for social clips, short interviews, product demos, or creator content where the brief is contained.',
  },
  {
    label: 'Music videos, commercials, content days',
    price: 'Contact us',
    detail:
      'Larger shoots are quoted after the brief because direction, crew size, set changes, editing, usage, and deliverables change the actual production load.',
  },
]

const deliverables = [
  '15s, 30s, and 60s ad cuts',
  'Vertical Reels, TikToks, and Shorts',
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
    answer: 'VibeShack is a production studio with rooms built for video, photo, podcast, green screen, and content work. You can book rooms directly, bring your own crew, or contact us before booking if you want help scoping crew, cameras, lighting, creative direction, or production support.',
  },
  {
    question: 'What video formats work best at VibeShack?',
    answer: 'The spaces work well for social media content, commercials, music videos, founder videos, interviews, product demos, training content, green screen videos, video podcasts, and brand content days.',
  },
  {
    question: 'How much does video production cost?',
    answer: 'Room-only video rentals start at $100 per hour. Scoped in-studio video production is quoted after the brief because concept, crew, camera needs, editing, usage, timeline, and deliverables change the scope.',
  },
  {
    question: 'Can we shoot social content, photos, and video in one day?',
    answer: 'Often, yes. The cleanest approach is to define the priority deliverables first, then build the schedule around wardrobe changes, set changes, lighting moves, product shots, interview moments, and vertical cutdowns.',
  },
  {
    question: 'Can I keep the whole booking on the VibeShack website?',
    answer: 'Yes. Studio booking, availability, and payment are handled on the VibeShack website, with Google Calendar used privately in the background for availability.',
  },
]

const videoServiceSchema = studioServiceSchema({
  name: 'Video Production Services in San Francisco',
  description:
    'Video production services and studio spaces in San Francisco for social media content, music videos, commercials, founder videos, product demos, training content, green screen, video podcasts, and brand content.',
  url: 'https://www.vibeshackstudios.com/video-production/',
  image: 'https://www.vibeshackstudios.com/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg',
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

      <section className="relative min-h-screen flex items-end overflow-hidden bg-black">
        <div className="absolute inset-0">
          <Image
            src="/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg"
            fill
            className="object-cover"
            alt="Behind the scenes video production lighting setup at VibeShack Studios San Francisco"
            priority
            style={{ objectPosition: 'center 42%' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.72) 42%, rgba(0,0,0,0.2) 78%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.18) 46%, transparent 78%)' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-12 pt-32 w-full">
          <div className="max-w-4xl">
            <p className="number-label mb-8">Video Production San Francisco</p>
            <h1 className="font-black text-white leading-[0.95] mb-8" style={{ fontSize: 'clamp(2.45rem, 5.7vw, 5.8rem)', letterSpacing: 0 }}>
              Social content, commercials, music videos.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mb-10">
              Plan video production at VibeShack for social media content, music videos, commercials, founder videos, product demos, interviews, green screen, and full brand content days.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 border-y border-white/10 mb-10 max-w-3xl">
              {[
                ['Production support', 'Contact us'],
                ['Room-only video space', 'from $100/hr'],
                ['Larger shoots', 'Contact us'],
              ].map(([label, value]) => (
                <div key={label} className="py-4 sm:border-r sm:border-white/10 sm:px-5 first:sm:pl-0 last:sm:border-r-0">
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{label}</p>
                  <p className="text-white text-base font-black">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/contact/?service=video-production" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
                Start a video request
              </Link>
              <Link href="/book/" prefetch={false} className="text-gray-400 hover:text-white text-sm font-semibold transition-colors">
                Book room-only
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-white/5 sticky top-20 z-30" data-carousel>
        <div className="scrollbar-hide max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max pr-6" role="list" aria-label="Service pages">
            {serviceTabs.map(({ href, label, active }) => (
              <Link
                key={href}
                href={href}
                role="listitem"
                className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
                  active
                    ? 'border-brand-red bg-brand-red text-white'
                    : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="max-w-4xl mb-20">
            <span className="number-label mb-6 block">What we make</span>
            <h2 className="text-white font-black leading-[0.98] mb-6" style={{ fontSize: 'clamp(2.45rem, 5vw, 5.4rem)', letterSpacing: 0 }}>
              Build the video around the job it has to do.
            </h2>
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-2xl">
              A TikTok batch, a commercial, a music video, and a founder film need different rooms, pacing, lighting, and shot lists. The point is to leave with usable footage, not just a pretty setup.
            </p>
          </div>

          <div className="space-y-24">
            {videoFormats.map(({ eyebrow, title, image, alt, objectPosition, pressure, bestRoom }, index) => (
              <article key={title} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                <div className={`relative overflow-hidden rounded-lg bg-zinc-950 h-[68vh] min-h-[500px] max-h-[740px] lg:col-span-7 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    className="object-cover"
                    style={{ objectPosition }}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                  />
                </div>
                <div className="lg:col-span-5">
                  <p className="number-label mb-7">{eyebrow}</p>
                  <h3 className="text-white font-black leading-[0.98] mb-7" style={{ fontSize: 'clamp(2.25rem, 4.8vw, 4.8rem)', letterSpacing: 0 }}>
                    {title}
                  </h3>
                  <div className="border-y border-white/10 divide-y divide-white/10">
                    <div className="py-7">
                      <p className="text-gray-600 text-[10px] tracking-[0.22em] uppercase mb-3">What matters</p>
                      <p className="text-gray-300 text-base leading-relaxed">{pressure}</p>
                    </div>
                    <div className="py-7">
                      <p className="text-gray-600 text-[10px] tracking-[0.22em] uppercase mb-3">How we shape it</p>
                      <p className="text-gray-400 text-base leading-relaxed">{bestRoom}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-16 items-start">
            <div>
              <span className="number-label mb-6 block">Possible outputs</span>
              <h2 className="text-white font-black leading-[0.98] mb-6" style={{ fontSize: 'clamp(2.25rem, 4vw, 4.5rem)', letterSpacing: 0 }}>
                Shoot once. Leave with the campaign pieces.
              </h2>
              <p className="text-gray-500 text-base leading-relaxed max-w-md">
                The best production days protect the main asset and the smaller assets around it: verticals, thumbnails, stills, cutdowns, and behind-the-scenes moments.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deliverables.map((deliverable) => (
                <div key={deliverable} className="rounded-lg border border-white/10 bg-black px-5 py-5">
                  <p className="text-white text-base font-semibold leading-snug">{deliverable}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
            <div>
              <span className="number-label mb-6 block">Room recommendations</span>
              <h2 className="text-white font-black leading-[0.98]" style={{ fontSize: 'clamp(2.25rem, 4vw, 4.5rem)', letterSpacing: 0 }}>
                Pick the environment before you pick the camera angle.
              </h2>
            </div>
            <Link href="/find-your-studio/" className="text-gray-600 hover:text-white text-sm transition-colors">Use the studio finder</Link>
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

      <section className="py-28 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-16">
            <div>
              <span className="number-label mb-6 block">Production logic</span>
              <h2 className="text-white font-black leading-[0.98] mb-6" style={{ fontSize: 'clamp(2.25rem, 4vw, 4.5rem)', letterSpacing: 0 }}>
                The best video shoot is organized before the camera turns on.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                Use this checklist when you book. It turns a room rental into a production day with a real shot plan.
              </p>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {productionRules.map(([title, body]) => (
                <div key={title} className="grid grid-cols-1 md:grid-cols-[0.35fr_0.65fr] gap-4 md:gap-12 py-7">
                  <p className="text-white font-semibold">{title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-16 items-start">
            <div>
              <span className="number-label mb-6 block">Pricing</span>
              <div className="font-black text-brand-red leading-none mb-3" style={{ fontSize: 'clamp(2.7rem, 6vw, 4.9rem)', letterSpacing: 0 }}>
                Contact us
              </div>
              <p className="text-white font-semibold mb-2">scoped in-studio video production</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Room-only bookings still start at $100/hr. Production support is quoted for clients who want help making the video, not just renting the room. Final scope depends on concept, crew, camera needs, lighting, set changes, editing, usage, and deliverables.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3">
                {productionPricing.map(({ label, price, detail }) => (
                  <div key={label} className="border border-white/10 bg-zinc-950 p-5">
                    <div className="flex items-baseline justify-between gap-6">
                      <p className="text-white font-semibold leading-tight">{label}</p>
                      <p className="text-brand-red font-black whitespace-nowrap">{price}</p>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mt-4">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {videoFaqs.map(({ question, answer }) => (
                <div key={question} className="grid grid-cols-1 md:grid-cols-[0.42fr_0.58fr] gap-4 md:gap-12 py-7">
                  <p className="text-white font-semibold">{question}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <p className="number-label mb-8">Ready</p>
          <h2 className="font-black text-white leading-[0.98] mb-6" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', letterSpacing: 0 }}>
            Bring the concept. Build the footage here.
          </h2>
          <p className="text-gray-500 text-lg mb-10">
            Video production support is quoted after the brief. Room-only video space starts at $100/hr.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact/?service=video-production" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
              Start a video request
            </Link>
            <Link href="/book/" prefetch={false} className="text-gray-500 hover:text-white transition-colors text-sm self-center">
              Book room-only
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

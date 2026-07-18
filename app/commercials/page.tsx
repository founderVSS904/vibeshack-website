import type { Metadata } from 'next'
import { RevenueCategoryPage } from '@/components/RevenueCategoryPage'
import { absoluteUrl, siteUrl } from '@/lib/seo/site'
import { breadcrumbSchema, studioServiceSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Commercial Video Production SF',
  description:
    'Commercial video production in San Francisco for launch ads, talking-head videos, founder videos, product demos, social ads, and campaign content.',
  alternates: { canonical: `${siteUrl}/commercials/` },
  openGraph: {
    title: 'Commercials | VibeShack Studios SF',
    description:
      'Plan commercial video shoots for product launches, talking-head ads, founder videos, demos, and social campaigns at VibeShack Studios.',
    url: `${siteUrl}/commercials/`,
    images: ['/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg'],
  },
}

const commercialServiceSchema = studioServiceSchema({
  name: 'Commercial Video Production in San Francisco',
  description:
    'Commercial video production services for launch ads, talking-head videos, product demos, founder videos, social ads, and campaign content.',
  url: `${siteUrl}/commercials/`,
  image: `${siteUrl}/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg`,
  serviceType: 'Commercial Video Production',
})

const breadcrumbs = breadcrumbSchema([
  { name: 'VibeShack Studios', url: absoluteUrl('/') },
  { name: 'Services', url: absoluteUrl('/services/') },
  { name: 'Commercials', url: absoluteUrl('/commercials/') },
])

export default function CommercialsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(commercialServiceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <RevenueCategoryPage
        eyebrow="Commercials"
        title="Video that sells the thing."
        lead="Commercial shoots at VibeShack start with the final use: launch ads, founder videos, product demos, talking-head spots, and campaign cutdowns."
        heroImage="/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg"
        heroAlt="Commercial video production lighting setup at VibeShack Studios San Francisco"
        heroPosition="center 42%"
        primaryCta={{ href: '/contact/?service=commercials', label: 'Start a commercial brief' }}
        secondaryCta={{ href: '/book/', label: 'Book room-only instead' }}
        stats={[
          { label: 'Best for', value: 'Ads', detail: 'Launch, social, product, founder, testimonial, and campaign video work.' },
          { label: 'Production pricing', value: 'Contact us', detail: 'Quoted after deliverables, crew, usage, and timeline are clear.' },
          { label: 'Room-only', value: 'from $100/hr', detail: 'For teams bringing their own director, operator, crew, and edit plan.' },
        ]}
        introEyebrow="Commercial formats"
        introTitle="Plan the shoot around the placement."
        introBody="Every commercial job is different. Pick the format that matches what you are launching, then send the brief."
        offers={[
          {
            eyebrow: 'Launch',
            title: 'Product launch videos',
            body: 'One shoot planned around the release moment. You leave with the hero video, social cutdowns, product details, thumbnails, and short edits.',
            image: '/studio-images/usecase-brand-content-v20260509.jpg',
            alt: 'Brand content production setup at VibeShack Studios',
          },
          {
            eyebrow: 'Talking head',
            title: 'Founder and spokesperson ads',
            body: 'Clear scripted or semi-scripted videos for paid social, landing pages, investor updates, and brand education.',
            image: '/studio-images/enhanced-horizon-warm-guest-closeup-v20260510.jpg',
            alt: 'Warm founder video setup at VibeShack Studios',
            objectPosition: 'center 38%',
          },
          {
            eyebrow: 'Product',
            title: 'Demos and explainers',
            body: 'Show the product clearly. Controlled footage for apps, services, explainers, training, and green screen compositing.',
            image: '/studio-images/guide-green-screen-prep-v20260509.jpg',
            alt: 'Green screen production studio for demo videos',
          },
          {
            eyebrow: 'Paid social',
            title: 'Short-form ad batches',
            body: 'A shoot day planned around hooks, vertical crops, alternate lines, thumbnails, stills, and fast testing.',
            image: '/studio-images/canvas-production-1-v1775100125.jpg',
            alt: 'Social ad production on a studio set',
          },
          {
            eyebrow: 'Campaign',
            title: 'Brand films and campaign spots',
            body: 'A more produced in-studio day for footage that has to carry a campaign, not pad a content calendar.',
            image: '/studio-images/canvas-production-2-v1775100125.jpg',
            alt: 'Commercial campaign production inside VibeShack Studios',
          },
          {
            eyebrow: 'Testimonials',
            title: 'Customer and interview videos',
            body: 'Real people, filmed well. Polished interviews for sales pages, case studies, course content, executive updates, and brand proof.',
            image: '/studio-images/parlor-production-v20260509.jpg',
            alt: 'Premium interview production at VibeShack Studios',
          },
        ]}
        packages={[
          { title: 'Room-only commercial space', price: 'from $100/hr', detail: 'Best when your crew already has the concept, camera, lighting, production plan, and post-production handled.' },
          { title: 'Scoped in-studio production', price: 'Contact us', detail: 'Best for contained ads, launch videos, founder pieces, product demos, or social batches where VibeShack helps shape the shoot.' },
          { title: 'Campaign production day', price: 'Contact us', detail: 'Best when you need a main asset plus cutdowns, thumbnails, stills, BTS, and multiple usage formats.' },
        ]}
        process={[
          { title: 'Brief', body: 'We define the offer, audience, usage, platform, length, examples, required shots, and final deliverables.' },
          { title: 'Scope', body: 'We decide if this is room-only, lightly supported, or a fuller production with direction, crew, set changes, and post needs.' },
          { title: 'Shoot', body: 'The schedule protects the hero take first, then captures alternate hooks, product angles, verticals, stills, and campaign support assets.' },
          { title: 'Deliver', body: 'You leave with the hero cut plus the cutdowns, stills, and thumbnails scoped in the brief.' },
        ]}
        proofEyebrow="Commercial proof"
        proofTitle="Controlled rooms. Campaign-ready footage."
        proofBody="The same building can handle clean product movement, founder interviews, green screen, white cyc, social cutdowns, and premium interview setups."
        proofImages={[
          { src: '/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg', alt: 'Commercial lighting setup at VibeShack Studios', label: 'Commercial setup', className: 'md:col-span-2 md:row-span-2', objectPosition: 'center 42%' },
          { src: '/studio-images/usecase-brand-content-v20260509.jpg', alt: 'Brand content set at VibeShack Studios', label: 'Brand content' },
          { src: '/studio-images/guide-green-screen-prep-v20260509.jpg', alt: 'Green screen commercial setup', label: 'Compositing' },
          { src: '/studio-images/parlor-production-v20260509.jpg', alt: 'Interview commercial setup', label: 'Interview' },
          { src: '/studio-images/canvas-production-3-v1775100125.jpg', alt: 'Canvas production setup', label: 'Campaign day' },
        ]}
        finalTitle="Turn the shoot into sales material."
        finalBody="Tell us what you are launching, where the video will live, and what assets you need to leave with."
      />
    </>
  )
}

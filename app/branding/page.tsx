import type { Metadata } from 'next'
import { RevenueCategoryPage } from '@/components/RevenueCategoryPage'
import { absoluteUrl } from '@/lib/seo/site'
import { breadcrumbSchema, studioServiceSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Branding and Creative Direction SF',
  description:
    'Branding and creative direction for founders and launches. Lookbooks, packaging visuals, media kits, pitch decks, and visual identity in San Francisco.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/branding/' },
  openGraph: {
    title: 'Branding | VibeShack Studios SF',
    description:
      'Creative direction, lookbooks, campaign systems, launch assets, content systems, visual identity, media kits, and brand decks from VibeShack.',
    url: 'https://www.vibeshackstudios.com/branding/',
    images: ['/studio-images/photo-gallery-red-blue-sunglasses-v20260520.jpg'],
  },
}

const brandingServiceSchema = studioServiceSchema({
  name: 'Branding and Creative Direction in San Francisco',
  description:
    'Branding, creative direction, visual systems, lookbooks, packaging visuals, launch creative, content systems, media kits, and brand deck services for founders, creators, and companies.',
  url: 'https://www.vibeshackstudios.com/branding/',
  image: 'https://www.vibeshackstudios.com/studio-images/photo-gallery-red-blue-sunglasses-v20260520.jpg',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandingServiceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <RevenueCategoryPage
        eyebrow="Branding"
        title="Make the brand easier to buy."
        lead="Branding at VibeShack means creative direction and visual systems for founders, creators, launches, campaigns, and content teams that need the work to feel coherent everywhere it shows up."
        heroImage="/studio-images/photo-gallery-red-blue-sunglasses-v20260520.jpg"
        heroAlt="Color-driven brand portrait created at VibeShack Studios"
        heroPosition="center 42%"
        primaryCta={{ href: '/contact/?service=branding', label: 'Start a brand request' }}
        secondaryCta={{ href: '/our-work/', label: 'See the work first' }}
        stats={[
          { label: 'Best for', value: 'Systems', detail: 'Identity, launches, campaigns, content pillars, decks, and creative direction.' },
          { label: 'Pricing', value: 'Contact us', detail: 'Scoped after goals, deliverables, revision needs, usage, and timeline are clear.' },
          { label: 'Studio advantage', value: 'Shoot-ready', detail: 'Brand thinking can move directly into photos, video, podcasts, and launch content.' },
        ]}
        introEyebrow="Branding scopes"
        introTitle="Turn taste into assets people can use."
        introBody="The goal is not just a logo. It is a working system that helps your site, content, sales material, campaigns, and studio production feel like they belong to the same world."
        offers={[
          {
            eyebrow: 'Identity',
            title: 'Visual identity systems',
            body: 'Direction for logos, type, color, image style, layout behavior, and the visual rules that keep content coherent.',
            image: '/studio-images/photo-gallery-black-white-sunglasses-v20260520.jpg',
            alt: 'Graphic black and white portrait for brand identity direction',
            objectPosition: 'center 38%',
          },
          {
            eyebrow: 'Lookbooks',
            title: 'Lookbooks and brand books',
            body: 'A polished visual package for collections, products, artists, founders, and brands that need a clear presentation system.',
            image: '/studio-images/work-pure-magic-branding-wide-v20260623.png',
            alt: 'Pure Magic product branding image for lookbook and brand book direction',
            objectPosition: 'center',
          },
          {
            eyebrow: 'Launch',
            title: 'Launch creative',
            body: 'Messaging, visual direction, campaign assets, landing-page imagery, ad concepts, and a production plan for release moments.',
            image: '/studio-images/usecase-brand-content-v20260509.jpg',
            alt: 'Brand launch content created at VibeShack Studios',
          },
          {
            eyebrow: 'Product',
            title: 'Packaging and product visuals',
            body: 'Product presentation, packaging direction, launch imagery, product-photo references, ecommerce hero frames, and social crops.',
            image: '/studio-images/home-branding-pure-magic-v20260625.png',
            alt: 'Pure Magic product image for packaging and product visual direction',
            objectPosition: 'center',
          },
          {
            eyebrow: 'Content',
            title: 'Social content systems',
            body: 'Repeatable creative pillars, visual formats, shoot lists, hooks, and asset structures for teams who need content to scale.',
            image: '/studio-images/homepage-creative-photography-gradient-editorial-v20260510.jpg',
            alt: 'Gradient editorial image for content system direction',
          },
          {
            eyebrow: 'Decks',
            title: 'Pitch decks and media kits',
            body: 'A clean narrative and visual system for investor decks, sponsor decks, capabilities decks, press kits, launch decks, and partnership materials.',
            image: '/studio-images/enhanced-canvas-podcast-amber-collage-v20260510.jpg',
            alt: 'Collage-style production visuals for brand deck direction',
          },
          {
            eyebrow: 'Campaign',
            title: 'Campaign direction',
            body: 'A campaign idea translated into visuals, rooms, talent direction, stills, video, and the assets needed for the channel mix.',
            image: '/studio-images/canvas-production-4-v1775100125.jpg',
            alt: 'Campaign production visuals at VibeShack Studios',
          },
          {
            eyebrow: 'Founder',
            title: 'Founder brand systems',
            body: 'Profile images, founder videos, language, content pillars, press visuals, and the repeatable look around the person leading the brand.',
            image: '/studio-images/enhanced-photography-editorial-male-portrait-v20260510.jpg',
            alt: 'Founder portrait for personal brand system',
            objectPosition: 'center 34%',
          },
        ]}
        packages={[
          { title: 'Brand direction sprint', price: 'Contact us', detail: 'Best for clarifying look, message, campaign direction, and what needs to be produced next.' },
          { title: 'Launch system', price: 'Contact us', detail: 'Best for a release that needs landing visuals, video, stills, social, decks, and a cohesive creative spine.' },
          { title: 'Content system', price: 'Contact us', detail: 'Best for founders and teams that need recurring formats, content pillars, shoot plans, and visual consistency.' },
        ]}
        process={[
          { title: 'Diagnose', body: 'We identify what feels unclear: positioning, visual identity, content direction, campaign language, or production assets.' },
          { title: 'Systemize', body: 'We shape the rules: look, voice, references, formats, shot list, asset types, and what should be repeatable.' },
          { title: 'Produce', body: 'Because VibeShack has studios, the brand system can move into photos, video, podcasts, commercials, and launch content without a handoff gap.' },
          { title: 'Monetize', body: 'Branding gets routed to inquiry because pricing depends on deliverables, but every page also points to bookable production paths.' },
        ]}
        proofEyebrow="Brand proof"
        proofTitle="Creative direction that can become real footage."
        proofBody="A brand system gets stronger when it can show up as portraits, campaigns, commercial footage, social systems, and polished studio content."
        proofImages={[
          { src: '/studio-images/photo-gallery-red-blue-sunglasses-v20260520.jpg', alt: 'Color-driven brand portrait at VibeShack Studios', label: 'Visual world', className: 'md:col-span-2 md:row-span-2' },
          { src: '/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg', alt: 'Production setup for brand campaign', label: 'Production' },
          { src: '/studio-images/photo-gallery-pink-profile-v20260520.jpg', alt: 'Pink profile portrait for brand identity', label: 'Identity' },
          { src: '/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg', alt: 'Blue stage brand content set', label: 'Content system' },
          { src: '/studio-images/photo-gallery-gesture-portrait-v20260520.jpg', alt: 'Gesture portrait for creative direction', label: 'Campaign' },
        ]}
        finalTitle="Give the brand a system, then make the assets."
        finalBody="Tell us what you are building, what needs to change, and what assets would make the brand easier to sell."
      />
    </>
  )
}

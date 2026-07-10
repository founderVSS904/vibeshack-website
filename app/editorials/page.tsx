import type { Metadata } from 'next'
import { RevenueCategoryPage } from '@/components/RevenueCategoryPage'
import { absoluteUrl } from '@/lib/seo/site'
import { breadcrumbSchema, studioServiceSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Editorial Photoshoots SF',
  description:
    'Editorial photoshoots in San Francisco for fashion, beauty, portraits, lookbooks, cover art, campaign stills, and content days at VibeShack Studios.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/editorials/' },
  openGraph: {
    title: 'Editorials | VibeShack Studios SF',
    description:
      'Plan fashion, beauty, portrait, lookbook, cover art, and campaign editorial shoots inside VibeShack Studios.',
    url: 'https://www.vibeshackstudios.com/editorials/',
    images: ['/studio-images/photo-gallery-direct-beauty-portrait-v20260520.jpg'],
  },
}

const editorialServiceSchema = studioServiceSchema({
  name: 'Editorial Photoshoots in San Francisco',
  description:
    'Editorial photoshoot services for fashion, beauty, portraits, cover art, lookbooks, campaign stills, and content days.',
  url: 'https://www.vibeshackstudios.com/editorials/',
  image: 'https://www.vibeshackstudios.com/studio-images/photo-gallery-direct-beauty-portrait-v20260520.jpg',
  serviceType: 'Editorial Photography Services',
})

const breadcrumbs = breadcrumbSchema([
  { name: 'VibeShack Studios', url: absoluteUrl('/') },
  { name: 'Services', url: absoluteUrl('/services/') },
  { name: 'Editorials', url: absoluteUrl('/editorials/') },
])

export default function EditorialsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(editorialServiceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <RevenueCategoryPage
        eyebrow="Editorials"
        title="Images with a point of view."
        lead="Editorials are for brands, artists, founders, stylists, and creators who need more than a clean headshot: fashion, beauty, portraits, cover art, lookbooks, and campaign stills."
        heroImage="/studio-images/photo-gallery-direct-beauty-portrait-v20260520.jpg"
        heroAlt="Editorial beauty portrait photographed at VibeShack Studios San Francisco"
        heroPosition="center 36%"
        primaryCta={{ href: '/contact/?service=editorials', label: 'Start an editorial request' }}
        secondaryCta={{ href: '/photography-studio-san-francisco/', label: 'Rent the photo room' }}
        stats={[
          { label: 'Best for', value: 'Campaigns', detail: 'Fashion, beauty, portraits, lookbooks, cover art, press, and content-day stills.' },
          { label: 'Produced shoot', value: 'Contact us', detail: 'Quoted around people, products, usage, sets, styling, and post expectations.' },
          { label: 'Room-only', value: '$100/hr', detail: 'Photography studio rental when your photographer and crew are already set.' },
        ]}
        introEyebrow="Editorial paths"
        introTitle="A shoot day should leave with a usable image system."
        introBody="The page gives editorial buyers clear categories, then separates custom production from simple hourly rental so the next step is obvious."
        offers={[
          {
            eyebrow: 'Fashion',
            title: 'Fashion editorials',
            body: 'Full-body frames, movement, wardrobe changes, strong crops, and controlled backgrounds for campaigns and lookbooks.',
            image: '/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260510.jpg',
            alt: 'Fashion editorial photographed at VibeShack Studios',
            objectPosition: '42% center',
          },
          {
            eyebrow: 'Beauty',
            title: 'Beauty and close-up portraits',
            body: 'Tight portraits, makeup details, jewelry, skin, expression, and high-impact hero images for launch and social.',
            image: '/studio-images/photo-gallery-editorial-makeup-closeup-v20260520.jpg',
            alt: 'Beauty editorial makeup close-up at VibeShack Studios',
            objectPosition: 'center 38%',
          },
          {
            eyebrow: 'Artists',
            title: 'Cover art and press images',
            body: 'Visual identity images for artists, creators, founders, and public-facing talent who need a stronger image set.',
            image: '/studio-images/photo-gallery-red-blue-sunglasses-v20260520.jpg',
            alt: 'Color-driven artist portrait at VibeShack Studios',
          },
          {
            eyebrow: 'Brands',
            title: 'Campaign stills',
            body: 'Product, talent, wardrobe, texture, movement, and negative-space frames built for ads, web, decks, and social.',
            image: '/studio-images/usecase-photography-campaign-v20260509.jpg',
            alt: 'Photography campaign image at VibeShack Studios',
          },
          {
            eyebrow: 'Content day',
            title: 'Portrait and content systems',
            body: 'A single shoot planned to produce headshots, editorial portraits, social crops, website assets, and press options.',
            image: '/studio-images/enhanced-photography-editorial-male-portrait-v20260510.jpg',
            alt: 'Editorial male portrait photographed at VibeShack Studios',
            objectPosition: 'center 34%',
          },
          {
            eyebrow: 'Movement',
            title: 'White cyc movement studies',
            body: 'Clean frames for dancers, performers, fashion tests, form studies, brand motion, and graphic campaign layouts.',
            image: '/studio-images/photo-gallery-pole-form-white-cyc-v20260520.jpg',
            alt: 'White cyc movement portrait at VibeShack Studios',
          },
        ]}
        packages={[
          { title: 'Photo room rental', price: '$100/hr', detail: 'For photographers and crews who only need the room, lighting access, backdrop options, and HMU space.' },
          { title: 'Editorial session', price: 'Contact us', detail: 'For portraits, cover art, lookbooks, beauty, and campaign stills with a clearer creative direction.' },
          { title: 'Campaign content day', price: 'Contact us', detail: 'For teams that need a wider image system: portraits, product, social crops, press, and campaign stills.' },
        ]}
        process={[
          { title: 'Reference', body: 'We look at the mood, brand, styling, audience, and placements so the shoot has direction before the camera comes out.' },
          { title: 'Shot list', body: 'We protect the must-have images first: hero, close-up, full-body, negative-space, product, press, and social crops.' },
          { title: 'Set rhythm', body: 'The day is paced around wardrobe changes, hair and makeup, lighting changes, selects, and any product or prop resets.' },
          { title: 'Route', body: 'Produced editorial work goes to inquiry. Room-only photography rental stays one click away when the buyer already has a crew.' },
        ]}
        proofEyebrow="Editorial proof"
        proofTitle="Beauty, fashion, portraits, and campaign stills."
        proofBody="The studio can move from clean cyc to color, close-up beauty, black-background portraits, and finished campaign images without leaving the building."
        proofImages={[
          { src: '/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260510.jpg', alt: 'Fashion editorial at VibeShack Studios', label: 'Fashion editorial', className: 'md:col-span-2 md:row-span-2', objectPosition: '42% center' },
          { src: '/studio-images/photo-gallery-beauty-jewelry-closeup-v20260520.jpg', alt: 'Beauty jewelry close-up at VibeShack Studios', label: 'Beauty' },
          { src: '/studio-images/photo-gallery-black-red-afro-portrait-v20260520.jpg', alt: 'Black and red editorial portrait at VibeShack Studios', label: 'Portrait' },
          { src: '/studio-images/photo-gallery-pink-studio-portrait-v20260520.jpg', alt: 'Pink studio editorial portrait at VibeShack Studios', label: 'Color study' },
          { src: '/studio-images/photo-gallery-mens-shadow-portrait-v20260520.jpg', alt: 'Mens shadow portrait at VibeShack Studios', label: 'Press image' },
        ]}
        finalTitle="Build an image set with teeth."
        finalBody="Tell us the campaign, talent, styling, deliverables, and where the images need to live."
      />
    </>
  )
}

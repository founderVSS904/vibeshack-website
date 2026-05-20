import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { breadcrumbSchema } from '@/lib/schemas'
import { absoluteUrl } from '@/lib/seo/site'
import { studioGuides } from '@/lib/seo/studioGuides'

export const metadata: Metadata = {
  title: 'Studio Guides',
  description:
    'Production prep guides for podcast, green screen, photo services, white cyc, and San Francisco studio rental planning at VibeShack Studios.',
  alternates: { canonical: absoluteUrl('/studio-guides/') },
  openGraph: {
    title: 'Studio Guides | VibeShack Studios',
    description:
      'Practical production guides for choosing and preparing for studio shoots in San Francisco.',
    url: absoluteUrl('/studio-guides/'),
    images: ['/og-image.jpg'],
  },
}

const orderedGuides = [
  studioGuides.find((guide) => guide.slug === 'best-studio-for-your-shoot'),
  ...studioGuides.filter((guide) => guide.slug !== 'best-studio-for-your-shoot'),
].filter((guide): guide is (typeof studioGuides)[number] => Boolean(guide))

const featuredGuide = orderedGuides[0]
const supportingGuides = orderedGuides.slice(1)

const operatingNotes = [
  {
    title: 'The room is a production decision.',
    body: 'Choose by the final asset: conversation, clean campaign still, keyed composite, product demo, or white cyc movement.',
  },
  {
    title: 'The first hour should feel calm.',
    body: 'Arrival, wardrobe, guest comfort, framing, audio checks, and setup order decide whether the session feels premium or rushed.',
  },
  {
    title: 'The best output is reusable.',
    body: 'Strong prep protects the hero take plus social crops, thumbnails, stills, hooks, clean plates, and secondary assets.',
  },
]

export default function StudioGuidesPage() {
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Studio Guides', url: absoluteUrl('/studio-guides/') },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section className="border-b border-white/10 bg-black px-6 pb-20 pt-32 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase text-brand-red">VibeShack decision guides</p>
            <h1 className="mt-8 max-w-5xl text-5xl font-black leading-[0.94] text-white sm:text-6xl lg:text-7xl">
              Prepare like the edit already depends on it.
            </h1>
          </div>
          <div className="grid gap-8">
            <p className="max-w-2xl text-lg leading-relaxed text-gray-300">
              These guides are built for people who want the session to feel controlled: what to bring, what to decide first, what usually breaks, and how to leave with assets that are actually useful.
            </p>
            {featuredGuide && (
              <Link href={`/studio-guides/${featuredGuide.slug}/`} className="group grid gap-5 border-y border-white/10 py-5 sm:grid-cols-[150px_1fr_auto] sm:items-center">
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-zinc-950">
                  <Image
                    src={featuredGuide.image}
                    alt=""
                    fill
                    priority
                    sizes="150px"
                    className="object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500">Start here</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight text-white">{featuredGuide.shortTitle}</h2>
                </div>
                <span className="text-sm font-bold text-white transition-colors group-hover:text-brand-red">Open guide &rarr;</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.72fr_1fr]">
          <div>
            <p className="text-xs font-bold uppercase text-brand-red">Producer standards</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              The guides are simple because the decisions are not.
            </h2>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {operatingNotes.map((note, index) => (
              <div key={note.title} className="grid gap-5 py-8 md:grid-cols-[80px_1fr]">
                <p className="text-sm font-bold text-gray-600">{String(index + 1).padStart(2, '0')}</p>
                <div>
                  <h3 className="text-2xl font-black leading-tight text-white">{note.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">{note.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-4xl">
            <p className="text-xs font-bold uppercase text-brand-red">Guide library</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-6xl">
              Practical prep for the moments that decide quality.
            </h2>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {supportingGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/studio-guides/${guide.slug}/`}
                className="group grid gap-8 py-10 lg:grid-cols-[280px_1fr_240px]"
              >
                <div className="relative aspect-[16/11] overflow-hidden rounded-md bg-black lg:aspect-[4/3]">
                  <Image
                    src={guide.image}
                    alt={guide.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 280px, 100vw"
                    className="object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500">{guide.keyword}</p>
                  <h3 className="mt-4 text-3xl font-black leading-tight text-white transition-colors group-hover:text-brand-red sm:text-4xl">
                    {guide.shortTitle}
                  </h3>
                  <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-400">{guide.intro}</p>
                </div>
                <div className="border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                  <p className="text-xs font-bold uppercase text-gray-600">Bring first</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-300">{guide.checklist[0]}</p>
                  <p className="mt-6 text-xs font-bold uppercase text-gray-600">Common miss</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">{guide.mistakes[0]}</p>
                  <span className="mt-7 inline-flex text-sm font-bold text-white transition-colors group-hover:text-brand-red">
                    Read guide &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 border-t border-white/10 pt-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-gray-600">Need a recommendation?</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
              Use the studio finder before you lock the room.
            </h2>
          </div>
          <Link href="/find-your-studio/" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-transform duration-300 hover:scale-[1.03]">
            Find a studio
          </Link>
        </div>
      </section>
    </>
  )
}

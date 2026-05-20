import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { breadcrumbSchema } from '@/lib/schemas'
import { absoluteUrl } from '@/lib/seo/site'
import { useCases } from '@/lib/seo/useCases'

const planningPrinciples = [
  {
    label: 'Outcome',
    title: 'Start with where the asset has to perform.',
    body: 'A sales page, investor update, internal training module, ad campaign, and founder interview all need different pacing, framing, audio, and crop choices.',
  },
  {
    label: 'Risk',
    title: 'Name the thing that would make the shoot feel amateur.',
    body: 'For some projects it is echo. For others it is green spill, floor marks, weak wardrobe, missing product backups, or a set that does not match the brand.',
  },
  {
    label: 'Package',
    title: 'Book for the full asset set, not one hero take.',
    body: 'The best studio day leaves with the main piece plus crops, stills, clips, clean plates, profile images, or launch variations that keep working after the session.',
  },
]

export const metadata: Metadata = {
  title: 'Studio Use Cases',
  description:
    'Choose the right VibeShack Studios path for podcast interviews, content days, green screen, photo services, photography studio rental, and white cyc social shoots.',
  alternates: { canonical: absoluteUrl('/use-cases/') },
  openGraph: {
    title: 'Studio Use Cases | VibeShack Studios',
    description: 'Choose the right San Francisco production studio by what you are making.',
    url: absoluteUrl('/use-cases/'),
    images: ['/og-image.jpg'],
  },
}

export default function UseCasesPage() {
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Use Cases', url: absoluteUrl('/use-cases/') },
  ])

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${absoluteUrl('/use-cases/')}#use-cases`,
    name: 'VibeShack Studios use cases',
    itemListElement: useCases.map((useCase, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: useCase.title,
      url: absoluteUrl(`/use-cases/${useCase.slug}/`),
    })),
  }

  const heroCases = useCases.slice(0, 3)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      <section className="border-b border-white/10 bg-black px-6 pb-20 pt-32 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase text-brand-red">Popular use cases</p>
            <h1 className="mt-8 max-w-5xl text-5xl font-black leading-[0.94] text-white sm:text-6xl lg:text-7xl">
              Choose the room by the work it has to produce.
            </h1>
          </div>

          <div className="grid gap-6">
            <p className="max-w-2xl text-lg leading-relaxed text-gray-300">
              This is the client-side way to choose VibeShack: start with the deliverable, understand the production risk, then book the setup that makes the final asset easier to trust, edit, and publish.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {heroCases.map((useCase) => (
                <div key={useCase.slug} className="relative aspect-[4/5] overflow-hidden rounded-md border border-white/10 bg-zinc-950">
                  <Image
                    src={useCase.image}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 17vw, 30vw"
                    className="object-cover opacity-85"
                    style={{ objectPosition: useCase.imagePosition ?? 'center' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.72fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase text-brand-red">How we think</p>
              <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
                A professional shoot is an operating system, not a pretty room.
              </h2>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {planningPrinciples.map((principle) => (
                <div key={principle.label} className="grid gap-5 py-7 md:grid-cols-[140px_1fr]">
                  <p className="text-sm font-bold text-gray-500">{principle.label}</p>
                  <div>
                    <h3 className="text-2xl font-black leading-tight text-white">{principle.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-400">{principle.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-4xl">
            <p className="text-xs font-bold uppercase text-brand-red">Production paths</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-6xl">
              Start with the situation your client, guest, product, or campaign is actually in.
            </h2>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {useCases.map((useCase, index) => (
              <Link
                key={useCase.slug}
                href={`/use-cases/${useCase.slug}/`}
                className="group grid gap-8 py-10 transition-colors hover:border-white/30 lg:grid-cols-[92px_280px_1fr_190px]"
              >
                <p className="text-sm font-bold text-gray-600">{String(index + 1).padStart(2, '0')}</p>

                <div className="relative aspect-[16/11] overflow-hidden rounded-md bg-black lg:aspect-[4/3]">
                  <Image
                    src={useCase.image}
                    alt={useCase.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 280px, 100vw"
                    className="object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                    style={{ objectPosition: useCase.imagePosition ?? 'center' }}
                  />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-gray-500">{useCase.shortTitle}</p>
                  <h3 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-white transition-colors group-hover:text-brand-red sm:text-4xl">
                    {useCase.title}
                  </h3>
                  <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-400">{useCase.clientNeed}</p>
                  <div className="mt-7 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-600">First room</p>
                      <p className="mt-2 text-sm text-gray-200">{useCase.roomMatches[0].name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-600">Rate signal</p>
                      <p className="mt-2 text-sm text-gray-200">{useCase.roomMatches[0].price}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-600">Primary output</p>
                      <p className="mt-2 text-sm text-gray-200">{useCase.deliverables[0]}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-end lg:justify-end">
                  <span className="text-sm font-bold text-white transition-colors group-hover:text-brand-red">
                    Plan the shoot &rarr;
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
            <p className="text-xs font-bold uppercase text-gray-600">Still deciding?</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
              Tour the rooms or start with the studio finder.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/find-your-studio/" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-transform duration-300 hover:scale-[1.03]">
              Find a studio
            </Link>
            <Link href="/tour/" className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-white/40">
              Book a tour
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

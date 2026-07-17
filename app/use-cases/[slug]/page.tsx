import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EditorialSeoHero } from '@/components/EditorialSeoHero'
import { breadcrumbSchema, faqSchema } from '@/lib/schemas'
import { absoluteUrl, siteUrl } from '@/lib/seo/site'
import { getUseCaseBySlug, getUseCaseCanonicalUrl, useCases } from '@/lib/seo/useCases'

export function generateStaticParams() {
  return useCases.map((useCase) => ({ slug: useCase.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const useCase = getUseCaseBySlug(slug)
  if (!useCase) return {}

  return {
    title: useCase.title,
    description: useCase.description,
    alternates: { canonical: getUseCaseCanonicalUrl(useCase.slug) },
    openGraph: {
      title: `${useCase.title} | VibeShack Studios`,
      description: useCase.description,
      url: getUseCaseCanonicalUrl(useCase.slug),
      images: [useCase.image],
    },
  }
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const useCase = getUseCaseBySlug(slug)
  if (!useCase) notFound()

  const bestRoom = useCase.roomMatches[0]
  const containHeroImage = ['brand-content-day'].includes(useCase.slug)

  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Use Cases', url: absoluteUrl('/use-cases/') },
    { name: useCase.shortTitle, url: getUseCaseCanonicalUrl(useCase.slug) },
  ])

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${getUseCaseCanonicalUrl(useCase.slug)}#service`,
    name: useCase.title,
    description: useCase.description,
    serviceType: useCase.serviceType,
    provider: { '@id': `${siteUrl}/#business` },
    areaServed: [{ '@type': 'City', name: 'San Francisco' }, { '@type': 'AdministrativeArea', name: 'Bay Area' }],
    audience: useCase.audience.map((name) => ({ '@type': 'Audience', audienceType: name })),
    url: getUseCaseCanonicalUrl(useCase.slug),
    image: absoluteUrl(useCase.image),
    availableChannel: { '@type': 'ServiceChannel', serviceUrl: absoluteUrl(useCase.bookHref) },
    offers: { '@type': 'Offer', url: absoluteUrl(useCase.bookHref), priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    serviceOutput: useCase.deliverables,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Recommended VibeShack studio setups',
      itemListElement: useCase.roomMatches.map((room) => ({
        '@type': 'Offer',
        name: room.name,
        url: absoluteUrl(room.href),
        description: room.fit,
        priceCurrency: 'USD',
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(useCase.faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />

      <EditorialSeoHero
        backHref="/use-cases/"
        backLabel="Use Cases"
        eyebrow={useCase.keyword}
        title={useCase.title}
        description={useCase.description}
        image={useCase.image}
        imageAlt={useCase.imageAlt}
        imagePosition={useCase.imagePosition ?? 'center'}
        imageFit={containHeroImage ? 'contain' : 'cover'}
        meta={[
          { label: 'Best first room', value: bestRoom.name },
          { label: 'Starting point', value: bestRoom.price },
          { label: 'Built for', value: useCase.audience.slice(0, 2).join(' / ') },
        ]}
      />

      <section className="bg-black px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl border-y border-white/10">
          {useCase.decisionPoints.slice(0, 3).map((point, index) => (
            <div key={point.label} className="grid gap-5 border-b border-white/10 py-7 last:border-b-0 md:grid-cols-[90px_260px_1fr] md:items-start">
              <p className="text-xs font-bold text-gray-600">{String(index + 1).padStart(2, '0')}</p>
              <p className="text-[11px] font-bold uppercase text-gray-500">{point.label}</p>
              <p className="max-w-3xl text-base leading-relaxed text-gray-200">{point.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-black px-6 pb-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">Production read</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-6xl">
              The room choice should protect the asset, not only hold the crew.
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-gray-400">{useCase.clientNeed}</p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-500">Use this path when</p>
            <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {useCase.idealFor.map((item) => (
                <li key={item} className="py-5 text-base leading-relaxed text-gray-200">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-500">Choose another path when</p>
            <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {useCase.notFor.map((item) => (
                <li key={item} className="py-5 text-base leading-relaxed text-gray-400">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">Room sequence</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              Start with the room that removes the most risk.
            </h2>
          </div>

          <div className="border-t border-white/10">
            {useCase.roomMatches.map((room, index) => (
              <Link
                key={room.name}
                href={room.href}
                className="group grid gap-5 border-b border-white/10 py-8 transition-colors hover:border-white/35 md:grid-cols-[90px_1fr_150px]"
              >
                <p className="text-xs font-bold text-gray-600">{String(index + 1).padStart(2, '0')}</p>
                <div>
                  <h3 className="text-3xl font-black leading-tight text-white transition-colors group-hover:text-brand-red">
                    {room.name}
                  </h3>
                  <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-400">{room.fit}</p>
                </div>
                <p className="text-left text-sm font-semibold text-gray-300 md:text-right">{room.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[0.78fr_1fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">Session architecture</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              A clean day has an order.
            </h2>
          </div>
          <div className="border-t border-white/10">
            {useCase.sessionBlueprint.map((item, index) => (
              <div key={item.step} className="grid gap-5 border-b border-white/10 py-7 sm:grid-cols-[70px_180px_1fr]">
                <p className="text-xs font-bold text-gray-600">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="text-lg font-black leading-tight text-white">{item.step}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">Producer prep</p>
          <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {useCase.plan.map((item, index) => (
              <div key={item.heading} className="grid gap-6 py-10 lg:grid-cols-[90px_0.82fr_1.18fr]">
                <p className="text-xs font-bold text-gray-600">{String(index + 1).padStart(2, '0')}</p>
                <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">{item.heading}</h2>
                <p className="text-base leading-relaxed text-gray-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">Bring before arrival.</h2>
            <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {useCase.preProduction.map((item) => (
                <li key={item} className="py-5 text-sm leading-relaxed text-gray-300">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">Protect against.</h2>
            <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {useCase.watchouts.map((item) => (
                <li key={item} className="py-5 text-sm leading-relaxed text-gray-400">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[0.74fr_1fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">Outputs</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              The session should leave with assets that can travel.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            {useCase.deliverables.map((item) => (
              <div key={item} className="border-t border-white/10 pt-5">
                <p className="text-sm leading-relaxed text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">Questions</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white">Before you book.</h2>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {useCase.faqs.map((faq) => (
              <div key={faq.question} className="py-7">
                <h3 className="text-lg font-bold text-white">{faq.question}</h3>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 border-t border-white/10 pt-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-600">Next move</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
              Book the setup with the clearest outcome.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={useCase.bookHref} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-gray-200">
              Book this setup
            </Link>
            <Link href="/tour/" className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-white/40">
              Tour first
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EditorialSeoHero } from '@/components/EditorialSeoHero'
import { breadcrumbSchema, faqSchema } from '@/lib/schemas'
import { absoluteUrl } from '@/lib/seo/site'
import { comparisonUrl, comparisons, getComparisonBySlug } from '@/lib/seo/comparisons'

const pageLabels: Record<string, string> = {
  '/green-screen-studio-sf/': 'Green Screen',
  '/canvas-rental/': 'Canvas Rental',
  '/podcast-studio-san-francisco/': 'Podcast Studios',
  '/photography-studio-san-francisco/': 'Photography Studio',
  '/book/': 'Custom booking',
}

export function generateStaticParams() {
  return comparisons.map((comparison) => ({ slug: comparison.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const comparison = getComparisonBySlug(slug)
  if (!comparison) return {}

  return {
    title: comparison.title,
    description: comparison.description,
    alternates: { canonical: comparisonUrl(comparison.slug) },
    openGraph: {
      title: `${comparison.title} | VibeShack Studios`,
      description: comparison.description,
      url: comparisonUrl(comparison.slug),
      images: [comparison.image],
    },
  }
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const comparison = getComparisonBySlug(slug)
  if (!comparison) notFound()

  const primaryLabel = pageLabels[comparison.primaryPage] ?? 'Primary option'
  const secondaryLabel = pageLabels[comparison.secondaryPage] ?? 'Alternative option'

  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Compare', url: absoluteUrl('/compare/') },
    { name: comparison.shortTitle, url: comparisonUrl(comparison.slug) },
  ])

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${comparisonUrl(comparison.slug)}#article`,
    headline: comparison.title,
    description: comparison.description,
    image: absoluteUrl(comparison.image),
    author: { '@id': 'https://www.vibeshackstudios.com/#org' },
    publisher: { '@id': 'https://www.vibeshackstudios.com/#org' },
    mainEntityOfPage: comparisonUrl(comparison.slug),
    datePublished: '2026-05-09',
    dateModified: '2026-05-09',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(comparison.faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />

      <EditorialSeoHero
        backHref="/compare/"
        backLabel="Comparisons"
        eyebrow={comparison.keyword}
        title={comparison.title}
        description={comparison.description}
        image={comparison.image}
        imageAlt={comparison.imageAlt}
        meta={[
          { label: 'Primary option', value: primaryLabel },
          { label: 'Alternative', value: secondaryLabel },
          { label: 'Decision type', value: comparison.shortTitle },
        ]}
      />

      <section className="bg-black px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[0.72fr_1fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">Recommendation</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-6xl">
              Make the room serve the edit.
            </h2>
          </div>
          <p className="self-end text-2xl font-black leading-tight text-white sm:text-4xl">
            {comparison.winner}
          </p>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">How to choose</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              The difference is usually operational, not cosmetic.
            </h2>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {comparison.sections.map((section, index) => (
              <div key={section.heading} className="grid gap-6 py-9 lg:grid-cols-[90px_0.82fr_1.18fr]">
                <p className="text-xs font-bold text-gray-600">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="text-3xl font-black leading-tight text-white">{section.heading}</h3>
                <p className="text-base leading-relaxed text-gray-400">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.72fr_1fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">Next step</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              Choose the option that removes the bigger production risk.
            </h2>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            <Link href={comparison.primaryPage} className="group grid gap-4 py-7 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-2xl font-black text-white transition-colors group-hover:text-brand-red">{primaryLabel}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{comparison.primaryReason}</p>
              </div>
              <span className="self-center text-sm font-bold text-gray-400 transition-colors group-hover:text-white">Open &rarr;</span>
            </Link>
            <Link href={comparison.secondaryPage} className="group grid gap-4 py-7 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-2xl font-black text-white transition-colors group-hover:text-brand-red">{secondaryLabel}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{comparison.secondaryReason}</p>
              </div>
              <span className="self-center text-sm font-bold text-gray-400 transition-colors group-hover:text-white">Open &rarr;</span>
            </Link>
            <Link href="/book/" prefetch={false} className="group grid gap-4 py-7 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-2xl font-black text-white transition-colors group-hover:text-brand-red">Book with the team</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">If the project needs a custom plan, start with the booking flow and include the production context.</p>
              </div>
              <span className="self-center text-sm font-bold text-gray-400 transition-colors group-hover:text-white">Book &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">Questions</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white">Before you decide.</h2>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {comparison.faqs.map((faq) => (
              <div key={faq.question} className="py-7">
                <h3 className="text-lg font-bold text-white">{faq.question}</h3>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

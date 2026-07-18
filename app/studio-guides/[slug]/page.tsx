import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EditorialSeoHero } from '@/components/EditorialSeoHero'
import { breadcrumbSchema, faqSchema } from '@/lib/schemas'
import { absoluteUrl, siteUrl } from '@/lib/seo/site'
import { getGuideBySlug, guideUrl, studioGuides } from '@/lib/seo/studioGuides'

export function generateStaticParams() {
  return studioGuides.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return {}

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: guideUrl(guide.slug) },
    openGraph: {
      title: `${guide.title} | VibeShack Studios`,
      description: guide.description,
      url: guideUrl(guide.slug),
      images: [guide.image],
    },
  }
}

export default async function StudioGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()

  const containHeroImage = ['photography-studio-prep', 'best-studio-for-your-shoot'].includes(guide.slug)

  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Studio Guides', url: absoluteUrl('/studio-guides/') },
    { name: guide.shortTitle, url: guideUrl(guide.slug) },
  ])

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${guideUrl(guide.slug)}#article`,
    headline: guide.title,
    description: guide.description,
    image: absoluteUrl(guide.image),
    author: { '@id': `${siteUrl}/#business` },
    publisher: { '@id': `${siteUrl}/#business` },
    mainEntityOfPage: guideUrl(guide.slug),
    datePublished: '2026-05-09',
    dateModified: '2026-05-09',
    about: guide.keyword,
    articleSection: 'Production planning',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(guide.faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />

      <EditorialSeoHero
        backHref="/studio-guides/"
        backLabel="Studio Guides"
        eyebrow={guide.keyword}
        title={guide.title}
        description={guide.description}
        image={guide.image}
        imageAlt={guide.imageAlt}
        imageFit={containHeroImage ? 'contain' : 'cover'}
        meta={[
          { label: 'First call', value: guide.sections[0].heading },
          { label: 'Bring first', value: guide.checklist[0] },
          { label: 'Watch for', value: guide.mistakes[0] },
        ]}
      />

      <section className="bg-black px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[0.74fr_1fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red">Producer read</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-6xl">
              Preparation is how the session stays expensive-looking.
            </h2>
          </div>
          <p className="self-end text-xl leading-relaxed text-gray-300">{guide.intro}</p>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red">Decision sequence</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              Decide in this order.
            </h2>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {guide.sections.map((section, index) => (
              <div key={section.heading} className="grid gap-6 py-9 lg:grid-cols-[90px_0.78fr_1.22fr]">
                <p className="text-xs font-bold text-gray-600">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="text-3xl font-black leading-tight text-white">{section.heading}</h3>
                <p className="text-base leading-relaxed text-gray-400">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Protect this</p>
            <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl">
              What a prepared session protects.
            </h2>
            <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {guide.producerNotes.map((item) => (
                <li key={item} className="py-5 text-sm leading-relaxed text-gray-300">{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Avoid this</p>
            <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl">
              The mistakes that make post harder.
            </h2>
            <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {guide.mistakes.map((item) => (
                <li key={item} className="py-5 text-sm leading-relaxed text-gray-400">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[0.72fr_1fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red">Bring list</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              Small decisions, cleaner footage.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            {guide.checklist.map((item, index) => (
              <div key={item} className="border-t border-white/10 pt-5">
                <p className="text-xs font-bold text-gray-600">{String(index + 1).padStart(2, '0')}</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red">Questions</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white">Before the booking.</h2>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {guide.faqs.map((faq) => (
              <div key={faq.question} className="py-7">
                <h3 className="text-lg font-bold text-white">{faq.question}</h3>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gray-600">Next move</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
              Choose the room with fewer unknowns.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={guide.primaryPage} className="rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              View matching studio
            </Link>
            <Link href="/book/" prefetch={false} className="rounded-lg border border-white/15 px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-white/40">
              Book a session
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

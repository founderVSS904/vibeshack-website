import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { breadcrumbSchema } from '@/lib/schemas'
import { comparisons } from '@/lib/seo/comparisons'
import { absoluteUrl } from '@/lib/seo/site'

const comparisonPrinciples = [
  'Choose green screen when the background will be rebuilt in post. Choose white cyc when the clean room is already the final look.',
  'Choose a podcast studio when audio, guest comfort, and repeatable camera angles matter more than improvising in an office.',
  'Choose studio photography when control matters. Choose location when the place itself is part of the story.',
]

export const metadata: Metadata = {
  title: 'Studio Comparisons',
  description: 'Practical VibeShack Studios comparisons for choosing green screen vs white cyc, podcast studio vs office recording, and studio vs location photography.',
  alternates: { canonical: absoluteUrl('/compare/') },
  openGraph: {
    title: 'Studio Comparisons | VibeShack Studios',
    description: 'Decision guides for booking the right San Francisco production studio.',
    url: absoluteUrl('/compare/'),
    images: ['/og-image.jpg'],
  },
}

export default function ComparePage() {
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Compare', url: absoluteUrl('/compare/') },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section className="border-b border-white/10 bg-black px-6 pb-20 pt-32 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">Compare studio options</p>
            <h1 className="mt-8 max-w-5xl text-5xl font-black leading-[0.94] text-white sm:text-6xl lg:text-7xl">
              Decide by what changes after the shoot.
            </h1>
          </div>
          <div className="max-w-2xl">
            <p className="text-lg leading-relaxed text-gray-300">
              Two rooms can both look professional and still solve very different problems. These comparisons make the tradeoff explicit: what gets easier on set, what gets harder in edit, and which option protects the final asset.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.72fr_1fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">Decision discipline</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              The right answer is the one that removes the biggest production risk.
            </h2>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {comparisonPrinciples.map((principle, index) => (
              <p key={principle} className="grid gap-5 py-7 text-base leading-relaxed text-gray-300 md:grid-cols-[80px_1fr]">
                <span className="text-sm font-bold text-gray-600">{String(index + 1).padStart(2, '0')}</span>
                <span>{principle}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-4xl">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">Comparison library</p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-6xl">
              The questions clients ask before they choose the wrong room.
            </h2>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {comparisons.map((comparison, index) => (
              <Link
                key={comparison.slug}
                href={`/compare/${comparison.slug}/`}
                className="group grid gap-8 py-10 lg:grid-cols-[92px_300px_1fr_160px]"
              >
                <p className="text-sm font-bold text-gray-600">{String(index + 1).padStart(2, '0')}</p>
                <div className="relative aspect-[16/11] overflow-hidden rounded-md bg-black lg:aspect-[4/3]">
                  <Image
                    src={comparison.image}
                    alt={comparison.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 300px, 100vw"
                    className="object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500">{comparison.keyword}</p>
                  <h3 className="mt-4 text-3xl font-black leading-tight text-white transition-colors group-hover:text-brand-red sm:text-4xl">
                    {comparison.shortTitle}
                  </h3>
                  <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-400">{comparison.description}</p>
                  <p className="mt-6 max-w-3xl text-lg font-black leading-tight text-white">{comparison.winner}</p>
                </div>
                <div className="flex items-end lg:justify-end">
                  <span className="text-sm font-bold text-white transition-colors group-hover:text-brand-red">
                    Compare &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

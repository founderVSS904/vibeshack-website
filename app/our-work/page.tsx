import type { Metadata } from 'next'
import Link from 'next/link'
import WorkCardMedia from '@/components/WorkCardMedia'
import { OurWorkShowreel } from '@/components/our-work/OurWorkShowreel'
import { absoluteUrl } from '@/lib/seo/site'
import { allWorkProjects, featuredWorkProject, shotAtVibeshack, workCategories, type WorkCategorySlug } from '@/lib/seo/workProjects'
import { breadcrumbSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Our Work',
  description:
    'Music videos, series, sports films, and event coverage produced with VibeShack Studios in San Francisco, plus client shows shot in our rooms.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/our-work/' },
  openGraph: {
    title: 'Our Work | VibeShack Studios SF',
    description:
      'Music videos, series, sports films, and event coverage produced with VibeShack Studios in San Francisco.',
    url: 'https://www.vibeshackstudios.com/our-work/',
    images: ['/studio-images/work-body-is-tea-music-v20260708b.jpg'],
  },
}

const breadcrumbs = breadcrumbSchema([
  { name: 'VibeShack Studios', url: absoluteUrl('/') },
  { name: 'Our Work', url: absoluteUrl('/our-work/') },
])

const normalizeCategory = (category?: string | string[]): WorkCategorySlug => {
  const value = Array.isArray(category) ? category[0] : category
  return workCategories.some((item) => item.slug === value) ? (value as WorkCategorySlug) : 'all'
}

export default async function OurWorkPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string | string[] }>
}) {
  const params = await searchParams
  const activeCategory = normalizeCategory(params?.category)
  const visibleProjects = activeCategory === 'all'
    ? allWorkProjects
    : allWorkProjects.filter((project) => project.category === activeCategory)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section className="relative h-[540px] overflow-hidden border-b border-white/10 bg-black pt-20 text-white">
        <div className="absolute inset-x-0 bottom-0 top-20 opacity-95">
          <OurWorkShowreel
            src="/studio-videos/our-work-showreel-v20260714.mp4"
            poster={featuredWorkProject.image}
            posterAlt={featuredWorkProject.alt}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,0.92)_23%,rgba(0,0,0,0.34)_48%,rgba(0,0,0,0)_72%),linear-gradient(180deg,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0)_60%,rgba(0,0,0,0.42)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-[1680px] items-center px-6 sm:px-10 lg:px-16">
          <div className="max-w-[520px] pb-4">
            <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">Showreel 2026</p>
            <h1 className="font-black uppercase leading-[0.92] text-white" style={{ fontSize: 'clamp(4.5rem, 7.6vw, 7.45rem)', letterSpacing: 0 }}>
              Our<br />Work
            </h1>
            <Link href="#work-projects" className="group mt-8 inline-flex flex-col gap-4 text-base text-white">
              <span className="inline-flex items-center gap-7">
                Explore projects
                <span className="transition-transform group-hover:translate-y-1">↓</span>
              </span>
              <span className="h-0.5 w-full origin-left scale-x-[0.08] bg-brand-red transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          </div>
        </div>
      </section>

      <main className="bg-black pb-16 text-white">
        <div className="mx-auto max-w-[1680px] px-6 sm:px-10 lg:px-16">
          <nav className="flex justify-center gap-8 overflow-x-auto py-5 sm:gap-12" aria-label="Work categories">
            {workCategories.map(({ slug, label }) => {
              const isActive = slug === activeCategory
              const href = slug === 'all' ? '/our-work/' : `/our-work/?category=${slug}`

              return (
                <Link
                  key={slug}
                  href={href}
                  className={`relative shrink-0 py-2 text-base transition-colors ${
                    isActive ? 'text-brand-red' : 'text-white/[0.86] hover:text-white'
                  }`}
                >
                  {label}
                  {isActive && <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-brand-red" />}
                </Link>
              )
            })}
          </nav>

          <div id="work-projects" className="grid scroll-mt-24 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map(({ slug, title, categoryLabel, client, image, alt, objectPosition, hoverClip }) => (
              <Link key={slug} href={`/our-work/${slug}/`} className="group block">
                <figure className="relative h-[206px] overflow-hidden rounded-md border border-white/10 bg-zinc-950">
                  <WorkCardMedia
                    image={image}
                    alt={alt}
                    clip={hoverClip}
                    objectPosition={objectPosition}
                    imageClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                    sizes="(min-width: 1280px) 32vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/12 to-transparent" />
                  <figcaption className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-base font-medium leading-tight text-white">{title}</p>
                      <p className="mt-0.5 text-sm text-white/70">
                        {categoryLabel} · {client}
                      </p>
                    </div>
                    <span className="hidden items-center gap-4 text-sm text-white transition-colors group-hover:text-brand-red sm:inline-flex">
                      View project
                      <span aria-hidden="true">→</span>
                    </span>
                  </figcaption>
                </figure>
              </Link>
            ))}
          </div>

          <section className="mt-24 border-t border-white/10 pt-14" aria-labelledby="shot-at-vibeshack-title">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red">
                  Shot at VibeShack
                </p>
                <h2 id="shot-at-vibeshack-title" className="mt-3 text-2xl font-black leading-tight text-white sm:text-3xl">
                  Client projects shot here
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-white/60">
                Podcasts, talks, and sessions recorded at the studio. Each one opens on YouTube.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
              {shotAtVibeshack.map(({ title, detail, youtubeId, image, alt, objectPosition, hoverClip }) => (
                <a
                  key={youtubeId}
                  href={`https://www.youtube.com/watch?v=${youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <figure className="relative h-[150px] overflow-hidden rounded-md border border-white/10 bg-zinc-950">
                    <WorkCardMedia
                      image={image}
                      alt={alt}
                      clip={hoverClip}
                      objectPosition={objectPosition}
                      imageClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                      sizes="(min-width: 1280px) 19vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                    <figcaption className="absolute inset-x-3 bottom-3">
                      <p className="text-sm font-semibold leading-tight text-white">{title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-white/60">{detail}</p>
                    </figcaption>
                  </figure>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

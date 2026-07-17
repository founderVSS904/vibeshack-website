import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { absoluteUrl, siteUrl } from '@/lib/seo/site'
import { allWorkProjects, getWorkProject, workProjects } from '@/lib/seo/workProjects'
import { breadcrumbSchema } from '@/lib/schemas'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return allWorkProjects.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getWorkProject(slug)

  if (!project) {
    return {
      title: 'Project Not Found',
    }
  }

  return {
    title: `${project.title} | Our Work`,
    description: project.summary,
    alternates: {
      canonical: `${siteUrl}/our-work/${project.slug}/`,
    },
    openGraph: {
      title: `${project.title} | VibeShack Studios`,
      description: project.summary,
      url: `${siteUrl}/our-work/${project.slug}/`,
      images: [project.image],
    },
  }
}

export default async function WorkProjectPage({ params }: PageProps) {
  const { slug } = await params
  const project = getWorkProject(slug)

  if (!project) {
    notFound()
  }

  const relatedProjects = allWorkProjects.filter((item) => item.slug !== project.slug).slice(0, 3)
  const watchUrl = project.youtubeId ? `https://www.youtube.com/watch?v=${project.youtubeId}` : null
  const breadcrumbs = breadcrumbSchema([
    { name: 'VibeShack Studios', url: absoluteUrl('/') },
    { name: 'Our Work', url: absoluteUrl('/our-work/') },
    { name: project.title, url: absoluteUrl(`/our-work/${project.slug}/`) },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section className="bg-black pt-20 text-white">
        <div className="mx-auto max-w-[1680px] px-6 pb-12 pt-7 sm:px-10 lg:px-16">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-5 sm:items-center">
            <Link href="/our-work/" className="text-sm font-semibold text-white/[0.48] transition-colors hover:text-white">
              Back to Our Work
            </Link>
            <p className="w-full text-left text-xs font-bold uppercase tracking-[0.16em] text-white/35 sm:w-auto sm:text-right">
              {project.categoryLabel} / {project.year}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(280px,0.34fr)_minmax(0,0.66fr)] lg:items-center">
            <div className="order-2 lg:order-1">
              <p className="mb-5 text-xs font-black uppercase tracking-[0.16em] text-brand-red">{project.client}</p>
              <h1 className="max-w-lg text-3xl font-black uppercase leading-[0.94] text-white sm:text-4xl lg:text-5xl">
                {project.title}
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-white/58">
                {project.summary}
              </p>
              <ul className="mt-6 space-y-2">
                {project.credits.map((credit) => (
                  <li key={credit} className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                    {credit}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {watchUrl && (
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                      <path d="M2 1.5v9l8-4.5-8-4.5z" />
                    </svg>
                    Watch on YouTube
                  </a>
                )}
                <Link href={project.serviceHref} className="text-sm font-semibold text-white/[0.48] transition-colors hover:text-white">
                  Start a similar project
                </Link>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
                <div className="relative aspect-video">
                  {project.video ? (
                    // Films without a YouTube home play straight from the site.
                    <video
                      src={project.video}
                      poster={project.poster ?? project.image}
                      controls
                      playsInline
                      preload="metadata"
                      aria-label={`${project.title} by ${project.client}`}
                      className="absolute inset-0 h-full w-full bg-black"
                    >
                      Your browser cannot play this video.
                    </video>
                  ) : (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${project.youtubeId}`}
                      title={`${project.title} by ${project.client}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      loading="lazy"
                      className="absolute inset-0 h-full w-full"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-black text-white">
        <section className="border-y border-white/10">
          <div className="mx-auto grid max-w-[1680px] grid-cols-1 divide-y divide-white/10 px-6 sm:px-10 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-16">
            {[
              ['Client', project.client],
              ['Format', project.categoryLabel],
              ['Year', project.year],
            ].map(([label, value]) => (
              <div key={label} className="py-5 md:px-8 md:first:pl-0 md:last:pr-0">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</p>
                <p className="text-xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-white/10 py-20 sm:py-24">
          <div className="mx-auto max-w-[1680px] px-6 sm:px-10 lg:px-16">
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="number-label mb-5">Related</p>
                <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
                  More work
                </h2>
              </div>
              <Link href="/our-work/" className="text-sm font-semibold text-white/50 transition-colors hover:text-white">
                View all projects
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {relatedProjects.map((item) => (
                <Link key={item.slug} href={`/our-work/${item.slug}/`} className="group block">
                  <figure className="relative h-64 overflow-hidden rounded-md border border-white/10 bg-zinc-950">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                      style={{ objectPosition: item.objectPosition || 'center' }}
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/12 to-transparent" />
                    <figcaption className="absolute inset-x-4 bottom-4">
                      <p className="text-base font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-white/62">{item.categoryLabel} · {item.client}</p>
                    </figcaption>
                  </figure>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 text-center">
          <div className="mx-auto max-w-3xl px-6">
            <p className="number-label mb-6">Ready</p>
            <h2 className="text-3xl font-black leading-tight text-white sm:text-5xl">
              Make the next one with us.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/50">
              Tell us what you are launching, documenting, recording, or selling. We will route the project to the right production path.
            </p>
            <Link href={project.serviceHref} className="mt-9 inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              Start a similar project
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}

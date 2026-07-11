'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export type SelectedFilm = {
  slug: string
  title: string
  categoryLabel: string
  client: string
  image: string
  alt: string
  objectPosition?: string
  youtubeId: string
  summary: string
}

type SelectedFilmGalleryProps = {
  films: SelectedFilm[]
}

export default function SelectedFilmGallery({ films }: SelectedFilmGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeFilm = films[activeIndex]

  if (!activeFilm) return null

  return (
    <div className="grid overflow-hidden rounded-lg border border-white/10 bg-zinc-950 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div
        id="selected-film-player"
        role="tabpanel"
        aria-labelledby={`selected-film-tab-${activeFilm.slug}`}
        className="relative aspect-video bg-black"
      >
        <iframe
          key={activeFilm.youtubeId}
          src={`https://www.youtube-nocookie.com/embed/${activeFilm.youtubeId}?rel=0`}
          title={`${activeFilm.title} by ${activeFilm.client}`}
          className="absolute inset-0 h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      <div className="flex min-w-0 overflow-x-auto border-t border-white/10 lg:flex lg:flex-col lg:overflow-visible lg:border-l lg:border-t-0" role="tablist" aria-label="Selected films">
        {films.map((film, index) => (
          <button
            key={film.slug}
            id={`selected-film-tab-${film.slug}`}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-controls="selected-film-player"
            onClick={() => setActiveIndex(index)}
            className="selected-film-tab flex w-[260px] shrink-0 gap-4 border-r border-white/10 p-4 text-left transition-colors last:border-r-0 hover:bg-white/[0.04] lg:w-full lg:flex-1 lg:border-b lg:border-r-0 lg:last:border-b-0"
          >
            <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded bg-black">
              <Image
                src={film.image}
                alt=""
                fill
                aria-hidden="true"
                quality={72}
                className="object-cover"
                style={{ objectPosition: film.objectPosition || 'center' }}
                sizes="96px"
              />
            </span>
            <span className="min-w-0 self-center">
              <span className="block text-[11px] font-semibold text-brand-red">{film.categoryLabel}</span>
              <span className="mt-1 block text-base font-semibold leading-tight text-white">{film.title}</span>
              <span className="mt-1 block truncate text-xs text-white/40">{film.client}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="border-t border-white/10 p-6 sm:p-8 lg:col-span-2 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
        <div>
          <p className="text-xs font-semibold text-brand-red">{activeFilm.categoryLabel} / {activeFilm.client}</p>
          <h3 className="brand-sans mt-3 text-3xl font-semibold text-white sm:text-4xl">{activeFilm.title}</h3>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/55 sm:text-base">{activeFilm.summary}</p>
        </div>
        <Link href={`/our-work/${activeFilm.slug}/`} className="mt-6 inline-flex text-sm font-semibold text-white/60 transition-colors hover:text-white lg:mt-0">
          View film details <span className="ml-2" aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </div>
  )
}

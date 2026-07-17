'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, type KeyboardEvent } from 'react'

export type PodcastSet = {
  id: string
  name: string
  fullName: string
  href: string
  bookHref: string
  img: string
  thumb: string
  series: string
  line: string
  bestFor: string
  price: string
  specs: string[]
  position: string
}

type PodcastSetSelectorProps = {
  sets: PodcastSet[]
}

export default function PodcastSetSelector({ sets }: PodcastSetSelectorProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [imageReady, setImageReady] = useState(true)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const activeSet = sets[activeIndex]

  const selectSet = (index: number, moveFocus = false) => {
    if (index === activeIndex) return

    setPreviousIndex(activeIndex)
    setImageReady(false)
    setActiveIndex(index)

    if (moveFocus) {
      window.requestAnimationFrame(() => {
        tabRefs.current[index]?.focus()
        tabRefs.current[index]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      })
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex = activeIndex

    if (event.key === 'ArrowRight') nextIndex = (activeIndex + 1) % sets.length
    if (event.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + sets.length) % sets.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = sets.length - 1
    if (nextIndex === activeIndex) return

    event.preventDefault()
    selectSet(nextIndex, true)
  }

  if (!activeSet) return null

  return (
    <div className="mt-12 sm:mt-16">
      <div
        id="podcast-set-panel"
        role="tabpanel"
        aria-labelledby={`podcast-set-tab-${activeSet.id}`}
      >
        <div className="podcast-set-stage relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-950 sm:aspect-[16/10] lg:aspect-[2/1]">
          {previousIndex !== null && sets[previousIndex] && (
            <Image
              src={sets[previousIndex].img}
              alt=""
              fill
              aria-hidden="true"
              priority={previousIndex === 0}
              quality={85}
              className="podcast-set-stage-previous object-cover"
              sizes="(min-width: 1536px) 1420px, (min-width: 1024px) calc(100vw - 128px), (min-width: 640px) calc(100vw - 80px), calc(100vw - 48px)"
              style={{ objectPosition: sets[previousIndex].position }}
            />
          )}
          <Image
            key={activeSet.id}
            src={activeSet.img}
            alt={`${activeSet.fullName} podcast set at VibeShack Studios`}
            fill
            priority={activeIndex === 0}
            quality={90}
            onLoad={() => setImageReady(true)}
            onTransitionEnd={() => {
              if (imageReady) setPreviousIndex(null)
            }}
            className={`podcast-set-stage-image object-cover ${imageReady ? 'is-ready' : ''}`}
            sizes="(min-width: 1536px) 1420px, (min-width: 1024px) calc(100vw - 128px), (min-width: 640px) calc(100vw - 80px), calc(100vw - 48px)"
            style={{ objectPosition: activeSet.position }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_45%,rgba(0,0,0,0.62)_100%)]" />
          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-6 sm:inset-x-8 sm:bottom-7">
            <p className="text-xs font-semibold text-white/75">{activeSet.series}</p>
            <p className="text-xs font-semibold tabular-nums text-white/75">
              {String(activeIndex + 1).padStart(2, '0')} / {String(sets.length).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Choose a podcast set"
          className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] lg:grid lg:grid-cols-7 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {sets.map((set, index) => (
            <button
              key={set.id}
              ref={(element) => { tabRefs.current[index] = element }}
              id={`podcast-set-tab-${set.id}`}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-controls="podcast-set-panel"
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => selectSet(index)}
              onKeyDown={handleKeyDown}
              className="podcast-set-choice group relative h-[96px] w-[156px] shrink-0 snap-start overflow-hidden rounded-md border border-white/10 bg-zinc-950 text-left sm:h-[112px] sm:w-[188px] lg:w-auto"
            >
              <Image
                src={set.thumb}
                alt=""
                fill
                aria-hidden="true"
                loading={index < 4 ? 'eager' : 'lazy'}
                quality={72}
                className="object-cover opacity-65 transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.025] group-hover:opacity-90"
                sizes="188px"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
              <span className="absolute inset-x-3 bottom-3 text-sm font-semibold text-white">{set.name}</span>
            </button>
          ))}
        </div>

        <div key={activeSet.id} className="podcast-set-copy-swap grid gap-10 border-b border-white/10 py-10 sm:py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end lg:gap-16">
          <div>
            <p className="text-sm font-semibold text-brand-red">{activeSet.price}</p>
            <h3 className="mt-4 text-5xl font-black leading-[0.92] text-white sm:text-7xl">
              {activeSet.fullName}
            </h3>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/65 sm:text-xl">
              {activeSet.line}
            </p>
          </div>

          <div>
            <div className="border-y border-white/10 py-5">
              <p className="text-xs font-semibold text-white/40">Best for</p>
              <p className="mt-2 text-base leading-relaxed text-white/85">{activeSet.bestFor}</p>
            </div>
            <ul className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:grid-cols-1 lg:divide-x-0 lg:divide-y">
              {activeSet.specs.map((spec) => (
                <li key={spec} className="py-3 text-sm text-white/55 sm:px-3 sm:first:pl-0 lg:px-0">
                  {spec}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Link
                href={activeSet.bookHref}
                prefetch={false}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-bold text-black transition-colors hover:bg-zinc-200"
              >
                Book this set
              </Link>
              <Link href={activeSet.href} className="text-sm font-semibold text-white/60 transition-colors hover:text-white">
                View set details <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

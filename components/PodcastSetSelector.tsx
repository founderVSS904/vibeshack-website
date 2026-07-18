'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState, type KeyboardEvent } from 'react'

export type PodcastSetCategory = 'podcast' | 'signature' | 'rental'

export type PodcastSet = {
  id: string
  name: string
  fullName: string
  href: string
  bookHref: string
  img: string
  thumb: string
  series: string
  category: PodcastSetCategory
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
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [imageReady, setImageReady] = useState(true)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const tablistRef = useRef<HTMLDivElement | null>(null)

  const activeSet = sets[activeIndex]

  const selectSet = (index: number, moveFocus = false) => {
    if (index === activeIndex || !sets[index]) return

    setPreviousIndex(activeIndex)
    setImageReady(false)
    setActiveIndex(index)

    window.requestAnimationFrame(() => {
      const selectedTab = tabRefs.current[index]
      const tablist = tablistRef.current

      if (moveFocus) selectedTab?.focus({ preventScroll: true })
      if (!selectedTab || !tablist) return

      tablist.scrollTo({
        behavior: 'smooth',
        left: selectedTab.offsetLeft - ((tablist.clientWidth - selectedTab.clientWidth) / 2),
      })
    })
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

  const highlights = activeSet.category === 'rental'
    ? activeSet.specs.slice(0, 3)
    : ['3-camera 4K', 'Broadcast audio', 'Open 24/7']

  return (
    <section id="sets" className="scroll-mt-20 bg-black pt-20 text-white" aria-label="Explore VibeShack studio sets">
      <div className="mx-auto max-w-[1680px] px-4 pb-8 pt-5 sm:px-6 sm:pb-10 sm:pt-7 lg:px-10 lg:pb-12">
        <div
          id="podcast-set-panel"
          role="tabpanel"
          aria-labelledby={`podcast-set-tab-${activeSet.id}`}
          className="relative h-[calc(100svh-8.75rem)] min-h-[560px] max-h-[720px] overflow-hidden rounded-2xl bg-zinc-950"
        >
          {previousIndex !== null && sets[previousIndex] && (
            <Image
              src={sets[previousIndex].img}
              alt=""
              fill
              aria-hidden="true"
              priority={previousIndex === 0}
              quality={85}
              className="podcast-set-stage-previous object-cover"
              sizes="(min-width: 1680px) 1600px, calc(100vw - 32px)"
              style={{ objectPosition: sets[previousIndex].position }}
            />
          )}
          <Image
            key={`${activeSet.id}-image`}
            src={activeSet.img}
            alt={`${activeSet.fullName} at VibeShack Studios`}
            fill
            priority={activeIndex === 0}
            quality={90}
            onLoad={() => setImageReady(true)}
            onTransitionEnd={() => {
              if (imageReady) setPreviousIndex(null)
            }}
            className={`podcast-set-stage-image object-cover ${imageReady ? 'is-ready' : ''}`}
            sizes="(min-width: 1680px) 1600px, calc(100vw - 32px)"
            style={{ objectPosition: activeSet.position }}
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.74)_0%,rgba(0,0,0,0.18)_62%,rgba(0,0,0,0.08)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0.02)_38%,rgba(0,0,0,0.88)_100%)]" />

          <div className="absolute inset-x-5 top-6 flex items-start justify-between gap-6 sm:inset-x-10 sm:top-9 lg:inset-x-12">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">VibeShack / San Francisco</p>
              <h1 className="mt-2 text-xl font-semibold leading-tight text-white sm:text-2xl">Podcast studios</h1>
            </div>
            <p className="shrink-0 whitespace-nowrap font-mono text-[10px] font-bold tabular-nums tracking-[0.16em] text-white/60">
              {String(activeIndex + 1).padStart(2, '0')} / {String(sets.length).padStart(2, '0')}
            </p>
          </div>

          <div key={`${activeSet.id}-copy`} className="podcast-set-copy-swap absolute inset-x-5 bottom-10 sm:inset-x-10 sm:bottom-10 lg:inset-x-12 lg:bottom-12">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">{activeSet.series}</p>
            <h2 className="mt-3 max-w-4xl text-4xl font-black uppercase leading-[0.9] text-white sm:text-6xl lg:text-7xl">
              {activeSet.fullName}
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-6 text-white/70 sm:mt-6 sm:text-lg sm:leading-7">{activeSet.line}</p>

            <ul className="mt-7 hidden flex-wrap gap-x-7 gap-y-2 sm:flex" aria-label="Studio highlights">
              {highlights.map((highlight) => (
                <li key={highlight} className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">
                  {highlight}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-4 sm:mt-8 sm:gap-x-7 sm:gap-y-5">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-brand-red sm:text-sm">
                {activeSet.price.replace('/hr', '')} <span className="text-white/45">/ hour</span>
              </p>
              <Link
                href={activeSet.bookHref}
                prefetch={false}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-red px-5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-red-700 sm:min-h-12 sm:px-6 sm:text-[10px] sm:tracking-[0.15em]"
              >
                Book this studio
              </Link>
              <Link
                href={activeSet.href}
                className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/70 transition-colors hover:text-white sm:inline-flex"
              >
                View studio <span className="ml-2" aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 min-w-0">
          <div className="mb-3 flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white">Choose a set</p>
              <p className="mt-1 text-xs text-white/35">Nine spaces, one address</p>
            </div>
            <Link
              href="/find-your-studio/"
              className="shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/45 transition-colors hover:text-white sm:text-[10px]"
            >
              Help me choose <span className="ml-1" aria-hidden="true">→</span>
            </Link>
          </div>
          <div
            ref={tablistRef}
            role="tablist"
            aria-label="Choose a studio"
            className="flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                onDoubleClick={() => router.push(set.href)}
                onKeyDown={handleKeyDown}
                title={`Double-click to view ${set.name}`}
                className="podcast-set-choice group min-w-[154px] snap-start text-left sm:min-w-[176px]"
              >
                <span className={`relative block aspect-[16/9] overflow-hidden rounded-lg border transition-colors ${
                  index === activeIndex ? 'border-white/25' : 'border-white/10 group-hover:border-white/30'
                }`}>
                  <Image
                    src={set.thumb}
                    alt=""
                    fill
                    aria-hidden="true"
                    loading="lazy"
                    quality={85}
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                    sizes="176px"
                    style={{ objectPosition: set.position }}
                  />
                  <span className={`absolute inset-0 transition-colors ${index === activeIndex ? 'bg-black/5' : 'bg-black/20 group-hover:bg-black/5'}`} />
                  <span className="absolute left-2.5 top-2.5 rounded bg-black/60 px-1.5 py-1 font-mono text-[8px] font-bold tabular-nums tracking-[0.14em] text-white/70 backdrop-blur-sm">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </span>
                <span className="mt-3 flex items-baseline justify-between gap-3 px-0.5">
                  <span className={`min-w-0 truncate text-sm font-semibold transition-colors ${index === activeIndex ? 'text-white' : 'text-white/55 group-hover:text-white/80'}`}>
                    {set.name}
                  </span>
                  <span className="shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-brand-red">
                    {set.price}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

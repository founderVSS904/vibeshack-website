'use client'

import Image from 'next/image'
import Link from 'next/link'
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

type SpecIconName = 'camera' | 'users' | 'waveform' | 'headphones' | 'frame' | 'light'

const categories: Array<{
  id: PodcastSetCategory
  number: string
  label: string
}> = [
  { id: 'podcast', number: '01', label: 'Podcast sets' },
  { id: 'signature', number: '02', label: 'Signature & custom' },
  { id: 'rental', number: '03', label: 'Rental studios' },
]

const podcastFacts: Array<{ icon: SpecIconName; label: string }> = [
  { icon: 'camera', label: '3-camera 4K' },
  { icon: 'users', label: 'Broadcast audio' },
  { icon: 'waveform', label: 'Live switching' },
  { icon: 'headphones', label: 'Engineer available' },
]

const rentalFactIcons: SpecIconName[] = ['frame', 'users', 'light', 'headphones']

export default function PodcastSetSelector({ sets }: PodcastSetSelectorProps) {
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

  const selectCategory = (category: PodcastSetCategory) => {
    const nextIndex = sets.findIndex((set) => set.category === category)
    if (nextIndex >= 0) selectSet(nextIndex)
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

  const stepSet = (direction: -1 | 1) => {
    const nextIndex = (activeIndex + direction + sets.length) % sets.length
    selectSet(nextIndex)
  }

  if (!activeSet) return null

  const activeFacts = activeSet.category === 'rental'
    ? activeSet.specs.slice(0, 4).map((label, index) => ({
        icon: rentalFactIcons[index] ?? 'frame',
        label,
      }))
    : podcastFacts

  return (
    <section id="sets" className="scroll-mt-20 bg-black pt-20 text-white" aria-label="Explore VibeShack studio sets">
      <div className="grid min-h-[calc(100svh-12.75rem)] grid-cols-1 border-b border-white/10 xl:grid-cols-[250px_minmax(0,1fr)_320px] xl:grid-rows-[minmax(450px,1fr)_174px]">
        <aside className="flex min-w-0 flex-col border-b border-white/10 bg-[#080808] px-4 py-4 sm:px-6 xl:col-start-1 xl:row-start-1 xl:border-b-0 xl:border-r xl:px-7 xl:py-6">
          <nav aria-label="Studio categories" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] xl:flex-col xl:gap-0 xl:overflow-visible [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => {
              const selected = activeSet.category === category.id

              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectCategory(category.id)}
                  className={`min-w-[138px] border-l-2 px-4 py-3 text-left transition-colors duration-300 sm:min-w-[154px] xl:min-w-0 xl:py-4 ${
                    selected
                      ? 'border-brand-red bg-white/[0.035] text-white'
                      : 'border-white/10 text-white/45 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <span className={`block font-mono text-[11px] font-bold tracking-[0.16em] ${selected ? 'text-brand-red' : 'text-white/35'}`}>
                    {category.number}
                  </span>
                  <span className="mt-2 block font-mono text-[11px] font-bold uppercase tracking-[0.12em] sm:text-[12px]">
                    {category.label}
                  </span>
                </button>
              )
            })}

            <Link
              href="/find-your-studio/"
              className="min-w-[138px] border-l-2 border-white/10 px-4 py-3 text-left text-white/45 transition-colors duration-300 hover:border-white/30 hover:text-white sm:min-w-[154px] xl:min-w-0 xl:py-4"
            >
              <span className="block font-mono text-[11px] font-bold tracking-[0.16em] text-white/35">04</span>
              <span className="mt-2 block font-mono text-[11px] font-bold uppercase tracking-[0.12em] sm:text-[12px]">Find a studio</span>
            </Link>
          </nav>

          <Link
            href="/book/?service=podcast"
            prefetch={false}
            className="mt-auto hidden items-center gap-4 border-t border-white/10 pt-5 text-white/60 transition-colors hover:text-white xl:flex"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/15" aria-hidden="true">
              <CalendarIcon />
            </span>
            <span>
              <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.14em]">Book a session</span>
              <span className="mt-1 block text-xs text-white/35">Live availability and checkout</span>
            </span>
          </Link>
        </aside>

        <div
          id="podcast-set-panel"
          role="tabpanel"
          aria-labelledby={`podcast-set-tab-${activeSet.id}`}
          className="relative min-h-[580px] overflow-hidden border-b border-white/10 bg-zinc-950 sm:min-h-[640px] xl:col-start-2 xl:row-start-1 xl:min-h-0"
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
              sizes="(min-width: 1280px) calc(100vw - 570px), 100vw"
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
            sizes="(min-width: 1280px) calc(100vw - 570px), 100vw"
            style={{ objectPosition: activeSet.position }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.02)_36%,rgba(0,0,0,0.84)_100%)]" />

          <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-5 sm:inset-x-8 sm:top-7">
            <div>
              <h1 className="text-xl font-semibold text-white sm:text-2xl">Podcast studios</h1>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">San Francisco / Open 24/7</p>
            </div>
            <p className="font-mono text-[10px] font-bold tabular-nums tracking-[0.16em] text-white/60">
              {String(activeIndex + 1).padStart(2, '0')} / {String(sets.length).padStart(2, '0')}
            </p>
          </div>

          <div key={`${activeSet.id}-copy`} className="podcast-set-copy-swap absolute inset-x-5 bottom-6 sm:inset-x-8 sm:bottom-8 lg:inset-x-10 lg:bottom-9">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">{activeSet.series}</p>
            <h2 className="mt-3 max-w-4xl text-4xl font-black uppercase leading-[0.9] text-white sm:text-6xl lg:text-7xl">
              {activeSet.fullName}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base lg:text-lg">{activeSet.line}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4">
              <p className="font-mono text-base font-bold uppercase tracking-[0.12em] text-brand-red sm:text-lg">
                {activeSet.price.replace('/hr', '')} <span className="text-white/55">/ hour</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={activeSet.href}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/35 px-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white hover:text-black"
                >
                  Explore set
                </Link>
                <Link
                  href={activeSet.bookHref}
                  prefetch={false}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-red px-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-red-700"
                >
                  Book this studio
                </Link>
              </div>
            </div>
          </div>
        </div>

        <aside className="flex items-center border-b border-white/10 bg-[#080808] p-4 sm:p-6 xl:col-start-3 xl:row-start-1 xl:border-b-0 xl:border-l xl:px-6">
          <div className="grid w-full grid-cols-2 overflow-hidden rounded-lg border border-white/15 xl:grid-cols-1">
            {activeFacts.map((fact, index) => (
              <div
                key={`${activeSet.id}-${fact.label}`}
                className={`flex min-h-[74px] items-center gap-3 border-b border-white/10 px-4 py-4 xl:min-h-[78px] ${index % 2 === 0 ? 'border-r xl:border-r-0' : ''}`}
              >
                <span className="text-white/55" aria-hidden="true"><SpecIcon name={fact.icon} /></span>
                <span className="font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.12em] text-white/70">{fact.label}</span>
              </div>
            ))}
            <div className="col-span-2 flex min-h-[78px] items-center gap-3 px-4 py-4 xl:col-span-1">
              <span className="text-white/55" aria-hidden="true"><LocationIcon /></span>
              <span>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">950 Battery St</span>
                <span className="mt-1 block text-xs text-white/40">San Francisco, CA</span>
              </span>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 items-center gap-3 bg-[#050505] px-3 py-4 sm:gap-4 sm:px-5 xl:col-span-3 xl:row-start-2">
          <button
            type="button"
            onClick={() => stepSet(-1)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
            aria-label="Previous studio"
            title="Previous studio"
          >
            <ArrowIcon direction="left" />
          </button>

          <div
            ref={tablistRef}
            role="tablist"
            aria-label="Choose a studio"
            className="flex min-w-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                className="podcast-set-choice group grid h-[142px] w-[158px] shrink-0 snap-start grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-white/10 bg-zinc-950 text-left sm:w-[174px] xl:w-[170px]"
              >
                <span className="relative block min-h-0 overflow-hidden">
                  <Image
                    src={set.thumb}
                    alt=""
                    fill
                    aria-hidden="true"
                    loading={index < 5 ? 'eager' : 'lazy'}
                    quality={80}
                    className="object-cover opacity-70 transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.025] group-hover:opacity-100"
                    sizes="180px"
                    style={{ objectPosition: set.position }}
                  />
                </span>
                <span className="block border-t border-white/10 px-3 py-2.5">
                  <span className="block truncate font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white">{set.name}</span>
                  <span className="mt-1 block font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-brand-red">
                    {set.price.replace('/hr', '')} <span className="text-white/40">/ hour</span>
                  </span>
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => stepSet(1)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
            aria-label="Next studio"
            title="Next studio"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>
    </section>
  )
}

function SpecIcon({ name }: { name: SpecIconName }) {
  if (name === 'camera') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 7H5.8A2.8 2.8 0 0 0 3 9.8v4.4A2.8 2.8 0 0 0 5.8 17h8.7a2.5 2.5 0 0 0 2.5-2.5v-5A2.5 2.5 0 0 0 14.5 7Z" />
        <path d="m17 10 4-2v8l-4-2" />
        <circle cx="10" cy="12" r="2.6" />
      </svg>
    )
  }

  if (name === 'users') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 18a5.5 5.5 0 0 1 11 0M15 6.5a2.7 2.7 0 0 1 0 5.2M16 14a4.5 4.5 0 0 1 4.5 4" />
      </svg>
    )
  }

  if (name === 'waveform') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M3 12h2M7 8v8M10 5v14M13 8v8M16 4v16M19 9v6M22 12h-1" />
      </svg>
    )
  }

  if (name === 'headphones') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
        <path d="M4 13h3v6H5.5A1.5 1.5 0 0 1 4 17.5V13ZM20 13h-3v6h1.5a1.5 1.5 0 0 0 1.5-1.5V13Z" />
      </svg>
    )
  }

  if (name === 'light') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="10" r="4" />
        <path d="M12 2v2M12 16v2M4 10H2M22 10h-2M5.7 3.7 7 5M17 15l1.3 1.3M18.3 3.7 17 5M7 15l-1.3 1.3M9 22h6" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {direction === 'left' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  )
}

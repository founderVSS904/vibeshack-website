'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { studioGuides, type StudioGuide } from '@/lib/seo/studioGuides'

// ─── Data shaping ─────────────────────────────────────────────────────────────

type TabId = 'all' | 'planning' | 'podcasts' | 'photography' | 'video' | 'rentals'

const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'All Guides' },
  { id: 'planning', label: 'Planning' },
  { id: 'podcasts', label: 'Podcasts' },
  { id: 'photography', label: 'Photography' },
  { id: 'video', label: 'Video' },
  { id: 'rentals', label: 'Studio Rentals' },
]

const GUIDE_TABS: Record<string, TabId[]> = {
  'best-studio-for-your-shoot': ['planning'],
  'podcast-studio-prep': ['podcasts'],
  'photography-studio-prep': ['photography'],
  'green-screen-studio-prep': ['video', 'rentals'],
  'white-cyc-studio-prep': ['rentals', 'video'],
}

const CHIPS: { label: string; tab: TabId }[] = [
  { label: 'A Podcast', tab: 'podcasts' },
  { label: 'A Campaign', tab: 'video' },
  { label: 'A Photo Shoot', tab: 'photography' },
  { label: 'A Content Day', tab: 'planning' },
]

// Stations sit on the compass ellipse (cx 50, cy 50, rx 46, ry 40, percent units).
const STATIONS = [
  {
    n: '01',
    name: 'Plan',
    title: 'Pick the room',
    body: 'Choose by the final asset: conversation, campaign still, keyed composite, or clean cyc movement.',
    href: '/studio-guides/best-studio-for-your-shoot/',
    cta: 'Open the guide',
    dot: { left: '13.3%', top: '25.9%' },
    label: '-translate-x-full -translate-y-full pr-4 pb-1 text-right',
  },
  {
    n: '02',
    name: 'Prepare',
    title: 'Before call time',
    body: 'What to bring, what to confirm, and what not to leave until the room is booked.',
    href: '/studio-guides/podcast-studio-prep/',
    cta: 'Open the checklist',
    dot: { left: '95.3%', top: '43.1%' },
    label: '-translate-y-full pl-4 pb-1 text-left',
  },
  {
    n: '03',
    name: 'Produce',
    title: 'On the day',
    body: 'Arrival, wardrobe, framing, and audio checks in the right order keep the session calm.',
    href: '/studio-guides/photography-studio-prep/',
    cta: 'Open the guide',
    dot: { left: '86.2%', top: '74.6%' },
    label: 'pl-4 pt-2 text-left',
  },
  {
    n: '04',
    name: 'Deliver',
    title: 'Leave with more',
    body: 'Hero takes plus crops, stills, and hooks. Decide the asset list before you wrap.',
    href: '/book/',
    cta: 'Book the session',
    dot: { left: '13.3%', top: '74.1%' },
    label: '-translate-x-full pr-4 pt-2 text-right',
  },
]

// Individual gear cutouts, placed on the compass. left/top/w are percent of the
// container; px is the PNG's natural size; z stacks the cluster.
const GEAR = [
  { src: '/studio-images/guides-gear/gear-camera-v20260715.webp', label: 'Cinema camera', px: [349, 331], w: 24, left: 41, top: 16, z: 3 },
  { src: '/studio-images/guides-gear/gear-mic-v20260715.webp', label: 'Shotgun mic', px: [250, 159], w: 17, left: 27, top: 17, z: 2 },
  { src: '/studio-images/guides-gear/gear-headphones-v20260715.webp', label: 'Headphones', px: [195, 216], w: 12, left: 64, top: 23, z: 2 },
  { src: '/studio-images/guides-gear/gear-cable-v20260715.webp', label: 'XLR cable', px: [180, 202], w: 11, left: 29, top: 40, z: 1 },
  { src: '/studio-images/guides-gear/gear-ssd-v20260715.webp', label: 'Portable SSD', px: [149, 120], w: 9, left: 39, top: 60, z: 1 },
  { src: '/studio-images/guides-gear/gear-led-v20260715.webp', label: 'LED panel', px: [130, 147], w: 8, left: 48, top: 62, z: 2 },
  { src: '/studio-images/guides-gear/gear-clapper-v20260715.webp', label: 'Clapperboard', px: [229, 199], w: 13, left: 56, top: 45, z: 2 },
]

// Dotted red connectors between gear pieces, in the same percent space.
const CONNECTORS: [number, number, number, number][] = [
  [37, 25, 44, 28],
  [60, 30, 65, 31],
  [35, 52, 41, 62],
  [57, 37, 60, 46],
  [46, 66, 49, 66],
]

function readMinutes(guide: StudioGuide) {
  const text = [
    guide.intro,
    ...guide.sections.map((s) => `${s.heading} ${s.body}`),
    ...guide.producerNotes,
    ...guide.mistakes,
    ...guide.checklist,
    ...guide.faqs.map((f) => `${f.question} ${f.answer}`),
  ].join(' ')
  const words = text.split(/\s+/).length
  return Math.min(9, Math.max(4, Math.round(words / 180)))
}

function matchesQuery(guide: StudioGuide, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [guide.title, guide.shortTitle, guide.keyword, guide.intro, guide.description]
    .join(' ')
    .toLowerCase()
    .includes(q)
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const guideIconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

function GuideIcon({ slug, className }: { slug: string; className: string }) {
  if (slug === 'podcast-studio-prep') {
    return (
      <svg {...guideIconProps} className={className}>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    )
  }
  if (slug === 'photography-studio-prep') {
    return (
      <svg {...guideIconProps} className={className}>
        <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
    )
  }
  if (slug === 'green-screen-studio-prep') {
    return (
      <svg {...guideIconProps} className={className}>
        <rect x="3" y="5" width="18" height="12" rx="1.5" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    )
  }
  if (slug === 'white-cyc-studio-prep') {
    return (
      <svg {...guideIconProps} className={className}>
        <path d="M4 4v9a7 7 0 0 0 7 7h9" />
        <path d="M4 20h4M20 4v4" />
      </svg>
    )
  }
  return (
    <svg {...guideIconProps} className={className}>
      <path d="M12 5c-2-1.5-4.5-2-8-2v16c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2V3c-3.5 0-6 .5-8 2z" />
      <path d="M12 5v16" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuidesPageClient() {
  const [tab, setTab] = useState<TabId>('all')
  const [query, setQuery] = useState('')
  const [activeStation, setActiveStation] = useState(1)
  const pinnedRef = useRef(false)

  // Ambient walk around the compass until the user takes over.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = setInterval(() => {
      if (document.hidden || pinnedRef.current) return
      setActiveStation((s) => (s + 1) % STATIONS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const pickStation = (index: number) => {
    pinnedRef.current = true
    setActiveStation(index)
  }

  const goToLibrary = () => {
    document.getElementById('guide-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Choose Your Studio leads the library; it is the orientation guide.
  const ordered = [
    ...studioGuides.filter((g) => g.slug === 'best-studio-for-your-shoot'),
    ...studioGuides.filter((g) => g.slug !== 'best-studio-for-your-shoot'),
  ]
  const filtered = ordered.filter(
    (guide) => (tab === 'all' || (GUIDE_TABS[guide.slug] ?? []).includes(tab)) && matchesQuery(guide, query),
  )
  const featured = filtered[0]
  const sideGuides = filtered.slice(1, 3)
  const restGuides = filtered.slice(3)
  const station = STATIONS[activeStation]

  return (
    <div className="bg-black">
      {/* ── Hero ── */}
      <section className="border-b border-white/10 px-6 pb-16 pt-28 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1680px] grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400">
              VibeShack Field Guide
            </p>
            <h1 className="mt-6 text-white" style={{ fontSize: 'clamp(2.75rem, 4vw, 4rem)' }}>
              Make the shoot feel easy<span className="text-brand-red">.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-300">
              Clear answers for planning, producing, and leaving with exactly what you came for.
            </p>

            <form
              className="mt-8 flex max-w-lg items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.03] py-2 pl-6 pr-2 transition-colors focus-within:border-white/35"
              onSubmit={(e) => {
                e.preventDefault()
                goToLibrary()
              }}
            >
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  if (tab !== 'all') setTab('all')
                }}
                placeholder="What are you making?"
                aria-label="Search the guides"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[17px] text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-red text-white transition-colors hover:bg-red-700"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {CHIPS.map((chip) => (
                <button
                  key={chip.tab}
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setTab(chip.tab)
                    goToLibrary()
                  }}
                  className="rounded-full border border-white/15 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:border-white/40 hover:text-white"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Compass (desktop) ── */}
          <div className="hidden lg:block">
          <div className="relative aspect-[13/9] select-none" aria-label="The VibeShack process: plan, prepare, produce, deliver">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <ellipse cx="50" cy="50" rx="46" ry="40" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.18" strokeDasharray="0.9 1.6" />
              {CONNECTORS.map(([x1, y1, x2, y2]) => (
                <line
                  key={`${x1}-${y1}-${x2}-${y2}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(236,0,0,0.35)"
                  strokeWidth="0.16"
                  strokeDasharray="0.7 1.5"
                />
              ))}
            </svg>

            {GEAR.map((item) => (
              <div
                key={item.label}
                className="group absolute"
                style={{ left: `${item.left}%`, top: `${item.top}%`, width: `${item.w}%`, zIndex: item.z }}
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  width={item.px[0]}
                  height={item.px[1]}
                  unoptimized
                  className="h-auto w-full transition-transform duration-300 ease-out group-hover:scale-110"
                  draggable={false}
                />
                <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/85 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100">
                  {item.label}
                </span>
              </div>
            ))}

            {STATIONS.map((s, i) => {
              const active = i === activeStation
              return (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => pickStation(i)}
                  aria-pressed={active}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: s.dot.left, top: s.dot.top }}
                >
                  <span
                    className={`block h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                      active
                        ? 'bg-brand-red shadow-[0_0_0_6px_rgba(236,0,0,0.18),0_0_28px_rgba(236,0,0,0.55)]'
                        : 'border border-white/40 bg-black'
                    }`}
                  />
                  <span className={`absolute left-1/2 top-1/2 block w-max ${s.label}`}>
                    <span className={`block font-mono text-[22px] leading-none transition-colors ${active ? 'text-brand-red' : 'text-zinc-500'}`}>
                      {s.n}
                    </span>
                    <span className={`mt-1 block font-mono text-[11px] font-bold uppercase tracking-[0.22em] transition-colors ${active ? 'text-white' : 'text-zinc-400'}`}>
                      {s.name}
                    </span>
                  </span>
                </button>
              )
            })}

          </div>

          {/* Active station, docked below the compass so it never covers the gear */}
          <div className="mt-4 flex items-center gap-6 rounded-xl border border-white/10 bg-[#0b0b0b] px-7 py-5">
            <div className="flex shrink-0 items-baseline gap-3">
              <span className="font-mono text-[26px] leading-none text-brand-red">{station.n}</span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white">{station.name}</span>
            </div>
            <span className="h-9 w-px shrink-0 bg-white/10" aria-hidden />
            <div key={station.n} className="booking-media-enter flex min-w-0 flex-1 items-center gap-6">
              <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-zinc-400">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white">{station.title}. </span>
                {station.body}
              </p>
              <Link
                href={station.href}
                className="shrink-0 whitespace-nowrap font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red transition-colors hover:text-red-400"
              >
                {station.cta} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          </div>

          {/* ── Compass (mobile): stations as steps ── */}
          <div className="lg:hidden">
            <div className="grid grid-cols-4 gap-2">
              {STATIONS.map((s, i) => {
                const active = i === activeStation
                return (
                  <button
                    key={s.n}
                    type="button"
                    onClick={() => pickStation(i)}
                    aria-pressed={active}
                    className={`rounded-xl border px-2 py-3 text-center transition-colors ${
                      active ? 'border-brand-red' : 'border-white/10'
                    }`}
                  >
                    <span className={`block font-mono text-base leading-none ${active ? 'text-brand-red' : 'text-zinc-500'}`}>{s.n}</span>
                    <span className={`mt-1.5 block font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${active ? 'text-white' : 'text-zinc-400'}`}>
                      {s.name}
                    </span>
                  </button>
                )
              })}
            </div>
            <div key={station.n} className="booking-media-enter mt-3 rounded-xl border border-white/15 bg-white/[0.02] p-5">
              <p className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-white">{station.title}</p>
              <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-400">{station.body}</p>
              <Link
                href={station.href}
                className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red transition-colors hover:text-red-400"
              >
                {station.cta} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Guide library ── */}
      <section id="guide-library" className="scroll-mt-24 px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1680px]">
          <div className="flex items-baseline justify-between gap-6 border-b border-white/10">
            <div className="scrollbar-hide flex gap-8 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-pressed={tab === t.id}
                  className={`relative shrink-0 pb-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                    tab === t.id ? 'text-brand-red' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.label}
                  {tab === t.id && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-brand-red" />}
                </button>
              ))}
            </div>
            <p className="hidden shrink-0 pb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:block">
              {filtered.length} guide{filtered.length === 1 ? '' : 's'}
            </p>
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-sm text-zinc-400">No guides match that search.</p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red transition-colors hover:text-red-400"
              >
                Clear the search
              </button>
            </div>
          )}

          {featured && (
            <div className={`mt-8 grid grid-cols-1 gap-5 ${sideGuides.length > 0 ? 'lg:grid-cols-[1.55fr_1fr]' : ''}`}>
              {/* Featured guide */}
              <Link
                href={`/studio-guides/${featured.slug}/`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] transition-colors hover:border-white/25 lg:flex-row"
              >
                <div className="flex flex-col p-8 lg:w-[54%] lg:p-10">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-red/60">
                    <GuideIcon slug={featured.slug} className="h-5 w-5 text-brand-red" />
                  </span>
                  <p className="font-black mt-7 leading-[0.94] text-white" style={{ fontSize: 'clamp(2.1rem, 2.6vw, 3rem)' }}>
                    {featured.shortTitle}
                  </p>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">{featured.description}</p>
                  <p className="mt-auto flex items-center gap-4 pt-9 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red">
                    {readMinutes(featured)} min guide
                    <span className="relative h-px w-24 bg-brand-red/70 transition-all duration-300 group-hover:w-32">
                      <span className="absolute -right-px -top-[3.5px] block h-[7px] w-[7px] rotate-45 border-r border-t border-brand-red/70" />
                    </span>
                  </p>
                </div>
                <div className="relative min-h-[240px] flex-1 overflow-hidden lg:min-h-[340px]">
                  {/* Photo and fade zoom as one layer so the blend never swims */}
                  <div className="absolute inset-0 transition-transform duration-[700ms] ease-out group-hover:scale-[1.03]">
                    <Image
                      src={featured.image}
                      alt={featured.imageAlt}
                      fill
                      quality={80}
                      sizes="(min-width: 1024px) 44vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-transparent to-transparent" />
                  </div>
                </div>
              </Link>

              {/* Side guides */}
              {sideGuides.length > 0 && (
                <div className="flex flex-col gap-5">
                  {sideGuides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/studio-guides/${guide.slug}/`}
                      className="group relative flex flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] transition-colors hover:border-white/25"
                    >
                      <div className="flex w-[58%] flex-col justify-center gap-4 p-7">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-red/60">
                          <GuideIcon slug={guide.slug} className="h-4 w-4 text-brand-red" />
                        </span>
                        <div>
                          <p className="font-black leading-[0.94] text-white" style={{ fontSize: 'clamp(1.4rem, 1.7vw, 1.85rem)' }}>
                            {guide.shortTitle}
                          </p>
                          <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-zinc-400">{guide.description}</p>
                        </div>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-red">
                          {readMinutes(guide)} min guide
                        </p>
                      </div>
                      <div className="relative min-h-[170px] flex-1 overflow-hidden">
                        <div className="absolute inset-0 transition-transform duration-[700ms] ease-out group-hover:scale-[1.03]">
                          <Image
                            src={guide.image}
                            alt={guide.imageAlt}
                            fill
                            quality={80}
                            sizes="(min-width: 1024px) 28vw, 45vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-transparent to-transparent" />
                        </div>
                      </div>
                      <span className="absolute bottom-4 right-4 text-white/70 transition-colors group-hover:text-brand-red" aria-hidden>
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {restGuides.length > 0 && (
            <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
              {restGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/studio-guides/${guide.slug}/`}
                  className="group flex items-center justify-between gap-6 py-6"
                >
                  <div className="min-w-0">
                    <p className="font-black text-2xl leading-[0.94] text-white">{guide.shortTitle}</p>
                    <p className="mt-2 line-clamp-1 max-w-2xl text-xs leading-relaxed text-zinc-400">{guide.description}</p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                      {readMinutes(guide)} min guide
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-colors group-hover:text-brand-red">
                    Read guide <span aria-hidden>→</span>
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-400">Not sure which room fits the plan?</p>
            <Link
              href="/find-your-studio/"
              className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red transition-colors hover:text-red-400"
            >
              Find a studio <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

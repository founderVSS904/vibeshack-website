'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { studioGuides } from '@/lib/seo/studioGuides'
import { rankGuides } from '@/lib/seo/guideSearch'

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

// How a session runs. Read as a static rail under the library.
const STATIONS = [
  {
    n: '01',
    name: 'Plan',
    title: 'Pick the room',
    body: 'Choose by the final asset: conversation, campaign still, keyed composite, or clean cyc movement.',
    href: '/studio-guides/best-studio-for-your-shoot/',
    cta: 'Open the guide',
  },
  {
    n: '02',
    name: 'Prepare',
    title: 'Before call time',
    body: 'What to bring, what to confirm, and what not to leave until the room is booked.',
    href: '/studio-guides/podcast-studio-prep/',
    cta: 'Open the checklist',
  },
  {
    n: '03',
    name: 'Produce',
    title: 'On the day',
    body: 'Arrival, wardrobe, framing, and audio checks in the right order keep the session calm.',
    href: '/studio-guides/photography-studio-prep/',
    cta: 'Open the guide',
  },
  {
    n: '04',
    name: 'Deliver',
    title: 'Leave with more',
    body: 'Hero takes plus crops, stills, and hooks. Decide the asset list before you wrap.',
    href: '/book/',
    cta: 'Book the session',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuidesPageClient() {
  const [tab, setTab] = useState<TabId>('all')
  const [query, setQuery] = useState('')

  const goToLibrary = () => {
    // globals.css already sets scroll-behavior: smooth inside a reduced-motion
    // guard. Passing 'smooth' here would override that guard.
    document.getElementById('guide-library')?.scrollIntoView({ block: 'start' })
  }

  // Choose Your Studio leads the library; it is the orientation guide.
  const ordered = [
    ...studioGuides.filter((g) => g.slug === 'best-studio-for-your-shoot'),
    ...studioGuides.filter((g) => g.slug !== 'best-studio-for-your-shoot'),
  ]
  const trimmed = query.trim()
  const inTab = ordered.filter((guide) => tab === 'all' || (GUIDE_TABS[guide.slug] ?? []).includes(tab))
  const ranked = trimmed ? rankGuides(inTab, trimmed) : inTab
  // Five guides. A dead end is never more useful than showing them.
  const noMatch = trimmed.length > 0 && ranked.length === 0
  const filtered = noMatch ? inTab : ranked
  const featured = filtered[0]
  const sideGuides = filtered.slice(1, 3)
  const restGuides = filtered.slice(3)

  return (
    <div className="bg-black">
      {/* ── Hero: one centered field, one job ── */}
      <section className="border-b border-white/10 px-6 pb-14 pt-28 sm:px-10 sm:pt-32 lg:px-16 lg:pb-28 lg:pt-40">
        <div className="mx-auto max-w-[720px] text-center">
          {/* globals.css already sets h1 condensed, 900, uppercase, lh 0.88 and
              forces letter-spacing. Size is the only knob here. */}
          <h1 className="text-white" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
            Studio guides<span className="text-brand-red">.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-[30rem] text-[17px] leading-relaxed text-zinc-400">
            Planning notes for podcast, photo, green screen, and white cyc sessions.
          </p>

          {/* The one object. The 40px above it is what makes it the focal point. */}
          <form
            role="search"
            className="mx-auto mt-10 flex max-w-[560px] items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] py-2 pl-6 pr-2 transition-colors duration-200 hover:border-white/25 focus-within:border-brand-red/60 focus-within:ring-2 focus-within:ring-brand-red/50"
            onSubmit={(e) => {
              e.preventDefault()
              goToLibrary()
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className="shrink-0 text-zinc-500" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M20.5 20.5 16.65 16.65" />
            </svg>
            <label htmlFor="guide-search" className="sr-only">Search the guides</label>
            {/* focus:shadow-none beats the global input:focus red glow, which would
                otherwise paint a rectangle inside the pill. appearance-none stops
                Safari's search field forcing a min width that blows out the row. */}
            <input
              id="guide-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (tab !== 'all') setTab('all')
              }}
              placeholder="What are you making?"
              className="min-w-0 flex-1 appearance-none border-0 bg-transparent py-3 text-[17px] text-white placeholder-zinc-500 focus:shadow-none focus:outline-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-red text-white transition-colors duration-200 hover:bg-red-700 sm:h-12 sm:w-12"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {CHIPS.map((chip) => (
              <button
                key={chip.tab}
                type="button"
                onClick={() => {
                  setQuery('')
                  setTab(chip.tab)
                  goToLibrary()
                }}
                className="rounded-full border border-white/10 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-colors duration-200 hover:border-white/40 hover:text-white"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Typing filters a library that sits below the fold, so say what happened.
              The reserved height stops the row shifting as text appears. */}
          <div className="mt-6 min-h-[22px]" aria-live="polite">
            {trimmed.length > 0 && (
              <button
                type="button"
                onClick={goToLibrary}
                className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red transition-colors duration-200 hover:text-red-400"
              >
                {noMatch
                  ? `Nothing matches that. All ${filtered.length} guides`
                  : `${filtered.length} ${filtered.length === 1 ? 'guide' : 'guides'} match`}{' '}
                <span aria-hidden>→</span>
              </button>
            )}
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
                  className={`relative shrink-0 pt-3 pb-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
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
                className="group flex flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0b] transition-colors hover:border-white/25 lg:flex-row"
              >
                <div className="flex flex-col p-8 lg:w-[54%] lg:p-10">
                  <p className="font-black leading-[0.94] text-white" style={{ fontSize: 'clamp(2.1rem, 2.6vw, 3rem)' }}>
                    {featured.shortTitle}
                  </p>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">{featured.description}</p>
                  <p className="mt-auto flex items-center gap-4 pt-9 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red">
                    Read the guide
                    <span className="relative h-px w-24 bg-brand-red/70 origin-left transition-transform duration-300 ease-out group-hover:scale-x-125">
                      <span className="absolute -right-px -top-[3.5px] block h-[7px] w-[7px] rotate-45 border-r border-t border-brand-red/70" />
                    </span>
                  </p>
                </div>
                <div className="relative min-h-[240px] flex-1 overflow-hidden lg:min-h-[340px]">
                  {/* Photo and fade zoom as one layer so the blend never swims */}
                  <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.035]">
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
                      className="group relative flex flex-1 overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0b] transition-colors hover:border-white/25"
                    >
                      <div className="flex w-[58%] flex-col justify-center gap-3 p-7">
                        <p className="font-black leading-[0.94] text-white" style={{ fontSize: 'clamp(1.4rem, 1.7vw, 1.85rem)' }}>
                          {guide.shortTitle}
                        </p>
                        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">{guide.description}</p>
                      </div>
                      <div className="relative min-h-[170px] flex-1 overflow-hidden">
                        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.035]">
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

      {/* ── How a session runs: the orientation rail, for whoever scrolled the
             whole library and still does not know where to start. ── */}
      <section className="border-t border-white/10 px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1680px]">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-zinc-500">
            How a session runs
          </p>
          <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATIONS.map((s) => (
              <Link
                key={s.n}
                href={s.href}
                className="group block border-t border-white/10 pt-6 transition-colors duration-200 hover:border-white/30"
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-[12px] tracking-[0.2em] text-zinc-500">{s.n}</span>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">{s.name}</span>
                </span>
                <span className="mt-4 block text-[17px] font-bold leading-snug text-white">{s.title}</span>
                <span className="mt-2.5 block text-[13px] leading-relaxed text-zinc-400">{s.body}</span>
                <span className="mt-5 block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500 transition-colors duration-200 group-hover:text-brand-red">
                  {s.cta} <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

type PhotoCategory = {
  label: string
  title: string
  body: string
  image: string
  alt: string
  position?: string
}

const CATEGORIES: PhotoCategory[] = [
  {
    label: 'Product',
    title: 'Product photography',
    body: 'Clean product stills, launch images, ecommerce crops, detail shots, campaign frames, and social assets.',
    image: '/studio-images/home-branding-pure-magic-v20260625.png',
    alt: 'Product photography of a styled cosmetics jar at VibeShack Studios',
  },
  {
    label: 'People',
    title: 'Headshots and portraits',
    body: 'Founder portraits, team headshots, press photos, artist portraits, executive profiles, and brand images.',
    image: '/studio-images/enhanced-photography-headshot-black-blazer-v20260510.jpg',
    alt: 'Professional headshot photographed at VibeShack Studios San Francisco',
    position: 'center 30%',
  },
  {
    label: 'Food',
    title: 'Food and beverage',
    body: 'Menu images, packaged goods, drink launches, tabletop scenes, delivery-app crops, and social content.',
    image: '/studio-images/photo-food-editorial-v20260715.jpg',
    alt: 'Dark editorial food photography with a plated dish and cocktail',
  },
  {
    label: 'Fashion',
    title: 'Editorials and lookbooks',
    body: 'Lookbook images, wardrobe stories, model tests, beauty crops, campaign stills, and full-body frames.',
    image: '/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260510.jpg',
    alt: 'Fashion editorial photographed on the cyc at VibeShack Studios',
    position: '42% center',
  },
  {
    label: 'Events',
    title: 'Wedding and event content',
    body: 'Engagement portraits, editorial wedding details, announcement images, event portraits, and polished recap stills.',
    image: '/studio-images/photo-events-editorial-v20260715.jpg',
    alt: 'Editorial event photograph of a couple at an evening celebration',
    position: 'center 30%',
  },
  {
    label: 'Content Days',
    title: 'Content days',
    body: 'A planned photo day for the images a brand needs across website, ads, social, decks, and launch material.',
    image: '/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg',
    alt: 'Crew setting lights during a content day at VibeShack Studios',
  },
]

// Deck geometry anchors by absolute distance from center; values between
// anchors are interpolated so the deck can rest at any fractional position.
const ANCHORS = [
  { x: 0, rot: 0, s: 1, b: 1, o: 1 },
  { x: 74, rot: 18, s: 0.86, b: 0.62, o: 1 },
  { x: 136, rot: 24, s: 0.74, b: 0.4, o: 1 },
  { x: 172, rot: 24, s: 0.62, b: 0.3, o: 0 },
]

const DRAG_STEP = 240 // px of drag per card
const LEAN = 0.55 // how far the deck leans toward the cursor, in cards
const EDGE_ZONE = 0.85 // |cursor ratio| beyond which the deck scrolls
const EDGE_SPEED = 0.0018 // max cards per ms at the far edge; scales with depth
const CHASE = 110 // ms time-constant of the exponential chase

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function slotAt(rel: number) {
  const side = rel < 0 ? -1 : 1
  const d = Math.min(Math.abs(rel), 3)
  const lower = Math.floor(d)
  const upper = Math.min(lower + 1, 3)
  const t = d - lower
  const a = ANCHORS[lower]
  const b = ANCHORS[upper]
  return {
    x: side * lerp(a.x, b.x, t),
    rot: -side * lerp(a.rot, b.rot, t),
    s: lerp(a.s, b.s, t),
    b: lerp(a.b, b.b, t),
    o: lerp(a.o, b.o, t),
    z: Math.round(30 - d * 10),
  }
}

function relativeTo(index: number, position: number) {
  const rel = (((index - position) % 6) + 6) % 6
  return rel > 3 ? rel - 6 : rel
}

export default function PhotoServicesHero() {
  const [active, setActive] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)

  const nodesRef = useRef<(HTMLButtonElement | null)[]>([])
  const posRef = useRef(0) // rendered position, continuous
  const baseRef = useRef(0) // anchor the lean is measured from
  const leanRef = useRef(0)
  const edgeRef = useRef(0) // signed 0..1 edge depth while the cursor rides an edge
  const hoveredRef = useRef<number | null>(null)
  const overRef = useRef(false)
  const pinnedRef = useRef(false)
  const dragRef = useRef<{ startX: number; startPos: number; moved: boolean } | null>(null)
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)
  const activeRef = useRef(0)

  const applyStyles = useCallback((pos: number) => {
    nodesRef.current.forEach((node, i) => {
      if (!node) return
      const rel = relativeTo(i, pos)
      const slot = slotAt(rel)
      const isHovered = hoveredRef.current === i
      const brightness = isHovered ? Math.min(1, slot.b + 0.25) : slot.b
      node.style.transform = `translate(-50%, -50%) translateX(${slot.x}%) rotateY(${slot.rot}deg) scale(${slot.s})`
      node.style.opacity = String(slot.o)
      node.style.filter = `brightness(${brightness})`
      node.style.zIndex = String(isHovered ? 40 : slot.z)
      node.style.pointerEvents = slot.o < 0.5 ? 'none' : ''
    })
  }, [])

  const tick = useCallback(
    (now: number) => {
      const dt = Math.min(Math.max(now - lastTsRef.current, 0), 50)
      lastTsRef.current = now

      if (edgeRef.current && !dragRef.current) {
        baseRef.current += edgeRef.current * EDGE_SPEED * dt
      }

      const goal = baseRef.current + leanRef.current
      if (!dragRef.current) {
        posRef.current += (goal - posRef.current) * (1 - Math.exp(-dt / CHASE))
        if (Math.abs(goal - posRef.current) < 0.0005) posRef.current = goal
      }

      applyStyles(posRef.current)

      const snapped = ((Math.round(posRef.current) % 6) + 6) % 6
      if (snapped !== activeRef.current) {
        activeRef.current = snapped
        setActive(snapped)
      }

      const settled = !dragRef.current && !overRef.current && Math.abs(goal - posRef.current) < 0.001
      if (settled) {
        rafRef.current = 0
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [applyStyles],
  )

  const ensureLoop = useCallback(() => {
    if (rafRef.current) return
    lastTsRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  // Pointer events tick the loop directly so motion stays glued to input
  // even where rAF is throttled.
  const pump = useCallback(() => {
    ensureLoop()
    tick(performance.now())
  }, [ensureLoop, tick])

  const go = useCallback(
    (index: number) => {
      pinnedRef.current = true
      const from = Math.round(baseRef.current)
      let delta = (((index - from) % 6) + 6) % 6
      if (delta > 3) delta -= 6
      baseRef.current = from + delta
      leanRef.current = 0
      edgeRef.current = 0
      ensureLoop()
    },
    [ensureLoop],
  )

  useEffect(() => {
    applyStyles(0)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [applyStyles])

  // Ambient advance until the visitor takes over.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = setInterval(() => {
      if (document.hidden || pinnedRef.current || overRef.current) return
      baseRef.current = Math.round(baseRef.current) + 1
      ensureLoop()
    }, 5000)
    return () => clearInterval(interval)
  }, [ensureLoop])

  const activeCategory = CATEGORIES[active]

  return (
    <>
      {/* ── Hero ── */}
      <section className="overflow-hidden border-b border-white/[0.08] bg-black pb-14 pt-28">
        <div className="mx-auto max-w-[1680px] px-6 text-center sm:px-10 lg:px-16">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand-red">
            Photography Services · San Francisco
          </p>
          <h1 className="mx-auto mt-6 max-w-4xl text-white" style={{ fontSize: 'clamp(2.75rem, 5vw, 5rem)' }}>
            Make the image
            <br />
            impossible to ignore<span className="text-brand-red">.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-zinc-300">
            From first shot list to final selects, we plan and produce photography built for where your brand is going next.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact/?service=photo-services"
              className="rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700"
            >
              Plan your shoot
            </Link>
            <Link
              href="/our-work/"
              className="rounded-lg border border-white/20 px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-white/50"
            >
              Explore the work
            </Link>
          </div>
        </div>

        {/* ── Fanned deck on a glass floor ── */}
        <div
          className={`relative mx-auto mt-12 h-[480px] max-w-[1680px] select-none sm:h-[560px] lg:h-[660px] ${
            dragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ perspective: '1400px' }}
          onPointerEnter={() => {
            overRef.current = true
          }}
          onPointerDown={(e) => {
            dragRef.current = { startX: e.clientX, startPos: posRef.current, moved: false }
            leanRef.current = 0
            edgeRef.current = 0
            setDragging(true)
            try {
              e.currentTarget.setPointerCapture(e.pointerId)
            } catch {}
            ensureLoop()
          }}
          onPointerMove={(e) => {
            const drag = dragRef.current
            if (drag) {
              const delta = e.clientX - drag.startX
              if (Math.abs(delta) > 10) drag.moved = true
              posRef.current = drag.startPos - delta / DRAG_STEP
              baseRef.current = posRef.current
              pump()
              return
            }
            if (e.pointerType !== 'mouse') return
            const rect = e.currentTarget.getBoundingClientRect()
            const ratio = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2))
            leanRef.current = ratio * LEAN
            edgeRef.current = Math.abs(ratio) > EDGE_ZONE
              ? Math.sign(ratio) * ((Math.abs(ratio) - EDGE_ZONE) / (1 - EDGE_ZONE))
              : 0
            if (edgeRef.current) pinnedRef.current = true
            pump()
          }}
          onPointerUp={() => {
            const drag = dragRef.current
            dragRef.current = null
            setDragging(false)
            if (drag) {
              pinnedRef.current = true
              baseRef.current = Math.round(posRef.current)
              leanRef.current = 0
            }
            ensureLoop()
          }}
          onPointerCancel={() => {
            dragRef.current = null
            setDragging(false)
            baseRef.current = Math.round(posRef.current)
            leanRef.current = 0
            ensureLoop()
          }}
          onPointerLeave={() => {
            overRef.current = false
            edgeRef.current = 0
            leanRef.current = 0
            baseRef.current = Math.round(baseRef.current)
            ensureLoop()
          }}
        >
          {/* The glass sea: a horizon sheen at the contact line and a soft
              falloff below it. Card bottoms sit ~155px above the stage bottom
              at every breakpoint, so the plane holds without per-size math. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[155px]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(58% 130% at 50% 0%, rgba(255,255,255,0.05), transparent 70%)' }}
            />
          </div>
          {CATEGORIES.map((category, i) => {
            const isHovered = hovered === i && !dragging
            const edge = isHovered ? '-13%' : '0%'
            const frameTransition = 'left 500ms cubic-bezier(0.32, 0.72, 0, 1), right 500ms cubic-bezier(0.32, 0.72, 0, 1)'
            return (
              <button
                key={category.label}
                ref={(el) => {
                  nodesRef.current[i] = el
                }}
                type="button"
                aria-label={`Show ${category.label}`}
                aria-pressed={i === active}
                tabIndex={relativeTo(i, active) === 3 ? -1 : 0}
                onMouseEnter={() => {
                  if (edgeRef.current === 0 && Math.abs(baseRef.current + leanRef.current - posRef.current) < 0.3) {
                    hoveredRef.current = i
                    setHovered(i)
                  }
                }}
                onMouseLeave={() => {
                  if (hoveredRef.current === i) hoveredRef.current = null
                  setHovered((h) => (h === i ? null : h))
                }}
                onClick={() => {
                  if (dragRef.current?.moved) return
                  if (i !== activeRef.current) go(i)
                }}
                className="absolute left-1/2 top-[38%] w-[240px] sm:w-[320px] lg:w-[420px]"
                style={{ aspectRatio: '5 / 6' }}
              >
                <span
                  className="absolute inset-y-0 block overflow-hidden rounded-xl border border-white/10 bg-zinc-950"
                  style={{ left: edge, right: edge, transition: frameTransition }}
                >
                  <Image
                    src={category.image}
                    alt={category.alt}
                    fill
                    quality={80}
                    sizes="(min-width: 1024px) 840px, 640px"
                    className="object-cover"
                    style={{ objectPosition: category.position || 'center' }}
                    draggable={false}
                    priority={i < 3}
                  />
                  <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
                  <span className="absolute bottom-4 left-5 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-white">
                    {category.label}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-full mt-[5px] block h-full overflow-hidden rounded-xl"
                  style={{
                    left: edge,
                    right: edge,
                    transition: frameTransition,
                    transform: 'scaleY(-1)',
                    maskImage: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 46%)',
                    WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 46%)',
                  }}
                >
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    quality={80}
                    sizes="(min-width: 1024px) 840px, 640px"
                    className="object-cover"
                    style={{ objectPosition: category.position || 'center' }}
                    draggable={false}
                  />
                  <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-4 left-5 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-white">
                    {category.label}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Pager ── */}
        <div className="mx-auto mt-8 flex max-w-[1680px] items-center gap-6 px-6 sm:px-10 lg:px-16">
          <p className="shrink-0 font-mono text-[12px] font-bold tracking-[0.14em] text-zinc-400">
            <span className="text-brand-red">{String(active + 1).padStart(2, '0')}</span> / 06
          </p>
          <div className="relative h-px min-w-0 flex-1 bg-white/15">
            <span
              className="absolute inset-y-0 left-0 bg-brand-red transition-[width] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${((active + 1) / 6) * 100}%` }}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              aria-label="Previous category"
              onClick={() => go((active + 5) % 6)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white"
            >
              <svg className="h-3.5 w-3.5 rotate-180" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-zinc-400" aria-hidden>
              Drag
            </span>
            <button
              type="button"
              aria-label="Next category"
              onClick={() => go((active + 1) % 6)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── Six ways to shoot ── */}
      <section className="border-b border-white/[0.08] bg-black py-16">
        <div className="mx-auto max-w-[1680px] px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-baseline lg:justify-between">
            <h2 className="shrink-0 text-white" style={{ fontSize: 'clamp(2rem, 2.8vw, 3rem)' }}>
              Six ways to shoot<span className="text-brand-red">.</span>
            </h2>
            <div className="scrollbar-hide flex gap-8 overflow-x-auto">
              {CATEGORIES.map((category, i) => (
                <button
                  key={category.label}
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => go(i)}
                  className={`relative shrink-0 pb-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                    i === active ? 'text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {category.label}
                  {i === active && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-brand-red" />}
                </button>
              ))}
            </div>
          </div>

          <div key={activeCategory.label} className="booking-media-enter mt-10 grid grid-cols-1 gap-8 border-t border-white/[0.08] pt-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <p className="text-2xl font-bold leading-snug text-white">{activeCategory.title}</p>
            <div>
              <p className="max-w-2xl text-base leading-relaxed text-zinc-400">{activeCategory.body}</p>
              <div className="mt-6 flex flex-wrap items-center gap-6">
                <Link
                  href="/contact/?service=photo-services"
                  className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red transition-colors hover:text-red-400"
                >
                  Plan this shoot <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/photography-studio-san-francisco/"
                  className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:text-white"
                >
                  Need room-only rental?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

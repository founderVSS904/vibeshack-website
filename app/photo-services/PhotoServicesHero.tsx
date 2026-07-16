'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

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
    image: '/studio-images/photo-product-puremagic-v20260716.jpg',
    alt: 'Product photography of a styled cosmetics jar at VibeShack Studios',
  },
  {
    label: 'People',
    title: 'Headshots and portraits',
    body: 'Founder portraits, team headshots, press photos, artist portraits, executive profiles, and brand images.',
    image: '/studio-images/photo-gallery-black-white-sunglasses-v20260716.jpg',
    alt: 'Black and white sunglasses portrait photographed at VibeShack Studios San Francisco',
    position: 'center 25%',
  },
  {
    label: 'Food',
    title: 'Food and beverage',
    body: 'Menu images, packaged goods, drink launches, tabletop scenes, delivery-app crops, and social content.',
    image: '/studio-images/photo-food-editorial-v20260716.jpg',
    alt: 'Dark editorial food photography with a plated dish and cocktail',
  },
  {
    label: 'Fashion',
    title: 'Editorials and lookbooks',
    body: 'Lookbook images, wardrobe stories, model tests, beauty crops, campaign stills, and full-body frames.',
    image: '/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260716.jpg',
    alt: 'Fashion editorial photographed on the cyc at VibeShack Studios',
    position: '42% center',
  },
  {
    label: 'Events',
    title: 'Wedding and event content',
    body: 'Engagement portraits, editorial wedding details, announcement images, event portraits, and polished recap stills.',
    image: '/studio-images/photo-events-editorial-v20260716.jpg',
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
const EDGE_SPEED = 0.002 // max cards per ms at the far edge
const EDGE_FLOOR = 0.55 // fraction of max speed the moment the cursor enters the zone
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

  const stageRef = useRef<HTMLDivElement>(null)
  const inViewRef = useRef(true)
  const nodesRef = useRef<(HTMLButtonElement | null)[]>([])
  const posRef = useRef(0) // rendered position, continuous
  const baseRef = useRef(0) // anchor the lean is measured from
  const leanRef = useRef(0)
  const edgeRef = useRef(0) // signed 0..1 edge depth while the cursor rides an edge
  const hoveredRef = useRef<number | null>(null)
  const overRef = useRef(false)
  const pinnedRef = useRef(false)
  const dragRef = useRef<{ id: number; startX: number; startPos: number; moved: boolean; lastX: number; lastT: number; v: number } | null>(null)
  const movedRef = useRef(false)
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)
  const activeRef = useRef(0)

  const dimsRef = useRef<(NodeListOf<HTMLElement> | null)[]>([])

  const applyStyles = useCallback((pos: number) => {
    nodesRef.current.forEach((node, i) => {
      if (!node) return
      const rel = relativeTo(i, pos)
      const slot = slotAt(rel)
      const isHovered = hoveredRef.current === i
      const brightness = isHovered ? Math.min(1, slot.b + 0.25) : slot.b
      node.style.transform = `translate(-50%, -50%) translateX(${slot.x.toFixed(3)}%) rotateY(${slot.rot.toFixed(3)}deg) scale(${slot.s.toFixed(4)})`
      node.style.opacity = slot.o.toFixed(3)
      node.style.zIndex = String(isHovered ? 40 : slot.z)
      node.style.pointerEvents = slot.o < 0.5 ? 'none' : ''
      // Dimming rides black overlays at pure compositor opacity; per-frame
      // filters repaint on the CPU in Safari.
      const dims = dimsRef.current[i] ?? (dimsRef.current[i] = node.querySelectorAll('[data-dim]'))
      const dim = Math.min(0.75, Math.max(0, 1 - brightness)).toFixed(3)
      dims.forEach((d) => {
        d.style.opacity = dim
      })
    })
  }, [])

  const tick = useCallback(
    (now: number) => {
      const dt = Math.min(Math.max(now - lastTsRef.current, 0), 50)
      lastTsRef.current = now

      if (edgeRef.current && !dragRef.current) {
        const depth = Math.abs(edgeRef.current)
        const speed = EDGE_SPEED * (EDGE_FLOOR + (1 - EDGE_FLOOR) * depth)
        baseRef.current += Math.sign(edgeRef.current) * speed * dt
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

      const settled = !dragRef.current && !edgeRef.current && Math.abs(goal - posRef.current) < 0.001
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
  // even where rAF is throttled, capped at one render per 16ms so high-rate
  // mice never double-pump a frame.
  const pump = useCallback(() => {
    ensureLoop()
    const now = performance.now()
    if (now - lastTsRef.current >= 16) tick(now)
  }, [ensureLoop, tick])

  // If focus sits on the card that the move will hide, it walks to the new
  // active card so keyboard users never lose their focus ring.
  const chaseFocus = useCallback((target: number) => {
    const focusedAt = nodesRef.current.findIndex((n) => n === document.activeElement)
    if (focusedAt >= 0 && relativeTo(focusedAt, target) === 3) {
      nodesRef.current[target]?.focus({ preventScroll: true })
    }
  }, [])

  const go = useCallback(
    (index: number) => {
      if (dragRef.current) return
      pinnedRef.current = true
      const from = Math.round(baseRef.current)
      let delta = (((index - from) % 6) + 6) % 6
      if (delta > 3) delta -= 6
      baseRef.current = from + delta
      leanRef.current = 0
      edgeRef.current = 0
      chaseFocus(index)
      ensureLoop()
    },
    [chaseFocus, ensureLoop],
  )

  // Steps read the motion target, not the lagging snapped index, so rapid
  // clicks advance one card each instead of re-aiming at the same slot.
  const goStep = useCallback(
    (dir: 1 | -1) => {
      if (dragRef.current) return
      pinnedRef.current = true
      baseRef.current = Math.round(baseRef.current) + dir
      leanRef.current = 0
      edgeRef.current = 0
      chaseFocus(((Math.round(baseRef.current) % 6) + 6) % 6)
      ensureLoop()
    },
    [chaseFocus, ensureLoop],
  )

  useEffect(() => {
    applyStyles(0)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [applyStyles])

  // The ambient walk only runs while the deck is actually on screen.
  useEffect(() => {
    const el = stageRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Ambient advance until the visitor takes over.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = setInterval(() => {
      if (document.hidden || !inViewRef.current || pinnedRef.current || overRef.current) return
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
          ref={stageRef}
          role="radiogroup"
          aria-label="Photography categories"
          className={`relative mx-auto mt-12 h-[480px] max-w-[1680px] touch-pan-y select-none sm:h-[560px] lg:h-[660px] ${
            dragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ perspective: '1400px', WebkitTouchCallout: 'none' }}
          onFocusCapture={() => {
            overRef.current = true
          }}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) overRef.current = false
          }}
          onPointerEnter={() => {
            overRef.current = true
          }}
          onPointerDown={(e) => {
            if (e.button !== 0 || dragRef.current) return
            dragRef.current = { id: e.pointerId, startX: e.clientX, startPos: posRef.current, moved: false, lastX: e.clientX, lastT: performance.now(), v: 0 }
            movedRef.current = false
            leanRef.current = 0
            edgeRef.current = 0
            setDragging(true)
            ensureLoop()
          }}
          onPointerMove={(e) => {
            const drag = dragRef.current
            if (drag) {
              if (e.pointerId !== drag.id) return
              const delta = e.clientX - drag.startX
              if (!drag.moved && Math.abs(delta) > 10) {
                drag.moved = true
                movedRef.current = true
                // Capture only once the drag is real, so plain clicks keep
                // firing on the cards underneath.
                try {
                  e.currentTarget.setPointerCapture(e.pointerId)
                } catch {}
              }
              const now = performance.now()
              const dtMove = Math.max(now - drag.lastT, 1)
              drag.v = 0.8 * ((e.clientX - drag.lastX) / dtMove) + 0.2 * drag.v
              drag.lastX = e.clientX
              drag.lastT = now
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
          onPointerUp={(e) => {
            const drag = dragRef.current
            if (drag && e.pointerId !== drag.id) return
            dragRef.current = null
            setDragging(false)
            if (drag) {
              pinnedRef.current = true
              // Carry the flick, capped; a held-still release throws nothing.
              const v = performance.now() - drag.lastT > 90 ? 0 : drag.v
              const thrown = posRef.current - (v * 160) / DRAG_STEP
              const capped = Math.max(posRef.current - 2.5, Math.min(posRef.current + 2.5, thrown))
              baseRef.current = Math.round(capped)
              leanRef.current = 0
            }
            ensureLoop()
          }}
          onPointerCancel={(e) => {
            if (dragRef.current && e.pointerId !== dragRef.current.id) return
            dragRef.current = null
            setDragging(false)
            baseRef.current = Math.round(posRef.current)
            leanRef.current = 0
            ensureLoop()
          }}
          onLostPointerCapture={() => {
            if (!dragRef.current) return
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
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault()
              goStep(1)
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault()
              goStep(-1)
            }
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
            // The spans permanently occupy the wide box; hovering animates a
            // clip-path reveal, which composites in Safari instead of
            // relayouting and re-rastering the reflection mask every frame.
            const clip = isHovered ? 'inset(0% 0% round 12px)' : 'inset(0% 10.3175% round 12px)'
            const frameTransition = 'clip-path 500ms cubic-bezier(0.32, 0.72, 0, 1), -webkit-clip-path 500ms cubic-bezier(0.32, 0.72, 0, 1)'
            return (
              <button
                key={category.label}
                ref={(el) => {
                  nodesRef.current[i] = el
                }}
                type="button"
                role="radio"
                aria-label={`Show ${category.label}`}
                aria-checked={i === active}
                tabIndex={relativeTo(i, active) === 3 ? -1 : 0}
                onPointerEnter={(e) => {
                  if (e.pointerType !== 'mouse') return
                  if (edgeRef.current === 0 && Math.abs(baseRef.current + leanRef.current - posRef.current) < 0.3) {
                    hoveredRef.current = i
                    setHovered(i)
                    ensureLoop()
                  }
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType !== 'mouse') return
                  if (hoveredRef.current === i) hoveredRef.current = null
                  setHovered((h) => (h === i ? null : h))
                  ensureLoop()
                }}
                onClick={() => {
                  if (movedRef.current) {
                    movedRef.current = false
                    return
                  }
                  if (i !== activeRef.current) go(i)
                }}
                className="absolute left-1/2 top-[38%] w-[240px] sm:w-[320px] lg:w-[420px]"
                style={{ aspectRatio: '5 / 6' }}
              >
                <span
                  className="absolute inset-y-0 block overflow-hidden bg-zinc-950"
                  style={{ left: '-13%', right: '-13%', clipPath: clip, WebkitClipPath: clip, transition: frameTransition }}
                >
                  <Image
                    src={category.image}
                    alt={category.alt}
                    fill
                    quality={80}
                    sizes="(min-width: 1024px) 530px, (min-width: 640px) 405px, 305px"
                    className="object-cover"
                    style={{ objectPosition: category.position || 'center', WebkitUserDrag: 'none' } as CSSProperties}
                    draggable={false}
                    priority={i === 0 || i === 1 || i === 5}
                  />
                  <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
                  <span
                    className="absolute bottom-4 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-white"
                    style={{ left: 'calc(10.3175% + 1.25rem)' }}
                  >
                    {category.label}
                  </span>
                  <span data-dim aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0 }} />
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-full mt-[5px] block h-full overflow-hidden rounded-xl"
                  style={{
                    left: '-13%',
                    right: '-13%',
                    clipPath: clip,
                    WebkitClipPath: clip,
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
                    sizes="(min-width: 1024px) 530px, (min-width: 640px) 405px, 305px"
                    className="object-cover"
                    style={{ objectPosition: category.position || 'center', WebkitUserDrag: 'none' } as CSSProperties}
                    draggable={false}
                  />
                  <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                  <span
                    className="absolute bottom-4 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-white"
                    style={{ left: 'calc(10.3175% + 1.25rem)' }}
                  >
                    {category.label}
                  </span>
                  <span data-dim aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0 }} />
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Pager ── */}
        <div className="mx-auto mt-8 flex max-w-[1680px] items-center gap-6 px-6 sm:px-10 lg:px-16">
          <p className="shrink-0 font-mono text-[12px] font-bold tracking-[0.14em] text-zinc-400">
            <span className="text-brand-red">{String(active + 1).padStart(2, '0')}</span> / 06
            <span className="sr-only" role="status" aria-live="polite">
              {activeCategory.title}, {active + 1} of 6
            </span>
          </p>
          <div className="relative h-px min-w-0 flex-1 bg-white/15">
            <span
              className="absolute inset-0 origin-left bg-brand-red transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `scaleX(${(active + 1) / 6})` }}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              aria-label="Previous category"
              onClick={() => goStep(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white"
            >
              <svg className="h-3.5 w-3.5 rotate-180" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400" aria-hidden>
              Drag
            </span>
            <button
              type="button"
              aria-label="Next category"
              onClick={() => goStep(1)}
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
            <div role="radiogroup" aria-label="Six ways to shoot" className="scrollbar-hide flex gap-8 overflow-x-auto">
              {CATEGORIES.map((category, i) => (
                <button
                  key={category.label}
                  type="button"
                  role="radio"
                  aria-checked={i === active}
                  onClick={() => go(i)}
                  className={`relative shrink-0 pb-3 pt-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                    i === active ? 'text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {category.label}
                  {i === active && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-brand-red" />}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 border-t border-white/[0.08] pt-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
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

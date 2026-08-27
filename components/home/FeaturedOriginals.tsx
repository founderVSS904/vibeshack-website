'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import MediaDialog from '@/components/media/MediaDialog'
import { getFeaturedPlaybackState, getFeaturedVideoEmbedUrl } from '@/lib/home/featuredOriginals'

type FeaturedSlide = {
  title: [string] | [string, string]
  kicker: string
  body: string
  primaryCta: { label: string; href: string; play?: boolean; external?: boolean }
  secondaryCta: { label: string; href: string }
  image: string
  // Sized-down variant served raw via the <video poster> attribute.
  posterSrc?: string
  imageAlt: string
  imagePosition?: string
  // Muted looping background clip; the image doubles as its poster.
  video?: string
  // Poster slides carry their own title art baked into the image, so the big
  // overlay headline is skipped and the copy sits along the bottom edge.
  poster?: boolean
}

const slides: FeaturedSlide[] = [
  {
    title: ['Body', 'Is Tea'],
    kicker: 'A music video by Varii · Directed by Gill',
    body: 'Presented by VibeShack Studios.',
    primaryCta: { label: 'Watch the video', href: 'https://www.youtube.com/watch?v=3Rbir7bu408', play: true, external: true },
    secondaryCta: { label: 'All work', href: '/our-work/' },
    image: '/studio-images/work-body-is-tea-music-v20260708b.jpg',
    posterSrc: '/studio-images/poster-work-body-is-tea-music-v20260708b.jpg',
    imageAlt: 'Body Is Tea music video title card with dancers in a sunny driveway',
    video: '/studio-videos/home-feat-body-is-tea-loop-v20260715.mp4',
    poster: true,
  },
  {
    title: ['The', 'Buzzer'],
    kicker: 'Silicon Mania · Startups pitch billionaires',
    body: 'Founders pitch, investors hold the buzzer.',
    primaryCta: { label: 'Watch the episode', href: 'https://www.youtube.com/watch?v=3mLFnCovlF8', play: true, external: true },
    secondaryCta: { label: 'All work', href: '/our-work/' },
    image: '/studio-images/work-the-buzzer-silicon-mania-v20260708.jpg',
    posterSrc: '/studio-images/poster-work-the-buzzer-silicon-mania-v20260708.jpg',
    imageAlt: 'The Buzzer title card over the Silicon Mania pitch show set',
    imagePosition: 'center 25%',
    video: '/studio-videos/home-feat-the-buzzer-loop-v20260709.mp4',
    poster: true,
  },
  {
    title: ['Wing', 'Battle'],
    kicker: "Melinda's Hot Sauce · Hayward, CA 2025",
    body: "Melinda's Wing Battle event film.",
    primaryCta: { label: 'Watch the film', href: 'https://www.youtube.com/watch?v=tX5nk9EEBHs', play: true, external: true },
    secondaryCta: { label: 'All work', href: '/our-work/' },
    image: '/studio-images/work-wing-battle-grill-v20260717.jpg',
    posterSrc: '/studio-images/poster-work-wing-battle-grill-v20260717.jpg',
    imageAlt: 'Hot wings tossed on a kettle grill at the Wing Battle event',
    video: '/studio-videos/home-feat-wing-battle-loop-v20260717.mp4',
    poster: true,
  },
]

export function FeaturedOriginals() {
  const [index, setIndex] = useState(0)
  const [autoAdvance, setAutoAdvance] = useState(true)
  const [motionPaused, setMotionPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)
  const [inView, setInView] = useState(true)
  const [videoIndex, setVideoIndex] = useState<number | null>(null)
  const carouselId = useId()
  const sectionRef = useRef<HTMLElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const count = slides.length
  const activeVideo = videoIndex === null ? null : slides[videoIndex]
  const embedUrl = activeVideo ? getFeaturedVideoEmbedUrl(activeVideo.primaryCta.href) : null
  const closeVideo = useCallback(() => setVideoIndex(null), [])
  const { playPreview, advanceSlides } = getFeaturedPlaybackState({
    motionPaused,
    reducedMotion,
    inView,
    videoOpen: embedUrl !== null,
    autoAdvance,
    hovered,
    focusWithin,
  })

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => setReducedMotion(query.matches)
    syncMotionPreference()
    query.addEventListener('change', syncMotionPreference)
    return () => query.removeEventListener('change', syncMotionPreference)
  }, [])

  // Offscreen, the carousel neither advances nor plays video.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const go = (next: number) => setIndex((next + count) % count)
  // Manual navigation stops rotation until the visitor explicitly resumes it.
  const manualGo = (next: number) => {
    setAutoAdvance(false)
    go(next)
  }
  const toggleMotion = () => {
    if (motionPaused) {
      setMotionPaused(false)
      setAutoAdvance(true)
    } else {
      setMotionPaused(true)
      setAutoAdvance(false)
    }
  }

  useEffect(() => {
    if (!advanceSlides) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [advanceSlides, count])

  // Only the visible slide's loop plays; the rest sit on their posters.
  useEffect(() => {
    const videos = [...videoRefs.current]
    videos.forEach((video, i) => {
      if (!video) return
      if (playPreview && i === index) {
        void video.play().catch(() => undefined)
      } else {
        video.pause()
      }
    })
    return () => videos.forEach((video) => video?.pause())
  }, [index, playPreview])

  return (
    <>
      <section
        ref={sectionRef}
        className="relative overflow-hidden bg-black"
        aria-roledescription="carousel"
        aria-label="Featured originals and work"
        onPointerEnter={(event) => {
          if (event.pointerType !== 'touch') setHovered(true)
        }}
        onPointerLeave={() => setHovered(false)}
        onFocusCapture={() => setFocusWithin(true)}
        onBlurCapture={(event) => {
          if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
            setFocusWithin(false)
          }
        }}
      >
        <button
          type="button"
          onClick={toggleMotion}
          disabled={reducedMotion}
          aria-controls={carouselId}
          title={reducedMotion ? 'Reduced motion is on. Use the arrows to browse featured work.' : undefined}
          className="absolute left-6 top-8 z-10 inline-flex h-10 items-center gap-2 rounded-full border border-white/25 bg-black/70 px-4 text-xs font-bold text-white backdrop-blur transition-colors hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:cursor-default sm:left-12 lg:left-24 lg:top-12"
        >
          {motionPaused && !reducedMotion ? (
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <path d="M2 1.5v9l8-4.5-8-4.5z" />
            </svg>
          ) : (
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <path d="M2 1h3v10H2zm5 0h3v10H7z" />
            </svg>
          )}
          {reducedMotion ? 'Motion paused' : motionPaused ? 'Resume motion' : 'Pause motion'}
        </button>
        <div
          id={carouselId}
          className="flex transition-transform duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <article
              key={slide.kicker}
              className="relative min-h-[520px] w-full flex-shrink-0 sm:min-h-[640px] lg:min-h-[76vh]"
              aria-hidden={i !== index}
            >
              {slide.video ? (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el
                  }}
                  src={slide.video}
                  poster={slide.posterSrc ?? slide.image}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: slide.imagePosition || 'center' }}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={slide.imageAlt}
                />
              ) : (
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  loading="lazy"
                  quality={85}
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: slide.imagePosition || 'center' }}
                />
              )}
              {slide.poster ? (
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.25)_22%,rgba(0,0,0,0)_40%)]" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.74)_32%,rgba(0,0,0,0.18)_60%,rgba(0,0,0,0.05)_100%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0)_32%)]" />
                </>
              )}

              <div
                className={`relative z-10 mx-auto flex h-full min-h-[520px] w-full max-w-[1680px] flex-col gap-5 px-6 sm:min-h-[640px] sm:px-12 lg:min-h-[76vh] lg:px-24 ${
                  slide.poster ? 'justify-end pb-14 pt-20 sm:pb-16' : 'justify-center py-20'
                }`}
              >
                <div className="lg:max-w-[52%]">
                  {slide.poster ? (
                    <h2 className="sr-only">
                      {slide.title[0]} {slide.title[1]}
                    </h2>
                  ) : (
                    <h2 className="mt-5 text-4xl font-black uppercase leading-[0.92] text-white sm:text-6xl lg:text-7xl">
                      {slide.title[0]}
                      {slide.title[1] && (
                        <>
                          <br />
                          {slide.title[1]}
                        </>
                      )}
                    </h2>
                  )}
                  {!slide.poster && (
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
                      {slide.body}
                    </p>
                  )}
                  <div className={`flex flex-wrap items-center gap-5 ${slide.poster ? 'mt-6' : 'mt-8'}`}>
                    <Link
                      href={slide.primaryCta.href}
                      target={slide.primaryCta.external ? '_blank' : undefined}
                      rel={slide.primaryCta.external ? 'noopener noreferrer' : undefined}
                      aria-haspopup={getFeaturedVideoEmbedUrl(slide.primaryCta.href) ? 'dialog' : undefined}
                      aria-label={`${slide.primaryCta.label}: ${slide.title.join(' ')}`}
                      onClick={(event) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
                        if (!getFeaturedVideoEmbedUrl(slide.primaryCta.href)) return
                        event.preventDefault()
                        event.currentTarget.focus({ preventScroll: true })
                        setVideoIndex(i)
                      }}
                      className="inline-flex items-center gap-2.5 rounded-md bg-brand-red px-6 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                      tabIndex={i === index ? undefined : -1}
                    >
                      {slide.primaryCta.play && (
                        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                          <path d="M2 1.5v9l8-4.5-8-4.5z" />
                        </svg>
                      )}
                      {slide.primaryCta.label}
                    </Link>
                    <Link
                      href={slide.secondaryCta.href}
                      className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/80 transition-colors hover:text-white"
                      tabIndex={i === index ? undefined : -1}
                    >
                      {slide.secondaryCta.label} <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="absolute right-6 top-8 z-10 flex items-center gap-2.5 sm:right-12 lg:right-24 lg:top-12">
          <button
            type="button"
            aria-label="Previous featured item"
            onClick={() => manualGo(index - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/80 backdrop-blur transition-colors hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next featured item"
            onClick={() => manualGo(index + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/80 backdrop-blur transition-colors hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="absolute bottom-7 right-4 z-10 flex items-center sm:right-10 lg:right-[86px]">
          {slides.map((slide, i) => (
            <button
              key={slide.kicker}
              type="button"
              aria-label={`Go to slide ${i + 1}: ${slide.title.join(' ')}`}
              aria-current={i === index}
              onClick={() => manualGo(i)}
              className="group/dot flex h-8 min-w-8 items-center justify-center px-2"
            >
              <span
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                  i === index ? 'w-6 bg-brand-red' : 'w-1.5 bg-white/50 group-hover/dot:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>
      </section>
      <MediaDialog
        open={embedUrl !== null}
        onClose={closeVideo}
        title={activeVideo ? activeVideo.title.join(' ') : 'Featured video'}
        description={activeVideo?.kicker}
      >
        {activeVideo && embedUrl && (
          <>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                key={embedUrl}
                src={embedUrl}
                title={`${activeVideo.title.join(' ')} video`}
                className="absolute inset-0 h-full w-full border-0"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <p className="px-5 py-4 text-sm text-white/70">
              Trouble playing?{' '}
              <a
                href={activeVideo.primaryCta.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeVideo}
                className="font-semibold text-white underline underline-offset-4 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red"
              >
                Watch on YouTube
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          </>
        )}
      </MediaDialog>
    </>
  )
}

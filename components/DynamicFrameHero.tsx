'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'

type Frame = {
  label: string
  labelLines?: string[]
  eyebrow: string
  href: string
  image: string
  alt: string
  position?: string
  accent: string
  // Muted clips that play while the tile is hovered or focused.
  videos?: string[]
}

const frames: Frame[] = [
  {
    label: 'Podcasts',
    eyebrow: 'Rooms, crew, cameras',
    href: '/podcast-studio-san-francisco/',
    image: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg',
    alt: 'Two-host podcast setup inside VibeShack Studios',
    position: 'center 45%',
    accent: '#ff2a1f',
    videos: ['/studio-videos/home-tile-podcasts-loop-v20260709d.mp4'],
  },
  {
    label: 'Video Production',
    labelLines: ['Video', 'Production'],
    eyebrow: 'Brand films, ads, product',
    href: '/video-production/',
    image: '/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg',
    alt: 'Video production crew setting lights inside VibeShack Studios',
    position: 'center 48%',
    accent: '#f6f6f6',
    videos: [
      '/studio-videos/home-tile-damian-stone-loop-v20260710.mp4',
      '/studio-videos/home-tile-video-production-loop-v20260709b.mp4',
    ],
  },
  {
    label: 'Our Work',
    eyebrow: 'Portfolio, proof, taste',
    href: '/our-work/',
    image: '/studio-images/canvas-rental-music-v1775095665.jpg',
    alt: 'Portfolio work and music video production inside a VibeShack Studios rental space',
    position: 'center',
    accent: '#ff2a1f',
    videos: ['/studio-videos/home-tile-our-work-loop-v20260709d.mp4'],
  },
  {
    label: 'Photography',
    eyebrow: 'Portraits, products, campaigns',
    href: '/photo-services/',
    image: '/studio-images/photo-gallery-direct-beauty-portrait-v20260520.jpg',
    alt: 'Photography services portrait created at VibeShack Studios',
    position: 'center 42%',
    accent: '#f6f6f6',
    videos: ['/studio-videos/home-tile-photography-loop-v20260709.mp4'],
  },
  {
    label: 'Branding',
    eyebrow: 'Identity, content systems',
    href: '/branding/',
    image: '/studio-images/home-branding-pure-magic-v20260625.png',
    alt: 'Pure Magic product branding image for VibeShack Studios',
    position: 'center',
    accent: '#ff2a1f',
    videos: ['/studio-videos/home-tile-branding-loop-v20260709e.mp4'],
  },
  {
    label: 'Rentals',
    eyebrow: 'White cyc, green screen',
    href: '/rental-studios/',
    image: '/studio-images/canvas-rental-space-v20260509.jpg',
    alt: 'White cyc rental studio inside VibeShack Studios',
    position: 'center 45%',
    accent: '#f6f6f6',
  },
]

export function DynamicFrameHero() {
  const [activeFrame, setActiveFrame] = useState<string | null>(null)
  const [videoIndices, setVideoIndices] = useState<Record<string, number>>({})
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
  const activeIndex = activeFrame ? Number(activeFrame) - 1 : null
  const activeColumn = activeIndex !== null ? String((activeIndex % 3) + 1) : undefined
  const activeRow = activeIndex !== null ? String(Math.floor(activeIndex / 3) + 1) : undefined

  // Play the hovered tile's loop; rewind the rest so the next hover starts fresh.
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    videoRefs.current.forEach((video, frameIndex) => {
      if (frameIndex === activeFrame && !reducedMotion) {
        void video.play().catch(() => undefined)
      } else {
        video.pause()
        video.currentTime = 0
      }
    })
  }, [activeFrame, videoIndices])

  const activateFrame = (frameIndex: string) => {
    setActiveFrame((currentFrame) => currentFrame === frameIndex ? currentFrame : frameIndex)
  }

  const clearFrame = () => {
    setActiveFrame((currentFrame) => currentFrame === null ? currentFrame : null)
  }

  return (
    <section className="dynamic-frame-hero bg-black" aria-labelledby="dynamic-frame-title">
      <h1 id="dynamic-frame-title" className="sr-only">
        VibeShack Studios production studios in San Francisco
      </h1>
      <div
        className="dynamic-frame-grid"
        data-active={activeFrame ?? undefined}
        data-active-column={activeColumn}
        data-active-row={activeRow}
        onMouseLeave={clearFrame}
        onPointerLeave={clearFrame}
        onPointerCancel={clearFrame}
      >
        {[0, 1].map((rowIndex) => (
          <div key={rowIndex} className="dynamic-frame-row" data-row={rowIndex + 1}>
            {frames.slice(rowIndex * 3, rowIndex * 3 + 3).map((frame, columnIndex) => {
              const index = rowIndex * 3 + columnIndex
              const frameIndex = String(index + 1)
              const frameVideos = frame.videos ?? []
              const activeVideoIndex = videoIndices[frameIndex] ?? 0
              const activeVideo = frameVideos.length > 0
                ? frameVideos[activeVideoIndex % frameVideos.length]
                : undefined

              return (
                <Link
                  key={frame.label}
                  href={frame.href}
                  className="dynamic-frame-tile group"
                  data-column={columnIndex + 1}
                  data-frame={frame.label.toLowerCase().replace(/\s+/g, '-')}
                  data-state={activeFrame === frameIndex ? 'active' : undefined}
                  onPointerEnter={() => activateFrame(frameIndex)}
                  onFocus={() => activateFrame(frameIndex)}
                  onBlur={clearFrame}
                  style={{ '--frame-accent': frame.accent, '--frame-index': index } as CSSProperties}
                >
                  <Image
                    src={frame.image}
                    alt={frame.alt}
                    fill
                    priority
                    quality={72}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="dynamic-frame-image"
                    style={{ objectPosition: frame.position || 'center' }}
                  />
                  {activeVideo && (
                    <video
                      key={activeVideo}
                      ref={(el) => {
                        if (el) videoRefs.current.set(frameIndex, el)
                        else videoRefs.current.delete(frameIndex)
                      }}
                      src={activeVideo}
                      muted
                      loop={frameVideos.length === 1}
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                      className="dynamic-frame-video"
                      style={{ objectPosition: frame.position || 'center' }}
                      onEnded={() => {
                        if (frameVideos.length < 2) return
                        setVideoIndices((currentIndices) => ({
                          ...currentIndices,
                          [frameIndex]: ((currentIndices[frameIndex] ?? 0) + 1) % frameVideos.length,
                        }))
                      }}
                    />
                  )}
                  <div className="dynamic-frame-vignette" />
                  <div className="dynamic-frame-noise" aria-hidden="true" />
                  <div className="dynamic-frame-copy">
                    <p className="dynamic-frame-eyebrow">{frame.eyebrow}</p>
                    <p className="dynamic-frame-label" aria-label={frame.label}>
                      {frame.labelLines
                        ? frame.labelLines.map((line) => (
                            <span key={line} aria-hidden="true" className="block">
                              {line}
                            </span>
                          ))
                        : frame.label}
                    </p>
                    <span className="dynamic-frame-cta">Explore</span>
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

'use client'

import Image from 'next/image'
import { useRef } from 'react'

// Card media for the work grids: a still at rest, and when a hover clip is
// provided, a muted loop that fades in over it on mouse hover and rewinds on
// leave. The clip never loads until the first hover, and reduced-motion
// visitors keep the still.
export default function WorkCardMedia({
  image,
  alt,
  clip,
  objectPosition,
  sizes,
  imageClassName,
}: {
  image: string
  alt: string
  clip?: string
  objectPosition?: string
  sizes: string
  imageClassName: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Metadata preloads up front (the pattern the homepage tiles use, proven
  // in Safari); the full clip only downloads once play() runs on hover.
  const enter = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || !clip) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const video = videoRef.current
    if (!video) return
    // Safari can stall play() on a pipeline that never initialized.
    if (video.readyState === 0) video.load()
    video.style.opacity = '1'
    void video.play().catch(() => {
      // Blocked or interrupted playback falls back to the still.
      video.style.opacity = '0'
    })
  }

  const leave = () => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    if (video.readyState > 0) video.currentTime = 0
    video.style.opacity = '0'
  }

  return (
    <span className="absolute inset-0 block" onPointerEnter={enter} onPointerLeave={leave}>
      <Image
        src={image}
        alt={alt}
        fill
        className={imageClassName}
        style={{ objectPosition: objectPosition || 'center' }}
        sizes={sizes}
      />
      {clip && (
        <video
          ref={videoRef}
          src={clip}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[420ms] ease-out"
          style={{ objectPosition: objectPosition || 'center' }}
        />
      )}
    </span>
  )
}

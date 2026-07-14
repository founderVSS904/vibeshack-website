'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

type OurWorkShowreelProps = {
  src: string
  poster: string
  posterAlt: string
}

export function OurWorkShowreel({ src, poster, posterAlt }: OurWorkShowreelProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [motionAllowed, setMotionAllowed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => setMotionAllowed(!motionQuery.matches)

    syncMotionPreference()
    motionQuery.addEventListener('change', syncMotionPreference)
    return () => motionQuery.removeEventListener('change', syncMotionPreference)
  }, [])

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      void video.play().catch(() => setIsPlaying(false))
    } else {
      video.pause()
    }
  }

  return (
    <div className="absolute inset-0">
      <Image
        src={poster}
        alt={posterAlt}
        fill
        priority
        quality={85}
        className="object-cover"
        style={{ objectPosition: '70% center' }}
        sizes="100vw"
      />

      {motionAllowed && (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <button
            type="button"
            onClick={togglePlayback}
            className="absolute bottom-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm transition-colors hover:border-white/70 hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red sm:bottom-7 sm:right-8"
            aria-label={isPlaying ? 'Pause showreel' : 'Play showreel'}
            title={isPlaying ? 'Pause showreel' : 'Play showreel'}
          >
            {isPlaying ? (
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M4 3.25h3v9.5H4zM9 3.25h3v9.5H9z" />
              </svg>
            ) : (
              <svg className="ml-0.5 h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M4.5 2.75v10.5L13 8 4.5 2.75z" />
              </svg>
            )}
          </button>
        </>
      )}
    </div>
  )
}

'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

type ProjectVideoPlayerProps = {
  src: string
  poster: string
  alt: string
  objectPosition?: string
  categoryLabel: string
  detail: string
}

export function ProjectVideoPlayer({
  src,
  poster,
  alt,
  objectPosition = 'center',
  categoryLabel,
  detail,
}: ProjectVideoPlayerProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [hasError, setHasError] = useState(false)
  // Assume support during SSR and the first client render, then correct after
  // mount so devices without element fullscreen (iPhone Safari) hide the
  // affordance instead of offering a dead control.
  const [fullscreenSupported, setFullscreenSupported] = useState(true)

  useEffect(() => {
    setFullscreenSupported(Boolean(document.fullscreenEnabled))
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === frameRef.current)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullView = async () => {
    const frame = frameRef.current

    if (!frame || isOpening) {
      return
    }

    if (document.fullscreenElement === frame) {
      try {
        await document.exitFullscreen?.()
      } catch {
        // Ignore denied exits; Esc still works natively.
      }
      return
    }

    if (hasError) {
      return
    }

    setIsOpening(true)

    try {
      // Fullscreen first: it must run inside the user-activation window, and
      // awaiting playback before it can let that window expire.
      await frame.requestFullscreen?.()
      if (!isPaused) {
        void videoRef.current?.play().catch(() => undefined)
      }
    } catch {
      // Some browsers can deny fullscreen. The inline player still keeps playing.
    } finally {
      setIsOpening(false)
    }
  }

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video || hasError) return

    // isPaused follows the element's own play/pause events, so the label stays
    // honest even when the browser suspends playback on its own.
    if (video.paused) {
      void video.play().catch(() => undefined)
    } else {
      video.pause()
    }
  }

  const statusLabel = hasError ? 'Video unavailable' : isPaused ? 'Loop paused' : 'Playing concept loop'
  const showFullViewControl = fullscreenSupported && (!hasError || isFullscreen)

  return (
    <div
      ref={frameRef}
      data-project-video-player
      className="project-video-player relative overflow-hidden rounded-lg border border-white/10 bg-black"
    >
      <div className="project-video-player-inner relative aspect-video min-h-[360px]">
        {hasError ? (
          <Image src={poster} alt={alt} fill className="object-cover" style={{ objectPosition }} />
        ) : (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="h-full w-full object-cover"
            style={{ objectPosition }}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setHasError(true)}
            onPlay={() => setIsPaused(false)}
            onPause={() => setIsPaused(true)}
          />
        )}
        <div className="project-video-player-vignette pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0)_48%,rgba(0,0,0,0.72)_100%)]" />
        {showFullViewControl && (
          <button
            type="button"
            data-fullview
            aria-label={isFullscreen ? `Exit full view of ${alt}` : `Open ${alt} in full view`}
            className="absolute inset-0 h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-red"
            onClick={() => void toggleFullView()}
          />
        )}
        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 backdrop-blur">
          {statusLabel}
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {!hasError && (
            <button
              type="button"
              aria-label={isPaused ? 'Play video loop' : 'Pause video loop'}
              className="rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 backdrop-blur transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              onClick={togglePlayback}
            >
              {isPaused ? 'Play' : 'Pause'}
            </button>
          )}
          {showFullViewControl && (
            <div className="pointer-events-none rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 backdrop-blur">
              {isFullscreen ? 'Exit full view' : isOpening ? 'Opening' : 'Full view'}
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">{categoryLabel}</p>
            <p className="mt-1 text-sm text-white/75">{detail}</p>
          </div>
          <div className="hidden h-1 w-40 overflow-hidden rounded-full bg-white/15 sm:block">
            <span className="block h-full w-2/3 bg-brand-red" />
          </div>
        </div>
      </div>
    </div>
  )
}

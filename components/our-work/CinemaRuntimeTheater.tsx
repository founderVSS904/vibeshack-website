'use client'

import Image from 'next/image'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { CSSProperties, VideoHTMLAttributes } from 'react'

const SAMPLE_WIDTH = 8
const SAMPLE_HEIGHT = 4
const SMOOTHING_ALPHA = 0.3
const MAX_TUNED_CHANNEL = 0.815
const RUNTIME_ASSET_ROOT = '/studio-videos/cinema/runtime-v017'

const responseFamilies = ['diffuse', 'lower', 'stage', 'glossy', 'rear'] as const
type ResponseFamily = (typeof responseFamilies)[number]
type Rgb = [number, number, number]

type FamilySamples = Record<ResponseFamily, Rgb[]>

type CinemaRuntimeTheaterProps = {
  src: string
  title: string
  muted: boolean
  screenFit: 'contain' | 'cover'
  screenPosition: { x: number; y: number }
  screeningActive: boolean
  ending: boolean
  onCanPlay: NonNullable<VideoHTMLAttributes<HTMLVideoElement>['onCanPlay']>
  onLoadedMetadata: NonNullable<VideoHTMLAttributes<HTMLVideoElement>['onLoadedMetadata']>
  onPlay: NonNullable<VideoHTMLAttributes<HTMLVideoElement>['onPlay']>
  onPause: NonNullable<VideoHTMLAttributes<HTMLVideoElement>['onPause']>
  onTimeUpdate: NonNullable<VideoHTMLAttributes<HTMLVideoElement>['onTimeUpdate']>
  onEnded: NonNullable<VideoHTMLAttributes<HTMLVideoElement>['onEnded']>
  onError: NonNullable<VideoHTMLAttributes<HTMLVideoElement>['onError']>
}

function blankFamilySamples(): FamilySamples {
  return Object.fromEntries(
    responseFamilies.map((family) => [
      family,
      Array.from({ length: 4 }, (): Rgb => [0, 0, 0]),
    ]),
  ) as FamilySamples
}

function drawPresentedVideo(
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  fit: 'contain' | 'cover',
  position: { x: number; y: number },
) {
  const sourceWidth = video.videoWidth
  const sourceHeight = video.videoHeight
  const outputWidth = context.canvas.width
  const outputHeight = context.canvas.height
  if (!sourceWidth || !sourceHeight || !outputWidth || !outputHeight) return false

  const scale = fit === 'cover'
    ? Math.max(outputWidth / sourceWidth, outputHeight / sourceHeight)
    : Math.min(outputWidth / sourceWidth, outputHeight / sourceHeight)
  const drawWidth = sourceWidth * scale
  const drawHeight = sourceHeight * scale
  const drawX = (outputWidth - drawWidth) * position.x
  const drawY = (outputHeight - drawHeight) * position.y

  context.clearRect(0, 0, outputWidth, outputHeight)
  context.fillStyle = '#000'
  context.fillRect(0, 0, outputWidth, outputHeight)
  context.drawImage(video, drawX, drawY, drawWidth, drawHeight)
  return true
}

function averageRegion(
  pixels: Uint8ClampedArray,
  xStart: number,
  xEnd: number,
  yStart = 0,
  yEnd = SAMPLE_HEIGHT,
): Rgb {
  const total: Rgb = [0, 0, 0]
  let count = 0
  for (let y = yStart; y < yEnd; y += 1) {
    for (let x = xStart; x < xEnd; x += 1) {
      const offset = (y * SAMPLE_WIDTH + x) * 4
      total[0] += pixels[offset] / 255
      total[1] += pixels[offset + 1] / 255
      total[2] += pixels[offset + 2] / 255
      count += 1
    }
  }
  return [total[0] / count, total[1] / count, total[2] / count]
}

function sampleResponseFamilies(pixels: Uint8ClampedArray): FamilySamples {
  const zones = (yStart = 0, yEnd = SAMPLE_HEIGHT) =>
    Array.from({ length: 4 }, (_, zone) =>
      averageRegion(pixels, zone * 2, zone * 2 + 2, yStart, yEnd),
    )

  return {
    diffuse: zones(),
    lower: zones(0, 2),
    stage: zones(0, 1),
    glossy: zones(1, 4),
    rear: zones(),
  }
}

function smoothSamples(previous: FamilySamples, current: FamilySamples) {
  for (const family of responseFamilies) {
    for (let zone = 0; zone < 4; zone += 1) {
      for (let channel = 0; channel < 3; channel += 1) {
        previous[family][zone][channel] =
          previous[family][zone][channel] * (1 - SMOOTHING_ALPHA)
          + current[family][zone][channel] * SMOOTHING_ALPHA
      }
    }
  }
}

function lightStyle(rgb: Rgb) {
  const luminance = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
  const peak = Math.max(rgb[0], rgb[1], rgb[2], 0.0001)
  const tuned = rgb.map((channel) => {
    const normalized = channel / peak
    return Math.min(1, (0.055 + Math.pow(normalized, 0.8) * 0.76) / MAX_TUNED_CHANNEL)
  })
  return {
    color: `rgb(${Math.round(tuned[0] * 255)} ${Math.round(tuned[1] * 255)} ${Math.round(tuned[2] * 255)})`,
    opacity: Math.sqrt(Math.max(0, Math.min(1, luminance))),
  }
}

export const CinemaRuntimeTheater = forwardRef<HTMLVideoElement, CinemaRuntimeTheaterProps>(
  function CinemaRuntimeTheater(
    {
      src,
      title,
      muted,
      screenFit,
      screenPosition,
      screeningActive,
      ending,
      onCanPlay,
      onLoadedMetadata,
      onPlay,
      onPause,
      onTimeUpdate,
      onEnded,
      onError,
    },
    forwardedRef,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const sampleCanvasRef = useRef<HTMLCanvasElement>(null)
    const fillCanvasRef = useRef<HTMLCanvasElement>(null)
    const lightRefs = useRef(new Map<string, HTMLDivElement>())
    const smoothedSamplesRef = useRef(blankFamilySamples())

    useImperativeHandle(forwardedRef, () => videoRef.current as HTMLVideoElement)

    useEffect(() => {
      const video = videoRef.current
      const sampleCanvas = sampleCanvasRef.current
      const fillCanvas = fillCanvasRef.current
      if (!video || !sampleCanvas || !fillCanvas) return

      const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true })
      const fillContext = fillCanvas.getContext('2d')
      if (!sampleContext || !fillContext) return

      let cancelled = false
      let videoFrameId: number | null = null
      let animationFrameId: number | null = null
      let lastFallbackTime = -1

      const resetLighting = () => {
        smoothedSamplesRef.current = blankFamilySamples()
        for (const light of lightRefs.current.values()) light.style.opacity = '0'
        fillContext.clearRect(0, 0, fillCanvas.width, fillCanvas.height)
      }

      const sampleFrame = () => {
        if (!screeningActive || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return
        try {
          drawPresentedVideo(fillContext, video, 'cover', screenPosition)
          if (!drawPresentedVideo(sampleContext, video, screenFit, screenPosition)) return
          const pixels = sampleContext.getImageData(
            0,
            0,
            SAMPLE_WIDTH,
            SAMPLE_HEIGHT,
          ).data
          smoothSamples(smoothedSamplesRef.current, sampleResponseFamilies(pixels))

          for (const family of responseFamilies) {
            for (let zone = 0; zone < 4; zone += 1) {
              const light = lightRefs.current.get(`${family}-${zone + 1}`)
              if (!light) continue
              const { color, opacity } = lightStyle(smoothedSamplesRef.current[family][zone])
              light.style.backgroundColor = color
              light.style.opacity = String(opacity)
            }
          }
        } catch {
          // A future CDN without CORS may taint the canvas. Playback remains
          // usable with the neutral Blender playing plate and no sampled spill.
          resetLighting()
        }
      }

      const scheduleVideoFrame = () => {
        if (cancelled) return
        const frameVideo = video as HTMLVideoElement & {
          requestVideoFrameCallback?: (callback: () => void) => number
          cancelVideoFrameCallback?: (handle: number) => void
        }
        if (typeof frameVideo.requestVideoFrameCallback === 'function') {
          videoFrameId = frameVideo.requestVideoFrameCallback(() => {
            sampleFrame()
            scheduleVideoFrame()
          })
          return
        }
        const tick = () => {
          if (video.currentTime !== lastFallbackTime) {
            lastFallbackTime = video.currentTime
            sampleFrame()
          }
          if (!cancelled) animationFrameId = requestAnimationFrame(tick)
        }
        animationFrameId = requestAnimationFrame(tick)
      }

      const sampleCurrentFrame = () => sampleFrame()
      video.addEventListener('loadeddata', sampleCurrentFrame)
      video.addEventListener('seeked', sampleCurrentFrame)

      if (screeningActive) {
        sampleFrame()
        scheduleVideoFrame()
      } else {
        resetLighting()
      }

      return () => {
        cancelled = true
        video.removeEventListener('loadeddata', sampleCurrentFrame)
        video.removeEventListener('seeked', sampleCurrentFrame)
        const frameVideo = video as HTMLVideoElement & {
          cancelVideoFrameCallback?: (handle: number) => void
        }
        if (videoFrameId !== null && typeof frameVideo.cancelVideoFrameCallback === 'function') {
          frameVideo.cancelVideoFrameCallback(videoFrameId)
        }
        if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
      }
    }, [screenFit, screenPosition, screeningActive, src])

    const positionStyle = {
      '--cinema-screen-position': `${screenPosition.x * 100}% ${screenPosition.y * 100}%`,
    } as CSSProperties

    return (
      <div
        className={`cinema-runtime-stage ${screeningActive ? 'is-screening-active' : ''} ${ending ? 'is-ending' : ''}`}
        aria-hidden="true"
      >
        <Image
          className="cinema-runtime-plate cinema-runtime-idle"
          src={`${RUNTIME_ASSET_ROOT}/theater_idle.png`}
          alt=""
          fill
          sizes="100vw"
          priority
          unoptimized
        />
        <div className="cinema-runtime-playing">
          <Image
            className="cinema-runtime-plate cinema-runtime-playing-base"
            src={`${RUNTIME_ASSET_ROOT}/theater_playing_base.png`}
            alt=""
            fill
            sizes="100vw"
            priority
            unoptimized
          />
          <div className="cinema-runtime-screen" style={positionStyle}>
            <canvas
              ref={fillCanvasRef}
              className={`cinema-runtime-screen-fill ${screenFit === 'contain' ? 'is-visible' : ''}`}
              width="840"
              height="352"
            />
            <video
              ref={videoRef}
              className="cinema-runtime-source-video"
              data-screen-fit={screenFit}
              crossOrigin="anonymous"
              src={src}
              preload="metadata"
              playsInline
              muted={muted}
              onCanPlay={onCanPlay}
              onLoadedMetadata={onLoadedMetadata}
              onPlay={onPlay}
              onPause={onPause}
              onTimeUpdate={onTimeUpdate}
              onEnded={onEnded}
              onError={onError}
              aria-label={`${title} playing on the VibeShack theater screen`}
            />
          </div>
          <div className="cinema-runtime-light-stack">
            {responseFamilies.flatMap((family) =>
              Array.from({ length: 4 }, (_, index) => {
                const zone = index + 1
                const key = `${family}-${zone}`
                return (
                  <div
                    key={key}
                    ref={(node) => {
                      if (node) lightRefs.current.set(key, node)
                      else lightRefs.current.delete(key)
                    }}
                    className="cinema-runtime-light"
                    style={{
                      '--cinema-light-mask': `url("${RUNTIME_ASSET_ROOT}/theater_light_${family}_zone_${zone}.png")`,
                    } as CSSProperties}
                  />
                )
              }),
            )}
          </div>
        </div>
        <canvas
          ref={sampleCanvasRef}
          className="cinema-runtime-sampler"
          width={SAMPLE_WIDTH}
          height={SAMPLE_HEIGHT}
        />
      </div>
    )
  },
)

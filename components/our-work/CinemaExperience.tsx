'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, WheelEvent } from 'react'
import type { CinemaProject } from '@/lib/cinema/cinemaCatalog'
import { CinemaRuntimeTheater } from './CinemaRuntimeTheater'

type CinemaExperienceProps = {
  projects: CinemaProject[]
}

type WebkitFullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void
  webkitFullscreenElement?: Element | null
}

type WebkitFullscreenVideo = HTMLVideoElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
  webkitEnterFullscreen?: () => void
  webkitExitFullscreen?: () => void
  webkitDisplayingFullscreen?: boolean
}

type FullscreenSession = {
  target: WebkitFullscreenVideo
  theater: HTMLVideoElement
  separateSource: boolean
  theaterOffsetSeconds: number
  theaterWasPlaying: boolean
  screeningWasActive: boolean
  playbackShouldContinue: boolean
  resumeTheaterAfterFilmEnd: boolean
  nativeVideoFullscreen: boolean
  entered: boolean
  restoring: boolean
  launcher: HTMLElement | null
}

const CHROME_FADE_OUT_SECONDS = 0.45
const LIGHTS_UP_SECONDS = 2.002

function getFullscreenElement() {
  return document.fullscreenElement
    ?? (document as WebkitFullscreenDocument).webkitFullscreenElement
    ?? null
}

function clampMediaTime(video: HTMLVideoElement, seconds: number) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0
  return Number.isFinite(video.duration)
    ? Math.min(safeSeconds, Math.max(0, video.duration))
    : safeSeconds
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '00:00'
  const whole = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(whole / 3600)
  const minutes = Math.floor((whole % 3600) / 60)
  const clock = `${String(minutes).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`
  return hours > 0 ? `${String(hours).padStart(2, '0')}:${clock}` : clock
}

export function CinemaExperience({ projects }: CinemaExperienceProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [screeningActive, setScreeningActive] = useState(false)
  const [ending, setEnding] = useState(false)
  const [chromeHidden, setChromeHidden] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null)
  const fullscreenSessionRef = useRef<FullscreenSession | null>(null)
  const chromeRef = useRef<HTMLDivElement>(null)
  const playbackActionsRef = useRef<HTMLDivElement>(null)
  const playButtonRef = useRef<HTMLButtonElement>(null)
  const browseReturnRef = useRef<HTMLButtonElement>(null)
  const cardRefs = useRef(new Map<string, HTMLButtonElement>())

  const selected = projects[selectedIndex]
  const usesSeparateFullscreenSource = selected.fullscreenSrc !== selected.cinemaSrc
  const showSelectedClient = selected.client.trim().toLowerCase() !== selected.title.trim().toLowerCase()

  const finishFullscreenSession = useCallback(() => {
    const session = fullscreenSessionRef.current
    if (!session || session.restoring) return
    session.restoring = true

    const { target, theater } = session
    target.controls = false
    if (session.separateSource) target.setAttribute('aria-hidden', 'true')
    setMuted(target.muted)

    if (session.separateSource) {
      const nextTime = clampMediaTime(
        theater,
        target.currentTime + session.theaterOffsetSeconds,
      )
      const nextDuration = Number.isFinite(theater.duration) ? theater.duration : 0
      const lightsUpBegins = Math.max(0, nextDuration - LIGHTS_UP_SECONDS)
      const shouldResume = session.resumeTheaterAfterFilmEnd || session.playbackShouldContinue

      target.pause()
      theater.currentTime = nextTime
      theater.muted = target.muted
      theater.volume = target.volume
      theater.playbackRate = target.playbackRate
      setCurrentTime(nextTime)
      setDuration(nextDuration)
      setEnding(nextDuration > 0 && nextTime >= lightsUpBegins)
      setScreeningActive(session.screeningWasActive || nextTime > 0 || shouldResume)
      setChromeHidden(
        shouldResume
        && nextTime >= CHROME_FADE_OUT_SECONDS
        && nextTime < lightsUpBegins,
      )

      if (shouldResume && (!nextDuration || nextTime < nextDuration - 0.01)) {
        void theater.play().catch(() => {
          setPlaying(false)
          setChromeHidden(false)
          setError('The film returned to the theater paused. Press play to continue.')
        })
      } else {
        theater.pause()
        setPlaying(false)
        setChromeHidden(false)
      }
    }

    const launcher = session.launcher
    fullscreenSessionRef.current = null
    setIsFullscreen(false)
    window.setTimeout(() => {
      if (launcher?.isConnected) launcher.focus({ preventScroll: true })
    }, 0)
  }, [])

  useEffect(() => {
    const chrome = chromeRef.current
    const playbackActions = playbackActionsRef.current
    const browseReturn = browseReturnRef.current
    if (!chrome) return
    if (chromeHidden) {
      if (document.activeElement instanceof Node && chrome.contains(document.activeElement)) {
        browseReturn?.focus({ preventScroll: true })
      }
      chrome.setAttribute('aria-hidden', 'true')
      chrome.setAttribute('inert', '')
    } else {
      chrome.removeAttribute('inert')
      chrome.setAttribute('aria-hidden', 'false')
      if (
        playbackActions
        && document.activeElement instanceof Node
        && playbackActions.contains(document.activeElement)
      ) {
        playButtonRef.current?.focus({ preventScroll: true })
      }
    }
  }, [chromeHidden])

  useEffect(() => {
    const syncFullscreenState = () => {
      const session = fullscreenSessionRef.current
      const fullscreenElement = getFullscreenElement()
      if (!session) {
        setIsFullscreen(false)
        return
      }
      if (fullscreenElement === session.target) {
        session.entered = true
        setIsFullscreen(true)
        return
      }
      if (session.entered) finishFullscreenSession()
    }

    document.addEventListener('fullscreenchange', syncFullscreenState)
    document.addEventListener('webkitfullscreenchange', syncFullscreenState)
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState)
      document.removeEventListener('webkitfullscreenchange', syncFullscreenState)
    }
  }, [finishFullscreenSession])

  useEffect(() => {
    const candidates = [videoRef.current, fullscreenVideoRef.current].filter(
      (video): video is HTMLVideoElement => Boolean(video),
    )
    const handleBeginFullscreen = (event: Event) => {
      const session = fullscreenSessionRef.current
      if (!session || event.currentTarget !== session.target) return
      session.entered = true
      session.nativeVideoFullscreen = true
      setIsFullscreen(true)
    }
    const handleEndFullscreen = (event: Event) => {
      const session = fullscreenSessionRef.current
      if (!session || event.currentTarget !== session.target) return
      finishFullscreenSession()
    }

    for (const video of candidates) {
      video.addEventListener('webkitbeginfullscreen', handleBeginFullscreen)
      video.addEventListener('webkitendfullscreen', handleEndFullscreen)
    }
    return () => {
      for (const video of candidates) {
        video.removeEventListener('webkitbeginfullscreen', handleBeginFullscreen)
        video.removeEventListener('webkitendfullscreen', handleEndFullscreen)
      }
    }
  }, [finishFullscreenSession, selected.slug])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const syncMediaReadiness = () => {
      if (Number.isFinite(video.duration)) setDuration(video.duration)
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) setReady(true)
    }

    syncMediaReadiness()
    video.addEventListener('loadedmetadata', syncMediaReadiness)
    video.addEventListener('canplay', syncMediaReadiness)
    return () => {
      video.removeEventListener('loadedmetadata', syncMediaReadiness)
      video.removeEventListener('canplay', syncMediaReadiness)
    }
  }, [selected.slug])

  const play = async () => {
    const video = videoRef.current
    if (!video) return
    try {
      setError(null)
      if (video.ended) {
        video.currentTime = 0
        setCurrentTime(0)
        setEnding(false)
      }
      await video.play()
    } catch {
      // Some privacy-focused browsers still reject sound on the first gesture.
      // Keep the screening usable, then let the visitor restore sound explicitly.
      if (!video.muted) {
        video.muted = true
        setMuted(true)
        try {
          await video.play()
          return
        } catch {
          // Fall through to the visible error below.
        }
      }
      setChromeHidden(false)
      setError('The cinema preview could not start. Please try again.')
    }
  }

  const pauseAndBrowse = () => {
    videoRef.current?.pause()
    setChromeHidden(false)
  }

  const selectProject = (project: CinemaProject) => {
    const nextIndex = projects.findIndex((candidate) => candidate.slug === project.slug)
    if (nextIndex < 0) return
    if (nextIndex === selectedIndex) {
      setError(null)
      return
    }
    videoRef.current?.pause()
    setReady(false)
    setPlaying(false)
    setScreeningActive(false)
    setEnding(false)
    setChromeHidden(false)
    setCurrentTime(0)
    setDuration(0)
    setError(null)
    setSelectedIndex(nextIndex)
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    const nextTime = video.currentTime
    const nextDuration = Number.isFinite(video.duration) ? video.duration : 0
    setCurrentTime(nextTime)
    setDuration(nextDuration)
    if (video.paused) return
    const lightsUpBegins = Math.max(0, nextDuration - LIGHTS_UP_SECONDS)
    setEnding(nextDuration > 0 && nextTime >= lightsUpBegins)
    setChromeHidden(nextTime >= CHROME_FADE_OUT_SECONDS && nextTime < lightsUpBegins)
  }

  const handleRailKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const offset = event.key === 'ArrowRight' ? 1 : -1
    const next = (index + offset + projects.length) % projects.length
    const project = projects[next]
    cardRefs.current.get(project.slug)?.focus()
    cardRefs.current.get(project.slug)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }

  const handleRailWheel = (event: WheelEvent<HTMLUListElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    event.currentTarget.scrollLeft += event.deltaY
  }

  const seek = (nextTime: number) => {
    const video = videoRef.current
    if (!video || !Number.isFinite(nextTime)) return
    video.currentTime = nextTime
    setCurrentTime(nextTime)
    const nextDuration = Number.isFinite(video.duration) ? video.duration : 0
    setEnding(nextDuration > 0 && nextTime >= Math.max(0, nextDuration - LIGHTS_UP_SECONDS))
  }

  const exitFilmFullscreen = async () => {
    const session = fullscreenSessionRef.current
    if (!session) return
    const fullscreenDocument = document as WebkitFullscreenDocument
    const fullscreenElement = getFullscreenElement()

    if (fullscreenElement === session.target) {
      if (document.exitFullscreen) await document.exitFullscreen()
      else if (fullscreenDocument.webkitExitFullscreen) {
        await fullscreenDocument.webkitExitFullscreen()
      } else {
        finishFullscreenSession()
      }
      if (
        fullscreenSessionRef.current === session
        && getFullscreenElement() !== session.target
      ) {
        finishFullscreenSession()
      }
      return
    }

    if (session.nativeVideoFullscreen && session.target.webkitExitFullscreen) {
      session.target.webkitExitFullscreen()
      window.setTimeout(() => {
        if (
          fullscreenSessionRef.current === session
          && !session.target.webkitDisplayingFullscreen
        ) {
          finishFullscreenSession()
        }
      }, 0)
      return
    }

    finishFullscreenSession()
  }

  const toggleFullscreen = async () => {
    const activeSession = fullscreenSessionRef.current
    if (activeSession) {
      if (!activeSession.entered) return
      try {
        await exitFilmFullscreen()
      } catch {
        setError('Full screen could not close. Use Escape or the video controls to return.')
      }
      return
    }

    const theater = videoRef.current
    const target = (
      usesSeparateFullscreenSource ? fullscreenVideoRef.current : theater
    ) as WebkitFullscreenVideo | null
    if (!theater || !target) return

    const theaterWasPlaying = !theater.paused && !theater.ended
    const session: FullscreenSession = {
      target,
      theater,
      separateSource: usesSeparateFullscreenSource,
      theaterOffsetSeconds: selected.fullscreenOffsetSeconds ?? 0,
      theaterWasPlaying,
      screeningWasActive: screeningActive,
      playbackShouldContinue: theaterWasPlaying,
      resumeTheaterAfterFilmEnd: false,
      nativeVideoFullscreen: false,
      entered: false,
      restoring: false,
      launcher: document.activeElement instanceof HTMLElement ? document.activeElement : null,
    }

    const restoreAfterFailedEntry = () => {
      if (session.separateSource) target.pause()
      target.controls = false
      if (session.separateSource) target.setAttribute('aria-hidden', 'true')
      fullscreenSessionRef.current = null
      setIsFullscreen(false)
      if (session.separateSource && session.theaterWasPlaying) {
        void theater.play()
      }
    }

    try {
      setError(null)
      fullscreenSessionRef.current = session
      target.controls = true
      if (session.separateSource) target.removeAttribute('aria-hidden')

      if (session.separateSource) {
        target.muted = theater.muted
        target.volume = theater.volume
        target.playbackRate = theater.playbackRate
        target.currentTime = clampMediaTime(
          target,
          theater.currentTime - session.theaterOffsetSeconds,
        )
      }

      let fullscreenRequest: Promise<void> | void
      if (target.requestFullscreen) {
        fullscreenRequest = target.requestFullscreen()
      } else if (target.webkitRequestFullscreen) {
        fullscreenRequest = target.webkitRequestFullscreen()
      } else if (target.webkitEnterFullscreen) {
        session.nativeVideoFullscreen = true
        if (session.separateSource) {
          theater.pause()
          if (session.theaterWasPlaying) void target.play()
        }
        target.webkitEnterFullscreen()
        session.entered = true
        setIsFullscreen(true)
        return
      } else {
        throw new Error('Fullscreen API unavailable')
      }

      if (session.separateSource) {
        theater.pause()
        if (session.theaterWasPlaying) void target.play()
      }

      await fullscreenRequest
      session.entered = true
      setIsFullscreen(true)
    } catch {
      restoreAfterFailedEntry()
      setError('Full screen is not available in this browser.')
    }
  }

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <div
      className={`cinema-experience-root ${playing ? 'is-playing' : ''} ${screeningActive ? 'is-screening-active' : ''} ${ending ? 'is-ending' : ''} ${chromeHidden ? 'is-chrome-hidden' : ''}`}
      aria-label="VibeShack Cinema"
    >
      <div className="cinema-media-layer">
        {selected.cinemaMode === 'runtime' ? (
          <CinemaRuntimeTheater
            key={selected.slug}
            ref={videoRef}
            src={selected.cinemaSrc}
            title={selected.title}
            muted={muted}
            screenFit={selected.screenFit ?? 'contain'}
            screenPosition={selected.screenPosition ?? { x: 0.5, y: 0.5 }}
            screeningActive={screeningActive}
            ending={ending}
            onCanPlay={() => setReady(true)}
            onLoadedMetadata={(event) => {
              setDuration(event.currentTarget.duration)
              setReady(true)
            }}
            onPlay={() => {
              setPlaying(true)
              setScreeningActive(true)
            }}
            onPause={() => {
              setPlaying(false)
              setChromeHidden(false)
            }}
            onTimeUpdate={handleTimeUpdate}
            onEnded={(event) => {
              setPlaying(false)
              setScreeningActive(false)
              setEnding(false)
              setChromeHidden(false)
              setCurrentTime(event.currentTarget.duration)
            }}
            onError={() => {
              setReady(false)
              setPlaying(false)
              setScreeningActive(false)
              setEnding(false)
              setChromeHidden(false)
              setError('This full-length cinema source is temporarily unavailable.')
            }}
          />
        ) : (
          <video
            key={selected.slug}
            ref={videoRef}
            className="cinema-theater-video"
            data-display-fit={selected.displayFit ?? 'contain'}
            style={{
              '--cinema-object-position': selected.displayPosition ?? 'center',
            } as CSSProperties}
            src={selected.cinemaSrc}
            poster={selected.cinemaPoster ?? '/studio-videos/cinema/cinema-theater-idle-v014.jpg'}
            preload="auto"
            playsInline
            muted={muted}
            onCanPlay={() => setReady(true)}
            onLoadedMetadata={(event) => {
              setDuration(event.currentTarget.duration)
              setReady(true)
            }}
            onPlay={() => {
              setPlaying(true)
              setScreeningActive(true)
            }}
            onPause={() => {
              setPlaying(false)
              setChromeHidden(false)
            }}
            onTimeUpdate={handleTimeUpdate}
            onEnded={(event) => {
              setPlaying(false)
              setScreeningActive(false)
              setEnding(false)
              setChromeHidden(false)
              setCurrentTime(event.currentTarget.duration)
            }}
            onError={() => {
              setReady(false)
              setPlaying(false)
              setScreeningActive(false)
              setEnding(false)
              setChromeHidden(false)
              setError('This integrated theater preview is temporarily unavailable.')
            }}
            aria-label={`${selected.title} playing inside the VibeShack theater`}
          />
        )}
        <button
          type="button"
          className="cinema-theater-hit-target"
          onClick={() => (playing ? pauseAndBrowse() : play())}
          aria-label={playing ? 'Pause and show cinema projects' : `Play ${selected.title} in the theater`}
        />
      </div>

      {usesSeparateFullscreenSource && (
        <video
          key={`fullscreen-${selected.slug}`}
          ref={fullscreenVideoRef}
          className="cinema-fullscreen-source"
          src={selected.fullscreenSrc}
          preload="auto"
          playsInline
          tabIndex={-1}
          aria-hidden="true"
          onPlay={(event) => {
            const session = fullscreenSessionRef.current
            if (session?.target === event.currentTarget) {
              session.playbackShouldContinue = true
            }
          }}
          onPause={(event) => {
            const session = fullscreenSessionRef.current
            const target = event.currentTarget as WebkitFullscreenVideo
            if (
              session?.target === target
              && (
                getFullscreenElement() === target
                || Boolean(target.webkitDisplayingFullscreen)
              )
            ) {
              session.playbackShouldContinue = false
            }
          }}
          onEnded={(event) => {
            const session = fullscreenSessionRef.current
            if (session?.target !== event.currentTarget) return
            session.resumeTheaterAfterFilmEnd = true
            session.playbackShouldContinue = true
            void exitFilmFullscreen()
          }}
          onError={(event) => {
            const session = fullscreenSessionRef.current
            if (session?.target !== event.currentTarget) return
            setError('The film-only full-screen source is temporarily unavailable.')
            void exitFilmFullscreen()
          }}
        />
      )}

      <div
        ref={chromeRef}
        className="cinema-chrome"
      >
        <div className="cinema-title-lockup">
          <p>VibeShack Cinema</p>
          <h1>Our<br />Work</h1>
          <div className="cinema-now-screening">
            <span>Now screening</span>
            <i aria-hidden="true" />
            <span>{String(selectedIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="cinema-dock">
          <div className="cinema-selected-project">
            <p className="cinema-eyebrow">
              <span aria-hidden="true" />
              Now playing
              <b>{String(selectedIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</b>
            </p>
            <h2>{selected.title}</h2>
            {showSelectedClient && <p>{selected.client}</p>}
            <div className="cinema-selected-actions">
              <button
                ref={playButtonRef}
                type="button"
                onClick={playing ? pauseAndBrowse : play}
                disabled={!ready}
                className="cinema-play-button"
              >
                <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
                {ready ? (playing ? 'Pause screening' : 'Play in theater') : 'Loading theater'}
              </button>
              <Link
                href={selected.href}
                target={selected.external ? '_blank' : undefined}
                rel={selected.external ? 'noopener noreferrer' : undefined}
                className="cinema-project-link"
              >
                {selected.external ? 'Watch project' : 'Project details'} <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          <div className="cinema-library">
            <ul className="cinema-film-rail" aria-label="All cinema projects" onWheel={handleRailWheel}>
              {projects.map((project, index) => (
                <li key={project.slug}>
                  <button
                    ref={(node) => {
                      if (node) cardRefs.current.set(project.slug, node)
                      else cardRefs.current.delete(project.slug)
                    }}
                    type="button"
                    className="cinema-film-card"
                    aria-pressed={project.slug === selected.slug}
                    aria-describedby={`cinema-summary-${project.slug}`}
                    onClick={() => selectProject(project)}
                    onDoubleClick={() => {
                      void play()
                    }}
                    onKeyDown={(event) => handleRailKeyDown(event, index)}
                    title={`Double-click ${project.title} to play it in the theater`}
                  >
                    <span className="cinema-film-thumb">
                      <Image
                        src={project.image}
                        alt=""
                        fill
                        sizes="180px"
                        className="object-cover"
                        style={{ objectPosition: project.objectPosition || 'center' }}
                      />
                    </span>
                    <span className="cinema-film-title">{project.title}</span>
                  </button>
                  <span id={`cinema-summary-${project.slug}`} className="sr-only">
                    {project.summary}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="cinema-transport" aria-label="Cinema controls">
            <span>{formatTime(currentTime)}</span>
            <input
              className="cinema-progress"
              type="range"
              min="0"
              max={duration || 0}
              step="0.01"
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => seek(Number(event.currentTarget.value))}
              onInput={(event) => seek(Number(event.currentTarget.value))}
              disabled={!ready}
              aria-label={`Seek ${selected.title}`}
              style={{ '--cinema-progress': `${progress}%` } as CSSProperties}
            />
            <span>{formatTime(duration)}</span>
            <button type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Unmute cinema' : 'Mute cinema'}>
              {muted ? 'Muted' : 'Sound'}
            </button>
            <button type="button" onClick={toggleFullscreen}>
              {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            </button>
          </div>
        </div>
      </div>

      <div
        ref={playbackActionsRef}
        className="cinema-playback-actions"
        aria-hidden={!chromeHidden}
        inert={chromeHidden ? undefined : true}
      >
        <button
          ref={browseReturnRef}
          type="button"
          className="cinema-browse-return"
          onClick={pauseAndBrowse}
          tabIndex={chromeHidden ? 0 : -1}
        >
          Browse projects
        </button>
        <button
          type="button"
          className="cinema-fullscreen-return"
          onClick={toggleFullscreen}
          tabIndex={chromeHidden ? 0 : -1}
          aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
        >
          <span aria-hidden="true">{isFullscreen ? '↙' : '⛶'}</span>
          {isFullscreen ? 'Exit full screen' : 'Full screen'}
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {error || (playing ? `${selected.title} is playing` : `${selected.title} is selected`)}
      </p>
      {error && <p className="cinema-error" role="alert">{error}</p>}
    </div>
  )
}

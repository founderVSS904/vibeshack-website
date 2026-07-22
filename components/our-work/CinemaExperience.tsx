'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, SyntheticEvent, WheelEvent } from 'react'
import { flushSync } from 'react-dom'
import type { CinemaProject } from '@/lib/cinema/cinemaCatalog'
import { CinemaRuntimeTheater } from './CinemaRuntimeTheater'
import { CinemaYouTubeTheater } from './CinemaYouTubeTheater'

type CinemaExperienceProps = {
  projects: CinemaProject[]
}

type CinemaCollectionFilter = 'all' | CinemaProject['collection']

const collectionFilters: Array<{ value: CinemaCollectionFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'podcasts', label: 'Podcasts' },
  { value: 'creative-productions', label: 'Creative Productions' },
]

type WebkitFullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void
  webkitFullscreenElement?: Element | null
}

type WebkitFullscreenVideo = HTMLVideoElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
  webkitEnterFullscreen?: () => void
  webkitExitFullscreen?: () => void
  webkitDisplayingFullscreen?: boolean
  webkitSupportsFullscreen?: boolean
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
const PRE_SHOW_SRC = '/studio-videos/cinema/our-work-preshow-v018.mp4'
const PRE_SHOW_POSTER = '/studio-videos/cinema/our-work-preshow-v018.jpg'
const PRE_SHOW_TITLE = 'VibeShack Pre-Show'

type NavigatorWithSaveData = Navigator & {
  connection?: {
    saveData?: boolean
  }
}

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

export function CinemaExperience({ projects }: CinemaExperienceProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showingPreShow, setShowingPreShow] = useState(true)
  const [preShowAutoplayAllowed, setPreShowAutoplayAllowed] = useState(false)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [screeningActive, setScreeningActive] = useState(false)
  const [ending, setEnding] = useState(false)
  const [chromeHidden, setChromeHidden] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [fullscreenSourceDuration, setFullscreenSourceDuration] = useState(0)
  const [fullscreenSourceReady, setFullscreenSourceReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [activeCollection, setActiveCollection] = useState<CinemaCollectionFilter>('all')
  const videoRef = useRef<HTMLVideoElement>(null)
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null)
  const fullscreenSessionRef = useRef<FullscreenSession | null>(null)
  const chromeRef = useRef<HTMLDivElement>(null)
  const playbackActionsRef = useRef<HTMLDivElement>(null)
  const playButtonRef = useRef<HTMLButtonElement>(null)
  const browseReturnRef = useRef<HTMLButtonElement>(null)
  const railRef = useRef<HTMLUListElement>(null)
  const cardRefs = useRef(new Map<string, HTMLButtonElement>())
  const pendingFilmPlayRef = useRef(false)

  const selected = projects[selectedIndex]
  const filteredProjects = activeCollection === 'all'
    ? projects
    : projects.filter((project) => project.collection === activeCollection)
  const usesYouTubePlayback = !showingPreShow && selected.playback === 'youtube'
  const useCleanMobileSource = isMobileViewport
    && !showingPreShow
    && selected.playback === 'hosted'
    && selected.cinemaMode === 'integrated'
  const activeMediaKey = showingPreShow ? 'vibeshack-pre-show' : selected.slug
  const activeCinemaMode = showingPreShow || useCleanMobileSource ? 'runtime' : selected.cinemaMode
  const activeCinemaSrc = showingPreShow
    ? PRE_SHOW_SRC
    : useCleanMobileSource
      ? (selected.fullscreenSrc ?? '')
      : (selected.cinemaSrc ?? '')
  const activeCinemaPoster = showingPreShow ? PRE_SHOW_POSTER : selected.cinemaPoster
  const activeTitle = showingPreShow ? PRE_SHOW_TITLE : selected.title
  const activeScreenFit = showingPreShow
    ? (isMobileViewport ? 'contain' : 'cover')
    : (selected.screenFit ?? 'contain')
  const activeScreenPosition = showingPreShow
    ? { x: 0.5, y: 0.5 }
    : (selected.screenPosition ?? { x: 0.5, y: 0.5 })
  const activeScreenBackdrop = showingPreShow ? 'ambient' : (selected.screenBackdrop ?? 'black')
  const usesSeparateFullscreenSource = !showingPreShow
    && !usesYouTubePlayback
    && Boolean(selected.fullscreenSrc)
    && selected.fullscreenSrc !== activeCinemaSrc
  const fullscreenOffsetSeconds = useCleanMobileSource ? 0 : (selected.fullscreenOffsetSeconds ?? 0)
  const fullscreenAvailable = !showingPreShow && !usesYouTubePlayback && ready

  useEffect(() => {
    const viewportQuery = window.matchMedia('(max-width: 767px)')
    const syncViewport = () => setIsMobileViewport(viewportQuery.matches)
    syncViewport()
    viewportQuery.addEventListener('change', syncViewport)
    return () => viewportQuery.removeEventListener('change', syncViewport)
  }, [])

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const saveData = (navigator as NavigatorWithSaveData).connection?.saveData === true
    const syncPreShowPreference = () => {
      setPreShowAutoplayAllowed(!motionQuery.matches && !saveData)
    }

    syncPreShowPreference()
    motionQuery.addEventListener('change', syncPreShowPreference)
    return () => motionQuery.removeEventListener('change', syncPreShowPreference)
  }, [])

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

  const cancelFullscreenSession = useCallback((message: string) => {
    const session = fullscreenSessionRef.current
    if (!session) return
    if (session.separateSource) {
      session.target.pause()
      session.target.setAttribute('aria-hidden', 'true')
      if (session.theaterWasPlaying) {
        void session.theater.play().catch(() => {
          setPlaying(false)
          setChromeHidden(false)
        })
      }
    }
    session.target.controls = false
    fullscreenSessionRef.current = null
    setIsFullscreen(false)
    setError(message)
  }, [])

  const returnToPreShow = useCallback(() => {
    pendingFilmPlayRef.current = false
    setReady(false)
    setPlaying(false)
    setScreeningActive(false)
    setEnding(false)
    setChromeHidden(false)
    setCurrentTime(0)
    setFullscreenSourceDuration(0)
    setFullscreenSourceReady(false)
    setError(null)
    setShowingPreShow(true)
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
    const handleFullscreenError = () => {
      if (!fullscreenSessionRef.current) return
      cancelFullscreenSession('Full screen is not available in this browser.')
    }

    document.addEventListener('fullscreenchange', syncFullscreenState)
    document.addEventListener('webkitfullscreenchange', syncFullscreenState)
    document.addEventListener('fullscreenerror', handleFullscreenError)
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState)
      document.removeEventListener('webkitfullscreenchange', syncFullscreenState)
      document.removeEventListener('fullscreenerror', handleFullscreenError)
    }
  }, [cancelFullscreenSession, finishFullscreenSession])

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
    const handleFullscreenError = (event: Event) => {
      const session = fullscreenSessionRef.current
      if (!session || event.currentTarget !== session.target) return
      cancelFullscreenSession('Full screen is not available in this browser.')
    }

    for (const video of candidates) {
      video.addEventListener('webkitbeginfullscreen', handleBeginFullscreen)
      video.addEventListener('webkitendfullscreen', handleEndFullscreen)
      video.addEventListener('webkitfullscreenerror', handleFullscreenError)
    }
    return () => {
      for (const video of candidates) {
        video.removeEventListener('webkitbeginfullscreen', handleBeginFullscreen)
        video.removeEventListener('webkitendfullscreen', handleEndFullscreen)
        video.removeEventListener('webkitfullscreenerror', handleFullscreenError)
      }
    }
  }, [activeMediaKey, cancelFullscreenSession, finishFullscreenSession])

  useEffect(() => {
    if (usesYouTubePlayback) return
    let video: HTMLVideoElement | null = null
    let animationFrameId: number | null = null

    const syncMediaReadiness = () => {
      video = videoRef.current
      if (!video) {
        animationFrameId = window.requestAnimationFrame(syncMediaReadiness)
        return
      }
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) setReady(true)
      video.addEventListener('loadedmetadata', handleMediaReadiness)
      video.addEventListener('canplay', handleMediaReadiness)
    }

    const handleMediaReadiness = () => {
      if (video && video.readyState >= HTMLMediaElement.HAVE_METADATA) setReady(true)
    }

    syncMediaReadiness()
    return () => {
      if (animationFrameId !== null) window.cancelAnimationFrame(animationFrameId)
      video?.removeEventListener('loadedmetadata', handleMediaReadiness)
      video?.removeEventListener('canplay', handleMediaReadiness)
    }
  }, [activeMediaKey, usesYouTubePlayback])

  useEffect(() => {
    if (!showingPreShow) return
    const video = videoRef.current
    if (!video) return

    video.muted = true
    if (!preShowAutoplayAllowed) {
      video.pause()
      video.currentTime = 0
      return
    }

    void video.play().catch(() => {
      // The branded first frame remains visible when autoplay is blocked.
      setPlaying(false)
      setChromeHidden(false)
    })
  }, [activeMediaKey, preShowAutoplayAllowed, showingPreShow])

  useEffect(() => {
    const video = fullscreenVideoRef.current
    if (!usesSeparateFullscreenSource || !video) return

    const syncFullscreenMediaReadiness = () => {
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) return
      if (Number.isFinite(video.duration)) setFullscreenSourceDuration(video.duration)
      setFullscreenSourceReady(true)
    }

    syncFullscreenMediaReadiness()
    video.addEventListener('loadedmetadata', syncFullscreenMediaReadiness)
    video.addEventListener('canplay', syncFullscreenMediaReadiness)
    return () => {
      video.removeEventListener('loadedmetadata', syncFullscreenMediaReadiness)
      video.removeEventListener('canplay', syncFullscreenMediaReadiness)
    }
  }, [activeMediaKey, usesSeparateFullscreenSource])

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

  const togglePreShow = async () => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    setError(null)
    if (!video.paused) {
      video.pause()
      return
    }
    try {
      await video.play()
    } catch {
      setPlaying(false)
      setChromeHidden(false)
    }
  }

  const launchProject = (project: CinemaProject) => {
    const nextIndex = projects.findIndex((candidate) => candidate.slug === project.slug)
    if (nextIndex < 0) return
    const launchesYouTube = project.playback === 'youtube'
    videoRef.current?.pause()
    pendingFilmPlayRef.current = false

    flushSync(() => {
      setReady(false)
      setPlaying(false)
      setScreeningActive(launchesYouTube)
      setEnding(false)
      setChromeHidden(false)
      setCurrentTime(0)
      setFullscreenSourceDuration(0)
      setFullscreenSourceReady(false)
      setError(null)
      setSelectedIndex(nextIndex)
      setShowingPreShow(false)
    })

    if (launchesYouTube) return

    const film = videoRef.current
    if (!film) {
      pendingFilmPlayRef.current = true
      return
    }
    film.currentTime = 0
    void play()
  }

  useEffect(() => {
    if (showingPreShow || !pendingFilmPlayRef.current || !ready) return
    pendingFilmPlayRef.current = false
    void play()
  }, [activeMediaKey, ready, showingPreShow])

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    const nextTime = video.currentTime
    const nextDuration = Number.isFinite(video.duration) ? video.duration : 0
    setCurrentTime(nextTime)
    if (video.paused) return
    if (showingPreShow) {
      setEnding(false)
      setChromeHidden(false)
      return
    }
    const lightsUpBegins = Math.max(0, nextDuration - LIGHTS_UP_SECONDS)
    setEnding(nextDuration > 0 && nextTime >= lightsUpBegins)
    setChromeHidden(nextTime >= CHROME_FADE_OUT_SECONDS && nextTime < lightsUpBegins)
  }

  const handleRailKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const offset = event.key === 'ArrowRight' ? 1 : -1
    const next = (index + offset + filteredProjects.length) % filteredProjects.length
    const project = filteredProjects[next]
    cardRefs.current.get(project.slug)?.focus()
    cardRefs.current.get(project.slug)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }

  const filterCollection = (collection: CinemaCollectionFilter) => {
    setActiveCollection(collection)
    window.requestAnimationFrame(() => {
      railRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
    })
  }

  const handleRailWheel = (event: WheelEvent<HTMLUListElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    event.currentTarget.scrollLeft += event.deltaY
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
    if (showingPreShow) return
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
    if (!theater) return
    const separateVideo = fullscreenVideoRef.current
    const separateSourceUsable = Boolean(
      usesSeparateFullscreenSource
      && separateVideo
      && separateVideo.readyState >= HTMLMediaElement.HAVE_METADATA
      && theater.currentTime >= fullscreenOffsetSeconds
      && theater.currentTime < fullscreenOffsetSeconds + separateVideo.duration - 0.04,
    )
    const target = (
      separateSourceUsable ? separateVideo : theater
    ) as WebkitFullscreenVideo | null
    if (!target) return
    if (!ready) {
      setError('Full screen is available while the selected film is on screen.')
      return
    }

    const theaterWasPlaying = !theater.paused && !theater.ended
    const session: FullscreenSession = {
      target,
      theater,
      separateSource: separateSourceUsable,
      theaterOffsetSeconds: fullscreenOffsetSeconds,
      theaterWasPlaying,
      screeningWasActive: screeningActive,
      playbackShouldContinue: theaterWasPlaying,
      resumeTheaterAfterFilmEnd: false,
      nativeVideoFullscreen: false,
      entered: false,
      restoring: false,
      launcher: document.activeElement instanceof HTMLElement ? document.activeElement : null,
    }

    const continueSeparatePlayback = () => {
      if (!session.separateSource || !session.theaterWasPlaying) return
      void target.play().catch(() => {
        session.playbackShouldContinue = false
      })
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
        if (target.webkitSupportsFullscreen === false) {
          throw new Error('Native video fullscreen unavailable')
        }
        session.nativeVideoFullscreen = true
        if (session.separateSource) {
          theater.pause()
          continueSeparatePlayback()
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
        continueSeparatePlayback()
      }

      await fullscreenRequest
      session.entered = true
      setIsFullscreen(true)
    } catch {
      cancelFullscreenSession('Full screen is not available in this browser.')
    }
  }

  const handleTheaterEnded = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (showingPreShow) return
    setCurrentTime(event.currentTarget.duration)

    const session = fullscreenSessionRef.current
    if (session?.target === event.currentTarget) {
      session.playbackShouldContinue = false
      session.resumeTheaterAfterFilmEnd = false
      void exitFilmFullscreen()
        .catch(finishFullscreenSession)
        .finally(returnToPreShow)
      return
    }

    returnToPreShow()
  }

  return (
    <div
      className={`cinema-experience-root ${playing ? 'is-playing' : ''} ${showingPreShow || screeningActive ? 'is-screening-active' : ''} ${ending ? 'is-ending' : ''} ${chromeHidden ? 'is-chrome-hidden' : ''}`}
      aria-label="VibeShack Cinema"
    >
      <div className="cinema-media-layer">
        {usesYouTubePlayback && selected.youtubeId ? (
          <CinemaYouTubeTheater
            key={activeMediaKey}
            videoId={selected.youtubeId}
            title={selected.title}
            onLoad={() => setReady(true)}
          />
        ) : activeCinemaMode === 'runtime' ? (
          <CinemaRuntimeTheater
            key={activeMediaKey}
            ref={videoRef}
            src={activeCinemaSrc}
            title={activeTitle}
            muted={showingPreShow ? true : muted}
            autoPlay={showingPreShow && preShowAutoplayAllowed}
            loop={showingPreShow}
            poster={activeCinemaPoster}
            preload={showingPreShow ? 'auto' : 'metadata'}
            screenFit={activeScreenFit}
            screenPosition={activeScreenPosition}
            screenBackdrop={activeScreenBackdrop}
            screeningActive={showingPreShow || screeningActive}
            ending={!showingPreShow && ending}
            filmFullscreen={isFullscreen && !usesSeparateFullscreenSource}
            onCanPlay={() => setReady(true)}
            onLoadedMetadata={() => setReady(true)}
            onPlay={(event) => {
              if (event.currentTarget !== videoRef.current) return
              setPlaying(true)
              setScreeningActive(true)
              if (showingPreShow) setChromeHidden(false)
            }}
            onPause={(event) => {
              if (event.currentTarget !== videoRef.current) return
              setPlaying(false)
              setChromeHidden(false)
            }}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleTheaterEnded}
            onError={(event) => {
              if (event.currentTarget !== videoRef.current) return
              setReady(false)
              setPlaying(false)
              setScreeningActive(false)
              setEnding(false)
              setChromeHidden(false)
              if (showingPreShow) return
              setError('This full-length cinema source is temporarily unavailable.')
            }}
          />
        ) : (
          <video
            key={activeMediaKey}
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
            onLoadedMetadata={() => setReady(true)}
            onPlay={(event) => {
              if (event.currentTarget !== videoRef.current) return
              setPlaying(true)
              setScreeningActive(true)
            }}
            onPause={(event) => {
              if (event.currentTarget !== videoRef.current) return
              setPlaying(false)
              setChromeHidden(false)
            }}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleTheaterEnded}
            onError={(event) => {
              if (event.currentTarget !== videoRef.current) return
              setReady(false)
              setPlaying(false)
              setScreeningActive(false)
              setEnding(false)
              setChromeHidden(false)
              setError('This integrated theater preview is temporarily unavailable.')
            }}
            aria-label={`${activeTitle} playing inside the VibeShack theater`}
          />
        )}
        {!usesYouTubePlayback && (
          <button
            type="button"
            className="cinema-theater-hit-target"
            onClick={() => {
              if (showingPreShow) {
                void togglePreShow()
                return
              }
              if (playing) pauseAndBrowse()
              else void play()
            }}
            aria-label={showingPreShow
              ? (playing ? 'Pause VibeShack pre-show' : 'Play VibeShack pre-show')
              : (playing ? 'Pause and show cinema projects' : `Play ${selected.title} in the theater`)}
          />
        )}
      </div>

      {usesSeparateFullscreenSource && (
        <video
          key={`fullscreen-${selected.slug}`}
          ref={fullscreenVideoRef}
          className="cinema-fullscreen-source"
          src={selected.fullscreenSrc}
          preload="metadata"
          playsInline
          tabIndex={-1}
          aria-hidden="true"
          aria-label={`${selected.title} film in full screen`}
          onLoadedMetadata={(event) => {
            setFullscreenSourceDuration(event.currentTarget.duration)
            setFullscreenSourceReady(true)
          }}
          onCanPlay={() => setFullscreenSourceReady(true)}
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
            void exitFilmFullscreen().catch(finishFullscreenSession)
          }}
          onError={(event) => {
            setFullscreenSourceReady(false)
            const session = fullscreenSessionRef.current
            if (session?.target !== event.currentTarget) return
            setError('The film-only full-screen source is temporarily unavailable.')
            void exitFilmFullscreen().catch(finishFullscreenSession)
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
        </div>

        <div className="cinema-dock">
          <div className="cinema-selected-project">
            {showingPreShow ? (
              <div className="cinema-selected-heading">
                <h2>{PRE_SHOW_TITLE}</h2>
              </div>
            ) : (
              <Link
                href={selected.href}
                target={selected.external ? '_blank' : undefined}
                rel={selected.external ? 'noopener noreferrer' : undefined}
                className="cinema-selected-title-link"
              >
                <h2>{selected.title}</h2>
              </Link>
            )}
            {!showingPreShow ? <p className="cinema-credit-line">{selected.creditLabel}</p> : null}
            <div className="cinema-selected-actions">
              {usesYouTubePlayback ? (
                <Link
                  href={selected.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cinema-play-button"
                  aria-label={`Watch ${selected.title} on YouTube`}
                >
                  <span aria-hidden="true">↗</span>
                  Watch on YouTube
                </Link>
              ) : (
                <>
                  <button
                    ref={playButtonRef}
                    type="button"
                    onClick={() => {
                      if (showingPreShow) {
                        void togglePreShow()
                        return
                      }
                      if (playing) pauseAndBrowse()
                      else void play()
                    }}
                    disabled={!ready}
                    className="cinema-play-button"
                  >
                    <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
                    {ready
                      ? showingPreShow
                        ? (playing ? 'Pause pre-show' : 'Play pre-show')
                        : (playing ? 'Pause screening' : 'Play in theater')
                      : showingPreShow
                        ? 'Loading pre-show'
                        : 'Loading theater'}
                  </button>
                  {!showingPreShow && (
                    <button
                      type="button"
                      className="cinema-sound-button"
                      onClick={() => setMuted((value) => !value)}
                      aria-label={muted ? 'Turn cinema sound on' : 'Mute cinema'}
                    >
                      <svg aria-hidden="true" viewBox="0 0 18 18">
                        <path d="M2 7h3l4-3v10l-4-3H2V7Z" fill="currentColor" />
                        {muted ? (
                          <path d="m12 6 4 6m0-6-4 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
                        ) : (
                          <path d="M12 6.2c1.4 1.4 1.4 4.2 0 5.6m2-7.6c2.5 2.5 2.5 7.1 0 9.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
                        )}
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="cinema-library">
            <div className="cinema-collection-filters" role="group" aria-label="Filter cinema projects">
              {collectionFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={activeCollection === filter.value}
                  onClick={() => filterCollection(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <ul
              ref={railRef}
              className="cinema-film-rail"
              aria-label={`${collectionFilters.find((filter) => filter.value === activeCollection)?.label ?? 'All'} cinema projects`}
              onWheel={handleRailWheel}
            >
              {filteredProjects.map((project, index) => (
                <li key={project.slug}>
                  <button
                    ref={(node) => {
                      if (node) cardRefs.current.set(project.slug, node)
                      else cardRefs.current.delete(project.slug)
                    }}
                    type="button"
                    className="cinema-film-card"
                    aria-pressed={!showingPreShow && project.slug === selected.slug}
                    aria-describedby={`cinema-summary-${project.slug}`}
                    onClick={() => launchProject(project)}
                    onKeyDown={(event) => handleRailKeyDown(event, index)}
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
                    {project.creditLabel}. {project.summary}
                  </span>
                </li>
              ))}
            </ul>
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
          disabled={!fullscreenAvailable}
          tabIndex={chromeHidden ? 0 : -1}
          aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
          title={fullscreenAvailable ? 'Watch the film full screen' : 'Available while the film is on screen'}
        >
          <span aria-hidden="true">{isFullscreen ? '↙' : '⛶'}</span>
          {isFullscreen ? 'Exit full screen' : 'Full screen'}
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {error || (showingPreShow
          ? (playing ? 'Silent VibeShack pre-show is playing' : 'VibeShack pre-show is ready')
          : (playing ? `${selected.title} is playing` : `${selected.title} is selected`))}
      </p>
      {error && <p className="cinema-error" role="alert">{error}</p>}
    </div>
  )
}

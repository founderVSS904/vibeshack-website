'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, WheelEvent } from 'react'
import type { CinemaProject } from '@/lib/cinema/cinemaCatalog'

type CinemaExperienceProps = {
  projects: CinemaProject[]
}

const filters = [
  { id: 'all', label: 'All' },
  { id: 'music-videos', label: 'Music Videos' },
  { id: 'films', label: 'Films' },
  { id: 'series', label: 'Series' },
  { id: 'sports', label: 'Sports' },
  { id: 'events', label: 'Events' },
  { id: 'shot-at-vibeshack', label: 'Shot at VibeShack' },
]

const CHROME_FADE_OUT_SECONDS = 0.45
const LIGHTS_UP_SECONDS = 2.002

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '00:00'
  const whole = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`
}

export function CinemaExperience({ projects }: CinemaExperienceProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all')
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [chromeHidden, setChromeHidden] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const chromeRef = useRef<HTMLDivElement>(null)
  const playButtonRef = useRef<HTMLButtonElement>(null)
  const browseReturnRef = useRef<HTMLButtonElement>(null)
  const cardRefs = useRef(new Map<string, HTMLButtonElement>())

  const selected = projects[selectedIndex]
  const filteredProjects = useMemo(
    () => projects.filter((project) => activeFilter === 'all' || project.category === activeFilter),
    [activeFilter, projects],
  )

  useEffect(() => {
    const chrome = chromeRef.current
    if (!chrome) return
    if (chromeHidden) {
      if (document.activeElement instanceof Node && chrome.contains(document.activeElement)) {
        browseReturnRef.current?.focus({ preventScroll: true })
      }
      chrome.setAttribute('inert', '')
    } else {
      chrome.removeAttribute('inert')
      if (document.activeElement === browseReturnRef.current) {
        playButtonRef.current?.focus({ preventScroll: true })
      }
    }
  }, [chromeHidden])

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
    videoRef.current?.pause()
    setReady(false)
    setPlaying(false)
    setChromeHidden(false)
    setCurrentTime(0)
    setDuration(0)
    setError(null)
    setSelectedIndex(nextIndex)
  }

  const setFilter = (filter: string) => {
    setActiveFilter(filter)
    const nextProjects = projects.filter((project) => filter === 'all' || project.category === filter)
    if (nextProjects.length && !nextProjects.some((project) => project.slug === selected.slug)) {
      selectProject(nextProjects[0])
    }
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

  const handleRailWheel = (event: WheelEvent<HTMLUListElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    event.currentTarget.scrollLeft += event.deltaY
    event.preventDefault()
  }

  const seek = (nextTime: number) => {
    const video = videoRef.current
    if (!video || !Number.isFinite(nextTime)) return
    video.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await rootRef.current?.requestFullscreen()
  }

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <div
      ref={rootRef}
      className={`cinema-experience-root ${playing ? 'is-playing' : ''} ${chromeHidden ? 'is-chrome-hidden' : ''}`}
      aria-label="VibeShack Cinema"
    >
      <div className="cinema-media-layer">
        <video
          key={selected.slug}
          ref={videoRef}
          className="cinema-theater-video"
          src={selected.cinemaSrc}
          poster="/studio-videos/cinema/cinema-theater-idle-v014.jpg"
          preload="auto"
          playsInline
          muted={muted}
          onCanPlay={() => setReady(true)}
          onLoadedMetadata={(event) => {
            setDuration(event.currentTarget.duration)
            setReady(true)
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => {
            setPlaying(false)
            setChromeHidden(false)
          }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setPlaying(false)
            setChromeHidden(false)
            setCurrentTime(duration)
          }}
          onError={() => {
            setReady(false)
            setPlaying(false)
            setChromeHidden(false)
            setError('This integrated theater preview is temporarily unavailable.')
          }}
          aria-label={`${selected.title} playing inside the VibeShack theater`}
        />
        <button
          type="button"
          className="cinema-theater-hit-target"
          onClick={() => (playing ? pauseAndBrowse() : play())}
          aria-label={playing ? 'Pause and show cinema projects' : `Play ${selected.title} in the theater`}
        />
        <div className="cinema-frame-vignette" aria-hidden="true" />
      </div>

      <div
        ref={chromeRef}
        className="cinema-chrome"
        aria-hidden={chromeHidden}
      >
        <div className="cinema-title-lockup">
          <p>VibeShack Cinema</p>
          <h1>Our<br />Work</h1>
          <div className="cinema-now-screening">
            <span>Now screening</span>
            <i aria-hidden="true" />
            <span>{selected.categoryLabel}</span>
          </div>
        </div>

        <div className="cinema-dock">
          <div className="cinema-selected-project">
            <p className="cinema-eyebrow"><span aria-hidden="true" /> Selected film</p>
            <h2>{selected.title}</h2>
            <p>{selected.client}</p>
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
                {selected.external ? 'Watch full project' : 'View case study'} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="cinema-library">
            <div className="cinema-filters" role="toolbar" aria-label="Filter cinema projects">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={activeFilter === filter.id}
                  onClick={() => setFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <ul className="cinema-film-rail" aria-label="Cinema projects" onWheel={handleRailWheel}>
              {filteredProjects.map((project, index) => (
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
              disabled={!ready}
              aria-label={`Seek ${selected.title}`}
              style={{ '--cinema-progress': `${progress}%` } as CSSProperties}
            />
            <span>{formatTime(duration)}</span>
            <button type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Unmute cinema' : 'Mute cinema'}>
              {muted ? 'Muted' : 'Sound'}
            </button>
            <button type="button" onClick={toggleFullscreen}>Fullscreen</button>
          </div>
        </div>
      </div>

      <button
        ref={browseReturnRef}
        type="button"
        className="cinema-browse-return"
        onClick={pauseAndBrowse}
        tabIndex={chromeHidden ? 0 : -1}
        aria-hidden={!chromeHidden}
      >
        Browse projects
      </button>

      <p className="sr-only" aria-live="polite">
        {error || (playing ? `${selected.title} is playing` : `${selected.title} is selected`)}
      </p>
      {error && <p className="cinema-error" role="alert">{error}</p>}
    </div>
  )
}

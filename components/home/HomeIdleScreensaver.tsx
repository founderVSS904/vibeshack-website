'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  IDLE_SCREEN_COLORS,
  IDLE_SCREEN_DELAY_MS,
  IDLE_SCREEN_MAX_FRAME_SECONDS,
  IDLE_SCREEN_PREVIEW_DELAY_MS,
  IDLE_SCREEN_WAKE_SHIELD_MS,
  clampBounceState,
  createIdleTimer,
  createInitialBounceState,
  getBounceBounds,
  stepBounce,
} from '@/lib/home/idleScreensaver'
import type { BounceBounds, BounceState, EdgeInsets } from '@/lib/home/idleScreensaver'
import styles from './HomeIdleScreensaver.module.css'

const editableSelector = 'input, textarea, select, [contenteditable="true"]'
const blockingOverlaySelector = 'dialog[open], [role="dialog"][aria-modal="true"], header details[open]'

const parseInset = (value: string) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const getStageInsets = (stage: HTMLElement): EdgeInsets => {
  const computed = window.getComputedStyle(stage)
  return {
    top: parseInset(computed.paddingTop),
    right: parseInset(computed.paddingRight),
    bottom: parseInset(computed.paddingBottom),
    left: parseInset(computed.paddingLeft),
  }
}

const hasForegroundMedia = () =>
  Array.from(document.querySelectorAll<HTMLMediaElement>('video, audio')).some(
    (media) => !media.paused && !media.ended && !media.muted,
  )

export function HomeIdleScreensaver() {
  const [active, setActive] = useState(false)
  const [shielding, setShielding] = useState(false)
  const [colorIndex, setColorIndex] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(false)
  const wakeShieldRequestedRef = useRef(false)
  const reducedMotionRef = useRef(false)
  const motionRef = useRef<BounceState | null>(null)
  const boundsRef = useRef<BounceBounds | null>(null)
  const wakeShieldTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    let disposed = false
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = motionQuery.matches
    const previewMode = process.env.NODE_ENV === 'development'
      && new URLSearchParams(window.location.search).get('idle-preview') === '1'

    const canActivate = () => {
      if (document.hidden || reducedMotionRef.current || document.fullscreenElement) return false
      if (document.querySelector(blockingOverlaySelector)) return false
      if (document.activeElement instanceof HTMLElement && document.activeElement.matches(editableSelector)) {
        return false
      }
      return !hasForegroundMedia()
    }

    const clearWakeShield = () => {
      if (wakeShieldTimeoutRef.current !== null) {
        window.clearTimeout(wakeShieldTimeoutRef.current)
        wakeShieldTimeoutRef.current = null
      }
      stageRef.current?.setAttribute('data-shielding', 'false')
      if (!disposed) setShielding(false)
    }

    const idleTimer = createIdleTimer({
      delayMs: previewMode ? IDLE_SCREEN_PREVIEW_DELAY_MS : IDLE_SCREEN_DELAY_MS,
      canActivate,
      onActiveChange: (nextActive) => {
        if (nextActive) {
          clearWakeShield()
        } else if (activeRef.current && wakeShieldRequestedRef.current && !disposed) {
          // Keep a transparent layer over the page while the first wake gesture
          // completes so that it cannot click a card or link underneath.
          clearWakeShield()
          stageRef.current?.setAttribute('data-shielding', 'true')
          setShielding(true)
          wakeShieldTimeoutRef.current = window.setTimeout(() => {
            stageRef.current?.setAttribute('data-shielding', 'false')
            setShielding(false)
            wakeShieldTimeoutRef.current = null
          }, IDLE_SCREEN_WAKE_SHIELD_MS)
        } else {
          clearWakeShield()
        }

        activeRef.current = nextActive
        if (!disposed) setActive(nextActive)
      },
    })

    let lastPointerReset = 0
    const recordActivity = () => {
      wakeShieldRequestedRef.current = activeRef.current
      idleTimer.activity()
      wakeShieldRequestedRef.current = false
    }
    const recordPointerMove = () => {
      const now = performance.now()
      if (!activeRef.current && now - lastPointerReset < 250) return
      lastPointerReset = now
      recordActivity()
    }
    const recordKeyActivity = (event: KeyboardEvent) => {
      if (activeRef.current) {
        event.preventDefault()
        event.stopPropagation()
      }
      recordActivity()
    }
    const recordPointerDown = (event: PointerEvent) => {
      if (activeRef.current) {
        event.preventDefault()
        event.stopPropagation()
      }
      recordActivity()
    }
    const recordTouchStart = (event: TouchEvent) => {
      if (activeRef.current) event.preventDefault()
      recordActivity()
    }
    const syncLifecycle = () => {
      clearWakeShield()
      if (document.hidden || reducedMotionRef.current) idleTimer.suspend()
      else idleTimer.resume()
    }
    const onVisibilityChange = () => syncLifecycle()
    const onMotionPreferenceChange = () => {
      reducedMotionRef.current = motionQuery.matches
      syncLifecycle()
    }
    const onPageHide = () => {
      clearWakeShield()
      idleTimer.suspend()
    }
    const onPageShow = () => syncLifecycle()

    document.addEventListener('pointermove', recordPointerMove, { passive: true })
    document.addEventListener('pointerdown', recordPointerDown, { capture: true })
    document.addEventListener('touchstart', recordTouchStart, { capture: true, passive: false })
    document.addEventListener('wheel', recordActivity, { passive: true })
    document.addEventListener('scroll', recordActivity, { capture: true, passive: true })
    document.addEventListener('keydown', recordKeyActivity, { capture: true })
    document.addEventListener('focusin', recordActivity)
    document.addEventListener('input', recordActivity)
    document.addEventListener('fullscreenchange', recordActivity)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('pageshow', onPageShow)
    motionQuery.addEventListener('change', onMotionPreferenceChange)
    idleTimer.arm()

    return () => {
      disposed = true
      document.removeEventListener('pointermove', recordPointerMove)
      document.removeEventListener('pointerdown', recordPointerDown, { capture: true })
      document.removeEventListener('touchstart', recordTouchStart, { capture: true })
      document.removeEventListener('wheel', recordActivity)
      document.removeEventListener('scroll', recordActivity, { capture: true })
      document.removeEventListener('keydown', recordKeyActivity, { capture: true })
      document.removeEventListener('focusin', recordActivity)
      document.removeEventListener('input', recordActivity)
      document.removeEventListener('fullscreenchange', recordActivity)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('pageshow', onPageShow)
      motionQuery.removeEventListener('change', onMotionPreferenceChange)
      idleTimer.dispose()
      clearWakeShield()
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = previousOverflow
    }
  }, [active])

  useEffect(() => {
    if (!active) {
      motionRef.current = null
      boundsRef.current = null
      return
    }

    const stage = stageRef.current
    const mark = markRef.current
    if (!stage || !mark) return

    let animationFrame = 0
    let startupFrame = 0
    let lastFrame = performance.now()

    const paint = (motion: BounceState) => {
      mark.style.transform = `translate3d(${motion.x.toFixed(2)}px, ${motion.y.toFixed(2)}px, 0)`
    }

    const measure = (reset = false) => {
      const bounds = getBounceBounds(
        { width: stage.clientWidth, height: stage.clientHeight },
        { width: mark.offsetWidth, height: mark.offsetHeight },
        getStageInsets(stage),
      )
      boundsRef.current = bounds
      motionRef.current = reset || !motionRef.current
        ? createInitialBounceState(bounds, stage.clientWidth)
        : clampBounceState(motionRef.current, bounds)
      paint(motionRef.current)
    }

    const tick = (now: number) => {
      const bounds = boundsRef.current
      const motion = motionRef.current
      if (!bounds || !motion) return

      const elapsedSeconds = Math.min(
        Math.max(0, (now - lastFrame) / 1000),
        IDLE_SCREEN_MAX_FRAME_SECONDS,
      )
      lastFrame = now
      const nextMotion = stepBounce(motion, elapsedSeconds, bounds)
      motionRef.current = nextMotion
      paint(nextMotion)
      if (nextMotion.collided) {
        setColorIndex((currentIndex) => (currentIndex + 1) % IDLE_SCREEN_COLORS.length)
      }
      animationFrame = window.requestAnimationFrame(tick)
    }

    setColorIndex(0)
    startupFrame = window.requestAnimationFrame(() => {
      measure(true)
      lastFrame = performance.now()
      animationFrame = window.requestAnimationFrame(tick)
    })

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => measure())
    const onResize = () => measure()
    resizeObserver?.observe(stage)
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)

    return () => {
      window.cancelAnimationFrame(startupFrame)
      window.cancelAnimationFrame(animationFrame)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
    }
  }, [active])

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      data-active={active ? 'true' : 'false'}
      data-shielding={shielding ? 'true' : 'false'}
      data-home-idle-screensaver=""
      aria-hidden="true"
    >
      <div
        ref={markRef}
        className={styles.mark}
        data-color-index={colorIndex}
        style={{ '--idle-mark-color': IDLE_SCREEN_COLORS[colorIndex] } as CSSProperties}
      />
    </div>
  )
}

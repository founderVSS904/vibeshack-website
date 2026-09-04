'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useMediaPreferences } from '@/components/media/useMediaPreferences'
import type { MediaPreferences } from '@/lib/media/playback'

const storageKey = 'vibeshack.motion-paused'
const HomeMotionContext = createContext({
  preferences: { ready: false, reducedMotion: true, saveData: true, canHover: false } as MediaPreferences,
  paused: false,
  motionEnabled: false,
  toggle: () => {},
})

export function HomeMotionProvider({ children }: { children: ReactNode }) {
  const preferences = useMediaPreferences()
  const [paused, setPaused] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      setPaused(window.localStorage.getItem(storageKey) === 'true')
    } catch {
      setPaused(false)
    }
  }, [])

  useEffect(() => {
    if (paused === null) return
    try {
      window.localStorage.setItem(storageKey, String(paused))
    } catch {
      // The control still works when storage is blocked.
    }
  }, [paused])

  const motionEnabled = preferences.ready && !preferences.reducedMotion && paused === false
  return (
    <HomeMotionContext.Provider value={{ preferences, paused: paused !== false, motionEnabled, toggle: () => setPaused((value) => !value) }}>
      <div className="home-landing-page" data-motion-paused={!motionEnabled}>
        {children}
      </div>
    </HomeMotionContext.Provider>
  )
}

export const useHomeMotion = () => useContext(HomeMotionContext)

export function HomeMotionButton({ className = '', onResume }: { className?: string; onResume?: () => void }) {
  const { preferences, paused, toggle } = useHomeMotion()
  const disabled = !preferences.ready || preferences.reducedMotion
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (paused) onResume?.()
        toggle()
      }}
      title={preferences.reducedMotion ? 'Your reduced-motion preference pauses homepage motion.' : undefined}
      aria-label={disabled ? 'Homepage motion paused' : paused ? 'Resume homepage motion' : 'Pause homepage motion'}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 bg-black/80 px-4 text-xs font-bold text-white backdrop-blur transition-colors hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:cursor-default ${className}`}
    >
      <span aria-hidden="true">{paused && !disabled ? '▶' : 'Ⅱ'}</span>
      {disabled ? 'Motion paused' : paused ? 'Resume motion' : 'Pause motion'}
    </button>
  )
}

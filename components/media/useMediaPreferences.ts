'use client'

import { useEffect, useState } from 'react'
import type { MediaPreferences } from '@/lib/media/playback'

type Connection = EventTarget & { saveData?: boolean }

// Keep ambient video sources out of the server markup and the first client
// render. Browser preferences are known only after hydration.
export function useMediaPreferences(): MediaPreferences {
  const [preferences, setPreferences] = useState<MediaPreferences>({
    ready: false, reducedMotion: true, saveData: true, canHover: false,
  })

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hover = window.matchMedia('(hover: hover) and (pointer: fine)')
    const connection = (navigator as Navigator & { connection?: Connection }).connection
    const sync = () => setPreferences({
      ready: true,
      reducedMotion: motion.matches,
      saveData: connection?.saveData === true,
      canHover: hover.matches,
    })
    sync()
    motion.addEventListener('change', sync)
    hover.addEventListener('change', sync)
    connection?.addEventListener('change', sync)
    return () => {
      motion.removeEventListener('change', sync)
      hover.removeEventListener('change', sync)
      connection?.removeEventListener('change', sync)
    }
  }, [])

  return preferences
}

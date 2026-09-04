export type MediaPreferences = {
  ready: boolean
  reducedMotion: boolean
  saveData: boolean
  canHover: boolean
}

export function allowAmbientVideo(
  preferences: MediaPreferences,
  { inView, paused = false, requiresHover = false }: {
    inView: boolean
    paused?: boolean
    requiresHover?: boolean
  },
) {
  return preferences.ready
    && !preferences.reducedMotion
    && !preferences.saveData
    && inView
    && !paused
    && (!requiresHover || preferences.canHover)
}

export function allowPreShowSource(preferences: MediaPreferences, requestedByUser: boolean, inView = true) {
  return requestedByUser || allowAmbientVideo(preferences, { inView, requiresHover: true })
}

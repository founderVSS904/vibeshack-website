type FeaturedPlaybackOptions = {
  motionPaused: boolean
  reducedMotion: boolean
  inView: boolean
  videoOpen: boolean
  autoAdvance: boolean
  hovered: boolean
  focusWithin: boolean
}

export function getFeaturedPlaybackState(options: FeaturedPlaybackOptions) {
  const playPreview = !options.motionPaused
    && !options.reducedMotion
    && options.inView
    && !options.videoOpen

  return {
    playPreview,
    advanceSlides: playPreview && options.autoAdvance && !options.hovered && !options.focusWithin,
  }
}

// Only the existing YouTube watch links can become embedded players.
export function getFeaturedVideoEmbedUrl(watchUrl: string): string | null {
  try {
    const url = new URL(watchUrl)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    if (url.hostname !== 'www.youtube.com' && url.hostname !== 'youtube.com') return null
    if (url.pathname !== '/watch') return null

    const videoId = url.searchParams.get('v')
    if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null

    return 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&playsinline=1&rel=0'
  } catch {
    return null
  }
}

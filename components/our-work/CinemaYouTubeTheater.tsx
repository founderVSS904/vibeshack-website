'use client'

import Image from 'next/image'

const RUNTIME_ASSET_ROOT = '/studio-videos/cinema/runtime-v017'

type CinemaYouTubeTheaterProps = {
  videoId: string
  title: string
  onLoad: () => void
}

export function CinemaYouTubeTheater({
  videoId,
  title,
  onLoad,
}: CinemaYouTubeTheaterProps) {
  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`

  return (
    <div className="cinema-runtime-stage cinema-runtime-youtube-stage is-screening-active">
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
        <div className="cinema-runtime-screen">
          <iframe
            className="cinema-runtime-youtube-frame"
            src={embedSrc}
            title={`${title} on YouTube`}
            loading="eager"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={onLoad}
          />
        </div>
      </div>
    </div>
  )
}

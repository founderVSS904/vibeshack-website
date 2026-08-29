'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import PhotoLightbox from './PhotoLightbox'

type ZoomableImageProps = Omit<ImageProps, 'src'> & { src: string; title?: string }

export default function ZoomableImage({ src, alt, title, ...imageProps }: ZoomableImageProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true })
          setOpen(true)
        }}
        aria-label={`View larger: ${title || alt}`}
        aria-haspopup="dialog"
        className={`group relative block w-full cursor-zoom-in rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${imageProps.fill ? 'h-full' : ''}`}
      >
        <Image {...imageProps} src={src} alt={alt} />
        <span className="pointer-events-none absolute bottom-3 right-3 inline-flex min-h-9 items-center gap-2 rounded-md border border-white/30 bg-black/80 px-3 text-xs font-medium text-white backdrop-blur-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></svg>
          View larger
        </span>
      </button>
      <PhotoLightbox photos={[{ src, alt, title }]} index={open ? 0 : null} onIndexChange={() => {}} onClose={() => setOpen(false)} title={title || 'Studio photo'} />
    </>
  )
}

'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import MediaDialog from './MediaDialog'
import styles from './PhotoLightbox.module.css'

export interface PreviewPhoto {
  src: string
  alt: string
  title?: string
  width?: number
  height?: number
}

interface PhotoLightboxProps {
  photos: readonly PreviewPhoto[]
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
  title?: string
  description?: string
}

export default function PhotoLightbox({ photos, index, onIndexChange, onClose, title = 'Photo preview', description }: PhotoLightboxProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const photo = index === null ? undefined : photos[index]

  useEffect(() => {
    const strip = thumbnailsRef.current
    const selected = strip?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
    if (!strip || !selected || index === null) return
    // Move only the thumbnail strip, without scrolling the photograph or page.
    strip.scrollLeft = Math.max(0, selected.offsetLeft - (strip.clientWidth - selected.clientWidth) / 2)
  }, [index])

  const move = (direction: number) => {
    if (index === null || photos.length < 2) return
    onIndexChange((index + direction + photos.length) % photos.length)
  }

  return (
    <MediaDialog
      open={Boolean(photo)}
      onClose={onClose}
      title={photo?.title || title}
      description={description}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          move(event.key === 'ArrowRight' ? 1 : -1)
        }
      }}
    >
      {photo && index !== null && (
        <>
          <div
            className={`${styles.frame} ${photo.width && photo.height ? styles.fitted : ''}`}
            style={photo.width && photo.height ? { aspectRatio: `${photo.width} / ${photo.height}` } : undefined}
            aria-busy={loadedSrc !== photo.src && failedSrc !== photo.src}
            onTouchStart={(event) => {
              touchStart.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null
            }}
            onTouchMove={(event) => { if (event.touches.length !== 1) touchStart.current = null }}
            onTouchCancel={() => { touchStart.current = null }}
            onTouchEnd={(event) => {
              const start = touchStart.current
              touchStart.current = null
              const end = event.changedTouches[0]
              if (!start || !end) return
              const dx = end.clientX - start.x
              const dy = end.clientY - start.y
              if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1)
            }}
          >
            {loadedSrc !== photo.src && failedSrc !== photo.src && <span className={styles.message} role="status">Loading photo...</span>}
            {failedSrc === photo.src && <span className={styles.message}>The preview could not load. <a href={photo.src} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Open the original photo</a></span>}
            <Image
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1200px) 1120px, 100vw"
              quality={90}
              className="object-contain"
              onLoad={() => {
                setLoadedSrc(photo.src)
                setFailedSrc((current) => current === photo.src ? null : current)
              }}
              onError={() => setFailedSrc(photo.src)}
            />
          </div>
          <div className={styles.navigation}>
            <button type="button" onClick={() => move(-1)} disabled={photos.length < 2} aria-label="Previous photo" className={styles.arrow}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
            </button>
            <p className={styles.count} role="status" aria-live="polite" aria-atomic="true">Photo {index + 1} of {photos.length}</p>
            <button type="button" onClick={() => move(1)} disabled={photos.length < 2} aria-label="Next photo" className={styles.arrow}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
            </button>
          </div>
          {photos.length > 1 && (
            <div ref={thumbnailsRef} className={styles.thumbnails} role="group" aria-label="Preview photos">
              {photos.map((item, itemIndex) => (
                <button
                  key={item.src}
                  type="button"
                  onClick={() => onIndexChange(itemIndex)}
                  aria-label={`Preview ${item.title || `photo ${itemIndex + 1}`}`}
                  aria-pressed={itemIndex === index}
                  className={styles.thumbnail}
                >
                  <Image src={item.src} alt="" fill sizes="80px" className="object-contain" />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </MediaDialog>
  )
}

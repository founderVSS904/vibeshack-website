'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import PhotoLightbox from '@/components/media/PhotoLightbox'
import { getStudioSetup, getStudioSetups, getStudioSetupCollection, type StudioSetupId } from '@/lib/booking/studio-setups'

interface StudioSetupPickerProps {
  id: string
  studioId: string
  value: string
  onChange: (setupId: StudioSetupId) => void
  wide?: boolean
}

export default function StudioSetupPicker({ id, studioId, value, onChange, wide = false }: StudioSetupPickerProps) {
  const [preview, setPreview] = useState<{ studioId: string; index: number } | null>(null)
  useEffect(() => { setPreview(null) }, [studioId])
  const options = getStudioSetups(studioId)
  const selected = getStudioSetup(studioId, value)
  const collection = getStudioSetupCollection(studioId)
  if (!collection || !options.length) return null

  const inquiryParams = new URLSearchParams({ service: 'studio-setup', studio: studioId })
  if (selected) inquiryParams.set('setup', selected.id)
  const emailSubject = `Custom setup for ${collection.studioName}${selected ? `: ${selected.label}` : ''}`

  return (
    <div>
      <fieldset aria-describedby={`${id}-hint`}>
        <legend className="text-xl font-bold text-white sm:text-2xl">Choose your {collection.shortName} setup</legend>
        <p id={`${id}-hint`} className="mb-6 mt-3 text-sm leading-relaxed text-zinc-300">
          {collection.intro} A selection is required before checkout.
        </p>
        <div className={`grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 ${wide ? (options.length === 3 ? 'md:grid-cols-3' : 'xl:grid-cols-4') : ''}`}>
          {options.map((option, index) => (
            <div key={option.id} className="relative">
            <label className="block h-full cursor-pointer">
              <input
                type="radio"
                name={`${id}-setup`}
                value={option.id}
                checked={value === option.id}
                onChange={() => onChange(option.id)}
                aria-label={option.label}
                required
                className="peer sr-only"
              />
              <span className="block h-full overflow-hidden rounded-lg border border-white/15 bg-white/[0.025] transition-colors hover:border-white/40 peer-checked:border-brand-red peer-checked:ring-1 peer-checked:ring-brand-red peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-white">
                <Image
                  src={option.image}
                  alt={option.alt}
                  width={option.width}
                  height={option.height}
                  sizes={wide ? (options.length === 3 ? '(min-width: 768px) 33vw, (min-width: 400px) 50vw, 100vw' : '(min-width: 1280px) 25vw, (min-width: 400px) 50vw, 100vw') : '(min-width: 1024px) 30vw, (min-width: 400px) 50vw, 100vw'}
                  className={`${collection.widePhotos ? 'aspect-video' : 'aspect-[4/3]'} h-auto w-full object-contain`}
                />
                <span className="block px-4 py-4">
                  <span className="block text-sm font-semibold text-white sm:text-base">{option.label}</span>
                  <span className="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-300">
                    <span>{option.chairs === 1 ? 'Solo recording' : option.chairs === 2 ? 'Two-person conversation' : 'Three-person conversation'}</span>
                    <span className={value === option.id ? 'font-semibold text-white' : 'text-zinc-400'} aria-hidden="true">
                      {value === option.id ? 'Selected ✓' : 'Select'}
                    </span>
                  </span>
                </span>
              </span>
            </label>
            <button
              type="button"
              onClick={(event) => {
                event.currentTarget.focus({ preventScroll: true })
                setPreview({ studioId, index })
              }}
              aria-label={`View larger: ${option.label}`}
              aria-haspopup="dialog"
              className="absolute right-2 top-2 inline-flex min-h-11 items-center gap-2 rounded-md border border-white/30 bg-black/80 px-3 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></svg>
              View larger
            </button>
            </div>
          ))}
        </div>
      </fieldset>
      <div className="mt-6 rounded-lg border border-white/10 px-5 py-4 text-sm leading-relaxed text-zinc-300">
        <p className="font-semibold text-white">All of our sets are customizable.</p>
        <p className="mt-1">
          These photos show a few options for {collection.studioName}. Have another layout or look in mind?{' '}
          <a className="text-white underline underline-offset-4 hover:text-red-400" href={`mailto:founder@vibeshackstudios.com?subject=${encodeURIComponent(emailSubject)}`}>Email us</a>
          {' '}or{' '}
          <Link className="text-white underline underline-offset-4 hover:text-red-400" href={`/contact/?${inquiryParams.toString()}#project-inquiry`}>get in touch</Link>
          {' '}before booking so we can plan it together.
        </p>
      </div>
      <PhotoLightbox
        photos={options.map((option) => ({ src: option.image, alt: option.alt, title: option.label, width: option.width, height: option.height }))}
        index={preview?.studioId === studioId ? preview.index : null}
        onIndexChange={(index) => setPreview({ studioId, index })}
        onClose={() => setPreview(null)}
        title={`${collection.studioName} setups`}
        description={`${collection.studioName}. Viewing photos does not change your setup choice.`}
      />
    </div>
  )
}

'use client'

import Image from 'next/image'
import { useRef, useState, type KeyboardEvent } from 'react'

export type VideoFormat = {
  eyebrow: string
  title: string
  image: string
  alt: string
  objectPosition: string
  pressure: string
  bestRoom: string
}

type VideoFormatSelectorProps = {
  formats: VideoFormat[]
}

export default function VideoFormatSelector({ formats }: VideoFormatSelectorProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [imageReady, setImageReady] = useState(true)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const activeFormat = formats[activeIndex]

  const selectFormat = (index: number, moveFocus = false) => {
    if (index === activeIndex) return

    setPreviousIndex(activeIndex)
    setImageReady(false)
    setActiveIndex(index)

    if (moveFocus) {
      window.requestAnimationFrame(() => {
        tabRefs.current[index]?.focus()
        tabRefs.current[index]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      })
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex = activeIndex

    if (event.key === 'ArrowRight') nextIndex = (activeIndex + 1) % formats.length
    if (event.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + formats.length) % formats.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = formats.length - 1
    if (nextIndex === activeIndex) return

    event.preventDefault()
    selectFormat(nextIndex, true)
  }

  if (!activeFormat) return null

  return (
    <div className="mt-12 sm:mt-16">
      <div
        role="tablist"
        aria-label="Choose a video format"
        className="flex snap-x snap-mandatory overflow-x-auto border-y border-white/10 [scrollbar-width:none] lg:grid lg:grid-cols-6 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        {formats.map((format, index) => (
          <button
            key={format.title}
            ref={(element) => { tabRefs.current[index] = element }}
            id={`video-format-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-controls="video-format-panel"
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => selectFormat(index)}
            onKeyDown={handleKeyDown}
            className="video-format-tab min-h-[72px] w-[172px] shrink-0 snap-start border-r border-white/10 px-4 py-4 text-left last:border-r-0 lg:w-auto"
          >
            <span className="block text-[10px] font-semibold tabular-nums text-white/30">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="mt-2 block text-sm font-semibold leading-tight text-white/50">{format.title}</span>
          </button>
        ))}
      </div>

      <div
        id="video-format-panel"
        role="tabpanel"
        aria-labelledby={`video-format-tab-${activeIndex}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950 sm:aspect-[16/10] lg:aspect-[2/1]">
          {previousIndex !== null && formats[previousIndex] && (
            <Image
              src={formats[previousIndex].image}
              alt=""
              fill
              aria-hidden="true"
              priority={previousIndex === 0}
              quality={85}
              className="video-format-image-previous object-cover"
              style={{ objectPosition: formats[previousIndex].objectPosition }}
              sizes="(min-width: 1280px) 1152px, (min-width: 640px) calc(100vw - 80px), calc(100vw - 48px)"
            />
          )}
          <Image
            key={`${activeFormat.title}-image`}
            src={activeFormat.image}
            alt={activeFormat.alt}
            fill
            priority={activeIndex === 0}
            quality={90}
            onLoad={() => setImageReady(true)}
            onTransitionEnd={() => {
              if (imageReady) setPreviousIndex(null)
            }}
            className={`video-format-image object-cover ${imageReady ? 'is-ready' : ''}`}
            style={{ objectPosition: activeFormat.objectPosition }}
            sizes="(min-width: 1280px) 1152px, (min-width: 640px) calc(100vw - 80px), calc(100vw - 48px)"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_38%,rgba(0,0,0,0.74)_100%)]" />
          <div key={`${activeFormat.title}-title`} className="video-format-title absolute inset-x-6 bottom-6 sm:inset-x-10 sm:bottom-9">
            <p className="text-xs font-semibold text-brand-red">{activeFormat.eyebrow}</p>
            <h3 className="brand-sans mt-3 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
              {activeFormat.title}
            </h3>
          </div>
        </div>

        <div key={`${activeFormat.title}-details`} className="video-format-details grid gap-8 border-b border-white/10 py-8 sm:py-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold text-white/35">What the shoot needs</p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">{activeFormat.pressure}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/35">How we shape the set</p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">{activeFormat.bestRoom}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

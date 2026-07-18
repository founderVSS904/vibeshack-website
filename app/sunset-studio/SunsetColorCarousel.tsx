'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

type SunsetColor = { img: string; name: string }

export default function SunsetColorCarousel({ colors }: { colors: SunsetColor[] }) {
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    // Respect reduced motion: no auto-scroll, leave the strip scrollable by hand
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const wrapper = carousel.parentElement
      if (wrapper) wrapper.style.overflowX = 'auto'
      return
    }

    // Calculate scroll distance and duration
    const itemWidth = 280 + 12 // item width + gap
    const totalItems = colors.length
    const scrollDistance = itemWidth * totalItems
    const duration = 18000 // 18 seconds in milliseconds

    let animationStartTime: number | null = null
    let pausedAt: number | null = null
    let animationId = 0

    const animate = (currentTime: number) => {
      if (animationStartTime === null) animationStartTime = currentTime

      if (pausedAt === null) {
        const elapsedTime = currentTime - animationStartTime
        const progress = (elapsedTime % duration) / duration
        const translateDistance = scrollDistance * progress

        carousel.style.transform = `translateX(-${translateDistance}px)`
        carousel.style.transition = 'none'
      }

      animationId = requestAnimationFrame(animate)
    }

    // Pause while hovered or focused so the card links stay clickable
    const pause = () => {
      if (pausedAt === null) pausedAt = performance.now()
    }
    const resume = () => {
      if (pausedAt !== null && animationStartTime !== null) {
        animationStartTime += performance.now() - pausedAt
      }
      pausedAt = null
    }

    carousel.addEventListener('pointerenter', pause)
    carousel.addEventListener('pointerleave', resume)
    carousel.addEventListener('focusin', pause)
    carousel.addEventListener('focusout', resume)

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      carousel.removeEventListener('pointerenter', pause)
      carousel.removeEventListener('pointerleave', resume)
      carousel.removeEventListener('focusin', pause)
      carousel.removeEventListener('focusout', resume)
    }
  }, [colors.length])

  return (
    <div className="carousel-wrapper" aria-label="Sunset color examples">
      <div className="carousel-inner" ref={carouselRef}>
        {colors.map(({ img, name }) => (
          <div key={name} className="carousel-item">
            <a
              href={`/book/?studio=sunset&color=${encodeURIComponent(name.toLowerCase())}`}
              className="carousel-link"
            >
              <Image src={img} alt={`Sunset ${name}`} width={280} height={256} className="w-full h-64 object-cover" />
              <p className="carousel-label">{name}</p>
            </a>
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {colors.map(({ img, name }) => (
          <div key={`${name}-2`} className="carousel-item">
            <a
              href={`/book/?studio=sunset&color=${encodeURIComponent(name.toLowerCase())}`}
              className="carousel-link"
            >
              <Image src={img} alt={`Sunset ${name}`} width={280} height={256} className="w-full h-64 object-cover" />
              <p className="carousel-label">{name}</p>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

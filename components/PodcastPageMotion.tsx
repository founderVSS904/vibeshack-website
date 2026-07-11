'use client'

import { useEffect } from 'react'

export default function PodcastPageMotion() {
  useEffect(() => {
    document.documentElement.classList.add('podcast-motion-ready')
    document.body.classList.add('podcast-page-active')

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>('[data-podcast-reveal]'))
    const revealTimers = new Set<number>()

    if (reducedMotion) {
      revealEls.forEach((el) => el.classList.add('is-visible'))
      return () => {
        document.documentElement.classList.remove('podcast-motion-ready')
        document.body.classList.remove('podcast-page-active')
      }
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        const delay = Number(el.dataset.delay || 0)
        const timer = window.setTimeout(() => {
          el.classList.add('is-visible')
          revealTimers.delete(timer)
        }, delay)
        revealTimers.add(timer)
        revealObserver.unobserve(el)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })

    revealEls.forEach((el) => revealObserver.observe(el))

    return () => {
      revealObserver.disconnect()
      revealTimers.forEach((timer) => window.clearTimeout(timer))
      document.documentElement.classList.remove('podcast-motion-ready')
      document.body.classList.remove('podcast-page-active')
    }
  }, [])

  return null
}

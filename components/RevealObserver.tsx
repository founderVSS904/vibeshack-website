'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    let observer: IntersectionObserver | null = null
    let fallback: ReturnType<typeof setTimeout> | null = null

    const observe = () => {
      const elements = document.querySelectorAll('[data-reveal], [data-stagger]')

      const activeObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement
              const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0
              setTimeout(() => el.classList.add('revealed'), delay)
              activeObserver.unobserve(el)
            }
          })
        },
        { threshold: 0.08, rootMargin: '-40px 0px' }
      )

      observer = activeObserver
      elements.forEach((el) => activeObserver.observe(el))

      fallback = setTimeout(() => {
        elements.forEach((el) => {
          ;(el as HTMLElement).classList.add('revealed')
        })
      }, 1200)
    }

    // Small delay to let page render
    const timer = setTimeout(() => {
      observe()
    }, 50)

    return () => {
      clearTimeout(timer)
      if (fallback) clearTimeout(fallback)
      observer?.disconnect()
    }
  }, [pathname])

  return null
}

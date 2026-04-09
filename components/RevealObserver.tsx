'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const observe = () => {
      const elements = document.querySelectorAll('[data-reveal], [data-stagger]')

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement
              const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0
              setTimeout(() => el.classList.add('revealed'), delay)
              observer.unobserve(el)
            }
          })
        },
        { threshold: 0.08, rootMargin: '-40px 0px' }
      )

      elements.forEach((el) => observer.observe(el))
      return observer
    }

    // Small delay to let page render
    const timer = setTimeout(() => {
      const obs = observe()
      return () => obs.disconnect()
    }, 50)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}

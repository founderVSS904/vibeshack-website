'use client'

import { useEffect } from 'react'

export default function PodcastPageMotion() {
  useEffect(() => {
    document.documentElement.classList.add('podcast-motion-ready')

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>('[data-podcast-reveal]'))
    const roomPanels = Array.from(document.querySelectorAll<HTMLElement>('[data-room-panel]'))
    const roomLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-room-link]'))

    const updateActiveRoom = () => {
      let activeRoom: string | undefined
      let activeScore = Number.POSITIVE_INFINITY
      const viewportFocus = window.innerHeight * 0.52

      roomPanels.forEach((panel) => {
        const rect = panel.getBoundingClientRect()
        if (rect.bottom < window.innerHeight * 0.12 || rect.top > window.innerHeight * 0.88) return

        panel.classList.add('is-visible')
        const score = Math.abs((rect.top + rect.height * 0.32) - viewportFocus)
        if (score < activeScore) {
          activeScore = score
          activeRoom = panel.dataset.roomPanel
        }
      })

      roomLinks.forEach((link) => {
        link.classList.toggle('is-active', link.dataset.roomLink === activeRoom)
      })
    }

    if (reducedMotion) {
      revealEls.forEach((el) => el.classList.add('is-visible'))
      roomPanels.forEach((el) => el.classList.add('is-visible'))
      if (roomLinks[0]) roomLinks[0].classList.add('is-active')
      return () => {
        document.documentElement.classList.remove('podcast-motion-ready')
      }
    }

    let activeRoomFrame = 0
    const scheduleActiveRoom = () => {
      if (activeRoomFrame) return
      activeRoomFrame = window.requestAnimationFrame(() => {
        activeRoomFrame = 0
        updateActiveRoom()
      })
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        const delay = Number(el.dataset.delay || 0)
        window.setTimeout(() => el.classList.add('is-visible'), delay)
        revealObserver.unobserve(el)
      })
    }, { threshold: 0.12, rootMargin: '-24px 0px' })

    revealEls.forEach((el) => revealObserver.observe(el))

    const roomObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const panel = entry.target as HTMLElement
        if (entry.isIntersecting) panel.classList.add('is-visible')
      })

      scheduleActiveRoom()
    }, { threshold: [0.08, 0.22, 0.38], rootMargin: '-10% 0px -18% 0px' })

    roomPanels.forEach((panel) => roomObserver.observe(panel))
    window.addEventListener('scroll', scheduleActiveRoom, { passive: true })
    window.addEventListener('resize', scheduleActiveRoom)
    scheduleActiveRoom()

    return () => {
      revealObserver.disconnect()
      roomObserver.disconnect()
      window.removeEventListener('scroll', scheduleActiveRoom)
      window.removeEventListener('resize', scheduleActiveRoom)
      if (activeRoomFrame) window.cancelAnimationFrame(activeRoomFrame)
      document.documentElement.classList.remove('podcast-motion-ready')
    }
  }, [])

  return null
}

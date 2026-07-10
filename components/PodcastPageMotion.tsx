'use client'

import { useEffect } from 'react'

export default function PodcastPageMotion() {
  useEffect(() => {
    document.documentElement.classList.add('podcast-motion-ready')
    document.body.classList.add('podcast-page-active')

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>('[data-podcast-reveal]'))
    const setPanels = Array.from(document.querySelectorAll<HTMLElement>('[data-set-panel]'))
    const setLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-set-link]'))
    const setNavScroller = document.querySelector<HTMLElement>('.podcast-set-nav > div')
    const revealTimers = new Set<number>()
    let lastActiveSet: string | undefined

    const updateActiveSet = () => {
      let activeSet: string | undefined
      let activeScore = Number.POSITIVE_INFINITY
      const viewportFocus = window.innerHeight * 0.52

      setPanels.forEach((panel) => {
        const rect = panel.getBoundingClientRect()
        if (rect.bottom < window.innerHeight * 0.12 || rect.top > window.innerHeight * 0.88) return

        panel.classList.add('is-visible')
        const score = rect.top <= viewportFocus && rect.bottom >= viewportFocus
          ? 0
          : Math.min(Math.abs(rect.top - viewportFocus), Math.abs(rect.bottom - viewportFocus))
        if (score < activeScore) {
          activeScore = score
          activeSet = panel.dataset.setPanel
        }
      })

      setPanels.forEach((panel) => {
        panel.classList.toggle('is-current', panel.dataset.setPanel === activeSet)
      })

      setLinks.forEach((link) => {
        link.classList.toggle('is-active', link.dataset.setLink === activeSet)
      })

      if (activeSet && activeSet !== lastActiveSet && setNavScroller) {
        const activeLink = setLinks.find((link) => link.dataset.setLink === activeSet)
        if (activeLink) {
          const linkLeft = activeLink.offsetLeft
          const linkRight = linkLeft + activeLink.offsetWidth
          const visibleLeft = setNavScroller.scrollLeft + 12
          const visibleRight = setNavScroller.scrollLeft + setNavScroller.clientWidth - 12

          if (linkLeft < visibleLeft || linkRight > visibleRight) {
            const centeredLeft = linkLeft - ((setNavScroller.clientWidth - activeLink.offsetWidth) / 2)
            setNavScroller.scrollTo({ left: Math.max(0, centeredLeft), behavior: 'smooth' })
          }
        }
        lastActiveSet = activeSet
      }
    }

    if (reducedMotion) {
      revealEls.forEach((el) => el.classList.add('is-visible'))
      setPanels.forEach((el) => el.classList.add('is-visible'))
      if (setPanels[0]) setPanels[0].classList.add('is-current')
      if (setLinks[0]) setLinks[0].classList.add('is-active')
      return () => {
        document.documentElement.classList.remove('podcast-motion-ready')
        document.body.classList.remove('podcast-page-active')
      }
    }

    let activeSetFrame = 0
    const scheduleActiveSet = () => {
      if (activeSetFrame) return
      activeSetFrame = window.requestAnimationFrame(() => {
        activeSetFrame = 0
        updateActiveSet()
      })
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

    const setObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const panel = entry.target as HTMLElement
        if (entry.isIntersecting) panel.classList.add('is-visible')
      })

      scheduleActiveSet()
    }, { threshold: [0.08, 0.22, 0.38], rootMargin: '-10% 0px -18% 0px' })

    setPanels.forEach((panel) => setObserver.observe(panel))
    window.addEventListener('scroll', scheduleActiveSet, { passive: true })
    window.addEventListener('resize', scheduleActiveSet)
    scheduleActiveSet()

    return () => {
      revealObserver.disconnect()
      setObserver.disconnect()
      revealTimers.forEach((timer) => window.clearTimeout(timer))
      window.removeEventListener('scroll', scheduleActiveSet)
      window.removeEventListener('resize', scheduleActiveSet)
      if (activeSetFrame) window.cancelAnimationFrame(activeSetFrame)
      document.documentElement.classList.remove('podcast-motion-ready')
      document.body.classList.remove('podcast-page-active')
    }
  }, [])

  return null
}

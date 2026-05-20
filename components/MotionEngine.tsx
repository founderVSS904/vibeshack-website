'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function MotionEngine() {
  const pathname = usePathname()

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal],[data-stagger]'))
    const tiltHandlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = []
    const magneticHandlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = []
    let revealObserver: IntersectionObserver | null = null
    let countObserver: IntersectionObserver | null = null
    let parallaxRaf: number | null = null

    if (reducedMotion) {
      revealEls.forEach((el) => el.classList.add('revealed'))
      return
    }

    if (revealEls.length > 0) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          const delay = parseInt(el.dataset.delay || '0', 10)
          window.setTimeout(() => el.classList.add('revealed'), delay)
          revealObserver?.unobserve(el)
        })
      }, { threshold: 0.06, rootMargin: '-30px 0px' })

      revealEls.forEach((el) => revealObserver?.observe(el))
    }

    const countEls = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'))
    if (countEls.length > 0) {
      countObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          const target = parseFloat(el.dataset.count || '0')
          const prefix = el.dataset.prefix || ''
          const suffix = el.dataset.suffix || ''
          const duration = 1200
          const start = performance.now()

          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 3)
            el.textContent = prefix + (target % 1 === 0
              ? Math.round(target * ease).toString()
              : (target * ease).toFixed(1)) + suffix
            if (progress < 1) requestAnimationFrame(tick)
          }

          requestAnimationFrame(tick)
          countObserver?.unobserve(el)
        })
      }, { threshold: 0.5 })

      countEls.forEach((el) => countObserver?.observe(el))
    }

    document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      if (el.querySelector('.word')) return
      if (el.querySelector('span, a, strong, em, br')) return

      const words = (el.textContent || '').split(/\s+/).filter(Boolean)
      el.innerHTML = words.map((word) =>
        `<span class="word" style="display:inline-block;overflow:hidden;vertical-align:bottom"><span class="word-inner" style="display:inline-block;transform:translateY(105%);transition:transform 0.75s cubic-bezier(0.16,1,0.3,1)">${word}</span></span>`
      ).join(' ')

      const wordObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const inners = (entry.target as HTMLElement).querySelectorAll<HTMLElement>('.word-inner')
          inners.forEach((inner, index) => {
            window.setTimeout(() => {
              inner.style.transform = 'translateY(0)'
            }, index * 60)
          })
          wordObserver.unobserve(entry.target)
        })
      }, { threshold: 0.1 })

      wordObserver.observe(el)
    })

    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (finePointer) {
      document.querySelectorAll<HTMLElement>('[data-tilt], .studio-card').forEach((el) => {
        const move = (event: MouseEvent) => {
          const rect = el.getBoundingClientRect()
          const x = (event.clientX - rect.left) / rect.width - 0.5
          const y = (event.clientY - rect.top) / rect.height - 0.5
          el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-4px) scale(1.02)`
          el.style.transition = 'transform 0.1s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease'
          el.style.boxShadow = `${-x * 20}px ${y * 20}px 60px rgba(0,0,0,0.5)`
        }
        const leave = () => {
          el.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0) scale(1)'
          el.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.6s ease'
          el.style.boxShadow = ''
        }

        el.addEventListener('mousemove', move)
        el.addEventListener('mouseleave', leave)
        tiltHandlers.push({ el, move, leave })
      })

      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
        const move = (event: MouseEvent) => {
          const rect = el.getBoundingClientRect()
          const x = (event.clientX - rect.left - rect.width / 2) * 0.25
          const y = (event.clientY - rect.top - rect.height / 2) * 0.25
          el.style.transform = `translate(${x}px, ${y}px)`
          el.style.transition = 'transform 0.2s cubic-bezier(0.16,1,0.3,1)'
        }
        const leave = () => {
          el.style.transform = 'translate(0,0)'
          el.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)'
        }

        el.addEventListener('mousemove', move)
        el.addEventListener('mouseleave', leave)
        magneticHandlers.push({ el, move, leave })
      })
    }

    const parallaxEls = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    if (parallaxEls.length > 0) {
      const handleParallax = () => {
        parallaxEls.forEach((el) => {
          const rect = el.getBoundingClientRect()
          const speed = parseFloat(el.dataset.parallax || '0.15')
          const center = rect.top + rect.height / 2 - window.innerHeight / 2
          el.style.transform = `translateY(${center * speed}px) scale(1.1)`
        })
        parallaxRaf = requestAnimationFrame(handleParallax)
      }
      parallaxRaf = requestAnimationFrame(handleParallax)
    }

    return () => {
      revealObserver?.disconnect()
      countObserver?.disconnect()
      if (parallaxRaf) cancelAnimationFrame(parallaxRaf)
      tiltHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move)
        el.removeEventListener('mouseleave', leave)
      })
      magneticHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move)
        el.removeEventListener('mouseleave', leave)
      })
    }
  }, [pathname])

  return null
}

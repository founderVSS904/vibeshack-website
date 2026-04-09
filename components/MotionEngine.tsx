'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function MotionEngine() {
  const pathname = usePathname()

  useEffect(() => {
    const updateProgress = () => {} // removed

    // ── 0b. IMAGE BLUR-UP on load ─────────────────────────────────────
    document.querySelectorAll('img').forEach(img => {
      if (img.dataset.noblur) return
      if (!img.complete) {
        img.style.filter = 'blur(12px)'
        img.style.transition = 'filter 0.8s cubic-bezier(0.16,1,0.3,1)'
        img.addEventListener('load', () => { img.style.filter = 'blur(0)' }, { once: true })
      }
    })
    // ── 1. INTERSECTION OBSERVER — reveal everything ──────────────────
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          const delay = parseInt(el.dataset.delay || '0')
          setTimeout(() => el.classList.add('revealed'), delay)
          io.unobserve(el)
        }
      })
    }, { threshold: 0.06, rootMargin: '-30px 0px' })

    document.querySelectorAll('[data-reveal],[data-stagger]').forEach(el => io.observe(el))

    // ── 1b. COUNT-UP NUMBERS (inline, fast) ──────────────────────────
    const countEls2 = document.querySelectorAll('[data-count]')
    const countIo2 = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const el = e.target as HTMLElement
        const target = parseFloat(el.dataset.count || '0')
        const prefix = el.dataset.prefix || ''
        const suffix = el.dataset.suffix || ''
        const duration = 1400
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - p, 4)
          el.textContent = prefix + (target % 1 === 0 ? Math.round(target * ease).toString() : (target * ease).toFixed(0)) + suffix
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        countIo2.unobserve(el)
      })
    }, { threshold: 0.5 })
    countEls2.forEach(el => countIo2.observe(el))

    // ── 1c. NAV SCROLL BEHAVIOR ───────────────────────────────────────
    const nav = document.querySelector('header') as HTMLElement | null
    const handleNavScroll = () => {
      if (!nav) return
      const y = window.scrollY
      if (y > 80) {
        nav.style.background = 'rgba(0,0,0,0.96)'
        nav.style.backdropFilter = 'blur(32px)'
        nav.style.borderBottomColor = 'rgba(255,255,255,0.12)'
      } else {
        nav.style.background = 'rgba(0,0,0,0.88)'
        nav.style.backdropFilter = 'blur(20px)'
        nav.style.borderBottomColor = 'rgba(255,255,255,0.08)'
      }
    }
    window.addEventListener('scroll', handleNavScroll, { passive: true })
    handleNavScroll()

    // ── 2. SPLIT TEXT — only split plain text, skip elements with child HTML ──
    document.querySelectorAll('[data-split]').forEach(el => {
      if (el.querySelector('.word')) return
      // Only split if it's plain text (no child elements with HTML tags)
      if (el.querySelector('span, a, strong, em, br')) return

      const text = el.textContent || ''
      const words = text.split(/\s+/).filter(Boolean)
      el.innerHTML = words.map(w =>
        `<span class="word" style="display:inline-block;overflow:hidden;vertical-align:bottom"><span class="word-inner" style="display:inline-block;transform:translateY(105%);transition:transform 0.75s cubic-bezier(0.16,1,0.3,1)">${w}</span></span>`
      ).join(' ')

      const wordIo = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const inners = (e.target as HTMLElement).querySelectorAll('.word-inner')
            inners.forEach((inner, i) => {
              setTimeout(() => {
                ;(inner as HTMLElement).style.transform = 'translateY(0)'
              }, i * 60)
            })
            wordIo.unobserve(e.target)
          }
        })
      }, { threshold: 0.1 })
      wordIo.observe(el)
    })

    // ── 2b. 3D CARD TILT ─────────────────────────────────────────────
    const tiltCards = document.querySelectorAll('[data-tilt], .studio-card')
    const tiltHandlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = []

    tiltCards.forEach(card => {
      const el = card as HTMLElement
      if (!el.addEventListener) return
      el.style.transformStyle = 'preserve-3d'
      el.style.perspective = '800px'

      const move = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-4px) scale(1.02)`
        el.style.transition = 'transform 0.1s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease'
        el.style.boxShadow = `${-x * 20}px ${y * 20}px 60px rgba(0,0,0,0.5)`
      }
      const leave = () => {
        el.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0) scale(1)'
        el.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.6s ease'
        el.style.boxShadow = ''
      }
      el.addEventListener('mousemove', move as EventListener)
      el.addEventListener('mouseleave', leave)
      tiltHandlers.push({ el, move, leave })
    })

    // ── 3. PARALLAX — images move at different speeds ─────────────────
    const parallaxEls = document.querySelectorAll('[data-parallax]')
    let rafId: number
    const handleParallax = () => {
      parallaxEls.forEach(el => {
        const rect = (el as HTMLElement).getBoundingClientRect()
        const speed = parseFloat((el as HTMLElement).dataset.parallax || '0.15')
        const center = rect.top + rect.height / 2 - window.innerHeight / 2
        const offset = center * speed
        ;(el as HTMLElement).style.transform = `translateY(${offset}px) scale(1.1)`
      })
      rafId = requestAnimationFrame(handleParallax)
    }
    rafId = requestAnimationFrame(handleParallax)

    // ── 4. MAGNETIC BUTTONS — CTAs follow cursor slightly ─────────────
    const magnetics = document.querySelectorAll('[data-magnetic]')
    const magneticHandlers: Array<{ el: Element; move: (e: MouseEvent) => void; leave: () => void }> = []

    magnetics.forEach(el => {
      const move = (e: MouseEvent) => {
        const rect = (el as HTMLElement).getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) * 0.25
        const y = (e.clientY - rect.top - rect.height / 2) * 0.25
        ;(el as HTMLElement).style.transform = `translate(${x}px, ${y}px)`
        ;(el as HTMLElement).style.transition = 'transform 0.2s cubic-bezier(0.16,1,0.3,1)'
      }
      const leave = () => {
        ;(el as HTMLElement).style.transform = 'translate(0,0)'
        ;(el as HTMLElement).style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)'
      }
      el.addEventListener('mousemove', move as EventListener)
      el.addEventListener('mouseleave', leave)
      magneticHandlers.push({ el, move, leave })
    })

    // ── 5. COUNT-UP NUMBERS ───────────────────────────────────────────
    const countEls = document.querySelectorAll('[data-count]')
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const el = e.target as HTMLElement
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
        countIo.unobserve(el)
      })
    }, { threshold: 0.5 })
    countEls.forEach(el => countIo.observe(el))

    return () => {
      io.disconnect()
      countIo.disconnect()
      countIo2.disconnect()
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('scroll', handleNavScroll)
      magnetics.forEach((el, i) => {
        el.removeEventListener('mousemove', magneticHandlers[i].move as EventListener)
        el.removeEventListener('mouseleave', magneticHandlers[i].leave)
      })
      tiltHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move as EventListener)
        el.removeEventListener('mouseleave', leave)
      })
    }
  }, [pathname])

  return null
}

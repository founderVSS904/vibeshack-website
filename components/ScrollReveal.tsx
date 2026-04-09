'use client'
import { useEffect, useRef, ReactNode } from 'react'

// Global scroll reveal — wraps any element, reveals it as it enters viewport
// variant: 'up' | 'fade' | 'left' | 'right' | 'scale' | 'none'
interface Props {
  children: ReactNode
  variant?: 'up' | 'fade' | 'left' | 'right' | 'scale'
  delay?: number   // ms
  duration?: number // ms
  threshold?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'span' | 'li'
}

const INITIAL_STYLES: Record<string, React.CSSProperties> = {
  up:    { opacity: 0, transform: 'translateY(40px)' },
  fade:  { opacity: 0 },
  left:  { opacity: 0, transform: 'translateX(-40px)' },
  right: { opacity: 0, transform: 'translateX(40px)' },
  scale: { opacity: 0, transform: 'scale(0.94)' },
}

export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  duration = 700,
  threshold = 0.1,
  className = '',
  as: Tag = 'div',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Apply initial state immediately
    Object.assign(el.style, {
      ...INITIAL_STYLES[variant],
      transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      willChange: 'opacity, transform',
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'none'
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '-60px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [variant, delay, duration, threshold])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

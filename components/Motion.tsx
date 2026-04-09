'use client'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef, ReactNode } from 'react'

// Fade up — words and paragraphs materialize as you scroll to them
export function FadeUp({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

// Fade in — images and cards that appear cleanly
export function FadeIn({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.9, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}

// Stagger children — for grids and lists
export function StaggerParent({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerChild({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}

// Parallax image — subtle depth as you scroll past
export function ParallaxImage({ src, alt, className = '', style = {} }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])
  return (
    <div ref={ref} className="overflow-hidden" style={style}>
      <motion.img src={src} alt={alt} style={{ y }} className={className} />
    </div>
  )
}

// Reveal line — a horizontal line that draws itself
export function RevealLine({ className = '' }: { className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      className={`h-px bg-white/20 ${className}`}
      initial={{ scaleX: 0, transformOrigin: 'left' }}
      animate={inView ? { scaleX: 1 } : {}}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    />
  )
}

// Counter — numbers count up when they enter view
export function CountUp({ value, suffix = '', className = '' }: { value: string; suffix?: string; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4 }}
    >
      {value}{suffix}
    </motion.span>
  )
}

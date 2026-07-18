'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

// The 3D VS mark: stacked copies along z read as an extruded slab. The sway
// animation only runs while the footer is actually on screen, so the
// compositor is not ticking layers the visitor cannot see.
export default function FooterMonogram() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="mb-6 flex justify-center" style={{ perspective: '700px' }}>
      <div className="footer-monogram-tilt">
        {/* Copies stacked along z turn the flat mark into an extruded slab;
            outer faces stay bright, inner layers darken into the side walls. */}
        <div
          className="footer-monogram-spin relative h-14 w-[100px]"
          style={{ animationPlayState: inView ? 'running' : 'paused' }}
        >
          {Array.from({ length: 15 }, (_, i) => (
            <Image
              key={i}
              src="/brand/vibeshack/monogram-3d-red-transparent-v20260715.png"
              alt={i === 14 ? 'VS' : ''}
              width={800}
              height={450}
              sizes="200px"
              className="absolute inset-0 h-full w-full"
              style={{
                transform: `translateZ(${i - 7}px)`,
                filter: i === 0 || i === 14 ? undefined : 'brightness(0.45) saturate(1.2)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

export type WheelSegment = {
  offset: number
  color: string
  label: string
  mood: string
}

export default function SunsetColorWheel({ segments }: { segments: WheelSegment[] }) {
  const [selectedWheelColor, setSelectedWheelColor] = useState(segments[0])
  const [hoveredWheelColor, setHoveredWheelColor] = useState<WheelSegment | null>(null)
  const activeWheelColor = hoveredWheelColor ?? selectedWheelColor

  return (
    <section className="py-32 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Color Wheel */}
          <div className="flex flex-col items-center justify-center gap-6 lg:items-start">
            <svg
              width="300"
              height="300"
              viewBox="0 0 300 300"
              className="max-w-xs drop-shadow-lg"
              aria-label="Interactive Sunset studio color wheel"
              onPointerLeave={() => setHoveredWheelColor(null)}
            >
              <defs>
                <radialGradient id="wheelGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                </radialGradient>
              </defs>
              {segments.map((segment, idx) => {
                const startAngle = (segment.offset * Math.PI) / 180 - Math.PI / 2
                const endAngle = ((segment.offset + 30) * Math.PI) / 180 - Math.PI / 2
                const radius = 130
                const x1 = 150 + radius * Math.cos(startAngle)
                const y1 = 150 + radius * Math.sin(startAngle)
                const x2 = 150 + radius * Math.cos(endAngle)
                const y2 = 150 + radius * Math.sin(endAngle)
                const selected = selectedWheelColor.label === segment.label
                const hovered = hoveredWheelColor?.label === segment.label
                const active = hovered || selected
                const midAngle = ((segment.offset + 15) * Math.PI) / 180 - Math.PI / 2
                const popDistance = hovered ? 11 : selected ? 5 : 0
                const popX = popDistance * Math.cos(midAngle)
                const popY = popDistance * Math.sin(midAngle)
                const scale = hovered ? 1.035 : selected ? 1.015 : 1

                return (
                  <path
                    key={idx}
                    d={`M 150 150 L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
                    fill={segment.color}
                    stroke="black"
                    strokeWidth={hovered ? 6 : selected ? 4 : 2}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${segment.label}`}
                    aria-pressed={selected}
                    className="cursor-pointer outline-none transition-[transform,opacity] duration-200 ease-out"
                    style={{
                      transform: `translate(${popX}px, ${popY}px) scale(${scale})`,
                      transformBox: 'view-box',
                      transformOrigin: '150px 150px',
                      opacity: active ? 1 : 0.88,
                      filter: hovered
                        ? `drop-shadow(0 14px 18px ${segment.color}55) brightness(1.14)`
                        : selected
                          ? `drop-shadow(0 8px 14px ${segment.color}35)`
                          : 'none',
                    }}
                    onPointerEnter={() => setHoveredWheelColor(segment)}
                    onPointerMove={() => setHoveredWheelColor(segment)}
                    onClick={() => setSelectedWheelColor(segment)}
                    onFocus={() => setHoveredWheelColor(segment)}
                    onBlur={() => setHoveredWheelColor(null)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setSelectedWheelColor(segment)
                      }
                    }}
                  />
                )
              })}
              {/* Outer ring glow effect */}
              <circle cx="150" cy="150" r="136" fill="none" stroke={activeWheelColor.color} strokeWidth="3" opacity="0.7" />
              {/* Center circle */}
              <circle cx="150" cy="150" r="60" fill="black" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <circle
                cx="150"
                cy="150"
                r={42}
                fill={activeWheelColor.color}
                opacity="0.85"
                className="transition-transform duration-200 ease-out"
                style={{
                  transform: hoveredWheelColor ? 'scale(1.12)' : 'scale(1)',
                  transformBox: 'view-box',
                  transformOrigin: '150px 150px',
                  filter: hoveredWheelColor ? `drop-shadow(0 0 18px ${activeWheelColor.color}77)` : 'none',
                }}
              />
            </svg>
            <div className="rounded-lg border border-white/10 bg-zinc-950/80 p-5 text-center lg:text-left">
              <p className="text-gray-500 font-mono text-[11px] font-bold uppercase tracking-[0.26em] mb-2">Selected mood</p>
              <p className="text-white text-2xl font-black" style={{ color: activeWheelColor.color }}>
                {activeWheelColor.label}
              </p>
              <p className="text-gray-400 text-sm mt-2 max-w-xs">{activeWheelColor.mood}</p>
            </div>
          </div>

          {/* Right: CTA */}
          <div>
            <h2 className="text-white font-black leading-none mb-6" style={{fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', letterSpacing: 0}}>
              Pick your <span style={{color: activeWheelColor.color}}>color.</span>
            </h2>
            <h3 className="text-white font-black leading-none mb-8" style={{fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: 0, color: activeWheelColor.color}}>
              {activeWheelColor.label}. We'll handle the rest.
            </h3>
            <p className="text-gray-400 text-base mb-12">$300/hr · Cameraman included · Open 24/7</p>
            <a href="/book/?studio=sunset" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              Book Sunset
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

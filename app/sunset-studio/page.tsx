'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function SunsetPage() {
  const colors = [
    { img: '/studio-images/sunset-red-v1775053057.jpg', name: 'Red' },
    { img: '/studio-images/sunset-blue-v1775053259.jpg', name: 'Blue' },
    { img: '/studio-images/sunset-green-v1775050495.jpg', name: 'Green' },
    { img: '/studio-images/sunset-purple-v1775080889.jpg', name: 'Purple' },
    { img: '/studio-images/sunset-white-v1775080644.jpg', name: 'White' },
    { img: '/studio-images/sunset-star-wars-v1775080748.jpg', name: 'Saber Green' },
    { img: '/studio-images/sunset-sunset-v1775053701.jpg', name: 'Sunset' },
  ]
  const wheelSegments = [
    { offset: 0, color: '#FF0000', label: 'Red', mood: 'high-energy, bold, and impossible to miss' },
    { offset: 30, color: '#FF6600', label: 'Orange', mood: 'warm, inviting, and creator-friendly' },
    { offset: 60, color: '#FFDD00', label: 'Yellow', mood: 'bright, optimistic, and punchy' },
    { offset: 90, color: '#00DD00', label: 'Green', mood: 'clean, unusual, and attention-grabbing' },
    { offset: 120, color: '#00DDDD', label: 'Cyan', mood: 'modern, crisp, and tech-forward' },
    { offset: 150, color: '#0099FF', label: 'Sky Blue', mood: 'cool, polished, and calm' },
    { offset: 180, color: '#0033FF', label: 'Blue', mood: 'deep, premium, and focused' },
    { offset: 210, color: '#7700FF', label: 'Purple', mood: 'cinematic, moody, and stylish' },
    { offset: 240, color: '#DD00DD', label: 'Magenta', mood: 'expressive, music-video ready, and loud' },
    { offset: 270, color: '#FF0099', label: 'Pink', mood: 'playful, social-first, and glossy' },
    { offset: 300, color: '#FFFFFF', label: 'White', mood: 'clean, minimal, and editorial' },
    { offset: 330, color: '#00FF66', label: 'Saber Green', mood: 'neon, sci-fi, and intentionally weird' },
  ]
  const [selectedWheelColor, setSelectedWheelColor] = useState(wheelSegments[0])
  const [hoveredWheelColor, setHoveredWheelColor] = useState<typeof wheelSegments[number] | null>(null)
  const activeWheelColor = hoveredWheelColor ?? selectedWheelColor

  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    // Respect reduced motion: no auto-scroll, leave the strip scrollable by hand
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const wrapper = carousel.parentElement
      if (wrapper) wrapper.style.overflowX = 'auto'
      return
    }

    // Calculate scroll distance and duration
    const itemWidth = 280 + 12 // item width + gap
    const totalItems = colors.length
    const scrollDistance = itemWidth * totalItems
    const duration = 18000 // 18 seconds in milliseconds

    let animationStartTime: number | null = null
    let pausedAt: number | null = null
    let animationId = 0

    const animate = (currentTime: number) => {
      if (animationStartTime === null) animationStartTime = currentTime

      if (pausedAt === null) {
        const elapsedTime = currentTime - animationStartTime
        const progress = (elapsedTime % duration) / duration
        const translateDistance = scrollDistance * progress

        carousel.style.transform = `translateX(-${translateDistance}px)`
        carousel.style.transition = 'none'
      }

      animationId = requestAnimationFrame(animate)
    }

    // Pause while hovered or focused so the card links stay clickable
    const pause = () => {
      if (pausedAt === null) pausedAt = performance.now()
    }
    const resume = () => {
      if (pausedAt !== null && animationStartTime !== null) {
        animationStartTime += performance.now() - pausedAt
      }
      pausedAt = null
    }

    carousel.addEventListener('pointerenter', pause)
    carousel.addEventListener('pointerleave', resume)
    carousel.addEventListener('focusin', pause)
    carousel.addEventListener('focusout', resume)

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      carousel.removeEventListener('pointerenter', pause)
      carousel.removeEventListener('pointerleave', resume)
      carousel.removeEventListener('focusin', pause)
      carousel.removeEventListener('focusout', resume)
    }
  }, [colors.length])

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/sunset-hero-v20260509.jpg"
          alt="Sunset studio with warm golden backdrop lighting"
          fill className="object-cover opacity-85" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-xs font-bold tracking-widest uppercase mb-4 text-brand-red">Creative Series</p>
          <h1 className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: '-0.04em'}}>
            Sunset<span className="text-brand-red">.</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-xl mb-8">
            Pick your mood. Control the light. 12 colors. One dial. Your call.
          </p>
          <a href="/book/?studio=sunset" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
            Book Sunset
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
          </a>
        </div>
      </section>

      {/* Choose Your Mood - Carousel */}
      <section className="py-32 bg-black border-t border-white/5 overflow-hidden" data-carousel>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 mb-12">
          <h2 className="text-white font-black leading-none" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
            Choose your <span className="text-brand-red">mood.</span>
          </h2>
        </div>
        
        <style>{`
          .carousel-wrapper {
            overflow: hidden;
            width: 100%;
          }
          .carousel-inner {
            display: flex;
            gap: 12px;
            padding: 0 24px;
            width: fit-content;
          }
          .carousel-item {
            flex-shrink: 0;
            width: 280px;
          }
          .carousel-link {
            cursor: pointer;
            position: relative;
            user-select: none;
            display: flex;
            flex-direction: column;
          }
          .carousel-link img {
            width: 100%;
            height: 260px;
            object-fit: cover;
            border-radius: 0.5rem 0.5rem 0 0;
            transition: transform 0.7s ease-out;
          }
          .carousel-link:hover img {
            transform: scale(1.035);
          }
          .carousel-label {
            background: rgba(0, 0, 0, 0.6);
            color: #d1d5db;
            padding: 16px 12px 18px;
            text-align: center;
            font-size: 14px;
            line-height: 1.4;
            border-radius: 0 0 0.5rem 0.5rem;
            transition: background 0.3s ease, color 0.3s ease;
            backdrop-filter: blur(8px);
            min-height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .carousel-link:hover .carousel-label {
            background: rgba(0, 0, 0, 0.8);
            color: #f3f4f6;
          }
        `}</style>

        <div className="carousel-wrapper" aria-label="Sunset color examples">
          <div className="carousel-inner" ref={carouselRef}>
            {colors.map(({ img, name }) => (
              <div key={name} className="carousel-item">
                <a
                  href={`/book/?studio=sunset&color=${encodeURIComponent(name.toLowerCase())}`}
                  className="carousel-link"
                >
                  <Image src={img} alt={`Sunset ${name}`} width={280} height={256} className="w-full h-64 object-cover" />
                  <p className="carousel-label">{name}</p>
                </a>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {colors.map(({ img, name }) => (
              <div key={`${name}-2`} className="carousel-item">
                <a
                  href={`/book/?studio=sunset&color=${encodeURIComponent(name.toLowerCase())}`}
                  className="carousel-link"
                >
                  <Image src={img} alt={`Sunset ${name}`} width={280} height={256} className="w-full h-64 object-cover" />
                  <p className="carousel-label">{name}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Studio - Features */}
      <section className="py-32 bg-zinc-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Features */}
            <div>
              <h2 className="text-white font-black leading-none mb-12" style={{fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                You control<br/>the <span className="text-brand-red">mood.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {[
                  '12 programmable colors',
                  '3-camera 4K setup',
                  'Cameraman included',
                  'Wireless mic system',
                  'Broadcast lighting',
                  'Color matching for brands',
                  'Pre-set moods ready',
                  'Full creative control',
                ].map(item => (
                  <div key={item} className="py-4 text-gray-400 text-base">{item}</div>
                ))}
              </div>
            </div>
            {/* Right: Photo */}
            <div>
              <Image src="/studio-images/sunset-hero-v20260509.jpg" alt="Sunset studio setup" width={800} height={600} className="w-full h-auto rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Sunset */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">The Difference</span>
          <h2 className="text-white font-black leading-none mb-4" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
            Programmable <span className="text-brand-red">means you decide.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-20 max-w-2xl">Every color is pre-calibrated and one dial away. Don't compromise on the mood your show needs. Paint the room to match your vision, not the other way around.</p>
          
          <div className="space-y-24">
            {/* Detail 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-1">
                <Image src="/studio-images/sunset-detail-02.jpg" alt="Sunset warm orange tones" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
              </div>
              <div className="order-2">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>Warm Tones Make People Look Human</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Gold. Orange. Warm reds. These colors do the heavy lifting for you. They make skin look healthy. They feel intimate. They photograph true to what people expect. Most shows live in these tones for a reason. One dial does all of it.</p>
                <p className="text-gray-500 text-sm">Podcast hosts use this. Creators use this. Brands use this.</p>
              </div>
            </div>

            {/* Detail 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>Bold Colors Stop Scrolls</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Red. Purple. Magenta. White. Blue. Saber Green. When you need your show to command attention, paint the room. Your audience's eyes lock in. Your brand pops out of the feed. Energy, edge, presence you can't ignore. All from the color dial. No gels. No rewiring. One turn.</p>
                <p className="text-gray-500 text-sm">Music videos and comedy specials book this room for exactly this.</p>
              </div>
              <div className="order-1 md:order-2">
                <Image src="/studio-images/sunset-detail-01.jpg" alt="Sunset bold red colors" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Color Wheel - Call to Action */}
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
                {wheelSegments.map((segment, idx) => {
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
              <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 text-center lg:text-left">
                <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase mb-2">Selected mood</p>
                <p className="text-white text-2xl font-black" style={{ color: activeWheelColor.color }}>
                  {activeWheelColor.label}
                </p>
                <p className="text-gray-400 text-sm mt-2 max-w-xs">{activeWheelColor.mood}</p>
              </div>
            </div>
            
            {/* Right: CTA */}
            <div>
              <h2 className="text-white font-black leading-none mb-6" style={{fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Pick your <span style={{color: activeWheelColor.color}}>color.</span>
              </h2>
              <h3 className="text-white font-black leading-none mb-8" style={{fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.04em', color: activeWheelColor.color}}>
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

      {/* Pricing */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Pricing</span>
          <div className="text-brand-red font-black leading-none mb-2" style={{fontSize: 'clamp(5rem, 14vw, 10rem)', letterSpacing: '-0.05em'}}>$300</div>
          <p className="text-gray-500 text-lg mb-1">per hour</p>
          <p className="text-white font-semibold mb-12">Cameraman included. 1 hour minimum. Open 24/7.</p>
          <div className="divide-y divide-white/10 border-y border-white/10 mb-12">
            {[
              { label: '2 Hours', price: '$600' },
              { label: '4 Hours', price: '$1,200' },
              { label: '8 Hours', price: '$2,400' },
            ].map(({ label, price }) => (
              <div key={label} className="flex items-center justify-between py-4">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className="text-white font-black text-lg">{price}</span>
              </div>
            ))}
          </div>
          <a href="/book/?studio=sunset" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
            Book Sunset
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
          </a>
          <p className="text-gray-700 text-xs mt-4">Instant confirmation. Free cancellation 48hrs before.</p>
        </div>
      </section>

      {/* Explore Other Studios */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-16">
            <span className="number-label mb-6 block">More Studios</span>
            <h2 className="text-white font-black leading-none" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
              Other rooms in the<br/><span className="text-brand-red">Creative Series.</span>
            </h2>
          </div>
          <a href="/canvas-podcast/" className="relative overflow-hidden rounded-3xl group block w-full" style={{height: '400px'}}>
            <Image src="/studio-images/parlor-hero.jpg" alt="Canvas Podcast premium studio" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" />
            <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 40%)'}} />
            <div className="absolute bottom-0 left-0 right-0 p-12">
              <p className="text-xs font-bold tracking-widest uppercase mb-3 text-brand-red">Creative Series</p>
              <h3 className="text-white font-black leading-none mb-3" style={{fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.04em'}}>Canvas Podcast</h3>
              <p className="text-gray-300 text-lg max-w-md mb-6">Signature podcast spaces. Customizable setups. Premium production crew included.</p>
              <p className="text-gray-400 text-sm">$400/hr · Podcast production</p>
            </div>
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h2 className="font-black text-white leading-none mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em' }}>
            Pick your <span className="text-brand-red">color.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10">$300/hr. Cameraman included. Instant confirmation.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/book/?studio=sunset" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              Book Your Session
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
            </a>
            <a href="/tour/?studio=sunset" className="text-gray-500 hover:text-white transition-colors text-sm self-center">Schedule a free tour →
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

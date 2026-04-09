'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function SunsetPage() {
  const colors = [
    { img: '/studio-images/sunset-red-v1775053057.jpg', name: 'Red' },
    { img: '/studio-images/sunset-blue-v1775053259.jpg', name: 'Blue' },
    { img: '/studio-images/sunset-green-v1775050495.jpg', name: 'Green' },
    { img: '/studio-images/sunset-purple-v1775080889.jpg', name: 'Purple' },
    { img: '/studio-images/sunset-white-v1775080644.jpg', name: 'White' },
    { img: '/studio-images/sunset-star-wars-v1775080748.jpg', name: 'Star Wars' },
    { img: '/studio-images/sunset-sunset-v1775053701.jpg', name: 'Sunset' },
  ]

  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    // Calculate scroll distance and duration
    const itemWidth = 280 + 12 // item width + gap
    const totalItems = colors.length
    const scrollDistance = itemWidth * totalItems
    const duration = 18000 // 18 seconds in milliseconds

    let animationStartTime: number | null = null
    let isRunning = true

    const animate = (currentTime: number) => {
      if (animationStartTime === null) animationStartTime = currentTime
      
      if (!isRunning) {
        animationStartTime = null
        return
      }

      const elapsedTime = currentTime - animationStartTime
      const progress = (elapsedTime % duration) / duration
      const translateDistance = scrollDistance * progress

      carousel.style.transform = `translateX(-${translateDistance}px)`
      carousel.style.transition = 'none'

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      isRunning = false
      cancelAnimationFrame(animationId)
    }
  }, [colors.length])

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/sunset-hero.jpg"
          alt="Sunset studio with warm golden backdrop lighting"
          fill className="object-cover object-bottom md:object-center opacity-85" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{color: '#99f6e4'}}>Creative Series</p>
          <h1 data-reveal="up" className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: '-0.04em'}}>
            Sunset
          </h1>
          <p className="text-gray-400 text-xl max-w-xl mb-8" data-reveal="fade">
            Pick your mood. Control the light. 12 colors, infinite possibilities.
          </p>
          <a href="/book?studio=sunset" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
            Book Sunset
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* Choose Your Mood - Carousel */}
      <section className="py-32 bg-black border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 mb-12">
          <h2 data-reveal="up" className="text-white font-black leading-none" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
            Choose your <span style={{color: '#99f6e4'}}>mood.</span>
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
            transition: transform 0.3s ease;
          }
          .carousel-link:hover img {
            transform: scale(1.06);
          }
          .carousel-label {
            background: rgba(0, 0, 0, 0.6);
            color: #d1d5db;
            padding: 16px 12px 18px;
            text-align: center;
            font-size: 14px;
            line-height: 1.4;
            border-radius: 0 0 0.5rem 0.5rem;
            transition: all 0.3s ease;
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

        <div className="carousel-wrapper">
          <div className="carousel-inner" ref={carouselRef}>
            {colors.map(({ img, name }) => (
              <div key={name} className="carousel-item">
                <a
                  href={`/book?studio=sunset&color=${name.toLowerCase()}`}
                  className="carousel-link"
                >
                  <Image src={img} alt={`Sunset ${name}`} width={280} height={256} className="w-full h-64 object-cover" />
                  <p className="carousel-label text-gray-500 text-sm mt-2 transition-colors">{name}</p>
                </a>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {colors.map(({ img, name }) => (
              <div key={`${name}-2`} className="carousel-item">
                <a
                  href={`/book?studio=sunset&color=${name.toLowerCase()}`}
                  className="carousel-link"
                >
                  <Image src={img} alt={`Sunset ${name}`} width={280} height={256} className="w-full h-64 object-cover" />
                  <p className="carousel-label text-gray-500 text-sm mt-2 transition-colors">{name}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Studio - Features */}
      <section className="py-32 bg-zinc-950 border-t" style={{borderColor: '#99f6e4'}}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Features */}
            <div>
              <h2 data-reveal="up" className="text-white font-black leading-none mb-12" style={{fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                You control<br/>the <span style={{color: '#99f6e4'}}>mood.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {[
                  '12 programmable colors',
                  'Dual-angle camera setup',
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
              <Image src="/studio-images/sunset-hero.jpg" alt="Sunset studio setup" width={800} height={600} className="w-full h-auto rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Sunset */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">The Difference</span>
          <h2 data-reveal="up" className="text-white font-black leading-none mb-4" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
            Programmable <span style={{color: '#99f6e4'}}>means you decide.</span>
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
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Gold. Orange. Warm reds. These colors do the heavy lifting for you. They make skin look healthy. They feel intimate. They photograph true to what people expect. Most shows live in these vibes because they just work. One dial. Infinite warmth.</p>
                <p className="text-gray-500 text-sm">Podcast hosts use this. Creators use this. Brands use this.</p>
              </div>
            </div>

            {/* Detail 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>Bold Colors Stop Scrolls</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Red. Purple. Magenta. White. Blue. Star Wars green. When you need your show to command attention, paint the room. Your audience's eyes lock in. Your brand pops out of the feed. Energy, edge, unmissable presence—all from the color dial. No gels. No rewiring. Just one turn.</p>
                <p className="text-gray-500 text-sm">Music videos use this. Comedy specials use this. Brand content uses this.</p>
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
            <div className="flex justify-center lg:justify-start">
              <svg width="300" height="300" viewBox="0 0 300 300" className="max-w-xs drop-shadow-lg">
                <defs>
                  <radialGradient id="wheelGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                  </radialGradient>
                </defs>
                {/* Color wheel with 12 vibrant segments */}
                {[
                  { offset: 0, color: '#FF0000', label: 'Red' },           /* Bright Red */
                  { offset: 30, color: '#FF6600', label: 'Orange' },        /* Vibrant Orange */
                  { offset: 60, color: '#FFDD00', label: 'Yellow' },        /* Bright Yellow */
                  { offset: 90, color: '#00DD00', label: 'Green' },         /* Bright Green */
                  { offset: 120, color: '#00DDDD', label: 'Cyan' },         /* Bright Cyan */
                  { offset: 150, color: '#0099FF', label: 'Sky' },          /* Bright Sky Blue */
                  { offset: 180, color: '#0033FF', label: 'Blue' },         /* Bright Blue */
                  { offset: 210, color: '#7700FF', label: 'Purple' },       /* Vibrant Purple */
                  { offset: 240, color: '#DD00DD', label: 'Magenta' },      /* Vibrant Magenta */
                  { offset: 270, color: '#FF0099', label: 'Pink' },         /* Bright Pink */
                  { offset: 300, color: '#FFFFFF', label: 'White' },        /* White */
                  { offset: 330, color: '#00FF66', label: 'Star Wars' },    /* Lime Green */
                ].map((segment, idx) => {
                  const startAngle = (segment.offset * Math.PI) / 180 - Math.PI / 2
                  const endAngle = ((segment.offset + 30) * Math.PI) / 180 - Math.PI / 2
                  const radius = 130
                  const x1 = 150 + radius * Math.cos(startAngle)
                  const y1 = 150 + radius * Math.sin(startAngle)
                  const x2 = 150 + radius * Math.cos(endAngle)
                  const y2 = 150 + radius * Math.sin(endAngle)
                  
                  return (
                    <path
                      key={idx}
                      d={`M 150 150 L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      stroke="black"
                      strokeWidth="2"
                    />
                  )
                })}
                {/* Outer ring glow effect */}
                <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                {/* Center circle */}
                <circle cx="150" cy="150" r="60" fill="black" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </svg>
            </div>
            
            {/* Right: CTA */}
            <div>
              <h2 className="text-white font-black leading-none mb-6" style={{fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Pick your <span style={{color: '#ff3333'}}>color.</span>
              </h2>
              <h3 className="text-white font-black leading-none mb-8" style={{fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.04em', color: '#ff3333'}}>
                We'll handle the rest.
              </h3>
              <p className="text-gray-400 text-base mb-12">$300/hr · Cameraman included · Open 24/7</p>
              <a href="/book?studio=sunset" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded-full hover:bg-gray-100 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
                Book Sunset
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
          <p className="text-gray-500 text-lg mb-1" data-reveal="fade">per hour</p>
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
          <a href="/book?studio=sunset" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
            Book Sunset
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <p className="text-gray-700 text-xs mt-4">Instant confirmation. Free cancellation 48hrs before.</p>
        </div>
      </section>

      {/* Explore Other Studios */}
      <section className="py-48 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-16">
            <span className="number-label mb-6 block">More Studios</span>
            <h2 data-reveal="up" className="text-white font-black leading-none" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
              Other rooms in the<br/><span style={{color: '#99f6e4'}}>Creative Series.</span>
            </h2>
          </div>
          <a href="/canvas-podcast" className="relative overflow-hidden rounded-3xl group block w-full" style={{height: '400px'}}>
            <Image src="/studio-images/parlor-hero.jpg" alt="Canvas Podcast premium studio" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 40%)'}} />
            <div className="absolute bottom-0 left-0 right-0 p-12">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{color: '#99f6e4'}}>Creative Series</p>
              <h3 className="text-white font-black leading-none mb-3" style={{fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.04em'}}>Canvas Podcast</h3>
              <p className="text-gray-300 text-lg max-w-md mb-6">Signature podcast spaces. Customizable setups. Premium production crew included.</p>
              <p className="text-gray-400 text-sm">$300/hr · Podcast production</p>
            </div>
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h2 data-reveal="up" className="font-black text-white leading-none mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em' }}>
            Pick your <span style={{color: '#99f6e4'}}>color.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10" data-reveal="fade">$300/hr. Cameraman included. Instant confirmation.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/book?studio=sunset" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
              Book Your Session
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="/contact" className="text-gray-500 hover:text-white transition-colors text-sm self-center">Schedule a free tour →
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

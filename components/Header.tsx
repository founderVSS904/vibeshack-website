'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const podcastStudios = [
  { href: '/podcast-studio-san-francisco', label: 'All Podcast Studios', price: '' },
  { href: '/the-executive', label: 'The Executive', price: '$300/hr' },
  { href: '/the-wing',                 label: 'The Wing',      price: '$300/hr' },
  { href: '/encore',                       label: 'Encore',        price: '$300/hr' },
  { href: '/sunset-studio',                label: 'Sunset',        price: '$300/hr' },
  { href: '/parlor',                        label: 'Parlor',        price: '$300/hr' },
  { href: '/horizon',                       label: 'Horizon',       price: '$300/hr' },
  { href: '/premier',                      label: 'Premier',       price: '$300/hr' },
]

const rentalStudios = [
  { href: '/rental-studios',                       label: 'All Rental Studios', price: '' },
  { href: '/white-backdrop-studio',                label: 'Canvas Rental',      price: '$100/hr' },
  { href: '/photography-studio-san-francisco',     label: 'Photography Studio', price: '$100/hr' },
  { href: '/green-screen-studio-sf',               label: 'Green Screen',       price: '$100/hr' },
]

export default function Header() {
  const [menuOpen, setMenuOpen]       = useState(false)
  const [studiosOpen, setStudiosOpen] = useState(false)
  const [visible, setVisible]         = useState(true)
  const [scrolled, setScrolled]       = useState(false)
  const [lastY, setLastY]             = useState(0)
  const dropdownRef                   = useRef<HTMLDivElement>(null)
  const pathname                      = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      if (y < 80) { setVisible(true) }
      else if (y > lastY + 4) { setVisible(false); setMenuOpen(false); setStudiosOpen(false) }
      else if (y < lastY - 4) { setVisible(true) }
      setLastY(y)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastY])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setStudiosOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setStudiosOpen(false) }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const navLinkClass = (href: string) =>
    `text-sm tracking-wide transition-colors duration-200 relative group ${
      isActive(href) ? 'text-white' : 'text-gray-400 hover:text-white'
    }`

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: scrolled ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.6)',
        backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'blur(12px)',
        borderColor: scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
      }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity duration-200">
            <span className="text-brand-red font-black tracking-tight" style={{fontSize: '1.25rem', letterSpacing: '-0.04em'}}>
              VibeShack
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">

            {/* Studios dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setStudiosOpen(!studiosOpen)}
                onMouseEnter={() => setStudiosOpen(true)}
                className={`flex items-center gap-1 text-sm tracking-wide transition-colors duration-200 ${
                  ['/the-executive','/sunset-studio','/encore','/the-wing','/canvas-podcast','/premier','/white-backdrop-studio','/photography-studio-san-francisco','/green-screen-studio-sf','/podcast-studio-san-francisco','/rental-studios'].some(h => pathname.startsWith(h))
                    ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}>
                Studios
                <svg className={`w-3 h-3 transition-transform duration-200 ${studiosOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {/* Dropdown */}
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 rounded-2xl overflow-hidden border border-white/10"
                style={{
                  background: 'rgba(10,10,10,0.97)',
                  backdropFilter: 'blur(24px)',
                  opacity: studiosOpen ? 1 : 0,
                  transform: studiosOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
                  pointerEvents: studiosOpen ? 'auto' : 'none',
                  transition: 'opacity 0.2s cubic-bezier(0.16,1,0.3,1), transform 0.2s cubic-bezier(0.16,1,0.3,1)',
                }}
                onMouseLeave={() => setStudiosOpen(false)}>
                <div className="p-3">
                  {/* Podcast */}
                  {podcastStudios.map(({ href, label, price }, i) => {
                    const isHub = i === 0
                    return (
                      <Link key={href + label} href={href} onClick={() => setStudiosOpen(false)}
                        className={`flex items-center justify-between px-3 rounded-xl hover:bg-white/5 transition-colors duration-150 group ${isHub ? 'py-3 mb-1' : 'py-2'}`}>
                        <span className={`text-sm transition-colors duration-150 group-hover:text-white ${
                          pathname === href ? 'text-white' : isHub ? 'text-white font-bold' : 'text-gray-400'
                        }`}>{label}</span>
                        {price && <span className="text-gray-600 text-xs">{price}</span>}
                        {isHub && <span className="text-gray-600 text-xs">→</span>}
                      </Link>
                    )
                  })}

                  {/* Rentals */}
                  <div className="border-t border-white/8 mt-2 pt-1">
                  {rentalStudios.map(({ href, label, price }, i) => {
                    const isHub = i === 0
                    return (
                      <Link key={href + label} href={href} onClick={() => setStudiosOpen(false)}
                        className={`flex items-center justify-between px-3 rounded-xl hover:bg-white/5 transition-colors duration-150 group ${isHub ? 'py-3 mb-1' : 'py-2'}`}>
                        <span className={`text-sm transition-colors duration-150 group-hover:text-white ${
                          pathname === href ? 'text-white' : isHub ? 'text-white font-bold' : 'text-gray-400'
                        }`}>{label}</span>
                        {price && <span className="text-gray-600 text-xs">{price}</span>}
                        {isHub && <span className="text-gray-600 text-xs">→</span>}
                      </Link>
                    )
                  })}
                  </div>
                </div>
              </div>
            </div>

            <a href="/find-your-studio" className={navLinkClass('/find-your-studio')}>
              Find a Studio
              {isActive('/find-your-studio') && <span className="absolute -bottom-1 left-0 w-full h-px bg-brand-red" />}
            </a>
            <Link href="/pricing" className={navLinkClass('/pricing')}>
              Pricing
              {isActive('/pricing') && <span className="absolute -bottom-1 left-0 w-full h-px bg-brand-red" />}
            </Link>
            <Link href="/about" className={navLinkClass('/about')}>
              About
              {isActive('/about') && <span className="absolute -bottom-1 left-0 w-full h-px bg-brand-red" />}
            </Link>
            <Link href="/made-at-vibeshack" className={navLinkClass('/made-at-vibeshack')}>
              Shot Here
              {isActive('/made-at-vibeshack') && <span className="absolute -bottom-1 left-0 w-full h-px bg-brand-red" />}
            </Link>
            <Link href="/support" className={navLinkClass('/support')}>
              Support
              {isActive('/support') && <span className="absolute -bottom-1 left-0 w-full h-px bg-brand-red" />}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link href="/book"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-full border border-white/20 hover:border-white/50 hover:bg-white/8 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer">
              Book
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            <button className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu — animated */}
        <div
          className="lg:hidden overflow-hidden"
          style={{
            maxHeight: menuOpen ? '600px' : '0px',
            opacity: menuOpen ? 1 : 0,
            transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
          }}>
          <div className="border-t border-white/8 py-6">
            <div className="mb-4">
              <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mb-3">Podcast</p>
              <div className="space-y-1">
                {podcastStudios.map(({ href, label, price }) => (
                  <Link key={href + label} href={href}
                    className={`flex items-center justify-between py-3 min-h-[44px] transition-colors duration-150 ${
                      pathname === href ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setMenuOpen(false)}>
                    <span className="text-sm">{label}</span>
                    <span className="text-gray-600 text-xs">{price}</span>
                  </Link>
                ))}
              </div>
              <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mb-3 mt-5">Rentals</p>
              <div className="space-y-1">
                {rentalStudios.map(({ href, label, price }) => (
                  <Link key={href + label} href={href}
                    className={`flex items-center justify-between py-3 min-h-[44px] transition-colors duration-150 ${
                      pathname === href ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setMenuOpen(false)}>
                    <span className="text-sm">{label}</span>
                    <span className="text-gray-600 text-xs">{price}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="border-t border-white/8 pt-4 space-y-3">
              <a href="/find-your-studio" className={`block text-sm py-2 min-h-[44px] flex items-center transition-colors duration-150 ${isActive('/find-your-studio') ? 'text-white' : 'text-gray-400 hover:text-white'}`} onClick={() => setMenuOpen(false)}>Find a Studio</a>
              <Link href="/pricing" className={`block text-sm py-2 min-h-[44px] flex items-center transition-colors duration-150 ${isActive('/pricing') ? 'text-white' : 'text-gray-400 hover:text-white'}`} onClick={() => setMenuOpen(false)}>Pricing</Link>
              <Link href="/about" className={`block text-sm py-2 min-h-[44px] flex items-center transition-colors duration-150 ${isActive('/about') ? 'text-white' : 'text-gray-400 hover:text-white'}`} onClick={() => setMenuOpen(false)}>About</Link>
              <Link href="/made-at-vibeshack" className={`block text-sm py-2 min-h-[44px] flex items-center transition-colors duration-150 ${isActive('/made-at-vibeshack') ? 'text-white' : 'text-gray-400 hover:text-white'}`} onClick={() => setMenuOpen(false)}>Shot Here</Link>
              <Link href="/support" className={`block text-sm py-2 min-h-[44px] flex items-center transition-colors duration-150 ${isActive('/support') ? 'text-white' : 'text-gray-400 hover:text-white'}`} onClick={() => setMenuOpen(false)}>Support</Link>
              <Link href="/book"
                className="inline-flex items-center gap-2 text-white font-semibold text-sm mt-2 px-5 py-3 min-h-[44px] bg-brand-red rounded-full hover:bg-red-700 transition-colors duration-200"
                onClick={() => setMenuOpen(false)}>
                Book a Session →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { BrandMark } from '@/components/BrandMark'

// True once a mega menu has been opened; menu media mounts on first open so
// closed menus cost zero image requests on page load.
const MenuMediaContext = createContext(false)

type HeaderLink = {
  href: string
  label: string
  detail?: string
  price?: string
  image?: string
}

const podcastStudios: HeaderLink[] = [
  { href: '/podcast-studio-san-francisco/', label: 'All Podcast Studios', detail: 'Compare every podcast set' },
  { href: '/the-executive/', label: 'The Executive', detail: 'Boardroom set, three cameras', price: '$300/hr', image: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg' },
  { href: '/the-wing/', label: 'The Wing', detail: 'Warm two-person conversation set', price: '$300/hr', image: '/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg' },
  { href: '/encore/', label: 'Encore', detail: 'Treated set with clean sightlines', price: '$300/hr', image: '/studio-images/enhanced-encore-podcast-wide-v20260510.jpg' },
  { href: '/sunset-studio/', label: 'Sunset', detail: 'Color-backed creative podcast set', price: '$300/hr', image: '/studio-images/sunset-hero-v20260509.jpg' },
  { href: '/parlor/', label: 'Parlor', detail: 'Signature lounge interview set', price: '$400/hr', image: '/studio-images/parlor-production-v20260509.jpg' },
  { href: '/horizon/', label: 'Horizon', detail: 'Warm sunset podcast and interview set', price: '$400/hr', image: '/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg' },
  { href: '/canvas-podcast/', label: 'Canvas Podcast', detail: 'Large-format custom podcast set', price: '$400/hr', image: '/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg' },
]

const rentalStudios: HeaderLink[] = [
  { href: '/rental-studios/', label: 'All Rental Studios', detail: 'White cyc, green screen, photo rooms', image: '/studio-images/canvas-rental-space-v20260509.jpg' },
  { href: '/canvas-rental/', label: 'Canvas Rental', detail: 'White cyc and open production floor', price: '$100/hr', image: '/studio-images/enhanced-canvas-podcast-white-cyc-duo-v20260510.jpg' },
  { href: '/green-screen-studio-sf/', label: 'Green Screen', detail: 'Full green wall for compositing', price: '$100/hr', image: '/studio-images/inside-green-screen-v20260509.jpg' },
]

const serviceLinks: HeaderLink[] = [
  { href: '/services/', label: 'All Services', detail: 'Choose the right path before the room' },
  { href: '/commercials/', label: 'Commercials', detail: 'Launch ads, talking heads, product demos' },
  { href: '/editorials/', label: 'Editorials', detail: 'Fashion, beauty, portraits, campaign stills' },
  { href: '/branding/', label: 'Branding', detail: 'Creative direction, launches, content systems' },
  { href: '/podcast-studio-san-francisco/', label: 'Podcast Production', detail: 'Sets with cameras, audio, and crew' },
  { href: '/rental-studios/', label: 'Studio Rentals', detail: 'White cyc, green screen, photo rooms' },
  { href: '/video-production/', label: 'All Video Production', detail: 'Social content, music videos, brand video' },
  { href: '/photo-services/', label: 'All Photo Services', detail: 'Headshots, portraits, products, campaigns' },
]

const planningLinks: HeaderLink[] = [
  { href: '/find-your-studio/', label: 'Find a Studio', detail: 'Pick by goal, room style, and deliverable' },
  { href: '/pricing/', label: 'Pricing', detail: 'See room rates and production starting points' },
  { href: '/book/', label: 'Book a Session', detail: 'Reserve studio time with live availability' },
  { href: '/tour/', label: 'Tour the Studio', detail: 'Book a walkthrough before a bigger shoot' },
]

const proofLinks: HeaderLink[] = [
  { href: '/our-work/', label: 'Our Work', detail: 'Portfolio, music videos, campaigns, proof' },
  { href: '/made-at-vibeshack/', label: 'Brands That Trust Us', detail: 'See the trusted-by wall' },
  { href: '/studio-guides/', label: 'Studio Guides', detail: 'Prep smarter before the session' },
  { href: '/use-cases/', label: 'Use Cases', detail: 'Choose by outcome and client need' },
  { href: '/compare/', label: 'Compare Studios', detail: 'Understand the tradeoffs before booking' },
  { href: '/support/', label: 'Support', detail: 'Questions, policies, and help' },
]

const signaturePodcastStudios = podcastStudios.slice(5)

const navLinkClass =
  'relative font-mono text-[12px] uppercase tracking-[0.18em] whitespace-nowrap text-gray-400 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red'

const menuButtonClass =
  'flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.18em] whitespace-nowrap text-gray-400 transition-colors duration-200 group-hover:text-white group-focus-within:text-white'

export default function Header() {
  const pathname = usePathname()
  const [dismissedMenu, setDismissedMenu] = useState<string | null>(null)
  const mobileMenuRef = useRef<HTMLDetailsElement>(null)

  const closeMobileMenu = useCallback(() => {
    mobileMenuRef.current?.removeAttribute('open')
  }, [])

  // The details element is uncontrolled and Header never remounts on client
  // navigation, so the panel must be closed for it.
  useEffect(() => {
    closeMobileMenu()
  }, [pathname, closeMobileMenu])

  // While the mobile menu covers the page, keep the content behind it out of
  // the tab order. The header itself stays interactive: the logo, Book CTA,
  // and close toggle are visible above the panel.
  useEffect(() => {
    const details = mobileMenuRef.current
    if (!details) return
    const setBackgroundInert = (value: boolean) => {
      document.querySelectorAll<HTMLElement>('body > main, body > footer').forEach((el) => {
        if (value) el.setAttribute('inert', '')
        else el.removeAttribute('inert')
      })
    }
    const onToggle = () => setBackgroundInert(details.open)
    details.addEventListener('toggle', onToggle)
    return () => {
      details.removeEventListener('toggle', onToggle)
      setBackgroundInert(false)
    }
  }, [])

  // The details element hides at the xl breakpoint but stays open, which
  // would leave the page inert. Close it when the viewport crosses over.
  // 1280px must stay in lockstep with the xl:hidden class on the details.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1280px)')
    const onChange = () => {
      if (mediaQuery.matches) closeMobileMenu()
    }
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [closeMobileMenu])
  const headerClassName = 'site-header fixed left-0 right-0 top-0 z-50 border-b border-white/[0.08] bg-black transition-colors duration-200'
  const headerContainerClassName = 'mx-auto max-w-7xl px-6 sm:px-10 lg:px-16'

  const dismissMenu = (menuId: string) => {
    setDismissedMenu(menuId)
  }

  const resetMenu = (menuId: string) => {
    setDismissedMenu((currentMenu) => currentMenu === menuId ? null : currentMenu)
  }

  const primaryNavClass = (href: string) => {
    const normalizedHref = href.replace(/\/$/, '') || '/'
    const isActive = pathname === normalizedHref || (normalizedHref !== '/' && pathname.startsWith(`${normalizedHref}/`))
    return `${navLinkClass} ${
      isActive
        ? 'text-white after:absolute after:left-0 after:right-0 after:-bottom-2 after:h-0.5 after:bg-brand-red'
        : ''
    }`
  }

  return (
    <header className={headerClassName}>
      <div className={headerContainerClassName}>
        <div className="site-header-inner grid h-20 grid-cols-[auto_1fr_auto] items-center gap-6">
          <Link
            href="/"
            aria-label="VibeShack Studios home"
            className="flex flex-shrink-0 items-center transition-opacity duration-200 hover:opacity-80"
          >
            <BrandMark variant="monogram" priority className="h-8 w-auto sm:hidden" />
            <BrandMark variant="lockup" priority className="hidden h-[34px] w-auto sm:block" />
          </Link>

          <nav className="hidden items-center justify-center gap-7 xl:flex 2xl:gap-10" aria-label="Primary">
            <DesktopMenuTrigger
              dismissed={dismissedMenu === 'studios'}
              label="Studios"
              menuId="studios"
              onDismiss={() => dismissMenu('studios')}
              onReset={() => resetMenu('studios')}
            >
              <DesktopStudiosMenu onNavigate={() => dismissMenu('studios')} />
            </DesktopMenuTrigger>

            <DesktopMenuTrigger
              dismissed={dismissedMenu === 'services'}
              label="Services"
              menuId="services"
              onDismiss={() => dismissMenu('services')}
              onReset={() => resetMenu('services')}
            >
              <DesktopServicesMenu onNavigate={() => dismissMenu('services')} />
            </DesktopMenuTrigger>

            <Link href="/our-work/" className={primaryNavClass('/our-work/')}>Our Work</Link>
            <Link href="/pricing/" className={primaryNavClass('/pricing/')}>Pricing</Link>
            <Link href="/about/" className={primaryNavClass('/about/')}>About</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/book/"
              prefetch={false}
              className="relative inline-flex items-center gap-2.5 whitespace-nowrap rounded-lg bg-white px-4 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-black transition-colors duration-200 hover:bg-white/90 sm:px-5"
            >
              Book a Session
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </Link>

            <details ref={mobileMenuRef} className="group xl:hidden">
              <summary className="list-none p-3 text-gray-400 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red [&::-webkit-details-marker]:hidden">
                <span className="sr-only">Toggle menu</span>
                <svg className="h-5 w-5 group-open:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg className="hidden h-5 w-5 group-open:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </summary>

              <MobileMenu onNavigate={closeMobileMenu} />
            </details>
          </div>
        </div>
      </div>
    </header>
  )
}

function DesktopMenuTrigger({
  dismissed,
  label,
  menuId,
  onDismiss,
  onReset,
  children,
}: {
  dismissed: boolean
  label: string
  menuId: string
  onDismiss: () => void
  onReset: () => void
  children: ReactNode
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [hovered, setHovered] = useState(false)
  const [toggledOpen, setToggledOpen] = useState(false)
  const [everOpened, setEverOpened] = useState(false)
  const open = (hovered || toggledOpen) && !dismissed

  return (
    <div
      className={`desktop-menu-trigger group flex h-20 items-center ${dismissed ? 'desktop-menu-trigger--dismissed' : ''}`}
      data-menu-id={menuId}
      data-open={toggledOpen && !dismissed ? '' : undefined}
      onFocusCapture={() => {
        // Reset only. Tabbing onto the trigger must not open the panel;
        // the button click (Enter, Space, or pointer) toggles it.
        onReset()
      }}
      onClickCapture={(e) => {
        // A click on a panel link navigates. Drop the pin with it, or the
        // next reset would spring the panel open over the new page.
        if ((e.target as HTMLElement).closest('a')) setToggledOpen(false)
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setToggledOpen(false)
      }}
      onMouseEnter={() => {
        onReset()
        setHovered(true)
        setEverOpened(true)
      }}
      onMouseLeave={(e) => {
        onReset()
        setHovered(false)
        // A pointer click can pin the panel open without focusing the button
        // (Safari does not focus buttons on click), so the blur close never
        // fires. Let the mouse leaving close the pin, unless keyboard focus
        // is still inside the menu.
        if (!e.currentTarget.contains(document.activeElement)) setToggledOpen(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          // Focus first so the reset it fires cannot undo the dismiss.
          buttonRef.current?.focus()
          onDismiss()
          setToggledOpen(false)
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => {
          onReset()
          setToggledOpen((current) => !current)
          setEverOpened(true)
        }}
        className={menuButtonClass}
      >
        {label}
        <svg className="desktop-menu-caret h-3 w-3 transition-transform duration-300 group-hover:rotate-180 group-data-[open]:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        aria-hidden="true"
        className="desktop-menu-scrim pointer-events-none fixed bottom-0 left-0 right-0 top-20 hidden bg-black/45 opacity-0 backdrop-blur-[10px] transition-opacity duration-[420ms] group-hover:opacity-100 group-data-[open]:opacity-100 xl:block"
        onClick={() => {
          onDismiss()
          setToggledOpen(false)
        }}
      />
      <MenuMediaContext.Provider value={everOpened}>{children}</MenuMediaContext.Provider>
    </div>
  )
}


function DesktopStudiosMenu({ onNavigate }: { onNavigate: () => void }) {
  const showMedia = useContext(MenuMediaContext)
  const podcastCore = podcastStudios.slice(1, 5) // The Executive, The Wing, Encore, Sunset

  return (
    // Exactly FOUR direct grid children below: three room columns and the plan
    // rail. The panel's reveal stagger (globals.css) only defines nth-child
    // delays through 4. A fifth child would arrive with no delay and break the
    // cascade, so keep this at four or add a nth-child(5) delay first.
    <DesktopMegaMenu className="grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)] gap-x-8 2xl:gap-x-10">
      <div className="flex flex-col">
        <MenuColumnHeader>Podcast Studios</MenuColumnHeader>
        <div className="divide-y divide-white/[0.06]">
          {podcastCore.map((room, i) => (
            <MenuRoomRow key={room.href} room={room} onNavigate={onNavigate} flagship={i === 0} />
          ))}
        </div>
        <MenuViewAll href="/podcast-studio-san-francisco/" label="All podcast studios" onNavigate={onNavigate} />
      </div>

      <div className="flex flex-col">
        <MenuColumnHeader>Signature &amp; Custom</MenuColumnHeader>
        <div className="divide-y divide-white/[0.06]">
          {signaturePodcastStudios.map((room) => (
            <MenuRoomRow key={room.href} room={room} onNavigate={onNavigate} />
          ))}
        </div>
        <p className="mt-auto border-t border-white/[0.06] pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Custom builds on request
        </p>
      </div>

      <div className="flex flex-col">
        <MenuColumnHeader>Rental Studios</MenuColumnHeader>
        <div className="divide-y divide-white/[0.06]">
          {rentalStudios.slice(1).map((room) => (
            <MenuRoomRow key={room.href} room={room} onNavigate={onNavigate} />
          ))}
        </div>
        <MenuViewAll href="/rental-studios/" label="All rental studios" onNavigate={onNavigate} />
      </div>

      {/* Plan rail: one tinted card that balances the panel and points at the
          two actions that matter, Find a Studio and Book. */}
      <div className="flex min-h-[300px] flex-col rounded-lg border border-white/[0.06] bg-white/[0.02] p-5">
        <MenuColumnHeader>Plan Your Visit</MenuColumnHeader>
        <Link
          href="/find-your-studio/"
          onClick={(event) => {
            onNavigate()
            event.currentTarget.blur()
          }}
          className="group/plan relative block h-28 overflow-hidden rounded-md ring-1 ring-white/10 transition-[box-shadow] duration-300 hover:ring-white/25"
        >
          {showMedia && (
            <Image src="/studio-images/canvas-rental-space-v20260509.jpg" alt="" fill sizes="384px" quality={85} className="object-cover transition-transform duration-700 ease-out group-hover/plan:scale-[1.04]" />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" aria-hidden="true" />
          <span className="absolute inset-x-4 bottom-3.5 block">
            <span className="block text-[12px] text-zinc-300">Not sure which room?</span>
            <span className="mt-0.5 flex items-center gap-2 text-[15px] font-semibold text-white">
              Find a Studio
              <span className="transition-transform duration-300 group-hover/plan:translate-x-0.5" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          </span>
        </Link>
        <div className="mt-auto divide-y divide-white/[0.06] pt-5">
          <MenuPlanLink href="/book/" label="Book a Session" onNavigate={onNavigate} primary />
          <MenuPlanLink href="/tour/" label="Tour the Studio" onNavigate={onNavigate} />
          <MenuPlanLink href="/compare/" label="Compare Studios" onNavigate={onNavigate} />
        </div>
      </div>
    </DesktopMegaMenu>
  )
}

function MenuColumnHeader({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-white">{children}</p>
      <div className="mt-3 h-px bg-white/[0.08]" aria-hidden="true" />
    </div>
  )
}

function MenuViewAll({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        onNavigate()
        event.currentTarget.blur()
      }}
      className="group/all mt-auto flex items-center gap-2 border-t border-white/[0.06] pt-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors duration-300 hover:text-white"
    >
      {label}
      <span className="transition-transform duration-300 group-hover/all:translate-x-0.5" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  )
}

function MenuRoomRow({ room, onNavigate, flagship = false }: { room: HeaderLink; onNavigate: () => void; flagship?: boolean }) {
  const showMedia = useContext(MenuMediaContext)
  return (
    <Link
      href={room.href}
      onClick={(event) => {
        onNavigate()
        event.currentTarget.blur()
      }}
      className="group/room -mx-3 flex items-center gap-4 rounded-lg px-3 py-3 transition-colors duration-200 hover:bg-white/[0.04]"
    >
      <span className="relative h-[64px] w-[96px] shrink-0 overflow-hidden rounded-md bg-white/5">
        {showMedia && room.image && (
          <Image src={room.image} alt="" fill sizes="192px" quality={85} className="object-cover transition-transform duration-500 ease-out group-hover/room:scale-[1.05]" />
        )}
      </span>
      {flagship ? (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-brand-red">Flagship</span>
          <span className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[15px] font-medium leading-tight text-white">{room.label}</span>
            {room.price && <span className="shrink-0 font-mono text-xs text-zinc-400 transition-colors duration-200 group-hover/room:text-white">{room.price}</span>}
          </span>
          {room.detail && <span className="truncate text-xs text-zinc-500">{room.detail}</span>}
        </span>
      ) : (
        <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
          <span className="truncate text-[15px] font-medium leading-tight text-white">{room.label}</span>
          {room.price && <span className="shrink-0 font-mono text-xs text-zinc-400 transition-colors duration-200 group-hover/room:text-white">{room.price}</span>}
        </span>
      )}
    </Link>
  )
}

function MenuPlanLink({ href, label, onNavigate, primary = false }: { href: string; label: string; onNavigate: () => void; primary?: boolean }) {
  return (
    <Link
      href={href}
      prefetch={href === '/book/' ? false : undefined}
      onClick={(event) => {
        onNavigate()
        event.currentTarget.blur()
      }}
      className={`group/planrow flex items-center justify-between py-3 text-[15px] font-medium transition-colors duration-300 hover:text-white ${primary ? 'text-white' : 'text-zinc-300'}`}
    >
      {label}
      <span className="text-zinc-600 transition-[transform,color] duration-300 group-hover/planrow:translate-x-0.5 group-hover/planrow:text-white" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  )
}


const serviceCards = [
  { href: '/commercials/', label: 'Commercials', detail: 'Launch ads, talking heads, product demos', image: '/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg' },
  { href: '/editorials/', label: 'Editorials', detail: 'Fashion, beauty, portraits, campaign stills', image: '/studio-images/photo-gallery-direct-beauty-portrait-v20260520.jpg' },
  { href: '/branding/', label: 'Branding', detail: 'Creative direction, launches, content systems', image: '/studio-images/home-branding-pure-magic-v20260716.jpg' },
  { href: '/podcast-studio-san-francisco/', label: 'Podcasts', detail: 'Sets with cameras, audio, and crew', image: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg' },
  { href: '/video-production/', label: 'Video Production', detail: 'Social content, music videos, brand video', image: '/studio-images/encore-production.jpg' },
  { href: '/photo-services/', label: 'Photo Services', detail: 'Headshots, portraits, products, campaigns', image: '/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260716.jpg' },
]

const proofStripLinks = [
  { href: '/our-work/', label: 'Our Work' },
  { href: '/made-at-vibeshack/', label: 'Trusted By' },
  { href: '/studio-guides/', label: 'Guides' },
  { href: '/use-cases/', label: 'Use Cases' },
  { href: '/compare/', label: 'Compare' },
  { href: '/support/', label: 'Support' },
]

function DesktopServicesMenu({ onNavigate }: { onNavigate: () => void }) {
  const [activeCard, setActiveCard] = useState(0)
  const showMedia = useContext(MenuMediaContext)

  return (
    // Exactly THREE direct grid children below: header, the card row, the bottom
    // pair. The reveal cascade (globals.css) only defines nth-child delays
    // through 4, so keep this at three or four, never more.
    <DesktopMegaMenu className="grid-cols-1 gap-y-5">
      <div>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[2.3rem] font-black leading-[1.02] tracking-[-0.01em] text-white 2xl:text-[2.5rem]">What are you making?</p>
            <p className="mt-2.5 text-sm text-zinc-400">Start with the outcome. We&apos;ll build the production.</p>
          </div>
          <Link
            href="/services/"
            onClick={(event) => {
              onNavigate()
              event.currentTarget.blur()
            }}
            className="group/allsvc mb-1 flex shrink-0 items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors duration-300 hover:text-white"
          >
            All services
            <span className="transition-transform duration-300 group-hover/allsvc:translate-x-0.5" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>
        <div className="mt-6 h-px w-full bg-white/[0.08]" aria-hidden="true" />
      </div>

      <div className="flex h-[280px] gap-2.5 2xl:h-[300px]">
        {serviceCards.map((card, index) => {
          const isActive = index === activeCard
          return (
            <Link
              key={card.href + card.label}
              href={card.href}
              onMouseEnter={() => setActiveCard(index)}
              onFocus={() => setActiveCard(index)}
              onClick={(event) => {
                onNavigate()
                event.currentTarget.blur()
              }}
              className={`group/svc relative min-w-0 overflow-hidden rounded-lg ring-1 transition-[flex-grow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isActive ? 'flex-[3_1_0%] ring-brand-red/60' : 'flex-[1_1_0%] ring-white/[0.08] hover:ring-white/20'
              }`}
            >
              {showMedia && card.image && (
                <Image
                  src={card.image}
                  alt=""
                  fill
                  sizes="640px"
                  quality={85}
                  className="object-cover transition-transform duration-700 group-hover/svc:scale-[1.03]"
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" aria-hidden="true" />
              <span className={`absolute left-4 top-4 font-mono text-[13px] font-medium tracking-[0.1em] transition-colors duration-500 ${isActive ? 'text-brand-red' : 'text-white/35'}`}>{String(index + 1).padStart(2, '0')}</span>
              <span className="absolute inset-x-4 bottom-4">
                <span className="block text-[21px] font-black leading-[0.95] text-white">
                  {card.label}
                </span>
                <span
                  className={`block overflow-hidden transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <span className="mt-2 block text-sm text-zinc-300">{card.detail}</span>
                  <span className="mt-3 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red">
                    Explore service
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
              </span>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-6 py-4">
          <MenuColumnHeader>More from VibeShack</MenuColumnHeader>
          <div className="grid grid-cols-2 gap-x-8">
            {proofStripLinks.map(({ href, label }) => (
              <Link
                key={href + label}
                href={href}
                onClick={(event) => {
                  onNavigate()
                  event.currentTarget.blur()
                }}
                className="group/proof -mx-2 flex items-center justify-between rounded-md px-2 py-1.5 text-[14px] font-medium text-zinc-300 transition-colors duration-200 hover:bg-white/[0.04] hover:text-white"
              >
                {label}
                <span className="text-zinc-600 transition-[transform,color] duration-300 group-hover/proof:translate-x-0.5 group-hover/proof:text-white" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
        <Link
          href="/find-your-studio/"
          onClick={(event) => {
            onNavigate()
            event.currentTarget.blur()
          }}
          className="group/find flex overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.04]"
        >
          <span className="relative w-2/5 shrink-0 overflow-hidden bg-white/5">
            {showMedia && (
              <Image src="/studio-images/sunset-hero-v20260509.jpg" alt="" fill sizes="384px" quality={85} className="object-cover transition-transform duration-700 group-hover/find:scale-[1.04]" />
            )}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent to-[#101010]/70" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col justify-center px-6 py-6">
            <span className="text-xl font-black leading-[0.95] text-white">Match the room to the outcome.</span>
            <span className="mt-2.5 text-sm leading-relaxed text-zinc-400">Tell us what you&apos;re making. We&apos;ll point you to the right room.</span>
            <span className="mt-4 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red transition-transform duration-300 group-hover/find:translate-x-0.5">
              Find a Studio
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        </Link>
      </div>
    </DesktopMegaMenu>
  )
}

function DesktopMegaMenu({
  className,
  children,
  footer,
}: {
  className: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="desktop-mega-menu pointer-events-none invisible fixed inset-x-0 top-[calc(5rem-1px)] mx-auto hidden max-h-[calc(100vh-6.5rem)] w-[min(calc(100vw-2rem),1680px)] translate-y-[-6px] overflow-y-auto overscroll-contain rounded-lg border border-white/[0.08] bg-[#0c0c0c] text-white opacity-0 shadow-[0_48px_140px_rgba(0,0,0,0.72)] transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-[60ms] group-hover:duration-[420ms] group-data-[open]:pointer-events-auto group-data-[open]:visible group-data-[open]:translate-y-0 group-data-[open]:opacity-100 group-data-[open]:delay-[60ms] group-data-[open]:duration-[420ms] xl:block">
      <div className={`desktop-mega-grid mx-auto grid px-10 pb-7 pt-9 lg:px-14 ${className}`}>
        {children}
      </div>
      {footer && <div className="desktop-mega-footer px-10 pb-7 lg:px-14">{footer}</div>}
    </div>
  )
}


function MobileMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="mobile-menu-panel absolute left-0 right-0 top-full h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain border-t border-white/[0.08] bg-black">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-6 sm:px-10">
        <MobileSection title="Studios" links={[...podcastStudios, ...rentalStudios]} onNavigate={onNavigate} />
        <MobileSection title="Services" links={serviceLinks} onNavigate={onNavigate} />
        <MobileSection title="Plan" links={[...planningLinks, ...proofLinks]} onNavigate={onNavigate} />
      </div>
    </div>
  )
}

function MobileSection({
  title,
  links,
  onNavigate,
}: {
  title: string
  links: HeaderLink[]
  onNavigate: () => void
}) {
  return (
    <div className="border-b border-white/[0.08] py-5 last:border-b-0">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gray-600">{title}</p>
      <div className="grid gap-1 sm:grid-cols-2 sm:gap-x-8">
        {links.map(({ href, label, detail, price }) => (
          <Link
            key={href + label}
            href={href}
            prefetch={href === '/book/' ? false : undefined}
            onClick={onNavigate}
            className="flex items-start justify-between gap-4 py-2.5 text-gray-400 transition-colors duration-150 hover:text-white"
          >
            <span>
              <span className="block text-sm font-semibold">{label}</span>
              {detail && <span className="mt-0.5 block text-xs leading-snug text-gray-600">{detail}</span>}
            </span>
            {price && <span className="pt-0.5 text-xs text-gray-600">{price}</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}

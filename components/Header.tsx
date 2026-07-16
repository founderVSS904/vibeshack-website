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
  { href: '/horizon/', label: 'Horizon', detail: 'Warm curated sunset podcast set', price: '$400/hr', image: '/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg' },
  { href: '/canvas-podcast/', label: 'Canvas Podcast', detail: 'Large-format custom podcast set', price: '$400/hr', image: '/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg' },
]

const rentalStudios: HeaderLink[] = [
  { href: '/rental-studios/', label: 'All Rental Studios', detail: 'White cyc, green screen, photo rooms', image: '/studio-images/canvas-rental-space-v20260509.jpg' },
  { href: '/canvas-rental/', label: 'Canvas Rental', detail: 'White cyc and open production floor', price: '$100/hr', image: '/studio-images/enhanced-canvas-podcast-white-cyc-duo-v20260510.jpg' },
  { href: '/photography-studio-san-francisco/', label: 'Photography Studio', detail: 'Backdrops, glam room, lighting', price: '$100/hr', image: '/studio-images/inside-photography-red-v20260509.jpg' },
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

const studioHubLinks: HeaderLink[] = [
  { href: '/podcast-studio-san-francisco/', label: 'Podcast Studios', detail: 'Sets built for interviews and shows' },
  { href: '/rental-studios/', label: 'Rental Studios', detail: 'White cyc, green screen, photo rooms' },
  { href: '/find-your-studio/', label: 'Find a Studio', detail: 'Choose by outcome, not guesswork' },
  { href: '/book/', label: 'Book a Session', detail: 'Live availability and checkout' },
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
  'relative font-mono text-[12px] uppercase tracking-[0.18em] whitespace-nowrap text-gray-400 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none'

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
  const isOurWorkPage = pathname === '/our-work' || pathname === '/our-work/'
  const headerClassName = 'site-header fixed left-0 right-0 top-0 z-50 border-b border-white/[0.08] bg-black transition-colors duration-200'
  const headerContainerClassName = isOurWorkPage
    ? 'mx-auto w-full px-9'
    : 'mx-auto max-w-7xl px-6 sm:px-10 lg:px-16'

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
              className="relative inline-flex items-center gap-2.5 whitespace-nowrap rounded-lg bg-white px-4 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-black transition-all duration-200 hover:scale-[1.03] hover:bg-white/90 active:scale-[0.98] sm:px-5"
            >
              Book a Session
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </Link>

            <details ref={mobileMenuRef} className="group xl:hidden">
              <summary className="list-none p-3 text-gray-400 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none [&::-webkit-details-marker]:hidden">
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
  const [focused, setFocused] = useState(false)
  const [everOpened, setEverOpened] = useState(false)
  const open = (hovered || focused) && !dismissed

  return (
    <div
      className={`desktop-menu-trigger group flex h-20 items-center ${dismissed ? 'desktop-menu-trigger--dismissed' : ''}`}
      data-menu-id={menuId}
      onFocusCapture={() => {
        onReset()
        setFocused(true)
        setEverOpened(true)
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
      onMouseEnter={() => {
        onReset()
        setHovered(true)
        setEverOpened(true)
      }}
      onMouseLeave={() => {
        onReset()
        setHovered(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          // Focus first so the reset it fires cannot undo the dismiss.
          buttonRef.current?.focus()
          onDismiss()
        }
      }}
    >
      <button ref={buttonRef} type="button" aria-haspopup="true" aria-expanded={open} className={menuButtonClass}>
        {label}
        <svg className="desktop-menu-caret h-3 w-3 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        aria-hidden="true"
        className="desktop-menu-scrim pointer-events-none fixed bottom-0 left-0 right-0 top-20 hidden bg-black/45 opacity-0 backdrop-blur-[10px] transition-opacity duration-[420ms] group-hover:opacity-100 group-focus-within:opacity-100 xl:block"
        onClick={onDismiss}
      />
      <MenuMediaContext.Provider value={everOpened}>{children}</MenuMediaContext.Provider>
    </div>
  )
}


function DesktopStudiosMenu({ onNavigate }: { onNavigate: () => void }) {
  const featured = podcastStudios[1]
  const coreRows = podcastStudios.slice(2, 5)
  const showMedia = useContext(MenuMediaContext)

  return (
    <DesktopMegaMenu
      className="grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-8 2xl:gap-x-12"
      footer={
        <div className="flex items-center gap-10 border-t border-white/[0.08] pt-5">
          <MenuFooterLink href="/tour/" label="Tour the studio" onNavigate={onNavigate} />
          <MenuFooterLink href="/compare/" label="Compare studios" onNavigate={onNavigate} />
        </div>
      }
    >
      <div>
        <span className="relative block h-56 overflow-hidden rounded-2xl border border-white/[0.08] 2xl:h-64">
          {showMedia && featured.image && (
            <Image src={featured.image} alt="The Executive podcast set at VibeShack Studios" fill sizes="768px" quality={85} className="object-cover" />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" aria-hidden="true" />
        </span>
        <p className="mt-6 text-[2rem] font-bold leading-none tracking-tight text-white">
          Choose your room<span className="text-brand-red">.</span>
        </p>
        <div className="mt-6 divide-y divide-white/[0.06]">
          {studioHubLinks.map(({ href, label }) => (
            <Link
              key={href + label}
              href={href}
              prefetch={href === '/book/' ? false : undefined}
              onClick={(event) => {
                onNavigate()
                event.currentTarget.blur()
              }}
              className="group/hub flex items-center justify-between py-3.5 text-[15px] font-medium text-zinc-300 transition-colors duration-300 hover:text-white"
            >
              {label}
              <span className="text-zinc-600 transition-all duration-300 group-hover/hub:translate-x-0.5 group-hover/hub:text-white" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <MenuColumnHeader>Podcast Sets</MenuColumnHeader>
        <Link
          href={featured.href}
          onClick={(event) => {
            onNavigate()
            event.currentTarget.blur()
          }}
          className="group/feat block overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/15 transition-all duration-300 hover:bg-white/[0.05] hover:ring-white/25"
        >
          <span className="relative block h-44 overflow-hidden">
            {showMedia && featured.image && (
              <Image src={featured.image} alt="" fill sizes="768px" quality={85} className="object-cover transition-transform duration-700 group-hover/feat:scale-[1.04]" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden="true" />
            <span className="absolute inset-x-4 bottom-3.5 flex items-baseline justify-between gap-3">
              <span className="text-[17px] font-bold leading-tight text-white">{featured.label}</span>
              <span className="shrink-0 font-mono text-xs text-zinc-300">{featured.price}</span>
            </span>
          </span>
        </Link>
        <div className="mt-1 flex-1 divide-y divide-white/[0.06]">
          {coreRows.map((room) => (
            <MenuRoomRow key={room.href} room={room} onNavigate={onNavigate} />
          ))}
        </div>
        <MenuViewAll href="/podcast-studio-san-francisco/" label="All podcast sets" onNavigate={onNavigate} />
      </div>

      <div className="flex flex-col">
        <MenuColumnHeader>Signature &amp; Custom</MenuColumnHeader>
        <div className="flex-1 divide-y divide-white/[0.06]">
          {signaturePodcastStudios.map((room) => (
            <MenuRoomRow key={room.href} room={room} onNavigate={onNavigate} />
          ))}
        </div>
        <MenuViewAll href="/compare/" label="Compare all rooms" onNavigate={onNavigate} />
      </div>

      <div className="flex flex-col">
        <MenuColumnHeader>Rental Studios</MenuColumnHeader>
        <div className="flex-1 divide-y divide-white/[0.06]">
          {rentalStudios.slice(1).map((room) => (
            <MenuRoomRow key={room.href} room={room} onNavigate={onNavigate} />
          ))}
        </div>
        <MenuViewAll href="/rental-studios/" label="All rental studios" onNavigate={onNavigate} />
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

function MenuRoomRow({ room, onNavigate }: { room: HeaderLink; onNavigate: () => void }) {
  const showMedia = useContext(MenuMediaContext)
  return (
    <Link
      href={room.href}
      onClick={(event) => {
        onNavigate()
        event.currentTarget.blur()
      }}
      className="group/room -mx-3 flex items-center gap-4 rounded-xl px-3 py-3 transition-colors duration-300 hover:bg-white/[0.04]"
    >
      <span className="relative h-[64px] w-[96px] shrink-0 overflow-hidden rounded-lg bg-white/5">
        {showMedia && room.image && (
          <Image src={room.image} alt="" fill sizes="192px" quality={85} className="object-cover transition-transform duration-500 group-hover/room:scale-[1.06]" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
        <span className="truncate text-[15px] font-medium leading-tight text-white">{room.label}</span>
        {room.price && <span className="shrink-0 font-mono text-xs text-zinc-400 transition-colors duration-300 group-hover/room:text-white">{room.price}</span>}
      </span>
    </Link>
  )
}

function MenuFooterLink({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        onNavigate()
        event.currentTarget.blur()
      }}
      className="group/foot flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors duration-300 hover:text-white"
    >
      {label}
      <span className="transition-transform duration-300 group-hover/foot:translate-x-0.5" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  )
}

const serviceCards = [
  { href: '/commercials/', label: 'Commercials', detail: 'Launch ads, talking heads, product demos', kicker: 'Campaign ready', image: '/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg' },
  { href: '/editorials/', label: 'Editorials', detail: 'Fashion, beauty, portraits, campaign stills', kicker: 'Print ready', image: '/studio-images/photo-gallery-direct-beauty-portrait-v20260520.jpg' },
  { href: '/branding/', label: 'Branding', detail: 'Creative direction, launches, content systems', kicker: 'Identity systems', image: '/studio-images/home-branding-pure-magic-v20260716.jpg' },
  { href: '/podcast-studio-san-francisco/', label: 'Podcasts', detail: 'Sets with cameras, audio, and crew', kicker: 'Broadcast ready', image: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg' },
  { href: '/video-production/', label: 'Video Production', detail: 'Social content, music videos, brand video', kicker: 'Concept to screen', image: '/studio-images/encore-production.jpg' },
  { href: '/photo-services/', label: 'Photo Services', detail: 'Headshots, portraits, products, campaigns', kicker: 'Every frame styled', image: '/studio-images/inside-photography-red-v20260509.jpg' },
]

const proofStripLinks = [
  { href: '/our-work/', label: 'Our Work' },
  { href: '/made-at-vibeshack/', label: 'Trusted By' },
  { href: '/studio-guides/', label: 'Guides' },
  { href: '/use-cases/', label: 'Use Cases' },
  { href: '/compare/', label: 'Compare' },
  { href: '/support/', label: 'Support' },
]

const proofIcons: ReactNode[] = [
  <svg key="work" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="9" width="18" height="11" rx="1.5" /><path d="m3.4 9 17-4.4M7 8l2.4-4.6M12.4 6.6 14.8 2M17.8 5.2 20.2 1.4M7 13h4" /></svg>,
  <svg key="brands" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2 20 5v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3Z" /><path d="m12 8 1.2 2.5 2.8.4-2 2 .5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-2 2.8-.4L12 8Z" /></svg>,
  <svg key="guides" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5c-1.5-1.4-3.6-2-6-2-1 0-2 .12-3 .35V19c1-.23 2-.35 3-.35 2.4 0 4.5.6 6 2 1.5-1.4 3.6-2 6-2 1 0 2 .12 3 .35V3.35C20 3.12 19 3 18 3c-2.4 0-4.5.6-6 2Z" /><path d="M12 5v15.65M6.5 8h2M6.5 12h2M15.5 8h2M15.5 12h2" /></svg>,
  <svg key="cases" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2 17 4.8v5L12 12 7 9.8v-5L12 2ZM7 12.2 12 15v5l-5-2.8v-5ZM17 12.2 12 15v5l5-2.8v-5Z" /></svg>,
  <svg key="compare" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v18M8 21h8M12 6H5L2 13a3.5 3.5 0 0 0 6 0L5 6M12 6h7l3 7a3.5 3.5 0 0 1-6 0l3-7" /></svg>,
  <svg key="support" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 13a8 8 0 1 1 16 0" /><rect x="2.5" y="13" width="4" height="6" rx="1.5" /><rect x="17.5" y="13" width="4" height="6" rx="1.5" /><path d="M19.5 19a4 4 0 0 1-4 3h-2" /></svg>,
]

function DesktopServicesMenu({ onNavigate }: { onNavigate: () => void }) {
  const [activeCard, setActiveCard] = useState(0)
  const active = serviceCards[activeCard]
  const showMedia = useContext(MenuMediaContext)

  return (
    <DesktopMegaMenu className="grid-cols-1 gap-y-7">
      <div>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[2.8rem] font-black leading-none text-white">What are you making?</p>
            <p className="mt-3 text-sm text-zinc-400">Start with the outcome. We&apos;ll build the production.</p>
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
        <div className="relative mt-7 h-9" aria-hidden="true">
          <span
            className="absolute top-0 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-brand-red transition-[left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ left: `min(calc(${(((activeCard + 1.5) / 8) * 100).toFixed(3)}% + 12px), calc(100% - 170px))` }}
          >
            {active.kicker}
          </span>
          <span className="absolute inset-x-0 top-[27px] h-px bg-brand-red/20" />
          <span
            className="absolute top-[27px] h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-brand-red shadow-[0_0_10px_rgba(236,0,0,0.55)] transition-[left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ left: `calc(${(((activeCard + 1.5) / 8) * 100).toFixed(3)}% - 3.5px)` }}
          />
        </div>
      </div>

      <div>
      <div className="flex h-[300px] gap-2.5 2xl:h-[320px]">
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
              className={`group/svc relative min-w-0 overflow-hidden rounded-xl ring-1 transition-[flex-grow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isActive ? 'flex-[3_1_0%] ring-brand-red/70' : 'flex-[1_1_0%] ring-white/[0.08] hover:ring-white/20'
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
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" aria-hidden="true" />
              <span className="absolute left-4 top-4 font-mono text-[15px] font-medium tracking-[0.08em] text-brand-red">{String(index + 1).padStart(2, '0')}</span>
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
      <div className="relative mx-auto mt-5 flex w-[420px] max-w-full gap-1" aria-hidden="true">
        {serviceCards.map((card, index) => (
          <span key={card.href + index} className="h-[2px] flex-1 bg-white/[0.12]" />
        ))}
        <span
          className="absolute top-0 h-[2px] bg-brand-red transition-[left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            width: 'calc((100% - 20px) / 6)',
            left: `calc(${activeCard} * ((100% - 20px) / 6 + 4px))`,
          }}
        />
      </div>
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-5">
        <div className="grid grid-cols-6 divide-x divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          {proofStripLinks.map(({ href, label }, index) => (
            <Link
              key={href + label}
              href={href}
              onClick={(event) => {
                onNavigate()
                event.currentTarget.blur()
              }}
              className="group/proof flex flex-col items-center justify-center gap-3.5 px-3 py-7 text-zinc-400 transition-colors duration-300 first:rounded-l-2xl last:rounded-r-2xl hover:bg-white/[0.04] hover:text-white"
            >
              {proofIcons[index]}
              <span className="whitespace-nowrap text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em]">{label}</span>
            </Link>
          ))}
        </div>
        <Link
          href="/find-your-studio/"
          onClick={(event) => {
            onNavigate()
            event.currentTarget.blur()
          }}
          className="group/find flex overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.04]"
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
    <div className="desktop-mega-menu pointer-events-none invisible fixed inset-x-0 top-[calc(5rem-1px)] mx-auto hidden max-h-[calc(100vh-6.5rem)] w-[min(calc(100vw-2rem),1680px)] translate-y-[-6px] overflow-y-auto overscroll-contain rounded-[20px] border border-white/[0.08] bg-[#0c0c0c] text-white opacity-0 shadow-[0_48px_140px_rgba(0,0,0,0.72)] transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-[60ms] group-hover:duration-[420ms] group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:delay-[60ms] group-focus-within:duration-[420ms] xl:block">
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

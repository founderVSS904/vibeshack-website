'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { BrandMark } from '@/components/BrandMark'

type HeaderLink = {
  href: string
  label: string
  detail?: string
  price?: string
}

const podcastStudios: HeaderLink[] = [
  { href: '/podcast-studio-san-francisco/', label: 'All Podcast Studios', detail: 'Compare every podcast room' },
  { href: '/the-executive/', label: 'The Executive', detail: 'Boardroom table, three cameras', price: '$300/hr' },
  { href: '/the-wing/', label: 'The Wing', detail: 'Warm two-person conversation set', price: '$300/hr' },
  { href: '/encore/', label: 'Encore', detail: 'Vault-style room with strong audio', price: '$300/hr' },
  { href: '/sunset-studio/', label: 'Sunset', detail: 'Color-backed creative podcast room', price: '$300/hr' },
  { href: '/parlor/', label: 'Parlor', detail: 'Premium lounge interview set', price: '$400/hr' },
  { href: '/horizon/', label: 'Horizon', detail: 'Warm curated sunset podcast set', price: '$400/hr' },
  { href: '/canvas-podcast/', label: 'Canvas Podcast', detail: 'Custom LED backdrop podcast studio', price: '$400/hr' },
]

const rentalStudios: HeaderLink[] = [
  { href: '/rental-studios/', label: 'All Rental Studios', detail: 'White cyc, green screen, photo rooms' },
  { href: '/canvas-rental/', label: 'Canvas Rental', detail: 'White cyc and open production floor', price: '$100/hr' },
  { href: '/photography-studio-san-francisco/', label: 'Photography Studio', detail: 'Backdrops, glam room, lighting', price: '$100/hr' },
  { href: '/green-screen-studio-sf/', label: 'Green Screen', detail: 'Full green wall for compositing', price: '$100/hr' },
]

const serviceLinks: HeaderLink[] = [
  { href: '/services/', label: 'All Services', detail: 'Choose the right path before the room' },
  { href: '/commercials/', label: 'Commercials', detail: 'Launch ads, talking heads, product demos' },
  { href: '/editorials/', label: 'Editorials', detail: 'Fashion, beauty, portraits, campaign stills' },
  { href: '/branding/', label: 'Branding', detail: 'Creative direction, launches, content systems' },
  { href: '/podcast-studio-san-francisco/', label: 'Podcast Production', detail: 'Rooms with cameras, audio, and crew' },
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
  { href: '/podcast-studio-san-francisco/', label: 'Podcast Studios', detail: 'Rooms built for interviews and shows' },
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
]

const corePodcastStudios = podcastStudios.slice(1, 6)
const premiumPodcastStudios = podcastStudios.slice(6)

const navLinkClass =
  'relative text-sm tracking-wide whitespace-nowrap text-gray-400 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none'

const menuButtonClass =
  'flex items-center gap-1.5 text-sm tracking-wide whitespace-nowrap text-gray-400 transition-colors duration-200 group-hover:text-white group-focus-within:text-white'

export default function Header() {
  const pathname = usePathname()
  const [dismissedMenu, setDismissedMenu] = useState<string | null>(null)
  const isOurWorkPage = pathname === '/our-work' || pathname === '/our-work/'
  // The landing page uses the same header as every other page, matching the
  // production site look Tay signed off on.
  const headerClassName = 'site-header fixed left-0 right-0 top-0 z-50 border-b border-white/8 bg-black transition-colors duration-200'
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
            <BrandMark variant="lockup" priority className="h-[30px] w-auto sm:h-[34px]" />
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

            <Link href="/find-your-studio/" className={primaryNavClass('/find-your-studio/')}>Find a Studio</Link>
            <Link href="/pricing/" className={primaryNavClass('/pricing/')}>Pricing</Link>
            <Link href="/about/" className={primaryNavClass('/about/')}>About</Link>
            <Link href="/our-work/" className={primaryNavClass('/our-work/')}>Our Work</Link>
            <Link href="/studio-guides/" className={primaryNavClass('/studio-guides/')}>Guides</Link>
            <Link href="/use-cases/" className={primaryNavClass('/use-cases/')}>Use Cases</Link>
            <Link href="/support/" className={primaryNavClass('/support/')}>Support</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/book/"
              prefetch={false}
              className="hidden items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:border-white/50 hover:bg-white/8 active:scale-[0.98] sm:inline-flex"
            >
              Book
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <details className="group xl:hidden">
              <summary className="list-none p-2 text-gray-400 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                <span className="sr-only">Toggle menu</span>
                <svg className="h-5 w-5 group-open:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg className="hidden h-5 w-5 group-open:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </summary>

              <MobileMenu />
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
  return (
    <div
      className={`desktop-menu-trigger group flex h-20 items-center ${dismissed ? 'desktop-menu-trigger--dismissed' : ''}`}
      data-menu-id={menuId}
      onFocusCapture={onReset}
      onMouseEnter={onReset}
      onMouseLeave={onReset}
    >
      <button type="button" className={menuButtonClass}>
        {label}
        <svg className="desktop-menu-caret h-3 w-3 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        aria-hidden="true"
        className="desktop-menu-scrim pointer-events-none fixed bottom-0 left-0 right-0 top-20 hidden bg-black/35 opacity-0 backdrop-blur-[3px] transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 xl:block"
        onClick={onDismiss}
      />
      {children}
    </div>
  )
}

function DesktopStudiosMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <DesktopMegaMenu className="max-w-7xl grid-cols-[1fr_1fr_1fr_1fr] gap-10">
      <MegaColumn eyebrow="Browse" links={studioHubLinks} large onNavigate={onNavigate} />
      <MegaColumn eyebrow="Podcast Rooms" links={corePodcastStudios} onNavigate={onNavigate} />
      <MegaColumn eyebrow="Premium & Custom" links={premiumPodcastStudios} onNavigate={onNavigate} />
      <MegaColumn eyebrow="Rental Studios" links={rentalStudios} onNavigate={onNavigate} />
    </DesktopMegaMenu>
  )
}

function DesktopServicesMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <DesktopMegaMenu className="max-w-6xl grid-cols-[1.1fr_0.9fr_0.85fr] gap-14">
      <MegaColumn eyebrow="Production Services" links={serviceLinks} large onNavigate={onNavigate} />
      <MegaColumn eyebrow="Planning Tools" links={proofLinks} onNavigate={onNavigate} />
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Best First Step</p>
        <Link
          href="/find-your-studio/"
          onClick={(event) => {
            onNavigate()
            event.currentTarget.blur()
          }}
          className="group/card block rounded-2xl border border-black/10 bg-white/65 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-black/20 hover:bg-white"
        >
          <span className="block text-2xl font-black tracking-tight text-black">Match the room to the outcome.</span>
          <span className="mt-3 block text-sm leading-relaxed text-zinc-600">
            Start with what you are making: portraits, a brand film, a podcast, social clips, or a clean rental space.
          </span>
          <span className="mt-5 inline-flex text-sm font-bold text-brand-red transition-transform duration-300 group-hover/card:translate-x-1">
            Find a Studio -&gt;
          </span>
        </Link>
      </div>
    </DesktopMegaMenu>
  )
}

function DesktopMegaMenu({
  className,
  children,
}: {
  className: string
  children: ReactNode
}) {
  return (
    <div className="desktop-mega-menu pointer-events-none invisible fixed left-0 right-0 top-[calc(5rem-1px)] hidden max-h-0 -translate-y-3 overflow-hidden border-b border-white/10 bg-[#f5f5f2] text-black opacity-0 shadow-[0_34px_90px_rgba(0,0,0,0.42)] transition-[max-height,opacity,transform,visibility] duration-300 group-hover:pointer-events-auto group-hover:visible group-hover:max-h-[540px] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:max-h-[540px] group-focus-within:translate-y-0 group-focus-within:opacity-100 xl:block">
      <div className={`mx-auto grid px-10 py-9 lg:px-16 ${className}`}>
        {children}
      </div>
    </div>
  )
}

function MegaColumn({
  eyebrow,
  links,
  large,
  onNavigate,
}: {
  eyebrow: string
  links: HeaderLink[]
  large?: boolean
  onNavigate?: () => void
}) {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{eyebrow}</p>
      <div className={large ? 'space-y-2' : 'space-y-2.5'}>
        {links.map(({ href, label, detail, price }, index) => (
          <Link
            key={href + label}
            href={href}
            prefetch={href === '/book/' ? false : undefined}
            onClick={(event) => {
              onNavigate?.()
              event.currentTarget.blur()
            }}
            className="group/link block text-zinc-700 transition-colors duration-200 hover:text-black"
          >
            <span className={`flex items-baseline justify-between gap-4 ${large ? 'text-[1.45rem] font-black leading-[1.08] tracking-tight' : 'text-[0.95rem] font-bold'}`}>
              <span>{label}</span>
              {price && <span className="text-xs font-semibold text-zinc-400 transition-colors duration-200 group-hover/link:text-zinc-700">{price}</span>}
              {!price && index === 0 && <span className="text-xs font-semibold text-brand-red opacity-0 transition duration-200 group-hover/link:translate-x-1 group-hover/link:opacity-100">-&gt;</span>}
            </span>
            {detail && <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">{detail}</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}

function MobileMenu() {
  return (
    <div className="mobile-menu-panel absolute left-0 right-0 top-full h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain border-t border-white/8 bg-black">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-6 sm:px-10">
        <MobileSection title="Studios" links={[...podcastStudios, ...rentalStudios]} />
        <MobileSection title="Services" links={serviceLinks} />
        <MobileSection title="Plan" links={[...planningLinks, ...proofLinks, { href: '/support/', label: 'Support', detail: 'Questions, policies, and help' }]} />
      </div>
    </div>
  )
}

function MobileSection({
  title,
  links,
}: {
  title: string
  links: HeaderLink[]
}) {
  return (
    <div className="border-b border-white/8 py-5 last:border-b-0">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gray-600">{title}</p>
      <div className="grid gap-1 sm:grid-cols-2 sm:gap-x-8">
        {links.map(({ href, label, detail, price }) => (
          <Link
            key={href + label}
            href={href}
            prefetch={href === '/book/' ? false : undefined}
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

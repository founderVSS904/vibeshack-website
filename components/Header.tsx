'use client'

import Image from 'next/image'
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
  const isOurWorkPage = pathname === '/our-work' || pathname === '/our-work/'
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
              className="hidden items-center gap-2.5 rounded-lg bg-white px-5 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-black transition-all duration-200 hover:scale-[1.03] hover:bg-white/90 active:scale-[0.98] sm:inline-flex"
            >
              Book a Session
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
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
        className="desktop-menu-scrim pointer-events-none fixed bottom-0 left-0 right-0 top-20 hidden bg-black/45 opacity-0 backdrop-blur-[10px] transition-opacity duration-[420ms] group-hover:opacity-100 group-focus-within:opacity-100 xl:block"
        onClick={onDismiss}
      />
      {children}
    </div>
  )
}

const hubIcons: Record<string, ReactNode> = {
  '/podcast-studio-san-francisco/': (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" />
    </svg>
  ),
  '/rental-studios/': (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  ),
  '/find-your-studio/': (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  ),
  '/book/': (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
}

function DesktopStudiosMenu({ onNavigate }: { onNavigate: () => void }) {
  const featured = podcastStudios[1]
  const coreRows = podcastStudios.slice(2, 5)

  return (
    <DesktopMegaMenu
      className="grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-8 2xl:gap-x-12"
      footer={
        <div className="flex items-center border-t border-white/10 pt-5">
          <MenuFooterLink
            href="/tour/"
            label="Tour the Studio"
            detail="Walk every VibeShack Studios space"
            onNavigate={onNavigate}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
          />
          <div className="mx-10 h-9 w-px bg-white/10" aria-hidden="true" />
          <MenuFooterLink
            href="/compare/"
            label="Compare Studios"
            detail="Compare features, sizes, and pricing"
            onNavigate={onNavigate}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 20V10M12 20V4M18 20v-7" />
              </svg>
            }
          />
          <span className="ml-auto text-brand-red" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      }
    >
      <div>
        <span className="relative block h-56 overflow-hidden rounded-2xl border border-white/[0.08] 2xl:h-64">
          {featured.image && (
            <Image src={featured.image} alt="The Executive podcast set at VibeShack Studios" fill sizes="768px" quality={85} className="object-cover" />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" aria-hidden="true" />
        </span>
        <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-red">VibeShack Studios</p>
        <p className="mt-2 text-[2rem] font-bold leading-none tracking-tight text-white">
          Choose your room<span className="text-brand-red">.</span>
        </p>
        <div className="mt-5 space-y-2.5">
          {studioHubLinks.map(({ href, label, detail }) => (
            <Link
              key={href + label}
              href={href}
              prefetch={href === '/book/' ? false : undefined}
              onClick={(event) => {
                onNavigate()
                event.currentTarget.blur()
              }}
              className="group/hub flex items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.05]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white" aria-hidden="true">
                {hubIcons[href]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white">{label}</span>
                <span className="mt-0.5 block text-xs leading-snug text-zinc-500">{detail}</span>
              </span>
              <span className="text-brand-red transition-transform duration-200 group-hover/hub:translate-x-1" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <MenuColumnHeader>Podcast Sets</MenuColumnHeader>
        <Link
          href={featured.href}
          onClick={(event) => {
            onNavigate()
            event.currentTarget.blur()
          }}
          className="group/feat flex items-center gap-4 rounded-2xl border border-white/20 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-3 transition-all duration-300 hover:border-white/35 hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          <span className="relative h-[104px] w-[128px] shrink-0 overflow-hidden rounded-[10px] ring-1 ring-white/10">
            {featured.image && (
              <Image src={featured.image} alt="" fill sizes="256px" quality={85} className="object-cover transition-transform duration-500 group-hover/feat:scale-[1.05]" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-brand-red">Featured</span>
            <span className="mt-1 flex items-baseline justify-between gap-3">
              <span className="text-[15px] font-bold leading-tight text-white">{featured.label}</span>
              <span className="shrink-0 font-mono text-xs font-bold text-brand-red">{featured.price}</span>
            </span>
            <span className="mt-1 block text-xs leading-snug text-zinc-500">{featured.detail}</span>
          </span>
          <MenuChevron className="group-hover/feat:translate-x-0.5" />
        </Link>
        <div className="mt-1 divide-y divide-white/[0.06]">
          {coreRows.map((room) => (
            <MenuRoomRow key={room.href} room={room} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

      <div>
        <MenuColumnHeader>Signature &amp; Custom</MenuColumnHeader>
        <div className="divide-y divide-white/[0.06]">
          {signaturePodcastStudios.map((room) => (
            <MenuRoomRow key={room.href} room={room} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

      <div>
        <MenuColumnHeader>Rental Studios</MenuColumnHeader>
        <div className="divide-y divide-white/[0.06]">
          {rentalStudios.map((room) => (
            <MenuRoomRow key={room.href} room={room} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </DesktopMegaMenu>
  )
}

function MenuColumnHeader({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4">
      <p className="flex items-center gap-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-300">
        <span className="h-[5px] w-[5px] rounded-full bg-brand-red" aria-hidden="true" />
        {children}
      </p>
      <div className="mt-3 h-px bg-white/[0.08]" aria-hidden="true" />
    </div>
  )
}

function MenuChevron({ className = '' }: { className?: string }) {
  return (
    <span className={`shrink-0 text-brand-red/70 transition-all duration-300 group-hover/room:text-brand-red group-hover/feat:text-brand-red ${className}`} aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 6 6 6-6 6" />
      </svg>
    </span>
  )
}

function MenuRoomRow({ room, onNavigate }: { room: HeaderLink; onNavigate: () => void }) {
  return (
    <Link
      href={room.href}
      onClick={(event) => {
        onNavigate()
        event.currentTarget.blur()
      }}
      className="group/room -mx-3 flex items-center gap-4 rounded-xl px-3 py-4 transition-colors duration-300 hover:bg-white/[0.04]"
    >
      <span className="relative h-[88px] w-[112px] shrink-0 overflow-hidden rounded-[10px] bg-white/5 ring-1 ring-white/10">
        {room.image && (
          <Image src={room.image} alt="" fill sizes="256px" quality={85} className="object-cover transition-transform duration-500 group-hover/room:scale-[1.06]" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-[15px] font-bold leading-tight text-white">{room.label}</span>
          {room.price && <span className="shrink-0 font-mono text-xs font-bold text-brand-red">{room.price}</span>}
        </span>
        <span className="mt-1 block text-xs leading-snug text-zinc-500">{room.detail}</span>
      </span>
      <MenuChevron className="group-hover/room:translate-x-0.5" />
    </Link>
  )
}

function MenuFooterLink({
  href,
  label,
  detail,
  icon,
  onNavigate,
}: {
  href: string
  label: string
  detail: string
  icon: ReactNode
  onNavigate: () => void
}) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        onNavigate()
        event.currentTarget.blur()
      }}
      className="group/foot flex items-center gap-4"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-white transition-colors duration-300 group-hover/foot:border-white/30" aria-hidden="true">
        {icon}
      </span>
      <span>
        <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors duration-200 group-hover/foot:text-brand-red">{label}</span>
        <span className="mt-0.5 block text-xs text-zinc-500">{detail}</span>
      </span>
    </Link>
  )
}

function DesktopServicesMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <DesktopMegaMenu className="max-w-6xl grid-cols-[1.1fr_0.9fr_0.85fr] gap-14">
      <MegaColumn eyebrow="Production Services" links={serviceLinks} large onNavigate={onNavigate} />
      <MegaColumn eyebrow="Planning Tools" links={proofLinks} onNavigate={onNavigate} />
      <div>
        <MenuColumnHeader>Best First Step</MenuColumnHeader>
        <Link
          href="/find-your-studio/"
          onClick={(event) => {
            onNavigate()
            event.currentTarget.blur()
          }}
          className="group/card block rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]"
        >
          <span className="block text-2xl font-black tracking-tight text-white">Match the room to the outcome.</span>
          <span className="mt-3 block text-sm leading-relaxed text-zinc-400">
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
  footer,
}: {
  className: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="desktop-mega-menu pointer-events-none invisible fixed left-1/2 top-[calc(5rem-1px)] hidden max-h-[calc(100vh-6.5rem)] w-[min(calc(100vw-2rem),1680px)] -translate-x-1/2 translate-y-[-10px] scale-[0.985] overflow-y-auto overscroll-contain rounded-[20px] border border-white/[0.08] bg-[#0c0c0c] text-white opacity-0 shadow-[0_48px_140px_rgba(0,0,0,0.72)] transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-hover:delay-[60ms] group-hover:duration-[420ms] group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100 group-focus-within:delay-[60ms] group-focus-within:duration-[420ms] xl:block">
      <div className={`desktop-mega-grid mx-auto grid px-10 pb-7 pt-9 lg:px-14 ${className}`}>
        {children}
      </div>
      {footer && <div className="desktop-mega-footer px-10 pb-7 lg:px-14">{footer}</div>}
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
      <MenuColumnHeader>{eyebrow}</MenuColumnHeader>
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
            className="group/link block text-zinc-300 transition-colors duration-200 hover:text-white"
          >
            <span className={`flex items-baseline justify-between gap-4 ${large ? 'text-[1.45rem] font-black leading-[1.08] tracking-tight text-white' : 'text-[0.95rem] font-bold'}`}>
              <span>{label}</span>
              {price && <span className="text-xs font-semibold text-zinc-500 transition-colors duration-200 group-hover/link:text-zinc-300">{price}</span>}
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
        <MobileSection title="Plan" links={[...planningLinks, ...proofLinks]} />
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

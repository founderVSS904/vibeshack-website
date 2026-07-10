import Image from 'next/image'
import Link from 'next/link'

// Only logos with true alpha transparency belong here; the white-silhouette
// treatment (brightness-0 invert) turns baked-in backgrounds into solid boxes.
const stripLogos = [
  { name: 'Saviynt', src: '/brand/trusted-by/clean/saviynt.png' },
  { name: 'unPAUSED', src: '/brand/trusted-by/clean/unpaused.png' },
  { name: 'Silicon Mania', src: '/brand/trusted-by/clean/silicon-mania.png' },
  { name: "Melinda's Hot Sauce", src: '/brand/trusted-by/clean/melindas-hot-sauce.png' },
  { name: 'Dollars & Donuts', src: '/brand/trusted-by/clean/dollars-donuts.png' },
  { name: '141 Studios', src: '/brand/trusted-by/clean/141-studios.png' },
  { name: 'Alex Fitness', src: '/brand/trusted-by/clean/alex-fitness.png' },
  { name: 'Vegas Veteran Voices', src: '/brand/trusted-by/clean/vegas-veteran-voices.png' },
]

function LogoRow({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-x-14 pr-14" aria-hidden={hidden || undefined}>
      {stripLogos.map((logo) => (
        <Image
          key={logo.name}
          src={logo.src}
          alt={hidden ? '' : logo.name}
          width={220}
          height={80}
          className="h-5 w-auto max-w-none object-contain opacity-60 brightness-0 invert sm:h-6"
        />
      ))}
    </div>
  )
}

export function TrustedStrip() {
  return (
    <section className="border-y border-white/10 bg-black" aria-label="Brands that trust VibeShack">
      <div className="mx-auto flex max-w-[1680px] flex-col items-center gap-5 px-6 py-9 sm:flex-row sm:gap-10 sm:px-12 lg:px-24">
        <p className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-white/60">
          Trusted by visionaries
        </p>
        <div className="shot-logo-marquee trusted-strip-marquee w-full min-w-0 flex-1">
          <div className="shot-logo-track">
            <LogoRow />
            <LogoRow hidden />
          </div>
          <span className="sr-only">
            {stripLogos.map((logo) => logo.name).join(', ')}
          </span>
        </div>
        <Link
          href="/made-at-vibeshack/"
          className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-white/60 transition-colors hover:text-white"
        >
          And more <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </section>
  )
}

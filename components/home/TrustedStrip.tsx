import Image from 'next/image'
import Link from 'next/link'
import { trustedLogos } from '@/lib/trusted-logos'

function LogoRow({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-x-14 pr-14" aria-hidden={hidden || undefined}>
      {trustedLogos.map((logo) => {
        const src = logo.stripSrc ?? logo.src.replace('/clean/', '/strip/')
        const scale = logo.stripScale === 'badge'
          ? 'h-12 w-auto object-contain sm:h-14'
          : logo.stripScale === 'mark'
            ? 'h-10 w-auto object-contain sm:h-11'
            : 'h-7 w-auto object-contain sm:h-8'

        return (
          <Image
            key={logo.name}
            src={src}
            alt={hidden ? '' : logo.name}
            width={logo.stripWidth ?? logo.width}
            height={logo.stripHeight ?? logo.height}
            sizes="160px"
            className={`${scale} max-w-none opacity-90`}
          />
        )
      })}
    </div>
  )
}

export function TrustedStrip() {
  return (
    <section className="border-y border-white/10 bg-black" aria-label="Brands that trust VibeShack">
      <div className="mx-auto flex max-w-[1680px] flex-col items-center gap-5 px-6 py-9 sm:flex-row sm:gap-10 sm:px-12 lg:px-24">
        <p className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-white/60">
          Brands that shoot here
        </p>
        <div className="shot-logo-marquee trusted-strip-marquee w-full min-w-0 flex-1">
          <div className="shot-logo-track">
            <LogoRow />
            <LogoRow hidden />
          </div>
          <span className="sr-only">
            {trustedLogos.map((logo) => logo.name).join(', ')}
          </span>
        </div>
        <Link
          href="/made-at-vibeshack/"
          className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-white/60 transition-colors hover:text-white"
        >
          And more <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </section>
  )
}

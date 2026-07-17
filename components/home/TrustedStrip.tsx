import Image from 'next/image'
import Link from 'next/link'
import { trustedLogos } from '@/lib/trusted-logos'

function LogoRow({ hidden }: { hidden?: boolean }) {
  return (
    <div
      className={`trusted-strip-logo-row flex shrink-0 items-center gap-x-5 pr-5 ${hidden ? 'trusted-strip-logo-row--duplicate' : ''}`}
      aria-hidden={hidden || undefined}
    >
      {trustedLogos.map((logo) => {
        const src = logo.stripSrc ?? logo.src.replace('/clean/', '/strip/')
        const scale = logo.stripScale === 'badge'
          ? 'h-14 w-auto object-contain sm:h-16'
          : logo.stripScale === 'mark'
            ? 'h-11 w-auto object-contain sm:h-12'
            : 'h-7 w-auto object-contain sm:h-8'

        return (
          <div
            key={logo.name}
            className="flex h-[82px] w-[168px] shrink-0 flex-col items-center justify-end gap-2 sm:h-[90px] sm:w-[184px]"
          >
            <div className="flex h-14 w-full items-center justify-center sm:h-16">
              <Image
                src={src}
                alt={hidden ? '' : logo.name}
                width={logo.stripWidth ?? logo.width}
                height={logo.stripHeight ?? logo.height}
                sizes="(max-width: 640px) 140px, 152px"
                className={`${scale} max-w-[140px] opacity-95 sm:max-w-[152px]`}
              />
            </div>
            <span className="whitespace-nowrap text-center text-[9px] font-medium uppercase tracking-[0.08em] text-white/70 sm:text-[10px]">
              {logo.stripLabel ?? logo.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function TrustedStrip() {
  return (
    <section className="border-y border-white/10 bg-black" aria-label="Brands that trust VibeShack">
      <div className="mx-auto flex max-w-[1680px] flex-col items-center gap-4 px-6 py-7 sm:flex-row sm:gap-8 sm:px-12 lg:px-24">
        <p className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-white/60">
          Brands that trust us
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

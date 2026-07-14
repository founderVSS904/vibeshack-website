import Image from 'next/image'
import { trustedLogos } from '@/lib/trusted-logos'

export function ShotHereLogoCarousel() {
  const logoList = trustedLogos.map((logo) => logo.name).join(', ')

  return (
    <section className="overflow-hidden border-t border-white/5 bg-black py-24 sm:py-32">
      <div className="mx-auto mb-12 flex max-w-7xl flex-col gap-6 px-6 sm:px-10 lg:px-16">
        <span className="number-label w-fit">Brands That Trust Us</span>
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black leading-none text-white sm:text-5xl">
            Trusted by brands, creators, and media teams.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
            A growing wall of teams who trust VibeShack for podcasts, campaigns, interviews, launches, and content days.
          </p>
        </div>
      </div>

      <div className="sr-only">
        Brands and creators that trust VibeShack Studios include {logoList}.
      </div>

      <div className="shot-logo-marquee" aria-hidden="true">
        <div className="shot-logo-track">
          {[0, 1].map((groupIndex) => (
            <div className="shot-logo-group" key={groupIndex}>
              {trustedLogos.map((logo, index) => (
                <div className={`shot-logo-card ${logo.card === 'dark' ? 'shot-logo-card--dark' : ''}`} key={`${groupIndex}-${logo.name}-${index}`}>
                  <Image
                    src={logo.src}
                    alt=""
                    width={logo.width}
                    height={logo.height}
                    className="shot-logo-img"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-6 text-center sm:px-10 lg:px-16">
        <p className="text-xs text-gray-600">
          Worked with us? <a href="mailto:founder@vibeshackstudios.com" className="text-brand-red transition-colors hover:text-white">Send your brand mark</a> for review.
        </p>
      </div>
    </section>
  )
}

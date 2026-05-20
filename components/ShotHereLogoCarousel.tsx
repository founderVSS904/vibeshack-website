import Image from 'next/image'

type TrustedLogo = {
  name: string
  src: string
  width: number
  height: number
  card?: 'dark'
}

const logos: TrustedLogo[] = [
  {
    name: 'BET',
    src: '/brand/trusted-by/clean/bet.png',
    width: 1100,
    height: 350,
  },
  {
    name: 'Front Office Sports',
    src: '/brand/trusted-by/clean/front-office-sports.png',
    width: 1100,
    height: 1100,
  },
  {
    name: 'Hey AI Podcast',
    src: '/brand/trusted-by/clean/hey-ai-podcast.png',
    width: 1100,
    height: 1100,
  },
  {
    name: 'Alex Fitness',
    src: '/brand/trusted-by/clean/alex-fitness.png',
    width: 723,
    height: 1100,
  },
  {
    name: 'Shagun',
    src: '/brand/trusted-by/clean/shagun.png',
    width: 1100,
    height: 604,
  },
  {
    name: '141 Studios',
    src: '/brand/trusted-by/clean/141-studios.png',
    width: 1100,
    height: 743,
  },
  {
    name: 'Dollars & Donuts Productions',
    src: '/brand/trusted-by/clean/dollars-donuts.png',
    width: 1100,
    height: 978,
  },
  {
    name: 'Saviynt',
    src: '/brand/trusted-by/clean/saviynt.png',
    width: 1100,
    height: 252,
  },
  {
    name: 'Owner',
    src: '/brand/trusted-by/clean/owner.png',
    width: 1100,
    height: 333,
  },
  {
    name: "Melinda's Hot Sauce",
    src: '/brand/trusted-by/clean/melindas-hot-sauce.png',
    width: 985,
    height: 1100,
  },
  {
    name: 'Oxygen Conversation',
    src: '/brand/trusted-by/clean/oxygen-conversation.png',
    width: 1100,
    height: 1100,
  },
  {
    name: 'Silicon Mania',
    src: '/brand/trusted-by/clean/silicon-mania.png',
    width: 1100,
    height: 775,
  },
  {
    name: 'unPAUSED',
    src: '/brand/trusted-by/clean/unpaused.png',
    width: 1100,
    height: 177,
    card: 'dark',
  },
  {
    name: 'Vegas Veteran Voices',
    src: '/brand/trusted-by/clean/vegas-veteran-voices.png',
    width: 1100,
    height: 1064,
  },
]

export function ShotHereLogoCarousel() {
  const logoList = logos.map((logo) => logo.name).join(', ')

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
              {logos.map((logo, index) => (
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

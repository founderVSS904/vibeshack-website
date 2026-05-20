import Image from 'next/image'
import Link from 'next/link'

type HeroMeta = {
  label: string
  value: string
}

type EditorialSeoHeroProps = {
  backHref: string
  backLabel: string
  eyebrow: string
  title: string
  description: string
  image: string
  imageAlt: string
  imagePosition?: string
  imageFit?: 'cover' | 'contain'
  meta?: HeroMeta[]
}

export function EditorialSeoHero({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  imagePosition = 'center',
  imageFit = 'cover',
  meta = [],
}: EditorialSeoHeroProps) {
  const imageClass = imageFit === 'contain' ? 'object-contain p-4 sm:p-5' : 'object-cover'

  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-black">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 opacity-20 lg:block">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover blur-sm"
          style={{ objectPosition: imagePosition }}
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,#000_48%,rgba(0,0,0,0.82)_100%)]" />

      <div className="relative z-10 mx-auto grid min-h-[82vh] max-w-7xl grid-cols-1 gap-14 px-6 pb-16 pt-32 sm:px-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,0.78fr)] lg:items-center lg:px-16">
        <div className="max-w-4xl">
          <Link href={backHref} className="text-sm text-gray-500 transition-colors hover:text-white">
            &larr; {backLabel}
          </Link>
          <p className="mt-10 text-xs font-bold uppercase text-brand-red">{eyebrow}</p>
          <h1 className="mt-8 max-w-5xl text-5xl font-black leading-[0.94] text-white sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">{description}</p>
        </div>

        <div className="lg:justify-self-end">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-white/10 bg-zinc-950/80 shadow-2xl shadow-black/40">
            <Image
              src={image}
              alt={imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className={imageClass}
              style={{ objectPosition: imagePosition }}
            />
          </div>

          {meta.length > 0 && (
            <div className="mt-5 grid grid-cols-1 border-y border-white/10 sm:grid-cols-3">
              {meta.map((item) => (
                <div key={item.label} className="border-b border-white/10 py-4 sm:border-b-0 sm:border-r sm:px-5 first:sm:pl-0 last:border-r-0 last:sm:pr-0">
                  <p className="text-[10px] font-bold uppercase text-gray-600">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold leading-tight text-gray-200">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

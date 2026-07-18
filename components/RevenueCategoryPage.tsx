import Image from 'next/image'
import Link from 'next/link'

type Cta = {
  href: string
  label: string
}

type Stat = {
  label: string
  value: string
  detail: string
}

type Offer = {
  eyebrow: string
  title: string
  body: string
  image: string
  alt: string
  objectPosition?: string
}

type Package = {
  title: string
  price: string
  detail: string
}

type ProcessStep = {
  title: string
  body: string
}

type ProofImage = {
  src: string
  alt: string
  label: string
  className?: string
  objectPosition?: string
}

type RevenueCategoryPageProps = {
  eyebrow: string
  title: string
  lead: string
  heroImage: string
  heroAlt: string
  heroPosition?: string
  primaryCta: Cta
  secondaryCta: Cta
  stats: Stat[]
  introEyebrow: string
  introTitle: string
  introBody: string
  offers: Offer[]
  packages: Package[]
  process: ProcessStep[]
  proofEyebrow: string
  proofTitle: string
  proofBody: string
  proofImages: ProofImage[]
  finalTitle: string
  finalBody: string
}

export function RevenueCategoryPage({
  eyebrow,
  title,
  lead,
  heroImage,
  heroAlt,
  heroPosition = 'center center',
  primaryCta,
  secondaryCta,
  stats,
  introEyebrow,
  introTitle,
  introBody,
  offers,
  packages,
  process,
  proofEyebrow,
  proofTitle,
  proofBody,
  proofImages,
  finalTitle,
  finalBody,
}: RevenueCategoryPageProps) {
  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-black">
        <Image
          src={heroImage}
          alt={heroAlt}
          fill sizes="100vw"
          priority
          className="object-cover"
          style={{ objectPosition: heroPosition }}
        />
        <div className="absolute inset-0 hidden lg:block" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.66) 42%, rgba(0,0,0,0.18) 78%)' }} />
        <div className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 38%, rgba(0,0,0,0.82) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.18) 36%, transparent 72%)' }} />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-6 pb-12 pt-32 sm:px-10 lg:px-16">
          <div className="max-w-4xl">
            <p className="number-label mb-7">{eyebrow}</p>
            <h1 className="mb-8 max-w-4xl font-black leading-[0.94] text-white" style={{ fontSize: 'clamp(2.7rem, 6.2vw, 6.3rem)', letterSpacing: 0 }}>
              {title}
            </h1>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
              {lead}
            </p>
            <div className="mb-10 grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-3">
              {stats.map(({ label, value, detail }) => (
                <div key={label} className="bg-black/70 p-5 backdrop-blur-sm">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">{label}</p>
                  <p className="text-2xl font-black leading-none text-white">{value}</p>
                  <p className="mt-3 text-xs leading-relaxed text-gray-500">{detail}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href={primaryCta.href} className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
                {primaryCta.label}
              </Link>
              <Link href={secondaryCta.href} prefetch={secondaryCta.href === '/book/' ? false : undefined} className="text-sm font-semibold text-gray-400 transition-colors hover:text-white">
                {secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-black py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="number-label mb-6">{introEyebrow}</p>
              <h2 className="font-black leading-[0.98] text-white" style={{ fontSize: 'clamp(2.25rem, 4.9vw, 5rem)', letterSpacing: 0 }}>
                {introTitle}
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
              {introBody}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {offers.map(({ eyebrow: offerEyebrow, title: offerTitle, body, image, alt, objectPosition }) => (
              <article key={offerTitle} className="group overflow-hidden rounded-lg border border-white/10 bg-zinc-950 transition-colors hover:border-white/25">
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                    style={{ objectPosition: objectPosition || 'center center' }}
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.74) 0%, transparent 58%)' }} />
                  <p className="absolute bottom-5 left-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">{offerEyebrow}</p>
                </div>
                <div className="p-6">
                  <h3 className="mb-4 text-2xl font-black leading-none text-white" style={{ letterSpacing: 0 }}>{offerTitle}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-zinc-950 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <p className="number-label mb-6">Pricing</p>
              <h2 className="mb-6 font-black leading-[0.98] text-white" style={{ fontSize: 'clamp(2.2rem, 4.2vw, 4.4rem)', letterSpacing: 0 }}>
                Package the scope before the number.
              </h2>
              <p className="text-sm leading-relaxed text-gray-500">
                Creative production should be priced around the real scope. Room-only work can book instantly. Larger work gets scoped from the deliverables, usage, crew, and timeline.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {packages.map(({ title: packageTitle, price, detail }) => (
                <div key={packageTitle} className="rounded-lg border border-white/10 bg-black p-6">
                  <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-brand-red">{price}</p>
                  <h3 className="mb-5 text-2xl font-black leading-none text-white" style={{ letterSpacing: 0 }}>{packageTitle}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-black py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="number-label mb-6">How it works</p>
              <h2 className="mb-6 font-black leading-[0.98] text-white" style={{ fontSize: 'clamp(2.2rem, 4.2vw, 4.4rem)', letterSpacing: 0 }}>
                From brief to finished assets.
              </h2>
              <Link href={primaryCta.href} className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
                {primaryCta.label}
              </Link>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {process.map(({ title: stepTitle, body }) => (
                <div key={stepTitle} className="grid grid-cols-1 gap-4 py-7 md:grid-cols-[0.35fr_0.65fr] md:gap-12">
                  <p className="font-semibold text-white">{stepTitle}</p>
                  <p className="text-sm leading-relaxed text-gray-500">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-zinc-950 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="mb-12 max-w-3xl">
            <p className="number-label mb-6">{proofEyebrow}</p>
            <h2 className="mb-6 font-black leading-[0.98] text-white" style={{ fontSize: 'clamp(2.2rem, 4.2vw, 4.4rem)', letterSpacing: 0 }}>
              {proofTitle}
            </h2>
            <p className="text-base leading-relaxed text-gray-500">{proofBody}</p>
          </div>

          <div className="grid auto-rows-[280px] grid-cols-1 gap-3 md:grid-cols-4">
            {proofImages.map(({ src, alt, label, className, objectPosition }) => (
              <figure key={src} className={`group relative overflow-hidden rounded-lg bg-black ${className || ''}`}>
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                  style={{ objectPosition: objectPosition || 'center center' }}
                  sizes={className ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 100vw'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <figcaption className="absolute bottom-4 left-4 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                  {label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black py-28">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-10 lg:px-16">
          <p className="number-label mb-8">Ready</p>
          <h2 className="mb-6 font-black leading-[0.98] text-white" style={{ fontSize: 'clamp(2.6rem, 5.5vw, 5rem)', letterSpacing: 0 }}>
            {finalTitle}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-500">{finalBody}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={primaryCta.href} className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              {primaryCta.label}
            </Link>
            <Link href={secondaryCta.href} prefetch={secondaryCta.href === '/book/' ? false : undefined} className="self-center text-sm text-gray-500 transition-colors hover:text-white">
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

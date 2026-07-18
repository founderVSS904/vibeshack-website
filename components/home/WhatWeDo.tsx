import Link from 'next/link'

type Offering = {
  number: string
  title: string
  body: string
  href: string
  cta: string
}

const offerings: Offering[] = [
  {
    number: '01',
    title: 'Podcast Production',
    body: 'Record, cut, and publish from one room.',
    href: '/podcast-studio-san-francisco/',
    cta: 'See the podcast sets',
  },
  {
    number: '02',
    title: 'Video Production',
    body: 'Brand films, ads, and product video with crew.',
    href: '/video-production/',
    cta: 'Watch the work',
  },
  {
    number: '03',
    title: 'Photography',
    body: 'Campaigns, portraits, and product stills.',
    href: '/photo-services/',
    cta: 'Plan a shoot',
  },
  {
    number: '04',
    title: 'Studio Rentals',
    body: 'Nine rooms from $100/hr, open 24/7.',
    href: '/rental-studios/',
    cta: 'See rental rates',
  },
]

export function WhatWeDo() {
  return (
    <section className="bg-black pb-28 pt-24 sm:pb-36 sm:pt-32" aria-labelledby="what-we-do-title">
      <div className="mx-auto max-w-[1680px] px-6 sm:px-12 lg:px-24">
        <div className="text-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red sm:text-xs">
            What we do
          </p>
          <h2
            id="what-we-do-title"
            className="mt-6 text-3xl font-black uppercase leading-none text-white sm:text-5xl"
          >
            From concept to culture
          </h2>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/10">
          {offerings.map((offering) => (
            <div key={offering.title} className="flex flex-col items-center gap-5 text-center lg:px-12">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red" aria-hidden="true">
                {offering.number}
              </p>
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">
                {offering.title}
              </h3>
              <p className="max-w-[250px] text-sm leading-relaxed text-gray-500">{offering.body}</p>
              <Link
                href={offering.href}
                className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-white/55 transition-colors hover:text-brand-red"
              >
                {offering.cta} <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

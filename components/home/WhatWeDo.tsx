import Link from 'next/link'
import type { ReactNode } from 'react'

type Offering = {
  title: string
  body: string
  href: string
  icon: ReactNode
}

const iconProps = {
  className: 'h-9 w-9 text-brand-red',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
} as const

const offerings: Offering[] = [
  {
    title: 'Podcast Production',
    body: 'Full-service podcast production from concept to distribution.',
    href: '/podcast-studio-san-francisco/',
    icon: (
      <svg {...iconProps}>
        <rect x="9" y="2.5" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7" />
      </svg>
    ),
  },
  {
    title: 'Video Production',
    body: 'High-end video production for brands and storytellers.',
    href: '/video-production/',
    icon: (
      <svg {...iconProps}>
        <rect x="2.5" y="7" width="13" height="10" rx="2" />
        <path d="M15.5 10.5l6-3v9l-6-3" />
      </svg>
    ),
  },
  {
    title: 'Photography',
    body: 'Campaigns, portraits, and content that capture attention.',
    href: '/photo-services/',
    icon: (
      <svg {...iconProps}>
        <path d="M4 7.5h3l1.5-2.5h7L17 7.5h3a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5z" />
        <circle cx="12" cy="13.5" r="3.5" />
      </svg>
    ),
  },
  {
    title: 'Studio Rentals',
    body: 'Top-tier studios and gear ready when you are.',
    href: '/rental-studios/',
    icon: (
      <svg {...iconProps}>
        <path d="M12 2.8l8 4.4v9.6l-8 4.4-8-4.4V7.2l8-4.4z" />
        <path d="M4 7.2l8 4.4 8-4.4M12 11.6V21.2" />
      </svg>
    ),
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
              {offering.icon}
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">
                {offering.title}
              </h3>
              <p className="max-w-[250px] text-sm leading-relaxed text-gray-500">{offering.body}</p>
              <Link
                href={offering.href}
                className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-white/55 transition-colors hover:text-brand-red"
              >
                Explore <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ContactForm from './ContactForm'
import { StudioLocation } from '@/components/StudioLocation'
import { business, peerspaceUrl, siteUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact VibeShack Studios. Book a studio session or schedule a tour. 950 Battery St, San Francisco, CA 94111. +1 (845) 381-2289. founder@vibeshackstudios.com',
  alternates: {
    canonical: `${siteUrl}/contact/`,
  },
  openGraph: {
    title: 'Contact VibeShack Studios | San Francisco',
    description:
      'Book a studio or schedule a tour. Northern Waterfront SF. +1 (845) 381-2289. founder@vibeshackstudios.com',
    url: `${siteUrl}/contact/`,
    images: [
      {
        url: '/brand/vibeshack/dream-factory-rooftop-wide-v20260520.jpg',
        width: 1200,
        height: 630,
        alt: 'VibeShack Studios Dream Factory rooftop in San Francisco',
      },
    ],
  },
}

export default function ContactPage() {
  return (
    <main className="overflow-hidden bg-black">
      <section className="relative isolate min-h-[720px] overflow-hidden border-b border-white/10 sm:min-h-[780px]">
        <Image
          src="/brand/vibeshack/dream-factory-rooftop-wide-v20260520.jpg"
          alt="Producer overlooking San Francisco from the VibeShack Dream Factory rooftop"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.68)_42%,rgba(0,0,0,0.08)_78%),linear-gradient(0deg,rgba(0,0,0,0.92)_0%,transparent_55%)]" />

        <div className="relative mx-auto flex min-h-[720px] max-w-[1480px] flex-col justify-between px-6 pb-8 pt-36 sm:min-h-[780px] sm:px-10 sm:pb-10 sm:pt-40 lg:px-16">
          <div className="max-w-3xl pt-[8vh] sm:pt-[10vh]">
            <span className="mb-7 flex w-fit font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Contact / 950 Battery St</span>
            <h1 className="max-w-4xl text-[clamp(3.6rem,8.7vw,8.6rem)] font-black leading-[0.84] tracking-[-0.055em] text-white">
              Tell us what<br />
              <span className="text-brand-red">you&apos;re making.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Studio bookings, tours, production questions, and project briefs.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#project-inquiry"
                className="group inline-flex items-center justify-center gap-3 rounded-md bg-brand-red px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-700 sm:justify-start"
              >
                Send a brief
                <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">↓</span>
              </a>
              <Link
                href="/book/"
                className="group inline-flex items-center justify-center gap-3 rounded-md border border-white/25 bg-black/25 px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-white/60 hover:bg-white/10 sm:justify-start"
              >
                Book a studio
                <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-10 flex max-w-3xl flex-col gap-2 border-t border-white/20 pt-5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 sm:mt-14 sm:flex-row sm:items-center sm:gap-0">
            {['Same-day replies', 'Open 24/7 by appointment', 'San Francisco'].map((item, index) => (
              <span key={item}>
                {index > 0 && <span className="mx-4 hidden text-white/25 sm:inline" aria-hidden="true">/</span>}
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="project-inquiry" className="border-b border-white/10 bg-[#070707] py-20 sm:py-28">
        <div className="mx-auto max-w-[1480px] px-6 sm:px-10 lg:px-16">
          <div className="mb-10 max-w-3xl sm:mb-14">
            <span className="mb-5 flex w-fit font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Project inquiry</span>
            <h2 className="text-4xl font-black leading-[0.96] tracking-[-0.04em] text-white sm:text-6xl">
              Send the brief.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-white/55 sm:text-lg">
              A few lines is enough. Include your date, crew size, and what you need to make.
            </p>
          </div>

          <div className="grid gap-14 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)] lg:items-start lg:gap-20">
            <div className="border-t border-white/15 pt-8">
              <ContactForm />
            </div>

            <aside className="border-t border-white/15 lg:sticky lg:top-28">
              <div className="py-8">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">Studio booking</p>
                <h3 className="mt-4 max-w-sm text-2xl font-bold leading-tight tracking-[-0.025em] text-white sm:text-3xl">
                  Already know the room and time?
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
                  Go straight to availability and reserve the studio online.
                </p>
                <Link
                  href="/book/"
                  className="group mt-7 inline-flex items-center gap-3 rounded-md bg-brand-red px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-700"
                >
                  View availability
                  <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="border-t border-white/15 py-8">
                <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">Direct contact</p>
                <div>
                  <div className="grid grid-cols-[86px_minmax(0,1fr)] gap-4 border-b border-white/10 py-4">
                    <p className="text-xs text-white/35">Phone</p>
                    <a href={`tel:${business.phone.replace(/[^\d+]/g, '')}`} className="text-sm font-medium text-white transition-colors hover:text-brand-red">
                      {business.phone}
                    </a>
                  </div>
                  <div className="grid grid-cols-[86px_minmax(0,1fr)] gap-4 border-b border-white/10 py-4">
                    <p className="text-xs text-white/35">Email</p>
                    <a href="mailto:founder@vibeshackstudios.com" className="break-words text-sm font-medium text-white transition-colors hover:text-brand-red">
                      founder@vibeshackstudios.com
                    </a>
                  </div>
                  <div className="grid grid-cols-[86px_minmax(0,1fr)] gap-4 py-4">
                    <p className="text-xs text-white/35">Studio</p>
                    <address className="not-italic text-sm text-white">
                      950 Battery St, San Francisco
                      <span className="mt-1 block text-xs text-white/40">Open 24/7 by confirmed booking</span>
                    </address>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 font-mono text-[9px] font-bold uppercase tracking-[0.16em]">
                  <Link href="/tour/" className="text-brand-red transition-colors hover:text-white">Book a tour →</Link>
                  <a href={peerspaceUrl} target="_blank" rel="noopener noreferrer" className="text-white/45 transition-colors hover:text-white">Peerspace →</a>
                  <a href="https://instagram.com/vibeshackhq/" target="_blank" rel="noopener noreferrer" className="text-white/45 transition-colors hover:text-white">Instagram →</a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <StudioLocation heightClassName="h-[320px] sm:h-[380px]" />
    </main>
  )
}

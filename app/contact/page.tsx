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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_60%,rgba(229,0,0,0.18),transparent_31%)]" />

        <div className="relative mx-auto flex min-h-[720px] max-w-[1480px] flex-col justify-between px-6 pb-8 pt-36 sm:min-h-[780px] sm:px-10 sm:pb-10 sm:pt-40 lg:px-16">
          <div className="max-w-3xl pt-[8vh] sm:pt-[10vh]">
            <span className="number-label mb-7 flex w-fit">Contact VibeShack / San Francisco</span>
            <h1 className="max-w-4xl text-[clamp(3.6rem,8.7vw,8.6rem)] font-black leading-[0.84] tracking-[-0.055em] text-white">
              Let&apos;s make<br />
              <span className="text-brand-red">something real.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Tell us what you are building. We will shape the right room, crew, and production plan around it.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#project-inquiry"
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-brand-red px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-red-700 sm:justify-start"
              >
                Start a project
                <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">↓</span>
              </a>
              <Link
                href="/book/"
                className="group inline-flex items-center justify-center gap-3 rounded-xl border border-white/25 bg-black/25 px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-white/10 sm:justify-start"
              >
                Book a studio
                <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-10 grid max-w-3xl grid-cols-1 border-t border-white/20 sm:mt-14 sm:grid-cols-3">
            {[
              ['Response', 'Same day'],
              ['Access', 'Studios open 24/7'],
              ['Location', '950 Battery St'],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-white/10 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-7 sm:first:pl-0 sm:last:border-r-0">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-white/45">{label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="project-inquiry" className="relative border-b border-white/10 bg-[#070707] py-20 sm:py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[780px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(229,0,0,0.08),transparent_66%)]" />
        <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10 lg:px-16">
          <div className="mb-10 max-w-3xl sm:mb-14">
            <span className="number-label mb-5 flex w-fit">Project inquiry</span>
            <h2 className="text-4xl font-black leading-[0.96] tracking-[-0.04em] text-white sm:text-6xl">
              Tell us what has to ship.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-white/55 sm:text-lg">
              Share the goal, audience, timing, and deliverables. We will come back with the clearest next step.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:items-start">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8 lg:p-10">
              <ContactForm />
            </div>

            <aside className="grid gap-6 lg:sticky lg:top-28">
              <div className="relative overflow-hidden rounded-[24px] bg-brand-red p-7 sm:p-9">
                <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border-[36px] border-white/10" aria-hidden="true" />
                <p className="relative font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">Fast track</p>
                <h3 className="relative mt-4 max-w-sm text-3xl font-black leading-[0.96] tracking-[-0.035em] text-white sm:text-4xl">
                  Know your room and date?
                </h3>
                <p className="relative mt-4 max-w-sm text-sm text-white/80">
                  Skip the inquiry. Pick a studio, choose a time, and confirm your session instantly.
                </p>
                <Link
                  href="/book/"
                  className="group relative mt-7 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black transition-transform hover:-translate-y-0.5"
                >
                  Book your session
                  <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black p-7 sm:p-9">
                <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">Call or text</p>
                    <a href={`tel:${business.phone.replace(/[^\d+]/g, '')}`} className="mt-2 block text-sm font-semibold text-white transition-colors hover:text-brand-red">
                      {business.phone}
                    </a>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">Email</p>
                    <a href="mailto:founder@vibeshackstudios.com" className="mt-2 block break-words text-sm font-semibold text-white transition-colors hover:text-brand-red">
                      founder@vibeshackstudios.com
                    </a>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">Visit</p>
                    <address className="mt-2 not-italic text-sm text-white">
                      950 Battery St<br />
                      <span className="text-white/50">San Francisco, CA 94111</span>
                    </address>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">Studio access</p>
                    <p className="mt-2 text-sm font-semibold text-white">24 hours / 7 days</p>
                    <p className="mt-1 text-xs text-white/45">By confirmed booking</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 font-mono text-[9px] font-bold uppercase tracking-[0.16em]">
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

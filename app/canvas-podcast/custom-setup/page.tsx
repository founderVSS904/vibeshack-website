import type { Metadata } from 'next'
import Image from 'next/image'
import CustomSetupForm from './CustomSetupForm'
import { siteUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'Canvas Podcast Custom Setup Request',
  description: 'Request a custom Canvas Podcast setup at VibeShack Studios in San Francisco.',
  alternates: { canonical: `${siteUrl}/canvas-podcast/custom-setup/` },
  robots: { index: false, follow: true },
}

export default function CanvasPodcastCustomSetupPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-black pt-36 pb-20">
        <div className="absolute inset-0 opacity-35">
          <Image src="/studio-images/podcast-cyc-duo.jpg" alt="" fill sizes="100vw" priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/40" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <a href="/canvas-podcast/" className="mb-10 inline-block text-sm text-gray-500 transition-colors hover:text-white">← Canvas Podcast</a>
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.25em] text-brand-red">Custom Setup Request</p>
          <h1 className="max-w-4xl font-black leading-none text-white" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: 0 }}>
            Tell us the set you want.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-gray-400">
            Use this form when Canvas Podcast needs custom lighting, backdrop direction, props, furniture, or a more produced setup before you book.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-zinc-950 py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 sm:px-10 lg:grid-cols-[0.75fr_1.25fr] lg:px-16">
          <aside className="self-start lg:sticky lg:top-28">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">How it works</p>
            <div className="space-y-6 text-sm leading-relaxed text-gray-400">
              <p>Send us the creative direction, preferred date, number of people, and any must-haves.</p>
              <p>We review the setup and reply with the cleanest room plan before you commit to the session.</p>
              <p className="text-white">$400/hr base rate. Custom production needs may require additional setup or crew planning.</p>
            </div>
          </aside>
          <div className="rounded-lg border border-white/10 bg-black p-6 sm:p-10">
            <CustomSetupForm />
          </div>
        </div>
      </section>
    </>
  )
}

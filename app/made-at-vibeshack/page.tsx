import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Shot Here | VibeShack Studios SF',
  description: 'Terminal Lance, Front Office Sports, Saviance and more have recorded at VibeShack Studios in San Francisco. See who\'s made work here.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/made-at-vibeshack' }
}

export default function MadeAtVibeShackPage() {
  return (
    <>
      <section className="relative min-h-[70vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/executive-made-3.jpg" alt="Shot at VibeShack Studios"
          fill className="object-cover" style={{opacity: 0.5}} priority />
        <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'}} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-40 w-full">
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mb-4">VibeShack Studios · SF</p>
          <h1 data-reveal="up" className="font-black text-white leading-none mb-4" style={{fontSize: 'clamp(3rem, 6vw, 6rem)', letterSpacing: '-0.05em'}}>
            Shot<br/><span className="text-brand-red">Here.</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-md" data-reveal="fade">
            The work made inside these walls.
          </p>
        </div>
      </section>

      {/* Brand wall */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Who&apos;s Recorded Here</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/8 rounded-2xl overflow-hidden">
            {[
              {
                name: 'Terminal Lance',
                desc: 'Military culture media. Podcast and video productions.',
                studio: 'The Executive',
                img: '/studio-images/executive-made-1.jpg',
              },
              {
                name: 'Front Office Sports',
                desc: 'Portfolio Players. Sports business media.',
                studio: 'The Executive',
                img: '/studio-images/executive-made-3.jpg',
              },
              {
                name: 'Saviance',
                desc: 'Brand and video production.',
                studio: 'VibeShack Studios',
                img: '/studio-images/the-executive-hero.jpg',
              },
            ].map(({ name, desc, studio, img }) => (
              <div key={name} className="bg-black p-8 group">
                <div className="overflow-hidden rounded-xl mb-6 relative aspect-square md:aspect-video">
                  <Image src={img} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <p className="text-white font-black text-xl mb-1" style={{letterSpacing: '-0.02em'}}>{name}</p>
                <p className="text-gray-500 text-sm mb-3">{desc}</p>
                <p className="text-gray-700 text-xs uppercase tracking-widest">{studio}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-6 text-center">
            Recorded here? <a href="mailto:founder@vibeshackstudios.com" className="text-brand-red hover:text-white transition-colors">Let us know</a> — we&apos;ll add you to the wall.
          </p>
        </div>
      </section>

      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
          
          {/* Badge display */}
          <div className="flex flex-col md:flex-row gap-16 items-start mb-20">
            <div className="flex-shrink-0">
              <div className="bg-zinc-900 rounded-2xl p-10 flex items-center justify-center" style={{minWidth: '280px'}}>
                <Image src="/brand/vibeshack-logo-transparent.png" alt="Made at VibeShack badge" width={192} height={80} className="w-48" />
              </div>
              <p className="text-gray-600 text-xs mt-4 text-center tracking-wide">The Creative Standard</p>
            </div>
            <div className="pt-4">
              <h2 data-reveal="up" className="text-white font-black text-2xl mb-4" style={{letterSpacing: '-0.03em'}}>The badge.</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                If you recorded here, you&apos;re part of the standard. The badge is your signal — to your audience, to your industry — that you take your work seriously enough to do it right.
              </p>
              <p className="text-gray-600 text-xs mb-2 tracking-widest uppercase">How to use it</p>
              <div className="divide-y divide-white/8">
                {[
                  { platform: 'Podcast show notes', text: 'Add "Recorded at VibeShack Studios, San Francisco" to every episode description.' },
                  { platform: 'YouTube', text: 'Add to your video description or as a lower-third in your intro.' },
                  { platform: 'Instagram', text: 'Drop in your bio or story highlights.' },
                  { platform: 'LinkedIn', text: 'Add to your show or channel description.' },
                ].map(({ platform, text }) => (
                  <div key={platform} className="py-4">
                    <p className="text-white font-semibold text-sm mb-1">{platform}</p>
                    <p className="text-gray-600 text-xs leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Copy text section */}
          <div className="border-t border-white/8 pt-16">
            <h2 data-reveal="up" className="text-white font-black text-xl mb-8" style={{letterSpacing: '-0.02em'}}>Copy and paste.</h2>
            <div className="space-y-6">
              {[
                { label: 'Short', text: 'Recorded at VibeShack Studios · San Francisco · vibeshackstudios.com' },
                { label: 'Standard', text: 'This episode was recorded at VibeShack Studios in San Francisco. The Creative Standard. vibeshackstudios.com' },
                { label: 'Full', text: 'Recorded at VibeShack Studios, 950 Battery St, San Francisco. Professional podcast, video, and photography studios. Open 24/7. vibeshackstudios.com' },
              ].map(({ label, text }) => (
                <div key={label} className="bg-zinc-950 rounded-xl p-6">
                  <p className="text-gray-600 text-xs tracking-widest uppercase mb-3">{label}</p>
                  <p className="text-gray-300 text-sm leading-relaxed font-mono">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="border-t border-white/8 pt-16 text-center">
            <p className="text-gray-500 text-sm mb-6">Haven&apos;t recorded here yet?</p>
            <Link href="/book" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
              Book Your Session
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

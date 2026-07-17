import type { Metadata } from 'next'
import ContactForm from './ContactForm'
import { StudioLocation } from '@/components/StudioLocation'
import { business, peerspaceUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact VibeShack Studios. Book a studio session or schedule a tour. 950 Battery St, San Francisco, CA 94111. +1 (845) 381-2289. founder@vibeshackstudios.com',
  alternates: {
    canonical: 'https://www.vibeshackstudios.com/contact/',
  },
  openGraph: {
    title: 'Contact VibeShack Studios | San Francisco',
    description:
      'Book a studio or schedule a tour. Northern Waterfront SF. +1 (845) 381-2289. founder@vibeshackstudios.com',
    url: 'https://www.vibeshackstudios.com/contact',
  },
}

export default function ContactPage() {
  return (
    <>
      <section className="bg-black pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Contact</span>
          <h1
            className="font-black text-white leading-none mb-6"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: 0 }}
          >
            Contact<br />
            <span className="text-brand-red">VibeShack.</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-lg">
            Studio bookings, tours, production questions, and project briefs.
          </p>
        </div>
      </section>

      <StudioLocation heightClassName="h-[320px] sm:h-[380px]" />

      {/* Main Contact Layout */}
      <section className="py-24 bg-zinc-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

            {/* Form — Apple Style */}
            <div>
              <h2
                className="font-black text-white leading-tight mb-12"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', letterSpacing: 0 }}
              >
                Send a Message
              </h2>
              <ContactForm />
            </div>

            {/* Contact Info — Clean Lines */}
            <div className="space-y-0 divide-y divide-white/10 border-y border-white/10 self-start">

              {/* Book Directly */}
              <div className="py-8">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Fastest Way to Book</p>
                <p className="text-gray-400 text-sm mb-5">
                  Pick your time and confirm instantly.
                </p>
                <a
                  href="/book/"
                  className="group inline-flex items-center gap-2.5 rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700"
                >
                  Book Your Session
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </a>
              </div>

              {/* Address */}
              <div className="py-8">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Location</p>
                <address className="not-italic">
                  <p className="text-white font-bold text-base">950 Battery St</p>
                  <p className="text-gray-400 text-sm">San Francisco, CA 94111</p>
                  <p className="text-gray-500 text-sm">Northern Waterfront · Near Embarcadero</p>
                </address>
                <a
                  href="https://maps.google.com/?q=950+Battery+St+San+Francisco+CA+94111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-brand-red text-sm font-semibold hover:underline mt-4"
                >
                  Open in Google Maps →
                </a>
              </div>

              {/* Phone */}
              <div className="py-8">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Phone</p>
                <a
                  href={`tel:${business.phone.replace(/[^\d+]/g, '')}`}
                  className="text-white font-semibold hover:text-brand-red transition-colors"
                >
                  {business.phone}
                </a>
                <p className="text-gray-500 text-sm mt-1">Call or text for booking questions.</p>
              </div>

              {/* Email */}
              <div className="py-8">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Email</p>
                <a
                  href="mailto:founder@vibeshackstudios.com"
                  className="text-white font-semibold hover:text-brand-red transition-colors"
                >
                  founder@vibeshackstudios.com
                </a>
                <p className="text-gray-500 text-sm mt-1">Available 7 days a week.</p>
              </div>

              {/* Instagram */}
              <div className="py-8">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Instagram</p>
                <a
                  href="https://instagram.com/vibeshackhq/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-white font-semibold hover:text-brand-red transition-colors"
                >
                  @vibeshackhq
                </a>
                <a
                  href="https://instagram.com/vibeshackstudios_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-gray-400 font-semibold hover:text-brand-red transition-colors"
                >
                  @vibeshackstudios_
                </a>
                <p className="text-gray-500 text-sm mt-1">Behind-the-scenes, studio looks, client work.</p>
              </div>

              {/* Hours */}
              <div className="py-8">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Studio Hours</p>
                <p className="text-white font-bold text-lg">24 / 7</p>
                <p className="text-gray-500 text-sm mt-1">
                  All studios open around the clock. Early morning, late night, weekends.
                </p>
              </div>

              {/* Peerspace */}
              <div className="py-8">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Also on Peerspace</p>
                <a
                  href={peerspaceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-red font-semibold text-sm hover:underline"
                >
                  Book via Peerspace →
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  )
}

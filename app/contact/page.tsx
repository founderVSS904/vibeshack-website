import type { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact | Book a Studio or Tour | VibeShack Studios',
  description:
    'Contact VibeShack Studios. Book a studio session or schedule a tour. 950 Battery St, San Francisco, CA 94111. founder@vibeshackstudios.com',
  alternates: {
    canonical: 'https://www.vibeshackstudios.com/contact',
  },
  openGraph: {
    title: 'Contact VibeShack Studios | San Francisco',
    description:
      'Book a studio or schedule a tour. Northern Waterfront SF. founder@vibeshackstudios.com',
    url: 'https://www.vibeshackstudios.com/contact',
  },
}

export default function ContactPage() {
  return (
    <>
      {/* Hero — Minimal */}
      <section className="bg-black pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Contact</span>
          <h1
            className="font-black text-white leading-none mb-6"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.05em' }}
          >
            Let&apos;s Build<br />
            <span className="text-brand-red">Something.</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-lg">
            Book a studio, schedule a tour, or ask us anything.
          </p>
        </div>
      </section>

      {/* Embedded Map */}
      <section className="bg-black border-t border-white/10">
        <div className="relative w-full" style={{ height: '380px' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d800!2d-122.4003!3d37.8009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808580f3b43fcd85%3A0x37a86c6c0f0a3f5a!2s950%20Battery%20St%2C%20San%20Francisco%2C%20CA%2094111!5e0!3m2!1sen!2sus!4v1"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="VibeShack Studios location"
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 2 }}>
            <div className="relative" style={{ marginTop: '-20px' }}>
              <div className="absolute -inset-4 rounded-full bg-brand-red opacity-20 animate-ping" />
              <div className="absolute -inset-2 rounded-full bg-brand-red opacity-30" />
              <div className="w-4 h-4 rounded-full bg-brand-red shadow-lg" style={{ boxShadow: '0 0 20px rgba(229,0,0,0.8), 0 0 40px rgba(229,0,0,0.4)' }} />
            </div>
          </div>
          <div className="absolute bottom-6 left-6 glass-card rounded-lg p-5" style={{ backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-brand-red" style={{ boxShadow: '0 0 8px #E50000' }} />
              <span className="text-white font-bold text-sm">VibeShack Studios</span>
            </div>
            <p className="text-gray-400 text-xs">950 Battery St · SF, CA 94111</p>
            <a
              href="https://maps.google.com/?q=950+Battery+St+San+Francisco+CA+94111"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-red text-xs font-semibold hover:text-white transition-colors mt-2"
            >
              Get Directions →
            </a>
          </div>
        </div>
      </section>

      {/* Main Contact Layout */}
      <section className="py-24 bg-zinc-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

            {/* Form — Apple Style */}
            <div>
              <h2
                className="font-black text-white leading-tight mb-12"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', letterSpacing: '-0.03em' }}
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
                  href="/book"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded-lg hover:bg-red-700 transition-colors"
                >
                  Book a Session →
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
                  href="https://instagram.com/vibeshackstudios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-semibold hover:text-brand-red transition-colors"
                >
                  @vibeshackstudios
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
                  href="https://www.peerspace.com/pages/listings/689d6738fd3071ac60b894ab"
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

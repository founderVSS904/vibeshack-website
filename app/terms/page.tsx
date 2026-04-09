import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | VibeShack Studios',
  description: 'Booking policies, cancellation, studio rules, and terms of use for VibeShack Studios.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/terms' }
}

export default function TermsPage() {
  return (
    <main className="bg-black min-h-screen">

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <p className="text-gray-600 text-xs uppercase tracking-widest mb-8">Legal</p>
        <h1
          className="font-black text-white leading-none mb-6"
          style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)', letterSpacing: '-0.05em' }}
        >
          Terms.
        </h1>
        <p className="text-gray-400 text-xl leading-relaxed max-w-xl">
          How bookings work, what to expect, and what we expect from you.
        </p>
        <p className="text-gray-600 text-sm mt-8">Effective April 2026</p>
      </section>

      {/* Bookings */}
      <section className="border-t border-white/10 py-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2
              className="text-white font-bold text-2xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Bookings
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              Your session is confirmed the moment payment is processed. You&apos;ll receive a confirmation email with your booking details immediately after.
            </p>
            <p>
              Sessions run on a fixed schedule. Your booked time is your time — it starts when it starts and ends when it ends. Late arrivals don&apos;t extend your session, and early departures aren&apos;t refunded.
            </p>
          </div>
        </div>
      </section>

      {/* Cancellation */}
      <section className="border-t border-white/10 py-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2
              className="text-white font-bold text-2xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Cancellation
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              Cancel at least 48 hours before your session and you get a full refund. No penalty, no questions. We think that&apos;s how it should work.
            </p>
            <p>
              Cancellations within 48 hours of your session are non-refundable. At that point, the slot can&apos;t be filled on short notice.
            </p>
            <p>
              No-shows are non-refundable.
            </p>
            <p>
              To cancel, email{' '}
              <a
                href="mailto:founder@vibeshackstudios.com"
                className="text-brand-red hover:text-white transition-colors"
              >
                founder@vibeshackstudios.com
              </a>{' '}
              with your booking details.
            </p>
          </div>
        </div>
      </section>

      {/* Payment */}
      <section className="border-t border-white/10 py-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2
              className="text-white font-bold text-2xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Payment
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              All payments are processed by Stripe. We accept all major credit and debit cards. Payment is required in full at the time of booking. All prices are in USD.
            </p>
            <p>
              If you have a billing issue, contact us before initiating a chargeback. We&apos;re reasonable and will work through it with you.
            </p>
          </div>
        </div>
      </section>

      {/* Studio rules */}
      <section className="border-t border-white/10 py-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2
              className="text-white font-bold text-2xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Studio rules
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              You&apos;re responsible for the studio during your session — that includes your guests and any damage beyond normal wear and tear. Treat the equipment well. If something breaks, we&apos;ll document it and invoice you at repair or replacement cost.
            </p>
            <p>
              No smoking, vaping, or open flames inside the studio. No illegal activity. No content that violates any applicable law.
            </p>
            <p>
              Leave the studio the way you found it. Excessive cleanup means a cleaning fee.
            </p>
          </div>
        </div>
      </section>

      {/* Your content */}
      <section className="border-t border-white/10 py-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2
              className="text-white font-bold text-2xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Your content
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              Everything you create in the studio is yours. We claim no rights over your creative work — photos, video, audio, or anything else produced during your session.
            </p>
            <p>
              We may photograph or film sessions for marketing purposes. If you&apos;d prefer we don&apos;t, let us know at the time of booking and we won&apos;t. No effect on your rate.
            </p>
          </div>
        </div>
      </section>

      {/* Liability */}
      <section className="border-t border-white/10 py-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2
              className="text-white font-bold text-2xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Liability
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              We provide the space and equipment. We&apos;re not responsible for the content you create, how you use it, or any claims that arise from it.
            </p>
            <p>
              Our liability to you is capped at the amount you paid for your session. We are not liable for indirect, incidental, or consequential damages.
            </p>
            <p>
              We recommend insuring any valuable personal equipment you bring to the studio.
            </p>
          </div>
        </div>
      </section>

      {/* Governing law */}
      <section className="border-t border-white/10 py-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2
              className="text-white font-bold text-2xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Governing law
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              These terms are governed by the laws of the State of California. Any disputes will be handled in San Francisco County. If something goes wrong, contact us first — we&apos;d rather resolve it directly.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-white/10 py-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2
              className="text-white font-bold text-2xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Contact
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-4 text-gray-400 text-lg leading-relaxed">
            <p>Questions about these terms — reach us directly.</p>
            <p>
              <a
                href="mailto:founder@vibeshackstudios.com"
                className="text-brand-red hover:text-white transition-colors"
              >
                founder@vibeshackstudios.com
              </a>
              <br />
              <span className="text-gray-600">
                VibeShack Studios · 950 Battery St · San Francisco, CA 94111
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <div className="border-t border-white/5 py-12 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <p className="text-gray-700 text-sm">
          We may update these terms from time to time. The current version is always at vibeshackstudios.com/terms. Bookings made before a change are governed by the terms in effect at the time of booking.
        </p>
      </div>

    </main>
  )
}

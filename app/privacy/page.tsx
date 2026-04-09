import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | VibeShack Studios',
  description: 'How VibeShack Studios collects, uses, and protects your personal information.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/privacy' }
}

export default function PrivacyPage() {
  return (
    <main className="bg-black min-h-screen">

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <p className="text-gray-600 text-xs uppercase tracking-widest mb-8">Legal</p>
        <h1
          className="font-black text-white leading-none mb-6"
          style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)', letterSpacing: '-0.05em' }}
        >
          Privacy.
        </h1>
        <p className="text-gray-400 text-xl leading-relaxed max-w-xl">
          What we collect, how we use it, and what you can do about it.
        </p>
        <p className="text-gray-600 text-sm mt-8">Effective April 2026</p>
      </section>

      {/* What we collect */}
      <section className="border-t border-white/10 py-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2
              className="text-white font-bold text-2xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              What we collect
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              When you book a session, we collect your name, email address, phone number, and the details of your booking — studio type, date, and duration. If you contact us through the site, we keep that correspondence.
            </p>
            <p>
              Payments go through Stripe. We never see your card number or CVV — only a transaction confirmation and the last four digits of your card. Stripe handles all payment data under their PCI-compliant infrastructure.
            </p>
            <p>
              We use Google Analytics to understand how people use the site. This data is anonymized — no personal identifiers are attached to traffic data. Standard browser cookies support site functionality and analytics. We don&apos;t sell tracking data.
            </p>
          </div>
        </div>
      </section>

      {/* How we use it */}
      <section className="border-t border-white/10 py-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2
              className="text-white font-bold text-2xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              How we use it
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              Your information is used to confirm and manage your booking, process payment, send you a confirmation and any relevant reminders, and schedule your session on our internal Google Calendar.
            </p>
            <p>
              If you contact us with a question, we use your information to respond. That&apos;s it.
            </p>
            <p>
              We do not sell your data. We do not share it with advertisers. We do not add you to any mailing list without your explicit consent.
            </p>
          </div>
        </div>
      </section>

      {/* Third parties */}
      <section className="border-t border-white/10 py-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2
              className="text-white font-bold text-2xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Third parties
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-10 text-gray-400 text-lg leading-relaxed">
            <div>
              <p className="text-white font-semibold mb-2">Stripe</p>
              <p>
                Payment processing. Your card data lives exclusively on their servers.{' '}
                <a
                  href="https://stripe.com/privacy"
                  className="text-brand-red hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  stripe.com/privacy
                </a>
              </p>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">Google Calendar</p>
              <p>
                Internal booking scheduling. Your name and email are added to calendar events we use to manage the studio — nothing more.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">Google Analytics</p>
              <p>
                Anonymized traffic data. No personal identifiers are shared with Google through analytics.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">Vercel</p>
              <p>
                Website hosting. Server logs may include IP addresses as a standard part of web hosting infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data retention */}
      <section className="border-t border-white/10 py-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2
              className="text-white font-bold text-2xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Data retention
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              Booking records are retained for three years for business and tax purposes. Contact form submissions are kept for twelve months. Analytics data follows Google&apos;s default retention settings.
            </p>
            <p>
              If you request deletion of your data, we remove everything we can while staying compliant with any applicable legal obligations.
            </p>
          </div>
        </div>
      </section>

      {/* Your rights */}
      <section className="border-t border-white/10 py-24 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2
              className="text-white font-bold text-2xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Your rights
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              You can request a copy of the data we hold about you, ask us to correct anything inaccurate, or request deletion. You can opt out of any marketing communications at any time.
            </p>
            <p>
              California residents have additional rights under the CCPA: the right to know what personal information is collected and disclosed, and the right to non-discrimination for exercising those rights. We do not sell personal information.
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
            <p>Questions or requests about this policy — reach us directly.</p>
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
          We may update this policy as our services evolve. Changes are posted here with a new effective date.
        </p>
      </div>

    </main>
  )
}

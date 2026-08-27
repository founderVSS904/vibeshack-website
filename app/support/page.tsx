import type { Metadata } from 'next'
import { siteUrl } from '@/lib/seo/site'
import { faqSchema } from '@/lib/schemas'
import { PODCAST_PACKAGE_SUMMARY, PODCAST_RATE_SUMMARY } from '@/lib/booking/podcast-package'

export const metadata: Metadata = {
  title: 'Support',
  description: 'Questions about booking, pricing, studios, or your session. We\'re here. VibeShack Studios, 950 Battery St, San Francisco.',
  alternates: { canonical: `${siteUrl}/support/` },
  openGraph: {
    type: 'website',
    siteName: 'VibeShack Studios',
    title: 'Support | VibeShack Studios SF',
    description: 'Questions about booking, pricing, studios, or your session. We\'re here. VibeShack Studios, 950 Battery St, San Francisco.',
    url: `${siteUrl}/support/`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VibeShack Studios support' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Support | VibeShack Studios SF',
    description: 'Questions about booking, pricing, studios, or your session. We\'re here. VibeShack Studios, 950 Battery St, San Francisco.',
    images: ['/og-image.jpg'],
  },
}

const FAQS = [
  {
    category: 'Booking',
    questions: [
      {
        q: 'How do I book a studio?',
        a: 'Go to vibeshackstudios.com/book. Pick your studio, choose your date and time, enter your info, and pay. Confirmation is instant.',
      },
      {
        q: 'Can I book multiple sessions at once?',
        a: 'Yes. Our booking system lets you add multiple studios and time slots to a single order and pay once. No need to go through checkout multiple times.',
      },
      {
        q: 'Can I book same-day?',
        a: 'Yes. We are open 24/7 and accept same-day bookings as long as the slot is available.',
      },
      {
        q: 'How far in advance can I book?',
        a: 'Up to 60 days in advance. If you need something further out, email us directly.',
      },
      {
        q: 'Can I set up a recurring booking?',
        a: 'Yes. During checkout, you can select a recurring schedule: weekly, bi-weekly, or monthly. We\'ll lock in your slot and apply a discount.',
      },
    ],
  },
  {
    category: 'Studios',
    questions: [
      {
        q: 'What is the difference between a Podcast Studio and a Rental?',
        a: `${PODCAST_PACKAGE_SUMMARY} ${PODCAST_RATE_SUMMARY} Rental studios are $100/hr for the space and listed lighting. Bring your camera package and crew, or arrange production support before booking.`,
      },
      {
        q: 'Is the equipment already set up when I arrive?',
        a: 'Yes. The studio and its included equipment are configured and tested before your session starts. Podcast bookings include the cameras, microphones, lighting, and studio operators. For rentals, check the equipment listed on your room page and bring your camera package.',
      },
      {
        q: 'How many people can fit in a studio?',
        a: 'It depends on the studio and what you\'re making. Our white cyc wall has held productions with over 100 people. Podcast studios are designed for intimate on-camera formats. Rental studios vary in size and can support anything from solo shoots to large-scale productions. Tell us your headcount and project type and we\'ll point you to the right space.',
      },
      {
        q: 'Do you have Hair and Makeup on-site?',
        a: 'We have dedicated Hair and Makeup rooms and wardrobe changing rooms at several of our studios: spaces where your talent can get ready before the session. We do not provide Hair and Makeup artists or services. Bring your own team, or arrive ready.',
      },
      {
        q: 'How quickly do I get my footage?',
        a: 'We offer a 6 to 12 hour turnaround. We process your footage and send it to you the same day as your session.',
      },
      {
        q: 'Can I do a free tour before I book?',
        a: 'Yes. Book a free tour at vibeshackstudios.com/tour. The available times are checked against the live studio calendar before your tour is confirmed.',
      },
    ],
  },
  {
    category: 'Pricing & Payment',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'All major credit and debit cards via Stripe. Payment is collected in full at the time of booking.',
      },
      {
        q: 'Are there any hidden fees?',
        a: `Your booking total shows the selected studio time and any extras before payment. Rental studios are $100/hr. ${PODCAST_RATE_SUMMARY} ${PODCAST_PACKAGE_SUMMARY}`,
      },
      {
        q: 'Do you offer monthly packages?',
        a: 'Yes. If you need regular studio time, reach out and we\'ll build a monthly package around your schedule. Email founder@vibeshackstudios.com.',
      },
    ],
  },
  {
    category: 'Cancellations & Changes',
    questions: [
      {
        q: 'What is your cancellation policy?',
        a: 'Free cancellation up to 48 hours before your session for a full refund. Cancellations within 48 hours are non-refundable.',
      },
      {
        q: 'Can I reschedule my session?',
        a: 'Yes. Email founder@vibeshackstudios.com with your booking details and the new time you want. We\'ll take care of it as long as the new slot is available.',
      },
      {
        q: 'What if I need to add more time on the day?',
        a: 'If the next slot is open, we can extend your session. Check with whoever is on-site and we\'ll sort it out.',
      },
    ],
  },
  {
    category: 'Day of Your Session',
    questions: [
      {
        q: 'Where exactly is VibeShack?',
        a: '950 Battery St, San Francisco, CA 94111. Northern Waterfront. Street parking on Battery St. 10 minute walk from the Ferry Building.',
      },
      {
        q: 'What should I bring?',
        a: 'For podcasts, bring your talking points, wardrobe, and any props. The podcast cameras, microphones, lighting, and studio operators are included. For rentals, bring your camera package and crew unless production support has been arranged. Check your room page for the included equipment.',
      },
      {
        q: 'What if I\'m running late?',
        a: 'Your session time is reserved. If you arrive late, your session still ends at the booked time unless the next slot is open. Email or call us if you\'re going to be significantly late.',
      },
    ],
  },
]

const supportFaqSchema = faqSchema(
  FAQS.flatMap(({ questions }) => questions.map(({ q, a }) => ({ question: q, answer: a })))
)

export default function SupportPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(supportFaqSchema) }}
      />
      <section className="bg-black pt-32 sm:pt-48 pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Support</span>
          <h1 className="font-black text-white leading-none mb-6" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', letterSpacing: 0 }}>
            How can we<br /><span className="text-brand-red">help?</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-xl leading-relaxed">
            Find answers below. If you don&apos;t see what you need, email us directly and we&apos;ll get back to you fast.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-black pb-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-20">

            {/* Sticky category nav */}
            <div className="hidden lg:block pt-16">
              <div className="sticky top-32 space-y-1">
                {FAQS.map(({ category }) => (
                  <a key={category} href={`#${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block text-gray-600 hover:text-white text-sm transition-colors py-1.5">
                    {category}
                  </a>
                ))}
                <div className="pt-6 border-t border-white/[0.08] mt-6">
                  <p className="text-gray-600 text-xs mb-3">Still need help?</p>
                  <a href="mailto:founder@vibeshackstudios.com" className="text-brand-red text-sm font-semibold hover:text-white transition-colors">
                    Email us →
                  </a>
                </div>
              </div>
            </div>

            {/* FAQ content */}
            <div className="pt-16 space-y-16">
              {FAQS.map(({ category, questions }) => (
                <div key={category} id={category.toLowerCase().replace(/\s+/g, '-')}>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-600 mb-8">{category}</p>
                  <div className="space-y-0">
                    {questions.map(({ q, a }) => (
                      <div key={q} className="py-6 border-b border-white/[0.08]">
                        <p className="text-white font-bold text-base mb-3">{q}</p>
                        <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                label: 'Email',
                value: 'founder@vibeshackstudios.com',
                sub: 'We respond same day.',
                href: 'mailto:founder@vibeshackstudios.com',
              },
              {
                label: 'Studio Address',
                value: '950 Battery St',
                sub: 'San Francisco, CA 94111',
                href: 'https://maps.google.com/?q=950+Battery+St+San+Francisco+CA+94111',
              },
              {
                label: 'Hours',
                value: 'Open 24/7',
                sub: 'Every day. No exceptions.',
                href: '/book/',
              },
            ].map(({ label, value, sub, href }) => (
              <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="border-t border-white/[0.08] pt-8 group">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-600 mb-3">{label}</p>
                <p className="text-white font-bold text-lg group-hover:text-brand-red transition-colors" style={{letterSpacing: 0}}>{value}</p>
                <p className="text-gray-500 text-sm mt-1">{sub}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

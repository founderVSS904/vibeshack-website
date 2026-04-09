interface BookingCTAProps {
  heading?: string
  subheading?: string
  primaryText?: string
  secondaryText?: string
  className?: string
}

export default function BookingCTA({
  heading = "Ready to Create?",
  subheading = "Book your studio session. Available 24/7 with flexible hourly rates.",
  primaryText = "Book Your Session",
  secondaryText = "Schedule a Free Tour",
  className = "",
}: BookingCTAProps) {
  return (
    <section className={`py-32 bg-zinc-950 border-t border-white/10 ${className}`}>
      <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
        <h2 className="font-black text-white leading-tight mb-6" style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em'}}>
          {heading}
        </h2>
        <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto">
          {subheading}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://calendly.com/founder-vibeshackstudios/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors"
          >
            {primaryText}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href="/contact"
            className="text-gray-500 hover:text-white transition-colors text-sm self-center"
          >
            {secondaryText} →
          </a>
        </div>
      </div>
    </section>
  )
}

const mapEmbedUrl =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d800!2d-122.4003!3d37.8009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808580f3b43fcd85%3A0x37a86c6c0f0a3f5a!2s950%20Battery%20St%2C%20San%20Francisco%2C%20CA%2094111!5e0!3m2!1sen!2sus!4v1'

const directionsUrl =
  'https://maps.google.com/?q=950+Battery+St+San+Francisco+CA+94111'

type StudioLocationProps = {
  heightClassName?: string
}

export function StudioLocation({
  heightClassName = 'h-[360px] sm:h-[440px]',
}: StudioLocationProps) {
  return (
    <div className="border-y border-white/10 bg-black">
      <div className={`w-full overflow-hidden bg-zinc-950 ${heightClassName}`}>
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          className="block"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="VibeShack Studios at 950 Battery Street"
        />
      </div>
      <div className="mx-auto grid max-w-7xl gap-5 px-6 py-6 sm:px-10 md:grid-cols-[1fr_auto] md:items-center lg:px-16">
        <address className="not-italic">
          <p className="text-sm font-bold text-white">VibeShack Studios</p>
          <p className="mt-1 text-sm text-zinc-400">
            950 Battery St, San Francisco, CA 94111
          </p>
          <p className="mt-1 text-xs text-zinc-600">Northern Waterfront · Open 24/7</p>
        </address>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:text-brand-red"
        >
          Get directions
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          >
            →
          </span>
        </a>
      </div>
    </div>
  )
}

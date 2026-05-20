import Image from 'next/image'

const photographyFrames = [
  {
    src: '/studio-images/instagram-vibeshackhq-model-photo.jpg',
    alt: 'Creative fashion portrait photographed at VibeShack Studios San Francisco',
    position: 'center 36%',
    widthClass: 'w-[68vw] sm:w-[320px] lg:w-[360px]',
  },
  {
    src: '/studio-images/enhanced-photography-headshot-black-blazer-v20260510.jpg',
    alt: 'Professional headshot photography created at VibeShack Studios San Francisco',
    position: 'center 28%',
    widthClass: 'w-[68vw] sm:w-[320px] lg:w-[360px]',
  },
  {
    src: '/studio-images/shot-here-red-fabric-portrait-v20260509.jpg',
    alt: 'Close editorial portrait with red fabric photographed at VibeShack Studios',
    position: 'center 44%',
    widthClass: 'w-[68vw] sm:w-[320px] lg:w-[360px]',
  },
  {
    src: '/studio-images/shot-here-joshua-blue-v20260509.jpg',
    alt: 'Blue spotlight portrait photographed at VibeShack Studios',
    position: 'center 42%',
    widthClass: 'w-[68vw] sm:w-[320px] lg:w-[360px]',
  },
  {
    src: '/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260510.jpg',
    alt: 'Editorial fashion photography on the white cyc at VibeShack Studios San Francisco',
    position: 'center 50%',
    widthClass: 'w-[82vw] sm:w-[500px] lg:w-[620px]',
  },
  {
    src: '/studio-images/homepage-creative-photography-gradient-editorial-v20260510.jpg',
    alt: 'Full-body editorial portrait with gradient lighting photographed at VibeShack Studios',
    position: 'center 48%',
    widthClass: 'w-[68vw] sm:w-[330px] lg:w-[380px]',
  },
  {
    src: '/studio-images/homepage-creative-photography-beauty-gel-v20260510.jpg',
    alt: 'Close beauty portrait with red and blue gel lighting photographed at VibeShack Studios',
    position: 'center 38%',
    widthClass: 'w-[68vw] sm:w-[320px] lg:w-[360px]',
  },
  {
    src: '/studio-images/enhanced-photography-editorial-male-portrait-v20260510.jpg',
    alt: 'Editorial male portrait photography created at VibeShack Studios',
    position: 'center 34%',
    widthClass: 'w-[68vw] sm:w-[320px] lg:w-[360px]',
  },
  {
    src: '/studio-images/homepage-creative-photography-afro-beauty-portrait-v20260510.jpg',
    alt: 'High-gloss beauty portrait photographed at VibeShack Studios San Francisco',
    position: 'center 44%',
    widthClass: 'w-[68vw] sm:w-[320px] lg:w-[360px]',
  },
  {
    src: '/studio-images/homepage-creative-photography-male-beauty-closeup-v20260510.jpg',
    alt: 'Close beauty portrait photographed at VibeShack Studios San Francisco',
    position: 'center 44%',
    widthClass: 'w-[68vw] sm:w-[320px] lg:w-[360px]',
  },
  {
    src: '/studio-images/homepage-creative-photography-female-beauty-closeup-v20260510.jpg',
    alt: 'Editorial beauty close-up photographed at VibeShack Studios San Francisco',
    position: 'center 45%',
    widthClass: 'w-[68vw] sm:w-[320px] lg:w-[360px]',
  },
  {
    src: '/studio-images/shot-here-trisha-red-v20260509.jpg',
    alt: 'Red backdrop campaign portrait photographed at VibeShack Studios',
    position: 'center 38%',
    widthClass: 'w-[68vw] sm:w-[320px] lg:w-[360px]',
  },
  {
    src: '/studio-images/photography-vibeshack-cover-v20260509.jpg',
    alt: 'Editorial cover-style portrait photographed at VibeShack Studios',
    position: 'center 40%',
    widthClass: 'w-[68vw] sm:w-[320px] lg:w-[360px]',
  },
  {
    src: '/studio-images/homepage-creative-photography-gradient-motion-v20260509.jpg',
    alt: 'Creative movement portrait with color gradients photographed at VibeShack Studios',
    position: 'center 50%',
    widthClass: 'w-[72vw] sm:w-[360px] lg:w-[420px]',
  },
  {
    src: '/studio-images/shot-here-joshua-spotlight-v20260509.jpg',
    alt: 'Spotlight portrait photographed at VibeShack Studios',
    position: 'center 40%',
    widthClass: 'w-[68vw] sm:w-[320px] lg:w-[360px]',
  },
]

export function InsideStudiosCarousel() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-black py-16">
      <div className="mx-auto mb-8 flex max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
        <span className="number-label">Creative Photography</span>
        <span className="hidden text-xs tracking-[0.18em] text-gray-700 sm:block">Moving gallery</span>
      </div>

      <div className="pointer-events-none absolute bottom-16 left-0 top-28 z-10 w-12 bg-gradient-to-r from-black to-transparent sm:w-24" />
      <div className="pointer-events-none absolute bottom-16 right-0 top-28 z-10 w-12 bg-gradient-to-l from-black to-transparent sm:w-24" />

      <div
        className="creative-photo-marquee"
        role="region"
        aria-label="Swipe through creative photography made at VibeShack Studios"
      >
        <div className="creative-photo-marquee-track">
          {photographyFrames.map(({ src, alt, position, widthClass }) => (
            <figure
              key={src}
              className={`creative-photo-card relative h-[390px] flex-none overflow-hidden rounded-lg border border-white/10 bg-zinc-950 sm:h-[430px] lg:h-[470px] ${widthClass}`}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 640px) 82vw, (max-width: 1024px) 500px, 620px"
                className="object-cover"
                style={{ objectPosition: position }}
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

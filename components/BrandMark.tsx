import Image from 'next/image'

const brandMarks = {
  wordmark: {
    src: '/brand/vibeshack/wordmark-red-transparent.png',
    alt: 'VibeShack',
    width: 1836,
    height: 194,
    sizes: '(min-width: 768px) 380px, 300px',
  },
  monogram: {
    src: '/brand/vibeshack/monogram-red-transparent.png',
    alt: 'VS',
    width: 1229,
    height: 562,
    sizes: '160px',
  },
  lockup: {
    src: '/brand/vibeshack/lockup-red-white-transparent-tight.png',
    alt: 'VibeShack Studios',
    width: 504,
    height: 144,
    sizes: '(min-width: 768px) 520px, 360px',
  },
} as const

type BrandMarkProps = {
  variant?: keyof typeof brandMarks
  className?: string
  priority?: boolean
}

export function BrandMark({
  variant = 'wordmark',
  className,
  priority = false,
}: BrandMarkProps) {
  const mark = brandMarks[variant]

  return (
    <Image
      src={mark.src}
      alt={mark.alt}
      width={mark.width}
      height={mark.height}
      sizes={mark.sizes}
      priority={priority}
      fetchPriority={priority ? 'high' : undefined}
      className={className}
    />
  )
}

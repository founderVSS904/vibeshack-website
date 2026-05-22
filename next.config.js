const isVercelRuntime = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV)

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com",
  "connect-src 'self' https://api.stripe.com https://r.stripe.com https://m.stripe.network https://checkout.stripe.com https://*.stripe.com https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://www.google.com",
  "form-action 'self'",
  isVercelRuntime ? 'upgrade-insecure-requests' : '',
].filter(Boolean).join('; ')

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
  ...(isVercelRuntime ? [{
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  }] : []),
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '0',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'X-Permitted-Cross-Domain-Policies',
    value: 'none',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  poweredByHeader: false,
  
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  // Redirects
  async redirects() {
    return [
      {
        source: '/sunset-room',
        destination: '/sunset-studio/',
        permanent: true,
      },
      {
        source: '/sunset-room/',
        destination: '/sunset-studio/',
        permanent: true,
      },
      {
        source: '/cozy-podcast',
        destination: '/the-wing/',
        permanent: true,
      },
      {
        source: '/cozy-podcast/',
        destination: '/the-wing/',
        permanent: true,
      },
      {
        source: '/modern-podcast',
        destination: '/encore/',
        permanent: true,
      },
      {
        source: '/modern-podcast/',
        destination: '/encore/',
        permanent: true,
      },
      {
        source: '/white-backdrop-studio',
        destination: '/canvas-rental/',
        permanent: true,
      },
      {
        source: '/white-backdrop-studio/',
        destination: '/canvas-rental/',
        permanent: true,
      },
      {
        source: '/phone',
        destination: '/contact/',
        permanent: false,
      },
      {
        source: '/phone/',
        destination: '/contact/',
        permanent: false,
      },
    ]
  },
  // Enable compression
  compress: true,
  // Generate ETags for caching
  generateEtags: true,
  // Headers for optimal caching and security
  headers: async () => {
    return [
      // Security headers for all routes
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // HTML pages: allow browser bfcache while still revalidating with the edge.
      {
        source: '/:path((?!_next|public).*\\.?)*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      // API responses may reflect live calendar, payment, and webhook state.
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      // Static assets in /public: long cache. Public files are served from
      // their URL path, not from /public.
      {
        source: '/og-image.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon-vs-redcircle-20260520-:size.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon-vs-redcircle-20260520.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon-vs-monogram-20260520-:size.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon-vs-monogram-20260520.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/apple-touch-icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/studio-images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/brand/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

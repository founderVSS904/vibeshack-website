/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  
  images: {
    // Enable image optimization - removed unoptimized: true
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for a long time
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.api.sanity.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.vibeshackstudios.com',
        pathname: '/**',
      },
    ],
  },
  // Redirects
  async redirects() {
    return [
      {
        source: '/sunset-room',
        destination: '/sunset-studio',
        permanent: true,
      },
      {
        source: '/sunset-room/',
        destination: '/sunset-studio/',
        permanent: true,
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
        headers: [
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
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // HTML pages: no caching (always fresh)
      {
        source: '/:path((?!_next|public).*\\.?)*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
        ],
      },
      // Static assets in /public: long cache
      {
        source: '/public/:path*',
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

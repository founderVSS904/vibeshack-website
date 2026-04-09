export async function GET() {
  const robotsTxt = `# VibeShack Studios robots.txt
# Last updated: ${new Date().toISOString()}
# Allow all search engines to crawl and index

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /.next/
Disallow: /node_modules/
Disallow: /private/
Disallow: /book/confirmation

# Specific rules for Googlebot
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Specific rules for Bingbot
User-agent: Bingbot
Allow: /
Crawl-delay: 0

# Block bad bots
User-agent: AhrefsBot
User-agent: SemrushBot
User-agent: DotBot
User-agent: MJ12bot
User-agent: MJ12bot
Disallow: /

# Sitemap location
Sitemap: https://www.vibeshackstudios.com/sitemap.xml
Sitemap: https://www.vibeshackstudios.com/rss.xml
`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}

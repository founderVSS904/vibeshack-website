const baseUrl = (process.env.SEO_AUDIT_BASE_URL || 'https://www.vibeshackstudios.com').replace(/\/$/, '')
const productionUrl = 'https://www.vibeshackstudios.com'

if (!process.env.SEO_AUDIT_BASE_URL) {
  console.warn('SEO_AUDIT_BASE_URL is not set, so this run audits PRODUCTION. Set SEO_AUDIT_BASE_URL=http://localhost:3011 to audit a local build.')
}
const requiredPaths = [
  '/',
  '/podcast-studio-san-francisco/',
  '/green-screen-studio-sf/',
  '/photography-studio-san-francisco/',
  '/video-production/',
  '/services/',
  '/canvas-rental/',
  '/rental-studios/',
  '/studio-guides/',
  '/use-cases/',
  '/compare/',
  '/press/',
  '/book/',
]

const requiredSitemapSubstrings = [
  '/studio-guides/podcast-studio-prep/',
  '/use-cases/brand-content-day/',
  '/use-cases/green-screen-video-production/',
  '/compare/green-screen-vs-white-cyc/',
  '/video-production/',
  '/services/',
  '/press/',
]

const failures = []
const warnings = []

function fail(message) {
  failures.push(message)
}

function warn(message) {
  warnings.push(message)
}

function absolute(path) {
  return path.startsWith('http') ? path : `${baseUrl}${path}`
}

function productionAbsolute(path) {
  return path.startsWith('http') ? path : `${productionUrl}${path}`
}

function toAuditUrl(url) {
  const parsed = new URL(url)
  const auditOrigin = new URL(baseUrl).origin
  if (parsed.origin === productionUrl && auditOrigin !== productionUrl) {
    return `${auditOrigin}${parsed.pathname}${parsed.search}`
  }
  return url
}

async function fetchText(url, options = {}) {
  const res = await fetch(url, options)
  const text = await res.text().catch(() => '')
  return { res, text }
}

function textBetween(html, regex) {
  return html.match(regex)?.[1]?.trim() || ''
}

function extractTagAttribute(tag, attribute) {
  return tag.match(new RegExp(`${attribute}=["']([^"']+)["']`, 'i'))?.[1]?.trim() || ''
}

function extractMetaContent(html, name) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0]
    if (extractTagAttribute(tag, 'name').toLowerCase() === name.toLowerCase()) {
      return extractTagAttribute(tag, 'content')
    }
  }
  return ''
}

function extractCanonical(html) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0]
    if (extractTagAttribute(tag, 'rel').toLowerCase() === 'canonical') {
      return extractTagAttribute(tag, 'href')
    }
  }
  return ''
}

function extractJsonLd(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
}

function extractInternalLinks(html) {
  const links = new Set()
  for (const match of html.matchAll(/href=["']([^"'#]+)(?:#[^"']*)?["']/gi)) {
    const href = match[1]
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue
    let url
    try {
      url = new URL(href, baseUrl)
    } catch {
      continue
    }
    if (
      url.origin === new URL(baseUrl).origin
      && !url.pathname.startsWith('/api/')
      && !url.pathname.startsWith('/_next/')
    ) {
      links.add(`${url.origin}${url.pathname}${url.search}`)
    }
  }
  return links
}

const { res: robotsRes, text: robots } = await fetchText(`${baseUrl}/robots.txt`)
if (!robotsRes.ok) fail(`robots.txt returned ${robotsRes.status}`)
if (!robots.includes('Sitemap:')) fail('robots.txt is missing sitemap directives')
if (!robots.includes('/image-sitemap.xml')) fail('robots.txt is missing image sitemap')
if (/Disallow:\s*\/_next/i.test(robots)) fail('robots.txt blocks Next.js assets')

const { res: sitemapRes, text: sitemap } = await fetchText(`${baseUrl}/sitemap.xml`)
if (!sitemapRes.ok) fail(`sitemap.xml returned ${sitemapRes.status}`)
for (const path of requiredSitemapSubstrings) {
  if (!sitemap.includes(path)) fail(`sitemap.xml is missing ${path}`)
}

const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
if (urls.length < 30) fail(`sitemap.xml only has ${urls.length} URLs`)

const { res: imageSitemapRes, text: imageSitemap } = await fetchText(`${baseUrl}/image-sitemap.xml`)
if (!imageSitemapRes.ok) fail(`image-sitemap.xml returned ${imageSitemapRes.status}`)
const imageCount = (imageSitemap.match(/<image:image>/g) || []).length
if (imageCount < 20) fail(`image-sitemap.xml only has ${imageCount} images`)

const pagesToCheck = Array.from(new Set([...urls.map(toAuditUrl), ...requiredPaths.map(absolute)]))
const internalLinks = new Set()

for (const url of pagesToCheck) {
  const { res, text: html } = await fetchText(url)
  if (!res.ok) {
    fail(`${url} returned ${res.status}`)
    continue
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) continue

  const title = textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
  const description = extractMetaContent(html, 'description')
  const canonical = extractCanonical(html)

  if (!title) fail(`${url} missing <title>`)
  if (title && title.length > 70) warn(`${url} title is long (${title.length} chars): ${title}`)
  if (!description) fail(`${url} missing meta description`)
  if (description && description.length > 170) warn(`${url} description is long (${description.length} chars)`)
  if (!canonical) fail(`${url} missing canonical`)
  if (canonical && !canonical.startsWith(productionUrl)) fail(`${url} canonical points off-domain: ${canonical}`)
  if (/calendly/i.test(html)) fail(`${url} contains Calendly`)

  const jsonLdBlocks = extractJsonLd(html)
  for (const block of jsonLdBlocks) {
    try {
      JSON.parse(block.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'"))
    } catch (error) {
      fail(`${url} has invalid JSON-LD: ${error.message}`)
    }
  }

  for (const link of extractInternalLinks(html)) internalLinks.add(link)
}

for (const path of requiredPaths) {
  const url = productionAbsolute(path)
  if (!urls.includes(url)) fail(`required page missing from sitemap: ${url}`)
}

for (const link of internalLinks) {
  if (link.includes('/book/confirmation')) continue
  const res = await fetch(link, { redirect: 'manual' })
  if (res.status >= 400) fail(`broken internal link ${res.status}: ${link}`)
}

for (const path of ['/patriot-black/', '/patriotblack/', '/partners/patriot-black/']) {
  const res = await fetch(absolute(path), { redirect: 'manual' })
  const location = res.headers.get('location') || ''
  const setCookie = res.headers.get('set-cookie') || ''
  if (![307, 308].includes(res.status)) fail(`${path} expected redirect, got ${res.status}`)
  if (!location.includes('/?ref=patriot-black')) fail(`${path} does not redirect to tracked homepage: ${location}`)
  if (!setCookie.includes('vibeshack_referral')) fail(`${path} did not set referral cookie`)
  if ((res.headers.get('x-robots-tag') || '').toLowerCase() !== 'noindex, nofollow') fail(`${path} missing noindex referral header`)
}

console.log(JSON.stringify({
  baseUrl,
  sitemapUrls: urls.length,
  internalLinks: internalLinks.size,
  imageCount,
  warnings,
  failures,
}, null, 2))

if (failures.length) process.exit(1)

# VibeShack Studios — Next.js Website

Production-ready Next.js 14 website for VibeShack Studios. Replaces the previous React SPA with full SSG (static site generation) for Google indexability.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** throughout
- **Tailwind CSS** for styling
- **Static Export** (`output: 'export'`) — all pages pre-rendered at build time
- Zero client-side-only dependencies

## Project Structure

```
vibeshack-website/
├── app/
│   ├── layout.tsx                          # Root layout, LocalBusiness JSON-LD schema, OG meta
│   ├── globals.css                         # Tailwind base + global styles
│   ├── page.tsx                            # Homepage (/)
│   ├── sitemap.ts                          # Auto-generated sitemap.xml
│   ├── robots.ts                           # robots.txt
│   ├── podcast-studio-san-francisco/
│   │   └── page.tsx                        # Podcast studio landing page
│   ├── green-screen-studio-sf/
│   │   └── page.tsx                        # Green screen landing page
│   ├── photography-studio-san-francisco/
│   │   └── page.tsx                        # Photography studio landing page
│   ├── pricing/
│   │   └── page.tsx                        # Full pricing table
│   ├── about/
│   │   └── page.tsx                        # About / brand story
│   └── contact/
│       └── page.tsx                        # Contact form + booking
├── components/
│   ├── Header.tsx                          # Sticky nav with mobile hamburger menu
│   ├── Footer.tsx                          # Footer with links + contact info
│   └── BookingCTA.tsx                      # Reusable CTA section component
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── postcss.config.js
```

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
# → http://localhost:3000
```

## Build & Deploy

### Option 1: Vercel (Recommended)

1. Push repo to GitHub
2. Import into Vercel: https://vercel.com/new
3. Vercel auto-detects Next.js — no config needed
4. Set custom domain: `www.vibeshackstudios.com`
5. Deploy

**Note:** For Vercel, remove `output: 'export'` from `next.config.js` — Vercel handles SSG natively with better ISR support.

### Option 2: Static Export (Any CDN/Host)

```bash
npm run build
# Generates ./out/ directory with static HTML files

# Upload ./out/ to:
# - Netlify (drag-and-drop or CLI)
# - AWS S3 + CloudFront
# - Cloudflare Pages
# - Any static host
```

### Option 3: Netlify

1. Connect GitHub repo at https://app.netlify.com
2. Build command: `npm run build`
3. Publish directory: `out`
4. Contact form already has `data-netlify="true"` attribute — Netlify Forms will auto-capture submissions

## Booking Calendar Configuration

The paid booking flow stays on `vibeshackstudios.com/book/`, checks Google Calendar before creating Stripe Embedded Checkout, and creates Google Calendar events only after Stripe confirms payment.

Required production env vars:

- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET`
- `GMAIL_USER` and `GMAIL_APP_PASSWORD`
- `GCAL_CALENDAR_ID` plus one Google Calendar credential source: `GCAL_TOKEN_B64`, `GCAL_TOKEN_JSON`, or `GCAL_TOKEN_PATH`
- `CRON_SECRET` for the protected `/api/cron/booking-reminders/` route

Stripe Checkout receives the customer's email as `receipt_email`, and the webhook sends both the customer confirmation/prep emails and the internal founder booking notification after payment. The Vercel cron job checks website-created Google Calendar events every hour and sends the customer 24-hour reminder once per booking.

By default, the site uses `GCAL_CALENDAR_ID` as a shared booking calendar. To support parallel room bookings, configure per-studio calendar IDs with one JSON env var:

```bash
GCAL_STUDIO_CALENDAR_IDS='{
  "the-executive": "the-executive-calendar-id",
  "the-wing": "the-wing-calendar-id",
  "encore": "encore-calendar-id",
  "sunset": "sunset-calendar-id",
  "premier": "premier-calendar-id",
  "parlor": "parlor-calendar-id",
  "horizon": "horizon-calendar-id",
  "canvas-podcast": "canvas-podcast-calendar-id",
  "green-screen": "green-screen-calendar-id",
  "photography": "photography-calendar-id",
  "canvas-rental": "canvas-rental-calendar-id"
}'
```

You can also set individual env vars like `GCAL_CALENDAR_ID_THE_EXECUTIVE` or `GCAL_CALENDAR_ID_CANVAS_RENTAL`.

If no per-studio calendar is configured, the shared calendar still behaves studio-aware for website-created events: events tagged with a studio only block that studio, while untagged/manual calendar holds block every studio. This lets the team create whole-building holds without losing parallel booking support for tagged room bookings.

Canvas Rental, Canvas Podcast, Parlor, Horizon, The Wing, and Green Screen share the same bookable stage resources. A booking for any one of those rooms automatically makes the matching time slot unavailable for the others, even when the rooms are mapped to separate Google calendars.

## SEO Configuration

Every page includes:
- Unique `<title>` tag (format: `[Page] | VibeShack Studios | San Francisco`)
- Meta description (under 155 chars)
- OpenGraph tags (`og:title`, `og:description`, `og:url`, `og:image`)
- Twitter card meta
- Canonical URL
- Auto-generated `sitemap.xml` at `/sitemap.xml`
- `robots.txt` at `/robots.txt`

Homepage additionally includes:
- **LocalBusiness JSON-LD schema** (full structured data for Google)

## Before Launch Checklist

- [ ] Add real phone number (currently `+1-415-000-0000`)
- [ ] Create `/public/og-image.jpg` (1200×630px) for social previews
- [ ] Add studio photography to `/public/` and update pages with `<Image>` components
- [ ] Verify custom booking flow at `https://www.vibeshackstudios.com/book/`
- [ ] Set canonical URLs to actual production domain (already set to `https://www.vibeshackstudios.com`)
- [ ] Submit `sitemap.xml` to Google Search Console
- [ ] Add Google Analytics or Plausible (optional — zero tracking currently)
- [ ] Test contact form (Netlify Forms or add serverless API route)

## SEO Target Keywords

| Page | Primary Keyword |
|------|----------------|
| `/` | `production studio san francisco` |
| `/podcast-studio-san-francisco` | `podcast studio san francisco` |
| `/green-screen-studio-sf` | `green screen studio san francisco` |
| `/photography-studio-san-francisco` | `photography studio san francisco` |
| `/pricing` | `studio rental san francisco pricing` |

## Partner Referral Links

- Patriot Black: `https://www.vibeshackstudios.com/patriot-black/`
- Commission: 20% of completed paid booking total
- Tracking: the link stores `patriot-black` as the referral source, passes it into Stripe metadata, and flags completed-booking internal emails/calendar events.

## Design System

| Token | Value |
|-------|-------|
| Background | `#0a0a0a` |
| Surface | `#111111` |
| Accent | `#E50000` (brand red) |
| Muted text | `#888888` |
| Border | `#222222` |
| Font | Inter (Google Fonts) |

## Contact

- Email: founder@vibeshackstudios.com
- Booking: https://www.vibeshackstudios.com/book/
- Address: 950 Battery St, 3rd Floor, San Francisco, CA 94111

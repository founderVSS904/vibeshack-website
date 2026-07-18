# VibeShack Studios Website Agent Handoff Package

Last updated: 2026-06-22, America/Los_Angeles

This handoff is for the real VibeShack Studios public website:

- Production domain: https://www.vibeshackstudios.com/
- Root redirect: https://vibeshackstudios.com/ -> https://www.vibeshackstudios.com/
- Framework: Next.js App Router
- Hosting platform: Vercel
- Current local preview: http://localhost:3011/

Important: this is not the Sovereign VibeShack OS surface. Do not touch `/Users/emmanueltay/Documents/sovereign-os` unless Emmanuel explicitly asks for Sovereign OS work.

## Executive Summary

We have been working on the real VibeShack Studios website, which is separate from Sovereign OS and separate from the embedded VibeShack OS app. The website is a Next.js project hosted on Vercel and connected to the GitHub repo `founderVSS904/vibeshack-website`.

Major work completed together so far:

1. Reconciled the correct production website repo and Vercel project.
2. Replaced and cleaned up favicon/brand identity assets earlier in the project history.
3. Applied the new VibeShack Studios logo, monogram, and bold condensed typography direction across the site.
4. Restored/adjusted room thumbnails and page hero direction after several design experiments.
5. Fixed booking checkout/payment/calendar/email fulfillment issues in a merged production branch.
6. Added shared-space conflict blocking for studios that cannot be booked simultaneously.
7. Added booking reminder safeguards and Vercel cron configuration.
8. Updated Horizon copy to remove incorrect LED wall language.
9. Created a new local homepage prototype inspired by the v0 Dynamic Frame Layout template.
10. Verified the current local prototype visually with screenshots, lint, TypeScript, and production build.

Current state:

- Branch: `codex/dynamic-frame-home-prototype`
- Working tree has uncommitted local prototype changes.
- The dev server is currently running locally on `http://localhost:3011/`.
- The current prototype has not been pushed or deployed.

## Absolute Safety Rules

Follow these without exception:

- Do not confuse this website with Sovereign OS.
- Do not edit `/Users/emmanueltay/Documents/sovereign-os` unless Emmanuel explicitly asks.
- Do not expose secrets, tokens, env var values, `.env.local`, Vercel env values, Stripe keys, Google tokens, app passwords, or webhook secrets.
- Do not commit screenshots, logs, `.env*`, runtime data, `.next`, local caches, or generated test artifacts.
- Do not push to `main` unless explicitly approved.
- Do not deploy production unless Emmanuel explicitly approves the exact deployment action.
- Use a feature branch for work.
- Run validation before claiming work is complete.
- Capture screenshots for UI changes.
- If a local dev server is running and you run `npm run build`, stop/restart dev afterwards. This repo can hit a `.next` mismatch when dev and build share the same output folder.

## Repositories And Local Paths

Primary local repo:

```txt
/Users/emmanueltay/Developer/vibeshack-website-reconcile
```

Current Git branch:

```txt
codex/dynamic-frame-home-prototype
```

Current remotes:

```txt
origin  https://github.com/founderVSS904/vibeshack-website.git
fork    https://github.com/mightaycourier-a11y/vibeshack-website.git
```

Current HEAD:

```txt
f81b8b51 Merge pull request #6 from mightaycourier-a11y/codex/reconcile-site-updates
```

Recent relevant commits:

```txt
f81b8b51 Merge pull request #6 from mightaycourier-a11y/codex/reconcile-site-updates
b98094bd fix: block shared studio booking conflicts
6800a91b fix: add booking reminder safeguards
0d9b7d0d fix: restore booking webhook fulfillment
29f05a0b feat: reconcile VibeShack site updates
```

Do not use this repo for Sovereign OS:

```txt
/Users/emmanueltay/Documents/sovereign-os
https://github.com/mightaycourier-a11y/sovereign-os.git
```

## Vercel Project Context

Production Vercel project:

```txt
Project name: vibeshack-website
Project ID: prj_x4OS0sdwAhMjngiZTtI1wWBWhTMG
Org/team ID: team_bCNlyMCShXZTLR5Xn1FiY8eg
Production domain: www.vibeshackstudios.com
Framework: Next.js
Vercel project linked locally in .vercel/project.json
```

Observed Vercel settings in `.vercel/project.json`:

```txt
projectName: vibeshack-website
nodeVersion: 24.x
framework/dev/build/install/output in Vercel project settings: null
```

Repo-level `vercel.json` defines the actual commands:

```json
{
  "buildCommand": "NODE_OPTIONS=\"--max-old-space-size=2048\" next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "crons": [
    {
      "path": "/api/cron/booking-reminders/",
      "schedule": "0 * * * *"
    }
  ],
  "outputDirectory": ".next"
}
```

Known Vercel project confusion:

- There are/were two VibeShack-looking Vercel projects visible in the Vercel dashboard.
- `vibeshack-website` is the real production project for `www.vibeshackstudios.com`.
- `vibeshack` appeared to be a legacy/non-production project using a `loveshack.vercel.app` domain.
- Do not delete or disconnect anything without a fresh audit in Vercel and explicit approval.
- Emmanuel previously asked to disable/disconnect the legacy `vibeshack` project from GitHub before deleting it. Treat that as a separate operations task requiring fresh confirmation.

## GitHub Access Context

Primary repo:

```txt
https://github.com/founderVSS904/vibeshack-website.git
```

Working fork:

```txt
https://github.com/mightaycourier-a11y/vibeshack-website.git
```

Observed browser login context:

- Emmanuel has been logged into GitHub in Chrome.
- Emmanuel has also been logged into Vercel in the browser.
- Do not assume CLI auth is available; verify with safe read-only commands first.

Suggested Git workflow:

```bash
git status --short --branch
git fetch origin
git switch -c codex/<task-name>
npm run lint
npx tsc --noEmit --pretty false
npm run build
git status --short
```

Only push after Emmanuel approves:

```bash
git push fork codex/<task-name>
```

Open a PR into `founderVSS904/vibeshack-website:main` unless Emmanuel instructs otherwise.

## Current Local Prototype State

Branch:

```txt
codex/dynamic-frame-home-prototype
```

Current uncommitted source changes:

```txt
M app/globals.css
M app/page.tsx
M next.config.js
?? components/DynamicFrameHero.tsx
```

The current local URL is:

```txt
http://localhost:3011/
```

At the time of this handoff, the dev server is running:

```txt
node listening on TCP *:3011
```

If the link is down, start it from the repo:

```bash
cd /Users/emmanueltay/Developer/vibeshack-website-reconcile
rm -rf .next
npm run dev -- -p 3011
```

Why `rm -rf .next` is used here:

- `.next` is generated output.
- The local dev server can break after running a production build while dev is also active.
- The symptom is a Next dev overlay with errors like missing `.next/server` chunks or missing React Client Manifest modules.
- Clearing `.next` and restarting dev fixes the local preview.

## Current Homepage Prototype

The homepage is being redesigned locally using a dynamic 6-tile frame layout inspired by this v0 template:

```txt
https://v0.app/templates/dynamicframelayout-v1tIli3svjV
```

Emmanuel's direction:

- Build locally before launching live.
- It should move/expand when the cursor hovers over a tile.
- It should feel premium, alive, smooth, not static.
- It should use real VibeShack imagery and the current VibeShack brand system.
- Use visual screenshots while building; do not judge by code alone.

Current implementation:

```txt
components/DynamicFrameHero.tsx
app/globals.css
app/page.tsx
```

`app/page.tsx` now imports and renders:

```tsx
<DynamicFrameHero />
```

The previous homepage WebGL hero was replaced locally:

```tsx
import { DynamicFrameHero } from '@/components/DynamicFrameHero'
```

The next section spacing was reduced:

```tsx
<section className="bg-black pb-3 pt-10 sm:py-4">
```

Current tile set in `components/DynamicFrameHero.tsx`:

```txt
Podcasts      -> /podcast-studio-san-francisco/
Commercial    -> /video-production/
Music Videos  -> /video-production/
Editorials    -> /photo-services/
Branding      -> /made-at-vibeshack/
Rentals       -> /rental-studios/
```

Current tile images:

```txt
Podcasts:
/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg

Commercial:
/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg

Music Videos:
/studio-images/canvas-rental-music-v1775095665.jpg

Editorials:
/studio-images/photo-gallery-direct-beauty-portrait-v20260520.jpg

Branding:
/studio-images/photo-gallery-red-blue-sunglasses-v20260520.jpg

Rentals:
/studio-images/canvas-rental-space-v20260509.jpg
```

Current animation approach:

- CSS grid is 3 columns x 2 rows on desktop.
- Hover/focus expands the active tile's column and row.
- On desktop, an active column expands to `1.52fr`; inactive columns compress to `0.78fr`.
- Top-row active tiles expand the top row; bottom-row active tiles expand the bottom row.
- A client-side `activeFrame` state was added to make pointer/focus state explicit.
- CSS still includes `:has(:hover, :focus-visible)` as a fallback/parallel behavior.
- All six hero images are marked `priority` because they are all first-viewport assets.

Known verification:

- Desktop default screenshot was captured at `/tmp/vibeshack-dynamic-frame-default-final.png`.
- Desktop hover screenshot was captured at `/tmp/vibeshack-dynamic-frame-hover-commercial-final.png`.
- Mobile screenshot was captured at `/tmp/vibeshack-dynamic-frame-mobile-final.png`.
- Do not commit these screenshots.

Desktop hover measurement from local Playwright:

```json
{
  "after": {
    "active": "2",
    "activeLabel": "Commercial",
    "columns": "320.094px 623.797px 320.109px",
    "rows": "400.078px 226.922px"
  }
}
```

Meaning:

- Hovering Commercial correctly sets active state to `2`.
- Commercial expands from about 421px to about 624px wide.
- Top row expands from about 314px to about 400px tall.

Mobile label width check:

```json
[
  { "text": "Podcasts", "width": 209, "parentWidth": 382 },
  { "text": "Commercial", "width": 268, "parentWidth": 382 },
  { "text": "Music Videos", "width": 284, "parentWidth": 382 },
  { "text": "Editorials", "width": 231, "parentWidth": 382 },
  { "text": "Branding", "width": 209, "parentWidth": 382 },
  { "text": "Rentals", "width": 177, "parentWidth": 382 }
]
```

## Current Prototype Validation Results

These commands passed after the dynamic frame changes:

```bash
npm run lint
npx tsc --noEmit --pretty false
npm run build
```

Production build completed successfully:

```txt
Compiled successfully
Generated static pages: 61/61
Route / first load JS: about 113 kB
```

After build, dev server needed a clean restart because `.next` was overwritten. Localhost was restored and confirmed:

```txt
http://localhost:3011/ returns 200 OK
HTML contains VibeShack Studios and dynamic-frame-grid
```

## Next.js / Package Commands

Package:

```json
{
  "name": "vibeshack-studios",
  "version": "1.0.0",
  "private": true
}
```

Scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run seo:audit
```

Useful local commands:

```bash
cd /Users/emmanueltay/Developer/vibeshack-website-reconcile
npm install
npm run dev -- -p 3011
npm run lint
npx tsc --noEmit --pretty false
npm run build
```

Important dependency versions:

```txt
Next.js: ^15.5.18
React: ^18.3.1
Stripe: ^20.4.1
googleapis: ^171.4.0
nodemailer: ^8.0.7
Tailwind CSS: ^3.4.6
TypeScript: ^5.5.3
Node engine: >=20 <25
Vercel linked project node version: 24.x
```

## Environment Variables

Do not expose raw secret values. The next agent should verify these names exist in Vercel Production/Preview/Development as appropriate.

Env var names referenced by the codebase:

```txt
CRON_SECRET
GCAL_CALENDAR_ID
GCAL_CALENDAR_ID_TOUR
GCAL_CLIENT_ID
GCAL_CLIENT_SECRET
GCAL_REDIRECT_URI
GCAL_STUDIO_CALENDAR_IDS
GCAL_STUDIO_CALENDAR_MAP
GCAL_TOKEN_B64
GCAL_TOKEN_JSON
GCAL_TOKEN_PATH
GCAL_TOUR_CALENDAR_ID
GMAIL_APP_PASSWORD
GMAIL_USER
NEXT_PUBLIC_BASE_URL
NEXT_PUBLIC_GA4_ID
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NODE_ENV
SEO_AUDIT_BASE_URL
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
VERCEL
VERCEL_ENV
VERCEL_URL
```

Operational notes:

- Stripe secrets must be configured in Vercel, not committed.
- Google Calendar OAuth/token data must be configured in Vercel, not committed.
- Gmail app password must be configured in Vercel, not committed.
- `CRON_SECRET` should protect `/api/cron/booking-reminders/`.
- `NEXT_PUBLIC_*` values are public by design; still verify them rather than guessing.
- `.env.local` exists locally but must not be printed, copied, or committed.

## Booking / Checkout / Calendar System

Relevant API routes:

```txt
app/api/availability/route.ts
app/api/book-tour/route.ts
app/api/contact/route.ts
app/api/create-checkout-session/route.ts
app/api/cron/booking-reminders/route.ts
app/api/health/route.ts
app/api/tour-availability/route.ts
app/api/webhook/route.ts
```

Relevant booking libraries:

```txt
lib/booking/calendar.ts
lib/booking/catalog.ts
lib/booking/referrals.ts
lib/booking/time.ts
```

Known user requirements for booking:

1. Client should not be allowed to book a time slot if Google Calendar or shared-space rules say it is unavailable.
2. Client should see an in-flow unavailable-slot message, not be dumped onto an error page.
3. After checkout, client should immediately receive a Stripe receipt.
4. VibeShack team/founder email should receive a notification/receipt with room, date, time, and booking details.
5. Google Calendar should be authoritative for manual/offline bookings too.
6. Website booking calendar must respect Google Calendar events already on the relevant calendars.
7. Follow-up/prep emails should be sent after booking and again about 24 hours before booking.
8. No retroactive email should be sent for the May 19 booking incident unless Emmanuel explicitly asks.

Shared-space booking rule implemented in merged work:

The following rooms/services share operational space and must block each other for the same time slot:

```txt
Canvas Rental
Canvas Podcast
Parlor
Horizon
The Wing
Green Screen
```

Example:

- If Green Screen is booked Sunday 3 PM to 5 PM, The Wing, Canvas Rental, Canvas Podcast, Horizon, and Parlor should also be unavailable for Sunday 3 PM to 5 PM.
- First confirmed booking wins.
- Availability UI should prevent the second client from completing checkout.

Merged commit that addressed this:

```txt
b98094bd fix: block shared studio booking conflicts
```

Booking reminder safeguards were merged in:

```txt
6800a91b fix: add booking reminder safeguards
```

Webhook fulfillment was restored in:

```txt
0d9b7d0d fix: restore booking webhook fulfillment
```

The Vercel cron path is:

```txt
/api/cron/booking-reminders/
```

The schedule is hourly:

```txt
0 * * * *
```

Testing guidance for booking:

- Test availability API directly.
- Test UI selecting a blocked slot.
- Test UI selecting an open slot.
- Test checkout session creation in Stripe test mode when possible.
- Do not send live emails to clients unless Emmanuel explicitly approves.
- Do not create real Stripe charges unless Emmanuel explicitly approves.
- For end-to-end live verification, use a controlled test product/date/time and get explicit approval.

## Stripe Notes

Code areas:

```txt
app/api/create-checkout-session/route.ts
app/api/webhook/route.ts
components/StripeEmbeddedCheckout.tsx
```

Expected Stripe behavior:

- Checkout session should include enough metadata to fulfill the booking.
- Stripe webhook should mark the booking fulfilled after payment.
- Stripe should send receipt email to the customer after payment.
- Internal notification email should go to the VibeShack/founder email.

Access needed:

- Stripe Dashboard access for the VibeShack account.
- Ability to inspect webhook endpoints.
- Ability to inspect test/live mode settings.
- Ability to inspect receipt email configuration.
- Ability to inspect recent checkout sessions/payment intents.

Likely production webhook endpoint:

```txt
https://www.vibeshackstudios.com/api/webhook
```

Do not reveal or paste:

```txt
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

## Google Calendar Notes

Code areas:

```txt
app/api/availability/route.ts
app/api/tour-availability/route.ts
lib/booking/calendar.ts
lib/booking/catalog.ts
```

Expected behavior:

- Calendar events should block availability.
- Room-specific calendars and shared-space mappings should be respected.
- Manual/offline calendar entries should block the website calendar.
- Calendar verification failures should prevent checkout instead of allowing a risky booking.

Access needed:

- Google account/calendar access for VibeShack calendars.
- Ability to inspect which calendars correspond to each room.
- Ability to inspect OAuth/token env vars in Vercel.

Do not reveal or paste:

```txt
GCAL_CLIENT_SECRET
GCAL_TOKEN_B64
GCAL_TOKEN_JSON
GCAL_TOKEN_PATH contents
```

## Gmail / Notification Email Notes

Code areas:

```txt
app/api/contact/route.ts
app/api/webhook/route.ts
app/api/cron/booking-reminders/route.ts
```

Expected behavior:

- VibeShack should receive booking notifications.
- Clients should receive booking-related transactional/prep/reminder emails.
- Do not send any emails to real clients without explicit approval.

Access needed:

- Gmail account or app-password setup used by `GMAIL_USER`.
- Vercel env var access for `GMAIL_USER` and `GMAIL_APP_PASSWORD`.

Do not reveal or paste:

```txt
GMAIL_APP_PASSWORD
```

## Brand / Design Context

Emmanuel provided updated brand direction:

- New VibeShack Studios logo.
- VS monogram.
- Typography system:
  - Primary condensed: Druk Condensed feel
  - Secondary clean: Inter
  - Accent mono: IBM Plex Mono
- Bold typography should have the same energy as VibeShack social posts:
  - Very condensed
  - Black/white/red palette
  - Strong editorial production feel
  - Big statements, sharp contrast

Current CSS variables:

```css
--font-brand-display: 'Druk Condensed', 'Druk Text Wide', 'HelveticaNeue-CondensedBlack', 'Arial Narrow', 'Roboto Condensed', Impact, sans-serif;
--font-brand-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-brand-mono: 'IBM Plex Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
--vibeshack-red: #EC0000;
```

Design direction learned from user feedback:

- Favicons should be clean, no ugly white square border.
- Black background or a clean circular shape is preferred.
- Full-width dropdown menus are preferred.
- Dropdown should not fight header/hero divider lines.
- The website should feel premium, smooth, and alive.
- Images should not be awkwardly cropped.
- Room thumbnails were reverted back to the grid style shown by Emmanuel, not the large new poster-card thumbnail concept.
- Page heroes were reverted back to the previous cinematic room hero style.
- Avoid overcommitting design experiments to production until Emmanuel reviews locally.

## Prior Content Changes To Preserve

Horizon page:

- Remove incorrect LED wall language.
- Horizon should not be described as an LED wall.
- Desired language: a customized, curated environment that feels like a warm summer evening; warm sunset conversation-set vibes.

Photo/video service pricing:

- For Photo Services and Video Production, remove the fixed price.
- Use "Contact us" instead.

Press/media kit founders section:

Use this leadership/founders text:

```txt
Emmanuel Tay
(CEO, Brand and systems architect)

Prabhnoor Gill
(President, Chief operations officer)

Akar Sharma
(VP, Chief Financial officer)
```

Note capitalization may need brand/editorial polishing, but preserve the substance.

Gallery:

- A previous section labeled "Visual Range" was removed and replaced with a gallery.
- Additional gallery/branding photos were added in merged work.
- Two Dream Factory hoodie/rooftop images were later removed from gallery use per Emmanuel's request.

## Important Files

Homepage and dynamic frame prototype:

```txt
app/page.tsx
components/DynamicFrameHero.tsx
app/globals.css
next.config.js
```

Global layout/brand/nav:

```txt
app/layout.tsx
components/Header.tsx
components/Footer.tsx
components/BrandMark.tsx
components/MotionEngine.tsx
components/RevealObserver.tsx
```

Booking:

```txt
app/book/page.tsx
components/StripeEmbeddedCheckout.tsx
app/api/create-checkout-session/route.ts
app/api/webhook/route.ts
app/api/availability/route.ts
app/api/cron/booking-reminders/route.ts
lib/booking/calendar.ts
lib/booking/catalog.ts
lib/booking/referrals.ts
lib/booking/time.ts
```

SEO/content:

```txt
lib/seo/site.ts
lib/seo/comparisons.ts
lib/seo/studioGuides.ts
lib/schemas.ts
public/llms.txt
app/sitemap.xml/route.ts
app/image-sitemap.xml/route.ts
```

Major pages:

```txt
app/about/page.tsx
app/book/page.tsx
app/canvas-podcast/page.tsx
app/canvas-rental/page.tsx
app/contact/page.tsx
app/encore/page.tsx
app/find-your-studio/page.tsx
app/green-screen-studio-sf/page.tsx
app/horizon/page.tsx
app/made-at-vibeshack/page.tsx
app/parlor/page.tsx
app/photo-services/page.tsx
app/photography-studio-san-francisco/page.tsx
app/podcast-studio-san-francisco/page.tsx
app/premier/page.tsx
app/press/page.tsx
app/pricing/page.tsx
app/rental-studios/page.tsx
app/services/page.tsx
app/studio-guides/page.tsx
app/sunset-studio/page.tsx
app/support/page.tsx
app/the-executive/page.tsx
app/the-wing/page.tsx
app/tour/page.tsx
app/use-cases/page.tsx
app/video-production/page.tsx
```

## Current `next.config.js` Notes

Recent local prototype changes:

- Added development-only `'unsafe-eval'` to CSP so Next dev hydration works locally.
- Added development-only local websocket/http sources for Next dev.
- Added `images.qualities` list so Next image quality warnings are quiet and future-compatible.

Important: production CSP remains stricter because `isDevelopment` is based on `NODE_ENV !== 'production'`.

Current image quality allowlist:

```js
qualities: [55, 58, 72, 75, 80, 85, 90, 100]
```

## Localhost / Browser Verification Guidance

Preferred local preview URL:

```txt
http://localhost:3011/
```

Start dev:

```bash
cd /Users/emmanueltay/Developer/vibeshack-website-reconcile
rm -rf .next
npm run dev -- -p 3011
```

Confirm server:

```bash
lsof -nP -iTCP:3011 -sTCP:LISTEN
curl -I http://localhost:3011/
curl -s http://localhost:3011/ | rg -o "VibeShack Studios|dynamic-frame-grid" -m 4
```

Expected:

```txt
HTTP/1.1 200 OK
dynamic-frame-grid exists in HTML
```

Visual QA checklist:

- Desktop home page shows 6-panel grid.
- Header logo renders correctly.
- Labels are crisp, not fuzzy/glowy.
- Hovering a tile expands it smoothly.
- Commercial hover reveals eyebrow and "Explore" label.
- Mobile stack is readable.
- Long labels like "Music Videos" do not overflow tile bounds.
- No ugly white favicon border.
- Menus/dropdowns still work.
- Existing studio thumbnail grid still appears below hero.

## Recommended Next Steps For Another Agent

1. Read this file fully.
2. Confirm repo and branch:

```bash
cd /Users/emmanueltay/Developer/vibeshack-website-reconcile
git status --short --branch
git remote -v
```

3. Start local server:

```bash
rm -rf .next
npm run dev -- -p 3011
```

4. Open:

```txt
http://localhost:3011/
```

5. Take fresh screenshots:

- Desktop 1280x720
- Hover state
- Mobile around 390x844

6. Ask Emmanuel for design feedback before pushing.
7. If approved, run:

```bash
npm run lint
npx tsc --noEmit --pretty false
npm run build
git status --short
```

8. Clear/restart local dev after build if needed:

```bash
rm -rf .next
npm run dev -- -p 3011
```

9. Commit only source/config changes.
10. Push to feature branch/fork and open a PR.
11. Do not deploy production until Emmanuel explicitly says to deploy.

## Production Deploy Checklist

Before production deploy:

- Confirm target is `vibeshack-website`, not legacy `vibeshack`.
- Confirm Vercel project domain is `www.vibeshackstudios.com`.
- Confirm branch to deploy.
- Confirm whether pushing/merging to `main` auto-deploys.
- Ensure no `.env*`, screenshots, logs, or runtime data are staged.
- Run:

```bash
npm run lint
npx tsc --noEmit --pretty false
npm run build
```

- Check Vercel preview deployment if using PR flow.
- Confirm booking API still works.
- Confirm Stripe webhook is still configured.
- Confirm Google Calendar availability still works.
- Confirm booking calendar blocks shared-space conflicts.
- Confirm client-facing unavailable-slot UX does not show a raw 409 page.
- Confirm no accidental live emails/charges were sent during testing.

After deploy:

- Visit https://www.vibeshackstudios.com/
- Hard refresh.
- Check favicon.
- Check homepage hero.
- Check dropdowns.
- Check booking flow up to checkout boundary.
- Check API health route if available.
- Check Vercel function logs for errors.

## Known Risks / Open Questions

1. Homepage prototype is local only and needs Emmanuel's visual approval before production.
2. The dynamic frame design may still need art direction refinements:
   - Which six categories should appear?
   - Should "Commercial" and "Music Videos" share `/video-production/` or route to more specific future pages?
   - Should "Branding" go to `/made-at-vibeshack/` or a dedicated branding page?
3. The embedded in-app browser screenshot can appear blurrier than actual Playwright/headless screenshots. Always inspect actual rendered screenshots too.
4. The legacy Vercel project cleanup is not automatically safe. Re-audit before deleting/disconnecting.
5. Booking/calendar/payment systems are business-critical. Do not refactor casually.
6. Live testing checkout may send real emails or create Stripe records. Get approval.
7. The Vercel project has env vars required for Google Calendar, Gmail, Stripe, and cron. Missing/mis-scoped env vars can break booking.

## Do Not Touch Unless Asked

```txt
/Users/emmanueltay/Documents/sovereign-os
vibeshack.html
vibeshack-nav.js
server/vibeshack-routes.js
assets/vibeshack-app-icon.png
```

Those files belong to Sovereign OS / VibeShack OS, not the public VibeShack Studios website.

## Quick Handoff Prompt For The Next Agent

Use this if handing off in chat:

```txt
You are working on the real VibeShack Studios public website, not Sovereign OS.

Repo:
/Users/emmanueltay/Developer/vibeshack-website-reconcile

Production:
https://www.vibeshackstudios.com/

GitHub:
origin = https://github.com/founderVSS904/vibeshack-website.git
fork = https://github.com/mightaycourier-a11y/vibeshack-website.git

Vercel:
Project = vibeshack-website
Project ID = prj_x4OS0sdwAhMjngiZTtI1wWBWhTMG
Team/org ID = team_bCNlyMCShXZTLR5Xn1FiY8eg

Current branch:
codex/dynamic-frame-home-prototype

Current local task:
Homepage dynamic-frame prototype inspired by v0 Dynamic Frame Layout. It is local only, uncommitted, and running on http://localhost:3011/ when the dev server is active.

Changed files:
app/page.tsx
app/globals.css
next.config.js
components/DynamicFrameHero.tsx

Do not expose secrets. Do not deploy production or push main without explicit approval. Do not touch /Users/emmanueltay/Documents/sovereign-os.

Validation already passed once:
npm run lint
npx tsc --noEmit --pretty false
npm run build

Before continuing, read AGENT_HANDOFF_PACKAGE.md and visually inspect localhost with screenshots.
```


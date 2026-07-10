# Fable 5 Local Build Handoff

Date: 2026-07-07

## Goal

Audit the current local VibeShack Studios website build exactly as Codex has been editing it. This is not the live production site and not a clean Git checkout; it is the current dirty local working tree.

## Exact Local Repo

```bash
cd /Users/emmanueltay/Developer/vibeshack-website-reconcile
```

Current branch:

```bash
codex/dynamic-frame-home-prototype
```

Important: this working tree has many uncommitted and untracked files. To audit the same build, use this exact folder, not a fresh clone.

## Runtime

Node requirement from `package.json`:

```bash
node >=20 <25
```

Scripts:

```bash
npm run dev
npm run lint
npm run build
npm run seo:audit
```

## Local Server

Preferred local URL:

```text
http://localhost:3011/
```

If port `3011` is already listening, use the existing server. If not, start it:

```bash
npm run dev -- -p 3011
```

If `3011` is taken by something stale, use another port:

```bash
npm run dev -- -p 3012
```

## Current Homepage Direction

The homepage was intentionally simplified to match the six-tile grid reference:

- Podcasts
- Video Production
- Our Work
- Photography
- Branding
- Rentals

Primary homepage:

```text
http://localhost:3011/
```

The old long homepage content was moved here for now:

```text
http://localhost:3011/duplicate/
```

## High-Priority Pages To Audit

```text
/
/duplicate/
/our-work/
/our-work/drive-mode/
/our-work/pure-magic/
/video-production/
/photo-services/
/branding/
/rental-studios/
/podcast-studio-san-francisco/
/book/
/tour/
/pricing/
```

## Key Files Changed In This Local Build

Homepage and routing:

```text
app/page.tsx
app/duplicate/page.tsx
components/DynamicFrameHero.tsx
components/Header.tsx
app/globals.css
```

Our Work and project pages:

```text
app/our-work/page.tsx
app/our-work/[slug]/page.tsx
components/ProjectVideoPlayer.tsx
lib/seo/workProjects.ts
public/studio-videos/work-drive-mode-loop-v20260626.mp4
```

Service pages:

```text
app/video-production/page.tsx
app/photo-services/page.tsx
app/branding/page.tsx
app/commercials/page.tsx
app/editorials/page.tsx
components/RevenueCategoryPage.tsx
```

Premier removal surfaces:

```text
lib/booking/catalog.ts
lib/seo/site.ts
app/sitemap.ts
app/image-sitemap.xml/route.ts
app/premier/page.tsx deleted
public/studio-images/premier-* deleted
```

## Known Context

- We no longer offer Premier. Frontend/backend should not support Premier.
- The new homepage should not show the old long sales sections or footer below the six-tile grid.
- The previous homepage is intentionally parked at `/duplicate/`.
- The podcast studio cards had colored pill badges removed; series names should remain plain.
- Drive Mode is currently the only project page using a video/full-view player.
- Pure Magic uses generated/concept branding imagery for now.
- Some images and generated concepts are placeholders by design.

## Audit Rules

- Do not deploy.
- Do not commit.
- Do not push.
- Do not trigger real Stripe charges.
- Do not create paid bookings.
- Do not submit valid live contact/tour forms unless there is a safe test mode.
- Report confirmed issues separately from recommendations.
- Include exact URLs, files, commands, and evidence.

## Suggested Verification Commands

```bash
npm run lint
npm run build
npm run seo:audit
```

For quick route checks:

```bash
node -e "Promise.all(['http://localhost:3011/','http://localhost:3011/duplicate/','http://localhost:3011/our-work/','http://localhost:3011/video-production/'].map(async u => [u, (await fetch(u)).status])).then(console.log)"
```

## What Codex Last Verified

- `npm run lint` passed after the homepage split.
- `/` returned `200`.
- `/duplicate/` returned `200`.
- Browser check confirmed `/` had six tiles, hidden footer, no extra scroll at wide desktop.
- Browser check confirmed `/duplicate/` still contained the old long homepage sections.

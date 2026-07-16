# VibeShack Studios Website — Project Rules (AI Agents)

You are working on the real VibeShack Studios public website. Read this fully
before making changes. A matching `CLAUDE.md` holds the same facts; keep the two
in sync if project facts change.

## What this is

Next.js 15 App Router site, hosted on Vercel, production domain
https://www.vibeshackstudios.com. A San Francisco studio-booking business
(podcast, video, photo, and rental studios).

- Repo: `/Users/emmanueltay/Developer/vibeshack-website-reconcile`
- Working branch: `codex/dynamic-frame-home-prototype`
- Production repo on GitHub: `founderVSS904/vibeshack-website`
- This is NOT Sovereign OS. Never touch `/Users/emmanueltay/Documents/sovereign-os`.

## Hard safety rules

- Do NOT deploy.
- Do NOT push to `main`, and do not push anything without explicit approval from
  the owner (Tay / Emmanuel).
- Do NOT trigger real Stripe charges, create real paid bookings, or submit live
  contact/tour forms.
- Do NOT commit secrets, `.env*`, `.next/`, `node_modules/`, logs, or local
  caches. The `.gitignore` covers these; do not weaken it.
- Premier is removed from the business. Do not reintroduce Premier anywhere in
  frontend or backend (booking catalog, pages, images, sitemaps, schemas).

## Running it

- Dev server: `npm run dev -- -p 3011`. Keep a server alive on port 3011; the
  owner browses there. Do not leave 3011 down.
- `npm run build` shares the `.next` folder with the dev server, so building
  kills a running dev server (routes return 500). After a build, restart
  `npm run dev -- -p 3011`, or serve the build with `npx next start -p 3011`.
- Node requirement: `>=20 <25`.

## Verify before claiming done

- `npm run lint` and `npx tsc --noEmit` clean.
- `npm run build` passes.
- Load changed pages on http://localhost:3011 and confirm behavior. Do not claim
  something works without checking it.
- SEO check: `scripts/seo-audit.mjs` defaults to PRODUCTION. For local, run
  `SEO_AUDIT_BASE_URL=http://localhost:3011 npm run seo:audit`.

## Where things live

- Homepage: `app/page.tsx` -> `components/DynamicFrameHero.tsx` (six-tile hero
  grid; an ambient spotlight walks the tiles when idle, hover or keyboard focus
  plays a tile's muted clip, and three tiles (Podcasts, Video Production, Our
  Work) rotate multi-clip playlists; files in `public/studio-videos/home-tile-*`),
  then `components/home/` (`FeaturedOriginals` carousel, `TrustedStrip` logo
  marquee, `StudioSpaces` studio grid, `WhatWeDo`). `Header` and `Footer` come
  from `app/layout.tsx` on every page.
- Our Work: `app/our-work/page.tsx`, `app/our-work/[slug]/page.tsx`,
  `lib/seo/workProjects.ts`. Real client work with YouTube embeds, plus a
  "Shot at VibeShack" row of external links.
- Booking UI: `app/book/` (`BookPageClient.tsx`, a 4-step flow: room, date and
  time with a month-grid calendar, extras, review and payment). Booking server
  side: `lib/booking/` (`calendar.ts` is the Google Calendar integration),
  `app/api/create-checkout-session/`, `app/api/webhook/`, `app/api/availability/`,
  `app/api/book-tour/`, `app/api/tour-availability/`.
  Prices are validated server-side; never trust a client-supplied price.
- Photo services deck hero: `app/photo-services/PhotoServicesHero.tsx`
  (cursor-driven fanned card deck).
- Header nav and both mega menus: `components/Header.tsx`.
- Footer with the 3D VS monogram: `components/Footer.tsx`.
- SEO surfaces: `app/sitemap.ts`, `app/image-sitemap.xml/route.ts`, `lib/seo/`.

## Two tools share this repo

Claude and ChatGPT both edit these files. Avoid collisions: work one tool at a
time, commit your changes at each handoff, and start from the latest commit.
Git is the coordination layer. Do not leave a large uncommitted tree.

## Style

Match the existing code: TypeScript, Tailwind utility classes, the same naming
and comment density already in the files you touch. Keep copy free of em dashes.
Report progress plainly.

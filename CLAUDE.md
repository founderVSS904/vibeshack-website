# VibeShack Studios Website — Project Rules (Claude)

This file is the shared source of truth for anyone working in this repo. A
matching `AGENTS.md` holds the same facts for other AI tools. Keep the two in
sync when project facts change.

## What this is

The real VibeShack Studios public website. Next.js 15 App Router, hosted on
Vercel, production domain https://www.vibeshackstudios.com. This is a studio
booking business in San Francisco (podcast, video, photo, rental studios).

- Repo: `/Users/emmanueltay/Developer/vibeshack-website-reconcile`
- Working branch: `codex/dynamic-frame-home-prototype`
- Production repo on GitHub: `founderVSS904/vibeshack-website`
- This is NOT Sovereign OS. Never touch `/Users/emmanueltay/Documents/sovereign-os`.

## Hard safety rules

- Do NOT trigger real Stripe charges, create real paid bookings, or submit live
  contact/tour forms.
- Do NOT commit secrets, `.env*`, `.next/`, `node_modules/`, logs, or local
  caches. The `.gitignore` already covers these; keep it that way.
- Premier is gone from the business. Do not reintroduce Premier anywhere in
  frontend or backend (booking catalog, pages, images, sitemaps, schemas).
- The Photography Studio rental is gone from the business. Do not reintroduce
  it anywhere in frontend or backend (booking catalog, pages, images, sitemaps,
  schemas, llms.txt). Canvas Rental is the photo room. Photo Services, which
  sells the shoot rather than the room, stays.

## Deployment authorization

- Tay gives deployment approval by explicitly saying `deploy`, `publish`,
  `launch`, `ship`, or an equally clear instruction in the current task. That
  instruction authorizes the complete release workflow without additional
  confirmation prompts.
- After that instruction, the agent may create and push a feature branch to
  `founderVSS904/vibeshack-website`, open or update a pull request, wait for the
  required checks, merge the pull request, allow Vercel to deploy `main`, and
  verify `https://www.vibeshackstudios.com`.
- The agent must not push directly to `main`. Production changes must reach
  `main` through a pull request.
- Before merging, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and all
  required GitHub and Vercel checks must pass. Do not deploy a known failing
  build.
- Never force-push, bypass required checks, disable branch protection, expose
  secrets, or weaken repository security to complete a deployment.
- After deployment, run production smoke tests on the changed pages and key
  navigation paths. If the new release causes a critical production failure,
  the agent may immediately revert that release or roll Vercel back to the last
  healthy deployment, then verify the recovery. Report the rollback to Tay.
- Routine feature-branch pushes, pull-request creation, merging after checks,
  Vercel production deployment, live verification, and emergency rollback do
  not require another approval after Tay has explicitly authorized deployment
  in the current task.
- Real Stripe charges, paid bookings, and live contact or tour form submissions
  remain prohibited unless Tay separately gives explicit approval for that
  exact real-world action.

## Running it

- Dev server: `npm run dev -- -p 3011`. Keep a server alive on 3011 at all times;
  Tay browses there.
- `npm run build` and the dev server share the `.next` folder, so a build wipes
  the running dev server (all routes 500). After any build, either restart
  `npm run dev -- -p 3011`, or serve the production build with
  `npx next start -p 3011` for a stable preview.
- Node requirement: `>=20 <25`.

## Verify before claiming done

- `npm run lint` and `npx tsc --noEmit` must be clean.
- `npm run build` must pass.
- Load the changed pages on http://localhost:3011 and confirm behavior.
- SEO check: `scripts/seo-audit.mjs` defaults to auditing PRODUCTION. For local,
  run `SEO_AUDIT_BASE_URL=http://localhost:3011 npm run seo:audit`.

## Where things live

- Homepage: `app/page.tsx` renders `components/DynamicFrameHero.tsx` (six-tile
  grid; an ambient spotlight walks the tiles when idle, hover or keyboard focus
  plays a tile's muted clip, and three tiles (Podcasts, Video Production, Our
  Work) rotate multi-clip playlists; files in `public/studio-videos/home-tile-*`),
  then `components/home/`: `FeaturedOriginals` (auto-advancing carousel with
  video slides), `TrustedStrip` (client-logo marquee), `StudioSpaces` (grid of
  the real studios), `WhatWeDo`. `Header` and `Footer` come from
  `app/layout.tsx` on every page.
- Our Work: `app/our-work/page.tsx`, `app/our-work/[slug]/page.tsx`,
  `lib/seo/workProjects.ts`. Real client work, YouTube embeds on project pages,
  plus a "Shot at VibeShack" row of external YouTube links.
- Cinema Experience checkpoint: `docs/CINEMA_EXPERIENCE_CHECKPOINT.md`. This is
  the source of truth for the Blender-integrated Our Work redesign. Build and
  review it in this repo at `http://localhost:3011/our-work/`; the separate
  Desktop Sites prototype is historical test material, not the production app.
- Booking UI: `app/book/` (`BookPageClient.tsx`, a 4-step flow: room, date and
  time with a month-grid calendar, extras, review and payment). Booking server
  side: `lib/booking/` (`calendar.ts` is the Google Calendar integration),
  `app/api/create-checkout-session/`, `app/api/webhook/`, `app/api/availability/`,
  `app/api/book-tour/`, `app/api/tour-availability/`.
  Prices are looked up server-side; never trust client price input.
- Photo services deck hero: `app/photo-services/PhotoServicesHero.tsx`
  (cursor-driven fanned card deck).
- Header nav and both mega menus: `components/Header.tsx`.
- Footer with the 3D VS monogram: `components/Footer.tsx`.
- SEO surfaces: `app/sitemap.ts`, `app/image-sitemap.xml/route.ts`, `lib/seo/`.

## Two tools share this repo now

Claude and ChatGPT both work on these files. To avoid collisions: work one at a
time, commit at each handoff, and pull up the latest commit before starting.
Git is the coordination layer. An uncommitted tree is the danger.

## Voice (Claude only)

Plain, everyday words. Short sentences. No em dashes. Never say "just". Talk
like you're talking to a friend. Execute decisively, minimal questions. Report
to Tay only. Tay ends the session.

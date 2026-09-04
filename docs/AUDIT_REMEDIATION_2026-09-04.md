# Website audit remediation, September 4, 2026

Implementation branch: `codex/audit-remediation-20260904`.
Baseline: `origin/main` at `cb60e6e7e955e6e91f7720973588315a058a65c9`.
This is an isolated local implementation. Production and the canonical checkout
have not been changed. Publishing requires the established release procedure.

## Changes

- Referral attribution remains, but new checkout metadata, calendar invitations,
  and staff email no longer calculate or display partner compensation. Historical
  provider records are preserved.
- Tour reservations use the same conditional Calendar hold ledgers as paid
  checkout and recheck availability while holding all required resources.
- Team email metadata uses reversible bounded chunks instead of truncated JSON.
- Booking emails use private delivery records for confirmation, preparation,
  individual team recipients, staff notification, and conflict alerts. See
  [delivery recovery](BOOKING_DELIVERY_RECOVERY.md) for retry and ambiguous-outcome
  handling, including the limitations of old aggregate completion markers.
- Tour calendar dates are computed after mount from the current Pacific date,
  with a stable loading state and midnight/focus refresh.
- Support and terms now describe one session per checkout, confirmation after
  payment and reservation, and recurring requests whose future dates need team
  coordination. `/terms-professional/` permanently redirects to `/terms/`.
- Press and business schema no longer promote the conflicting $75/hour listing.
  The external marketplace listing itself was not edited.
- Verified live purchases and delivered project inquiries or newly confirmed tours
  have completion events. Spam acknowledgments and Stripe test payments do not
  count. Query strings, hashes, contact details, dates, and exact slots are
  excluded from the manual event payloads.
- Ambient media loads selectively; a shared homepage motion control persists
  across visits. Theater image delivery drops from 1,431,965 to 52,578 bytes,
  preserving the original source images. See [media notes](MEDIA_ACCESSIBILITY_2026-09-04.md).
- Portfolio/contact/policy readability and page landmarks are improved.
- CI now defines dependency audit, lint, TypeScript, tests, production build, and
  local SEO checks. Dependency updates currently have no reported npm advisories.
- The finder uses verified on-camera capacity and directs unknown capacities or
  crew-dependent setups to coordination, with the visitor's brief preserved.

## Measurement activation

The implementation does not invent a GA property or emit data from this local
preview. The public measurement ID and stream configuration must be confirmed.

1. In the intended GA4 web stream, turn off Enhanced Measurement automatic
   events, including browser-history page changes and form interactions. Manual
   page views and conversion events are implemented here. `send_page_view:false`
   alone does not disable the stream's automatic history events.
2. Set `NEXT_PUBLIC_GA4_ID` to that stream's valid `G-...` ID and set
   `NEXT_PUBLIC_GA4_MANUAL_EVENTS_ONLY=true` only after the stream is configured.
   Both values are needed at build time; no secrets belong in either value.
3. In a controlled analytics validation environment, verify outgoing requests
   contain path-only page locations and origin-only referrers, no booking query
   tokens/contact values, one pageview per navigation, and one purchase per
   transaction. GA and local storage provide complementary best-effort purchase
   deduplication. Ad blockers, disabled scripts, and visitors who never return
   to confirmation can still prevent browser-side reporting.
4. Confirm `generate_lead` is marked as a key event in the intended GA property.
   `lead_type` distinguishes `project_inquiry` from `tour`; register that custom
   dimension if it is needed in reports. Revenue is emitted only when Stripe
   reports a paid, complete live session, its amount/cart validate, the calendar
   is fulfilled, and the browser holds a valid management token.

Configuration reference: [Google manual pageview guidance](https://developers.google.com/analytics/devguides/collection/ga4/views).

## GitHub activation

The connected account has repository write access but not administrator access.
The prepared protection script was run with `--apply`; it refused before making
any changes. Branch protection therefore remains pending an administrator.

After the workflow exists on the candidate branch, an administrator can review
`node scripts/configure-branch-protection.mjs` and apply with `--apply`. The policy
requires a pull request, an up-to-date branch, `Validate website` and `Vercel`
checks, and resolved conversations. It blocks force pushes/deletion and includes
administrators. The script refuses to overwrite existing protection, so a later
stronger policy must be reviewed instead of replaced. CI is not active on GitHub
until this branch is published through the release process.

## Business facts still needed

Only The Executive (3 on camera, with desk-layout qualifications) and The Wing
(2) have verified values in source material. Confirm the simultaneous on-camera
capacity for Encore, Sunset, Parlor, Horizon, Canvas Podcast, Green Screen, and
Canvas Rental before expanding automatic recommendations. Event occupancy is
not treated as an on-camera setup capacity.

## Audit clarification

The original audit grouped internal notification failure with swallowed optional
emails. Preparation and team failures were swallowed; internal notification was
already critical, but its failure retried the whole email block and could
duplicate successful earlier messages. The new independent delivery states
address both behaviors. No exploitable production incident was established.

## Validation

- Clean `npm ci` completed on Node 22.22.2. Node minimum is now 20.9 to match
  Sharp 0.35.4. Major framework/runtime migrations were not mixed into this fix;
  the existing ESLint 8 toolchain still reports deprecation warnings.
- Final `npm run verify` passed lint, TypeScript, all 234 tests, and the production
  build. Provider-sensitive tests use isolated simulated providers, including
  concurrent tour/checkout requests and the actual webhook mail sequence.
- Full-tree `npm audit --json` reported zero advisories at validation time. This
  is a dependency advisory result, not a guarantee against all vulnerabilities.
- Local SEO audit checked 58 sitemap pages, 97 internal links, and 98 sitemap
  images, with zero warnings or failures.
- Desktop and 390/320-pixel browser checks covered homepage motion pause across
  both controls and reload persistence; current September tour dates without
  hydration errors; one main landmark on contact, privacy, terms, project detail,
  and booking pages; and no horizontal overflow on the sampled narrow layouts.
- The mobile cinema had no initial video source and no desktop plate background.
  Explicit pre-show play and pause worked. Desktop used the optimized WebP plate;
  selecting Body Is Tea played the film, hid browsing controls, and the Browse
  projects control paused playback and restored focus to Play in theater.
- A five-person podcast finder request correctly used coordination and preserved
  its on-camera count and crew preference in the contact brief. No form was sent.
- Local booking and tour availability failed closed without provider credentials.
  Booking reached date selection; no checkout or live provider action was used.
  Browser console inspection found no hydration errors on the changed pages.

The production build is running at `http://localhost:3011` from this branch.
No live checkout, charge, Calendar reservation, form submission, email send, or
authenticated cron was used for QA. No Lighthouse or field Core Web Vitals score
is claimed from asset-size changes.

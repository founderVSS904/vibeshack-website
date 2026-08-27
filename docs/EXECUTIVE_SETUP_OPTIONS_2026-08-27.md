# Executive setup options: local handoff, August 27, 2026

## Status

Implemented and validated locally. Nothing was pushed, published, or deployed.
No real checkout, charge, Calendar event, contact inquiry, or email was created.

Working branch: `codex/executive-setup-options-20260827`.
Worktree: `/Users/emmanueltay/Desktop/VibeShack/Website/Agent Worktrees/executive-setup-options-20260827`.
Started from `origin/main` at `98326d2`, then merged the completed local Wing branch
`codex/wing-setup-options-20260827` containing `2aa2b74`.

The website-building workflow extended the existing Next.js/Vercel application.
It did not create another site or migrate hosting. Browser checks used the same
local preview tab. The hosting workflow's local-only exception applies.

## Customer-visible changes

- The Executive has three photo choices with no default selection:
  - 1 black office chair with desk: `one-office-chair-desk`.
  - 2 black office chairs with desk: `two-office-chairs-desk`.
  - 3 black armchairs without desk: `three-black-armchairs`.
- The room page, booking picker, and review show the exact arrangement.
- New Executive bookings require a valid choice. Choosing a photo on the room
  page carries it into booking, and customers can change it before payment.
- The studio rate remains $300/hr. Two operators and at least three cameras
  remain included. Teleprompter remains optional at $50/hr.
- Customization copy invites customers to discuss another arrangement by email
  or an inquiry prefilled with the room and selected photo. Nothing is submitted
  automatically.
- Executive hero, feature photos, booking gallery, directory, and navigation now
  use or describe these layouts. New images are in the image sitemap.
- The finder supports three on-camera people only in the supplied three-armchair
  arrangement, without a desk. It carries that exact photo into checkout.
  Desk layouts remain one or two people, not three. This is not an occupancy
  claim. Unverified rooms and larger groups still need team confirmation.
- The Wing retains its four original options and IDs. Its page uses the shared
  selector without changing the existing booking behavior.

## Booking and compatibility

- Setup IDs are validated against the selected room on the server. Browser-sent
  prices and labels are not authoritative.
- The canonical label flows through per-session checkout metadata, signed
  confirmation details, customer/staff/team messages, Calendar descriptions,
  and reminders using the existing Wing pipeline.
- Old paid bookings without a setup remain valid. Their setup is described as
  not recorded rather than inventing a chair or desk arrangement.
- Interrupted checkout authority is preserved. A different requested room or
  layout is not silently substituted into an existing payment session.
- Older pending Executive checkouts without a valid setup require the existing
  release-and-revise flow before payment. Calendar resource groups, equipment
  locks, cancellation authority, and webhook idempotency are unchanged.

## Photo sources

Originals remain untouched in:
`/Users/emmanueltay/Desktop/VibeShack/Aug 27/Executive (update)`.

| Original | Website asset | Full dimensions | Bytes |
| --- | --- | --- | --- |
| `1 black office chair setup.PNG` | `one-office-chair-desk.webp` | 1672 x 941 | 151490 |
| `two black chair office setup.jpg` | `two-office-chairs-desk.webp` | 1673 x 879 | 245674 |
| `3 black chairs.PNG` | `three-black-armchairs.webp` | 1688 x 932 | 271696 |

Assets are in `public/studio-setups/the-executive`. They preserve the complete
source framing and use `object-contain` in the selector. The preparation script,
`scripts/prepare-executive-setup-images.mjs`, reads an explicitly supplied source
directory and refuses to overwrite existing output. Do not rerun it needlessly.

## Verification

- `npm run build`: passed, including all 146 tests and 76 generated pages.
- `npm run lint`: passed.
- `node_modules/.bin/tsc --noEmit --incremental false`: passed after the build.
- `SEO_AUDIT_BASE_URL=http://localhost:3011 npm run seo:audit`: passed, with
  58 sitemap URLs, 99 internal links, 98 images, no warnings, and no failures.
- Read-only source and content reviews found no actionable Executive defects.
- Actual browser checks covered 320, 360, 390, 400, 768, and 1440 pixel widths.
  No horizontal page overflow was found; the logo retained visible width.
  Desktop, 320-pixel, and 400-pixel photo layouts were inspected visually.
- All three options were selectable. Room-page links and the three-person finder
  carried the correct setup to booking. The final production-style preview also
  preserved the solo desk choice through its real navigation link.
- An isolated local proxy supplied synthetic availability and blocked every real
  API action. A one-hour three-armchair booking with teleprompter reached review
  at $350; the real pricing helper received the exact setup ID. No Stripe session
  was created. Edit buttons were disabled while the request was in progress.
- Changing the selected photo retained the date, time, and teleprompter choice.
  A 320-pixel review screen was checked visually.
- Fake pending checkout tests verified the changed-photo warning, safe release,
  and applying the new photo. A legacy Executive checkout without a setup showed
  the payment gate and reopened with no default photo and a disabled continuation.
- Contact navigation prefilled the exact three-armchair arrangement. The form was
  not submitted. Calendar insertion, reminders, signed confirmation privacy,
  legacy records, maximum metadata size, and cross-room rejection were tested
  with injected fixtures, not live services.

## Preview and continuation

- Main preview: `http://localhost:3011/the-executive/#choose-setup`.
- Safe walkthrough: `http://localhost:3012/the-executive/#choose-setup`.
  Port 3012 proxies the same build, supplies fake availability, and blocks writes.
  Its dates are not real studio availability, and it cannot complete payment.
- The existing Wing preview remains at `http://localhost:3011/the-wing/#choose-setup`.
- Port 3011 serves this worktree's production build. Do not start `next dev` or
  rebuild into the same `.next` while that preview is serving. Prepare a tested
  replacement before switching the owner's preview.
- Dependencies use the existing local runtime symlink. Do not remove or reinstall
  that shared runtime as part of a cleanup.
- The already-tracked `tsconfig.tsbuildinfo` is a regenerated local cache. It is
  deliberately excluded from the feature commit, along with all build outputs,
  temporary QA fixtures, environment values, and dependencies.
- Any production release still requires Tay's explicit deployment instruction.
  Follow the repository's PR/checks workflow and recheck current `origin/main`
  before publishing. No real payment or form submission is authorized by this
  local implementation request.

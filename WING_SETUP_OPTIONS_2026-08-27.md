# Wing setup options: local handoff

Date: August 27, 2026

## Status

Implemented and verified locally. Not pushed, published, or deployed. No real
payments, reservations, Calendar writes, or emails were made during verification.

Worktree: `Website/Agent Worktrees/wing-setup-options-20260827`

Branch: `codex/wing-setup-options-20260827`

Based on `origin/main` at `98326d242f44cda4b5f5de5b1493df8e6ffd0487`, with the
previously approved `codex/website-audit-fixes-20260827` branch merged in. The
current main branch's homepage idle screensaver and the prior audit fixes are
preserved. The canonical checkout and original audit worktree were not edited.

## Owner preview

- Normal local preview: <http://localhost:3011/the-wing/#choose-setup>
- Safe booking walkthrough: <http://localhost:3012/the-wing/#choose-setup>

Port 3011 now serves this worktree's production build. Port 3012 remains the
existing local QA proxy, now pointing to that updated build. Its available times
are synthetic. It blocks submissions and payments. No production credentials
were copied into this worktree.

To restart the normal preview from this worktree, use:

```sh
npm run build
npm run start -- -p 3011 --hostname 127.0.0.1
```

Dependencies are linked to the existing local audit runtime. Do not delete that
runtime or replace the link without checking the other preview's dependency use.
Generated `.next`, dependency links, and the generated `tsconfig.tsbuildinfo`
change are not part of the feature commit.

## Customer experience

The Wing offers the four exact owner-supplied photo options:

1. 1 black chair
2. 1 brown chair
3. 2 brown chairs
4. 2 black chairs

The page starts without a default choice. Its booking links lead to the selector.
A customer chooses a photo and continues with that room and setup preselected.
Direct entry into booking also shows the selector, and a choice is required for
new Wing checkouts. No other room receives Wing choices.

The booking summary and review show the chosen name and photo. A customer can
change the setup while retaining the date and time. Changing studios clears the
room-specific setup. Review edits are locked while checkout creation is pending.

All four setups retain the $300/hour Wing rate. The optional teleprompter stays
$50/hour and is priced independently. No chair surcharge was added.

The customization note says all sets are customizable and invites an email or
contact inquiry before booking. The contact link carries the selected Wing photo
into an editable, unsent inquiry. Executive options are intentionally not added.

## Booking and staff preparation

- A shared allowlist supplies stable setup IDs, labels, images, and descriptions.
- The server requires a valid Wing selection before creating a new checkout.
- Canonical setup information travels through checkout cart metadata, Stripe line
  descriptions, booking holds, and final Calendar event descriptions/private data.
- Customer, team, staff/preparation, and reminder email templates include the
  per-session setup. The signed confirmation summary also includes it.
- Setup choices do not alter booking resources, equipment locks, or prices.
- Historical paid bookings without a setup remain valid. They are labeled as
  lacking a recorded setup instead of being silently assigned chairs.
- A resumed older checkout without a setup requires a protected revision before
  payment. A conflicting new photo choice never silently replaces an existing
  checkout. The prior checkout must first be safely released.

## Photos

The four original PNGs under `Aug 27/The Wing (Update)` were preserved. New WEBP
copies live under `public/studio-setups/the-wing`. All retain the original
1448 by 1086 framing, with no cropping. Together they total 1,015,634 bytes.

`scripts/prepare-wing-setup-images.mjs` reproduces the conversion from an explicit
source directory and refuses to overwrite existing generated files.

## Verification

- `npm run build`: passed, including 76 generated routes and type validation.
- `npm test`: 128 passed, none failed or skipped.
- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `git diff --check`: passed before the handoff note was added; checked again at staging.
- Browser-tested both development and production previews.
- Actual Next Link navigation preserves the selected room and photo.
- Required unselected state, photo changes, review name/image, and preserved
  date/time verified in the browser.
- Safe synthetic checkout received `two-black-chairs` with a canonical total of
  $350 for one hour plus teleprompter. All review editing controls were disabled
  during the delayed request. The test endpoint created nothing.
- Fake pending-checkout fixtures verified setup conflicts, legacy missing setup,
  protected revision, and switching to a different studio. Payment frames did
  not mount for the conflict or missing-setup states.
- The custom inquiry opened with `1 brown chair` already in its unsent message.
- Wing and booking layouts checked at 320, 360, 390, 400, 768, and 1440 pixels.
  No horizontal overflow found. The 320-pixel logo retained a 70-pixel width.
- Automated tests cover server query handoff, distinct React selection keys,
  invalid/duplicated parameters, strict setup validation, legacy metadata,
  signed confirmation privacy, pricing, and all four image assets.
- Calendar insertion and reminder functions were exercised with an in-memory
  Calendar fake, including retry idempotency and preservation of private data.
- Independent read-only reviews found no remaining actionable issues.

Keyboard semantics use native labeled radio inputs with visible focus styling.
The browser automation's key events did not exercise native radio movement, so
physical-keyboard behavior is not claimed as a completed browser test.

## Before any launch

Obtain the owner's approval of the local photo choices and copy. A separately
authorized test-mode integration check should verify Stripe, Calendar, and email
delivery together. None of those live integrations was contacted by the local
checkout fixtures. Fetch and review current main again before preparing a release.

# Local interaction upgrades, 2026-08-27

## Scope and delivery

Branch: `codex/site-interaction-upgrades-20260827`.

Started from `origin/main` at `98326d242f44cda4b5f5de5b1493df8e6ffd0487`, then included the approved local Wing, Executive, and audit work through `aef33b0`.

The verified production build is running locally at [http://localhost:3011](http://localhost:3011).

This is a local-only implementation. No production deployment, remote push, pull request, real contact submission, booking, Calendar insertion, or Stripe charge was performed. The canonical checkout and unrelated user work were preserved.

## What changed

- Wing and Executive setup cards have separate **View larger** buttons. Full-frame photo previews support arrows, thumbnails, keyboard navigation, and horizontal swipes. Previewing never selects a setup or changes the booking choice.
- Thirty-two standalone studio photos across nine studio pages now open in the same viewer. Linked cards and hero interactions were left alone.
- The existing photography deck now has a full-frame viewer for its fifteen photos. Closing returns to the photograph being previewed while preserving the deck's continuous wrap position. The active thumbnail scrolls into view without moving the photo or page.
- All three Featured Originals Watch links open a video dialog. The YouTube iframe exists only while open, closes cleanly, and has a visible YouTube fallback. Modified-click and no-JavaScript links still work normally.
- Featured Originals has a visible pause/resume control for background video and automatic rotation. Reduced-motion preferences, offscreen suspension, manual navigation, hover, and keyboard focus are respected.
- The cinema includes a small **Start a similar project** link for the selected project. Contact receives only allowlisted project context, with existing service and setup inquiry handoffs retained.
- Pricing uses native FAQ disclosures with unchanged answers and structured data. Answer-specific URLs open and focus the intended question.
- Contact has field-level errors, first-invalid-field focus, retained values, a duplicate-send guard, distinct delivery errors, and announced success. The backend payload and anti-spam fields are unchanged.

Shared dialogs use native modal focus containment, a sticky Close control, Escape dismissal, backdrop dismissal, body-scroll restoration, and explicit return focus to the triggering control. Media is loaded on demand. Image loading and failure states are visible.

No new package dependency, paid service, demo asset, homepage positioning statement, or comparison/deliverables section was added. The existing black/red, photo-led design remains intact.

## Design references

Original lightweight implementations adapted the approved interaction patterns, not marketplace source or demo media:

- [Gallery Grid](https://21st.dev/@moumensoliman/components/gallery-grid-block-shadcnui)
- [Hero Video Dialog](https://21st.dev/@dillionverma/components/hero-video-dialog)
- [Button with Animated Arrow](https://21st.dev/@originui/components/button/button-with-animated-arrow)
- [Accordion](https://21st.dev/@fuma-nama/components/accordion)
- [Input with Error](https://21st.dev/@originui/components/input/input-with-error)

## Verification

- Full unit/regression suite: 189 passed, 0 failed, 41 suites.
- Full ESLint: passed.
- TypeScript with `--noEmit --incremental false`: passed.
- Production build: passed, including the repeat build with final thumbnail polish. All 76 static pages generated successfully.
- Local route audit repeated against the final port 3011 build: 58 sitemap pages, 99 internal links, and 98 image-sitemap entries checked. Zero warnings or failures.
- Browser checks: desktop Executive photo selection isolation; Wing at 320px; sticky Close at 844 x 390 after scrolling; mobile video playback and removal for all three featured projects; actual pause/resume; FAQ expansion/deep linking; empty and invalid contact fields without sending a request.
- The photography deck's first-to-last wrap and preview/close retain photo 15 and return focus. A standalone green-screen photo loads full-frame in the shared viewer with the original card dimensions preserved.
- Both Body Is Tea and The Sitdown: Matt Cross pass the real cinema-to-contact UI handoff, including project type, title, and the correct internal or YouTube reference.
- The final gallery build keeps photo 15's thumbnail fully visible after wrapping. The Pricing inclusion-answer deep link opens and focuses correctly at 390px with no horizontal overflow.
- Success, rate-limit, server-error, and network-error delivery tests use mocked fetch, not live submissions.

The test-only CSS preload lets existing Node server-rendering tests import CSS-module components. Actual CSS is validated by the Next build and browser checks. The isolated Node image warning about quality 90 does not reflect runtime configuration: `next.config.js` already allows quality 90.

## Local environment notes

Keep the verified production preview on port 3011. The existing safe walkthrough proxy on 3012 targets 3011 and must not be replaced or exposed publicly. Temporary QA servers must not overwrite a running build's `.next` directory.

iCloud temporarily evicted source and Git object files during implementation, causing long reads and an intermittent development-page 404. Only task-related source/Git/media paths were downloaded as needed. No files were deleted, no cloud settings changed, and no originals moved.

Browser skill was used for interaction and responsive QA. Computer Use was used only to inspect Finder during local file recovery.

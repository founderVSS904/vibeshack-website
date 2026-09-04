# Media loading and accessibility, September 4, 2026

Base: origin/main `cb60e6e7e955e6e91f7720973588315a058a65c9`.

## Behavior

- Homepage ambient video sources are absent until browser preferences are known and the active tile/carousel is visible. Touch, reduced-motion, and Save-Data visitors receive still images. Explicit featured-video links still open their player.
- Both homepage motion controls share a stored pause preference. Pausing stops hero previews, featured rotation/previews, the trusted-logo marquee, and the idle screensaver. Reduced-motion preference takes precedence.
- Cinema pre-show video is absent from initial HTML. Automatic loading requires an eligible desktop. Explicit Play pre-show works on touch and restrictive preferences without waiting for metadata that has not been requested.
- The native cinema player and YouTube theater retain the original screen/light geometry. Desktop plates use optimized WebP backgrounds; their media query excludes phones from downloading hidden plates.
- Small portfolio, contact, and privacy text uses readable secondary colors. Inner main wrappers are removed from contact/privacy, project pages, and error states; app/layout retains the main landmark. The policy agent owns terms wrappers separately.

## Asset provenance

`public/studio-videos/cinema/runtime-v017/theater_idle-q95.webp` and `theater_playing_base-q95.webp` derive from their adjacent checked-in PNG originals. Reproduce using `node scripts/prepare-cinema-plates.mjs`.

The encoder uses WebP quality 95, alpha quality 100, effort 6, with no resize, crop, or geometry change. Both remain 1800 x 800. Originals and lighting masks are preserved. The two delivery files total 52,578 bytes versus 1,431,965 bytes for the PNGs, a 96.3 percent reduction. Native-size image inspection found no material layout or scene change. The versioned runtime directory receives immutable caching; future content changes require a new versioned path.

## Validation and handoff

ESLint and TypeScript passed. All 199 baseline-plus-media tests passed. Added tests cover restrictive preference/loading behavior, explicit playback, SSR image fallbacks without video sources, and derivative geometry/size. The test-only Next Image quality warnings arise because direct React server rendering does not load next.config; configured app builds include those qualities.

Parent task performs the integrated build and real browser QA before release. Check 320/390 desktop-responsive and desktop layouts, both homepage pause controls and reload persistence, no automatic mobile media requests, explicit cinema play/pause, project launch/fullscreen, reduced-motion preference, and paused idle behavior. No live booking, form, payment, email, push, or deployment occurred in this subtask.

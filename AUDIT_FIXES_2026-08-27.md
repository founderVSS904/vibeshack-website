# Approved website audit fixes

Local review handoff, August 27, 2026.

These changes are on `codex/website-audit-fixes-20260827`, based on production source commit `dc7234c`. The verified implementation ends at `6a8e821`. They have not been pushed or deployed. The canonical checkout and unrelated work were not edited.

## Local review

- [Local website](http://localhost:3011/) is the production build running on this Mac.
- [Safe checkout demo](http://localhost:3012/book/?studio=the-executive) uses the same built frontend with synthetic availability. Every backend submission is blocked. Its times are demonstration data, not actual studio availability, and it cannot take a payment or create a reservation.
- The main preview intentionally has no production service credentials loaded. Live calendar availability and payment fulfillment are therefore not available there.
- To inspect the teleprompter, use the safe demo: choose a date, duration, and available time, then continue to Extras and Review. No personal information is needed for these steps.

The isolated worktree is `/Users/emmanueltay/Desktop/VibeShack/Website/Agent Worktrees/website-audit-fixes-20260827`. To restart the already-built main preview from that directory, run `npm run start -- -p 3011 --hostname 127.0.0.1`. The local-only demo proxy is outside the repository at `/Users/emmanueltay/Library/Caches/vibeshack-audit-runtime.S6FE2y/local-booking-preview.mjs` and can be restarted with Node while port 3011 is running. It is not part of the release.

## What changed

### 1. Booking confirmation is verified

- The confirmation page now asks the server to verify the Stripe session. A query parameter by itself cannot produce a successful booking message.
- Success requires a completed, paid VibeShack checkout with complete booking metadata, matching USD payment amount, and calendar fulfillment recorded.
- Missing, invalid, expired, unpaid, unverified, still-processing, and service-error states have separate messages.
- A paid session with a scheduling conflict stays in a team-attention state, even if its alert email fails. Ordinary booking confirmation is suppressed until that conflict is resolved.
- Booking details require the existing signed checkout-management token. A confirmation URL alone returns status, not customer details.
- Pending checkout data is cleared only after a verified confirmation for that same session.

### 2. Same-day booking uses San Francisco time

- Studio and tour date pickers include today, calculated in `America/Los_Angeles`, rather than in the visitor's local timezone.
- Existing availability verification, future-slot checks, booking holds, and shared podcast-equipment conflict checks remain in place.
- Tours retain the existing two-hour lead time. Same-day availability does not mean past or unavailable times can be booked.
- Unavailable and elapsed times are labeled “unavailable,” not “booked.” An elapsed day no longer implies that every time was reserved.
- Date tests cover Pacific midnight, visitors in other timezones, and daylight-saving transitions.

### 3. Podcast packages are consistent

Every podcast booking includes **2 studio operators** and a **minimum of 3 cameras**.

| Podcast room | Hourly rate |
| --- | ---: |
| The Executive | $300 |
| The Wing | $300 |
| Encore | $300 |
| Sunset | $300 |
| Parlor | $400 |
| Horizon | $400 |
| Canvas Podcast | $400 |

Canvas Rental and Green Screen remain $100/hr. Canvas Rental is distinct from Canvas Podcast.

The approved facts are reflected in the booking catalog, room pages, podcast overview, pricing, support, related copy, and structured metadata. Professional terms received only a narrow equipment/included-crew correction. Cancellation, refund, and liability policies were not changed.

### 4. Teleprompter is an optional $50/hr checkout add-on

- Default off, selected separately for each studio session in the Extras step.
- Charged for that session's duration, including half-hour increments.
- Shown separately in review, cart totals, Stripe line items, saved checkout revisions, calendar details, customer/staff emails, and authorized confirmation details.
- The server validates the selection and calculates the price. Client-supplied prices are not trusted.
- Recurring savings apply to studio time, not to the teleprompter.
- Old checkouts without add-ons remain readable.
- Canvas Rental no longer makes the blanket “All equipment included” claim. Its specific included cyc wall, lighting grid, and floor mats remain listed.

Examples:

| Selection | Studio | Teleprompter | Total |
| --- | ---: | ---: | ---: |
| $300/hr room, 1.5 hours | $450 | $75 | $525 |
| $300/hr room, 2 hours | $600 | $100 | $700 |
| Same two-hour session with 10% recurring savings | $540 | $100 | $640 |
| $400/hr room, 2 hours | $800 | $100 | $900 |

Large carts also reserve space for fulfillment and payment-status metadata. Stripe allows 50 metadata pairs with a 500-character limit per value; the implementation budgets initial fields and tests the largest supported cart. [Stripe metadata documentation](https://docs.stripe.com/metadata).

### 5. Green Screen support is available by arrangement

Operator and streaming support use the approved arrangement wording. They were not reintroduced as online checkout options. The newly added checkout option is the teleprompter.

### 6. The studio finder uses actual on-camera counts

- Visitors enter an exact number of people appearing on camera at once, excluding off-camera crew.
- Fractional counts and the old ambiguous group-size ranges are not accepted. Product shoots can enter zero; undecided counts have a confirmation path.
- Automatic matches are filtered by documented on-camera capacity and production type.
- Executive and Wing currently have documented two-person layouts. Other room limits remain unverified until Tay confirms them. This is not a claim about building occupancy or their absolute maximum capacity.
- A larger or unverified group gets a team-confirmation request instead of an unsupported room recommendation. Its project type, count, and crew needs carry into an editable contact message.
- The complete studio directory is clearly labeled as browsing, not as additional capacity-checked recommendations.
- Question changes and restarts reset the scroll position so the next heading remains visible on short screens.

### 7. Navigation works on narrow screens

- The mobile logo has a reserved 70 by 32 pixel footprint. The booking button reads “Book” on small screens.
- Pricing, Our Work, About, and Contact are at the top of the mobile panel.
- Individual rooms and other links sit in expandable categories.
- Escape closes the panel and restores focus. Resizing to desktop restores access to the page behind it.
- Desktop studio names wrap rather than truncate.

### 8. Portfolio inquiry is a simple next step

“Start a similar project” now leads directly to the contact form with an allowlisted project reference and appropriate project type. The message remains editable. No new case-study, comparison, or deliverable sections were added.

## Deliberately left unchanged

- The homepage layout and its existing positioning treatment.
- Existing comparison and portfolio content beyond the requested inquiry CTA.
- Unrelated analytics, media, performance, and policy work from the broader audit.
- Private client/revenue data, credentials, original media, and unrelated worktrees.

## Verification

The final `npm run build` passed, including **101 tests with zero failures**, lint and TypeScript checks, and generation of all **76 pages**. This run includes the final availability and equipment-copy corrections. The local preview serves this production build.

Browser checks covered:

- Header layouts at 320, 360, 390, and 1280 pixels; desktop checkout at 1440 pixels. The mobile logo remains 70 pixels wide and the reviewed pages do not overflow horizontally.
- Mobile quick links and expandable room categories, Escape dismissal and focus restoration, and recovery when an open mobile panel is resized to desktop.
- Full desktop room names without truncation.
- Same-day selection in both the studio and tour pickers.
- The teleprompter defaulting off, selection and removal, a two-hour $100 add-on, a 90-minute $75 add-on, and studio-only recurring discounts. Review and sidebar totals agree.
- Missing and malformed confirmation links returning non-success states.
- A failed local calendar lookup showing an availability error and keeping checkout disabled.
- A two-person podcast returning only the documented Executive and Wing matches, and an unverified larger-count inquiry carrying the count and crew context into Contact.
- Finder step changes and restart returning the heading into view with the page at the top on a 390 by 667 pixel screen.
- The portfolio inquiry selecting Music Video and prefilling an editable Body Is Tea reference.

No real bookings, payments, calendar writes, contact submissions, or tour submissions were made. Stripe, calendar, and email behavior in automated tests uses controlled fixtures. The optional local booking walkthrough uses synthetic availability and blocks every backend submission.

## Remaining release decisions

1. Review the local implementation before authorizing production deployment.
2. Confirm on-camera limits for Encore, Sunset, Parlor, Horizon, and Canvas Podcast, plus rental rooms if they should receive automatic finder recommendations. The current confirmation fallback is safe without those numbers.
3. Real Stripe payment, Google Calendar fulfillment, and email deliverability have not been exercised. Before release, run an authorized Stripe test-mode checkout against a test calendar and test inboxes, verifying the teleprompter line item, webhook retries, confirmation state, and delivered booking details. Do not use a real customer booking as a test.

The machine was very low on free disk space during validation. No user media or project folders were removed to make room.

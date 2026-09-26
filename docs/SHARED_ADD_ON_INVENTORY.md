# Shared add-on inventory

Approved by Tay on September 25, 2026: only the teleprompter is quantity-limited.
There is one unit shared across every studio. Charge $50 once per booked session.
Live switching remains $75/hour. Remote podcast remains free.

## Reservation rules

- Equipment occupies the actual paid session, with an exclusive end boundary.
  A 3:00-5:00 PM reservation blocks overlapping sessions and permits a new
  teleprompter reservation at 5:00 PM. Studio turnaround remains a separate
  30-minute room-only rule.
- `SINGLE_UNIT_ADD_ONS` in `lib/booking/add-on-inventory.ts` declares single-unit
  equipment. This is intentionally not an arbitrary multi-quantity inventory engine.
- Checkout checks confirmed events on every configured calendar and acquires a
  global `add-on:teleprompter` hold in the existing Calendar ledger. ETag conflict
  handling prevents concurrent checkouts in different rooms from both winning.
- The existing checkout cancellation, expiration, rollback, paid fulfillment,
  and watchdog paths release or renew these resource holds with the same cart.
- Confirmed calendar events carry `addOnIds`. Their actual event times determine
  inventory, so moving/cancelling the event changes availability. Historical
  `Add-on: Teleprompter:` descriptions are also recognized.
- Old temporary checkout events did not record equipment selections. Until they
  expire or are fulfilled, their paid intervals conservatively block the single
  teleprompter. New holds explicitly record selections, including none.

## Pricing compatibility

- The historical `hourlyRateCents` wire field remains for compatibility. New
  teleprompter snapshots add `billing: 'session'`, serialized as `b: 's'`.
- Metadata without the billing flag preserves its original hourly amount.
  Never reprice a paid booking or an already-created Stripe checkout.
- New pending browser drafts record `addOnPricingVersion: 2`. Restoring an old
  draft preserves its hourly display; editing creates a new checkout using the
  current flat fee. Stripe remains the payment authority.

## Availability UI and validation

- `/api/add-on-availability/` is a rate-limited, no-store, read-only endpoint.
  It returns availability booleans only, never calendar events or customer data.
- Extras and Review refresh on time/duration changes, focus, and every 30 seconds.
  Stale responses cannot enable equipment for a different session. Unverified
  inventory fails closed for the teleprompter without blocking studio-only orders.
- A previously selected but unavailable add-on can always be removed. Server
  conflicts return `unavailableAddOnIds` so checkout returns to Extras.
- Tests cover independent-room contention, rollback, expiry/release, legacy
  reservations, pagination, calendar edits, boundary times, DST, flat pricing,
  historical snapshots, and disabled/removable card states.
- Never create real test bookings, Stripe sessions, or customer messages to test
  this feature. Use isolated fixtures and read-only production smoke checks.

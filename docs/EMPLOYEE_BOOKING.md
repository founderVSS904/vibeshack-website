# Employee booking

Local implementation, September 26, 2026. Not deployed or activated.

## Routes and behavior

- `/employee/`: invite-only Google sign-in, linked from the website footer.
- `/employee/book/`: authenticated one-page calendar, time, setup, extras,
  client details and session summary. No payment fields for staff.
- `/employee/preview/`: development-only browser-memory preview. Requires
  `EMPLOYEE_LOCAL_PREVIEW=1`, `NODE_ENV=development`, and no `VERCEL` environment.
  It never authenticates API calls or creates provider records. Production
  builds return 404 even if the preview flag is accidentally set.
- `/api/employee/*`: authorization is enforced on the server. Write requests
  additionally require the configured exact Origin. Prices are rebuilt from
  the existing canonical catalog, including the $50/session teleprompter.

Employee reservations acquire only the chosen studio's resource lock, with
30 minutes of turnaround, plus any limited equipment lock. Public checkout
continues to use the existing shared podcast/stage rules. Staff must coordinate
operators and cameras for overlapping staff-created sessions. Tours and
unidentified manual busy events continue to block conservatively.

The employee workspace keeps its one-page grouped cards, with the customer
checkout's larger type scale, full weekday labels, neutral selection/focus
states, rounded 48px controls, icon-led summary rows, and red booking action.
Studio and duration selectors share EmployeeSelect, which preserves native
select semantics and mobile pickers. Setup choices are required native radio
cards with the existing catalog photos. At narrower widths the summary and
then calendar/time panels stack without shrinking essential text.
This presentation change does not alter employee or public booking rules.

The faster-booking follow-up adds Today/Tomorrow shortcuts and a cancellable
Next available search across the next seven days, including overnight hours.
The search uses verified employee availability, the selected duration and the
same consecutive-slot fit test. A verification failure stops the search; it
never guesses availability. Studio/date/duration changes cancel pending
searches so late responses cannot change a newer choice. Teleprompter inventory
is still independently checked for the resulting session.

Time buttons are grouped by Pacific morning/afternoon/evening/overnight, with
unavailable starts hidden by default and an explicit show toggle. No nested
time-list scrolling is needed. The selected range and turnaround end appear
directly below the scheduler. The summary uses a smaller image, stronger date
and time, a studio subtotal and itemized add-ons, and edit shortcuts that focus
the relevant section. Teleprompter pricing remains visible before availability
is known. The narrow-screen review bar only moves focus to the summary; it
cannot submit. It hides while editing inputs or when the virtual keyboard
reduces the viewport, and includes safe-area spacing.

Result status separates reservation, payment and email-request acceptance.
Acceptance is not claimed as inbox delivery. Preview success always says that
nothing was sent or charged, with no fake payment link. Paid results do not
offer unpaid cancellation. Broader history, in-place rescheduling and real
account activation remain outside this local UI follow-up.

Pending-payment policy currently defaults to keeping the reservation until
staff cancels it. Tay was asked to confirm this policy; no answer was received
during implementation. Invoices request payment before the booked start time,
but overdue invoices do not automatically release the room.

## Production setup still required

No credentials, account permissions, Vercel settings, Google settings or Stripe
settings were changed during this local task. Configure these in the secure
deployment environment before activating the feature:

| Variable | Purpose |
| --- | --- |
| `EMPLOYEE_GOOGLE_CLIENT_ID` | Dedicated Google OAuth web client for staff sign-in |
| `EMPLOYEE_GOOGLE_CLIENT_SECRET` | That client's secret, stored only in Vercel |
| `EMPLOYEE_SESSION_SECRET` | Cryptographically random signing secret, at least 32 characters |
| `EMPLOYEE_ALLOWED_EMAILS` | Comma-separated exact approved addresses, no automatic domain-wide access |
| `EMPLOYEE_BASE_URL` | Canonical origin, normally `https://www.vibeshackstudios.com` |
| `EMPLOYEE_BOOKING_ENABLED` | Set to `1` only after configuration and authorized integration checks |

Use a dedicated Google sign-in OAuth client, not the calendar refresh-token
client. Register this exact callback for the production origin:
`https://www.vibeshackstudios.com/api/employee/auth/callback`.
Approve only identity/email scopes. The existing Google Calendar integration
continues to supply calendar access separately. Sessions use HTTP-only,
Secure (HTTPS), SameSite=Lax cookies with an eight-hour expiry. OAuth attempts
use a signed short-lived state cookie, PKCE, a nonce and verified Google ID
tokens. Removing an address from the allowlist revokes its existing sessions.

Confirm the exact employee list with Tay. No account was automatically granted
access by this change. Keep OAuth secrets and the signing secret out of chat,
Git, logs and screenshots.

The existing Stripe webhook at `/api/webhook/` must also receive `invoice.paid`
and `invoice.voided` events. Retain its existing checkout events and signing
secret. Employee invoices are identified by `source=vibeshack-employee-booking`
and an exact booking reference. Only verified webhook signatures enter the
handler, which retrieves current invoice status and checks customer, amount,
currency and booking identity before changing the calendar. Stripe Invoicing
is used, so review the account's applicable invoicing fees before activation.

References: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect),
[Stripe manual invoice finalization](https://docs.stripe.com/api/invoices/finalize),
[Stripe invoice sending](https://docs.stripe.com/api/invoices/send).

## Reservation and payment lifecycle

1. Authenticate the employee and validate the canonical session/client input.
2. Create a private transparent state event in the existing hold calendar. A
   deterministic reference and ETag lease serialize retries across instances.
3. Check availability, acquire room/equipment ledgers, recheck, and create a
   private opaque studio reservation. Failed post-hold conflict checks release
   their ledgers. An uncertain calendar write stays blocked for recovery.
4. Create a booking-specific Stripe customer and draft invoice. Use stable
   provider idempotency keys. Do not sweep unrelated pending invoice items.
5. Attach the server-priced line, verify the total, finalize without automatic
   advancement, and send the hosted Stripe invoice email.
6. Show success only after the send request succeeds. Keep the reservation if
   invoice creation or email fails; retry the same request to resume safely.
7. A verified payment webhook marks the calendar Paid. No duplicate public
   booking event or customer checkout fulfillment is created.
8. Staff cancellation voids the unpaid invoice first, then removes the room
   event and releases room/equipment ledgers. Paid invoices cannot be cancelled
   by this endpoint. Voiding the invoice in Stripe also reconciles via webhook.

The employee page supports cancelling the reservation just created. A broader
staff booking-history/rescheduling dashboard is not included in this change.
After leaving the page, existing reservations can be managed through Calendar
and Stripe; void the invoice in Stripe to release through the webhook. Do not
delete only the calendar event, because the resource ledger also needs release.

## Interrupted bookings and recovery

Do not refresh or start a new booking after an uncertain create response. The
page preserves its request ID and locks the form so Retry uses the same input.
The durable state keeps invoice/customer identifiers and completed stages.
If a process dies while holding a lease, wait five minutes before retrying.

Stripe idempotency keys have a limited retention period. An incomplete booking
older than 23 hours is blocked from automatic recreation. An administrator must
inspect its private booking-state record and the bookingRef metadata in Stripe,
reconcile any existing invoice, and resolve its room/teleprompter holds before
retrying or clearing it. Never blindly create a replacement invoice.

Calendar records contain client contact data and internal notes. Keep the
calendar private and do not export those records into public artifacts.
Employee notes are not copied into Stripe invoice descriptions or client mail.
Employee routes are noindex, omitted from sitemaps, and excluded from the site's
page-view and attribution capture components.

## Local review and safe testing

Run from the feature checkout:

```sh
EMPLOYEE_LOCAL_PREVIEW=1 npm run dev -- -H 127.0.0.1 -p 3011
```

Open `http://localhost:3011/employee/preview/`. Use fictional client data.
Reservations exist only in that tab's memory and disappear on reload. The local
preview explicitly says nothing is emailed or charged.

The sign-in screen at `/employee/` uses a standalone black layout with the red
VS monogram. In local preview mode only, it displays the requested email and
password design. Those controls do not submit, store, log, or authenticate
credentials. Sign In and Forgot password show explanatory notices; Keep me
signed in changes only the preview checkbox. Use fictional input. A separate
Explore booking preview link opens the synthetic booking screen.

Outside that development-only mode, password controls are not rendered. The
existing configured Google OAuth path remains available, or access stays closed
when configuration is missing. Real password authentication and password reset
have not been implemented. Changing the authentication provider needs a separate
decision and implementation. The public header is hidden only on the sign-in
route; employee booking keeps the normal website header and black background.

Automated tests exercise canonical prices, strict authentication, origin
protection, concurrent and repeated submissions, invoice/email failures,
late-retry protection, cancellation ordering, Stripe invoice parameters,
webhook reconciliation, room-only occupancy, turnaround, global teleprompter
inventory and preservation of public checkout rules. Provider tests use
in-memory fakes, not live services.

Real Google sign-in, Stripe invoice/email delivery and live payment webhooks
remain untested. Those require the missing configuration and separate explicit
authorization for exact external actions. Publication is also a separate step.

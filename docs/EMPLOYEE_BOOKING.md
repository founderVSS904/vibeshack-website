# Employee booking

Implementation updated September 26, 2026. Production rollout authorized; provider activation must be verified separately from code deployment.

## Routes and behavior

- `/employee/`: invitation-only email-link sign-in, linked from the website
  footer. Google appears only when its provider is configured and
  `EMPLOYEE_GOOGLE_ENABLED=1`.
- `/employee/book/`: authenticated three-step booking flow: Session, Setup &
  extras, and Client & review. No payment fields for staff.
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

The employee workspace now separates the workflow into three focused screens
with a dedicated black team header: the approved logo and Team label, a current
Book a client section, a website link opening in a separate tab, and an account
disclosure. The disclosure identifies the local preview without implying a
signed-in employee. Authenticated sessions show their verified email and the
existing POST sign-out action. The standalone sign-in and public site navigation
are unchanged. Account actions have moved out of the workspace footer.

The booking flow stays
on the same protected route. Session shows studio/date/time/duration and a
compact, photo-free subtotal summary. Setup & extras gives catalog-photo radio
cards more space and shows optional extras separately. Client & review pairs
contact details with the full itemized summary and final booking action. Later
steps use a small text recap rather than repeating the full room-photo card.

The Session step uses a shorter heading and progress row, with studio and
session length together above the calendar. Calendar, time choices and the
subtotal/Continue summary fit alongside one another on laptop screens. The
summary omits the repeated room name and hourly rate. All four time ranges
share one row except on very narrow phones, where they wrap into two rows.
Smaller screens stack naturally; no fixed-height clipping or nested scrolling
hides extra calendar weeks, daylight-saving time slots or validation messages.

An ordered progress navigation shows the current step and allows return to
visited steps. Continue validates the current session and, at step two, setup
and limited-equipment availability. Re-entering review rechecks these gates.
Draft state stays in the parent component while inactive panels unmount, so
Back preserves all selections/client data without hidden required controls
participating in tab order or validation. Step transitions focus the new
heading. An early-step Enter/submit cannot create a reservation; the submit
handler explicitly requires step three. Busy, uncertain-retry and completed
states lock navigation. Create another booking resets progress to step one.

The black palette, readable labels, neutral selection/focus, rounded controls
and red actions remain consistent. Studio/duration use native selects; setup
uses required native radios. Mobile panels stack, with normal in-flow actions
instead of a floating review bar. Public and employee booking rules are unchanged.

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
directly below the scheduler. Final review emphasizes date/time, studio subtotal
and itemized add-ons, with edit shortcuts back to Session or Setup & extras.
Teleprompter pricing remains visible even when its availability is not verified.

Result status separates reservation, payment and email-request acceptance.
Acceptance is not claimed as inbox delivery. Preview success always says that
nothing was sent or charged, with no fake payment link. Paid results do not
offer unpaid cancellation. Booking history and real account activation are
handled by the account and history routes described
below. In-place rescheduling remains outside this release.

Pending-payment policy currently defaults to keeping the reservation until
staff cancels it. Tay was asked to confirm this policy; no answer was received
during implementation. Invoices request payment before the booked start time,
but overdue invoices do not automatically release the room.

## Employee creator attribution

The booking creator comes from the authenticated Supabase user and current
active employee membership, never from the booking form. The stable user ID,
verified email and admin-maintained employee name are captured server-side.
The private booking record snapshots that name and the employee email when the
reservation is first created. Retries preserve the original creator even if
the account's display name changes later. Older sessions or profiles without a
name remain attributable by email; the system does not invent a name.

The private studio Calendar event shows `Booked by: Name (email)` from creation
onward, with no guest attendees or Calendar update emails. New named bookings
also store `bookedByName` and `bookedByEmail` as internal Stripe invoice metadata.
These fields are excluded from invoice descriptions, line items, booking API
results and all client/guest email templates. Legacy records retain their
original invoice-creation parameters for safe idempotent retries.

Tay confirmed the internal notification should go out **after the client pays**.
After a signature-verified invoice webhook retrieves and validates the invoice,
the booking is marked paid and Calendar is updated. A dedicated New Booking
email then goes only to the existing internal address,
`founder@vibeshackstudios.com`, including the Booked by line. No internal email
is sent merely for an unpaid reservation or cancellation. Client invoice emails
and the public checkout's confirmation, prep and invited-guest emails stay
unchanged. The preview never sends mail or invents a signed-in employee.

The internal email uses the existing Gmail transport and durable message
delivery ledger. Verified rejections can retry; accepted messages are not
repeated. Ambiguous SMTP outcomes require inspection instead of blind resend.
A notification failure returns a retryable webhook error while retaining the
paid reservation. Repeated webhooks resume notification delivery without
recreating the reservation/invoice or resending the client's invoice email.

## Accounts, roles and production activation

The current implementation uses Supabase Auth and PostgreSQL for staff access.
The old direct-Google allowlist and signed-session helpers remain only as legacy
code/test references. Production routes do not accept those cookies.

The migration seeds `founder@vibeshackstudios.com` as an invited Superadmin
without an Auth user ID. This permits the founder's first email sign-in before
Google is configured. The invitation is not an authenticated account: the
confirmed email or OAuth identity must pass the service-only acceptance
function before the membership becomes active and binds to a stable Auth user
ID. TOTP enrollment is then required before entering the workspace. Employees
are invited from `/employee/team/`; name and email are the only invitation
inputs. They cannot assign their own roles.

Every protected operation verifies the Supabase user and signed claims, then
reads the current membership from the database. Disabled accounts lose access
even with an existing valid session. Superadmin requires a verified TOTP second
factor (`aal2`) before booking or administering the team. `/employee/security/`
handles enrollment and challenges. An existing verified factor cannot be
replaced by a first-factor-only session.

Invitation and later sign-in email links are generated by Supabase Admin and
sent through the website's existing Gmail transport. No additional Supabase
SMTP configuration is required for these application routes. The confirmation
GET displays an explicit Continue form; only its same-origin POST consumes the
single-use token, protecting against common email link scanners. Tokens are
never returned by team APIs or written into audit records. Delivery acceptance
is not described as inbox delivery. Unknown/disabled email requests return a
generic response without granting access. Database throttles serialize repeated
recipient requests and Superadmin invitation sends.

Apply `supabase/migrations/202609270001_employee_accounts.sql` to a dedicated
project. It enables RLS and removes all anonymous/authenticated direct access
to membership/activity tables and privileged functions. Only server-side
service credentials access those records. The production environment needs:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Dedicated project's HTTPS URL |
| `SUPABASE_PUBLISHABLE_KEY` | Project publishable or legacy anon key |
| `SUPABASE_SECRET_KEY` | Project secret or legacy service-role key, server-only |
| `EMPLOYEE_BASE_URL` | `https://www.vibeshackstudios.com` |
| `EMPLOYEE_GOOGLE_ENABLED` | `1` only after the Supabase Google provider and its OAuth configuration are verified; leave unset while Google is unavailable |
| `EMPLOYEE_BOOKING_ENABLED` | `1` only after authentication and booking integrations are verified |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Existing website mail transport |
| `STRIPE_SECRET_KEY` | Existing server-side Stripe account used for employee customers, invoices and payment reconciliation |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the existing `/api/webhook/` endpoint |
| `GCAL_TOKEN_JSON` or `GCAL_TOKEN_B64` | Existing server-side Calendar credentials; configure one production credential source |

For OAuth Calendar credentials, `GCAL_CLIENT_ID` and `GCAL_CLIENT_SECRET` are
needed only when those values are not contained in the credential JSON;
`GCAL_REDIRECT_URI` is the corresponding optional fallback. Service-account
credentials instead carry their own client email and private key. Never copy
credential values into this document. A local `GCAL_TOKEN_PATH` is supported by
the existing Calendar adapter but must not be treated as a deployed file.

Preserve the existing Calendar routing configuration: `GCAL_CALENDAR_ID`,
optional `GCAL_HOLD_CALENDAR_ID`, `GCAL_TOUR_CALENDAR_ID` (or
`GCAL_CALENDAR_ID_TOUR`), and any per-studio `GCAL_CALENDAR_ID_<STUDIO_ID>` or
`GCAL_STUDIO_CALENDAR_IDS` / `GCAL_STUDIO_CALENDAR_MAP` overrides. Absent
overrides, the hold/tour/studio routes use the default calendar. The credentials
must read and write the applicable private calendars and resource ledgers.
Employee Google login credentials never replace these booking credentials.

Configure Google in Supabase Auth using a dedicated Google web OAuth client,
with Google's callback pointing to the project's Supabase Auth callback. In
Supabase's redirect allowlist, permit only the canonical website callback
`https://www.vibeshackstudios.com/api/employee/auth/callback` and explicitly
required development/test origins. Do not use wildcard production redirects.
Use identity/email/profile scopes only, never Calendar scopes for staff login.
The existing Calendar credentials remain separate. Configure short email-token
expiry, TOTP support and a suitable session lifetime. Google authentication may
create an Auth identity, but it grants no portal access without founder identity
verification or an invited membership. Disable unused public authentication
methods; never enable anonymous users for the employee portal.

Production `npm run build` runs `scripts/verify-employee-config.mjs` first,
followed by `scripts/verify-employee-booking.ts`.
When Supabase variables are present, this performs read-only checks of the
service account's membership-table access, denied anonymous table access and
Auth provider settings. It requires email authentication, checks Google when
the Google flag is enabled, and checks that mail transport variables exist.
The script prints no keys, tokens, employee rows or email contents, and creates
no records or messages. Partial or rejected configuration fails the build.
With no Supabase configuration it reports closed employee access.

The booking check is skipped unless `EMPLOYEE_BOOKING_ENABLED=1`. When enabled,
it requires the Stripe secret, webhook signing secret and Gmail transport
variables. It reads Calendar-list metadata, without event contents, to verify
owner/writer access to the default, hold and unique studio calendars resolved
from the canonical studio catalog. It reads bounded Stripe webhook endpoint
pages to verify an enabled endpoint at the canonical
`EMPLOYEE_BASE_URL` + `/api/webhook/`, with both invoice events and both existing
checkout events. It verifies Gmail SMTP connectivity and authentication without
sending a message. Provider failures produce fixed safe errors and fail the
build without exposing credentials, provider objects or record identifiers.

These read-only checks do not create reservations, test invoice delivery,
confirm the webhook signing secret matches the endpoint, complete TOTP
enrollment or prove a paid booking end to end. Keep the existing verified
webhook signing secret when updating its event subscriptions.
`EMPLOYEE_BOOKING_ENABLED=1` requires working employee access and the booking
provider checks; Supabase setup alone does not activate those providers. Keep
`EMPLOYEE_LOCAL_PREVIEW` out of the production configuration.

At this activation checkpoint, the dedicated Supabase migration, exact Auth
callback allowlist and TOTP settings have been applied. Supabase production
variables have been saved for the pending deployment and its prebuild check.
Google configuration is waiting for the owner's reauthentication, so the
Google flag remains unset and email sign-in is the available account path.

The Team screen supports pending invitation resend/revocation and active account
disable/restore. Restoring an unaccepted invitation returns it to Invited;
restoring an established employee returns it to Active. These explicit actions
are audited. The sole Superadmin is protected from those actions. Account
activity at `/employee/activity/` shows the latest 100 access-management events.
Employee-created booking history at `/employee/bookings/` comes directly from
private Calendar state, with bounded pages and an explicit 90-day update window.
Employees see/manage their own records; Superadmin sees all employee records.
It does not claim to be the history of public customer checkouts.

Bookings retain creator name/email and stable ID snapshots across profile
changes and deactivation. New bookings use stable ID ownership; historical
records without it fall back to the verified original email. Cancellation
checks ownership before provider writes and again inside the record lease.
Paid invoices still require a separate Stripe refund/cancellation process.

### Owner recovery

Before operational use, the verified project owner must retain secure recovery
access to the Supabase project and the founder email account. If the founder
loses the authenticator, recover through that verified administrative access:
remove only the lost MFA factor, revoke existing Auth sessions, then require
fresh verified email or configured Google sign-in and new TOTP enrollment. Keep the existing stable user ID
and Superadmin membership. Never recover by granting a client-supplied role,
disabling MFA checks, sharing an employee session, or creating a public bypass.

### Booking provider readiness

The existing Stripe webhook at `/api/webhook/` has been configured to receive
`invoice.paid` and `invoice.voided` while retaining `checkout.session.completed`,
`checkout.session.expired` and its existing signing secret. Employee invoices
carry `source=vibeshack-employee-booking` and an exact
booking reference. Verified webhook signatures, retrieved invoice identity,
amount and currency are required before calendar reconciliation. No real
booking, charge, invitation or client email is part of automated validation.

References: [Supabase server authentication](https://supabase.com/docs/guides/auth/server-side/creating-a-client),
[Supabase TOTP](https://supabase.com/docs/guides/auth/auth-mfa/totp),
[Stripe invoice finalization](https://docs.stripe.com/api/invoices/finalize).

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

The employee page supports cancelling the reservation just created. History is available at `/employee/bookings/`;
in-place rescheduling remains outside this release. Existing reservations can
also be managed through Calendar and Stripe; void the invoice in Stripe to release through the webhook. Do not
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

### 24-hour employee calendar

The Session step exposes Night (12 AM to 6 AM), Morning (6 AM to 12 PM),
Afternoon (12 PM to 6 PM), and Evening (6 PM to 12 AM) with equal prominence.
The calendar date is the session's starting date. Sessions remain 1 to 8 hours,
in half-hour increments, and may continue past midnight. End times and
turnaround times show their next-day date. Repeated fall-back start times are
distinguished with PDT/PST labels.

Employee availability verifies the selected date plus enough next-day slots
for the longest session. Server-side canonicalization allows overnight slots
only through the authenticated employee path. Room checks and global equipment
ledgers cover both dates, and the studio's 30-minute turnaround crosses midnight
as needed. One overnight session still has one flat teleprompter charge. Public
checkout validation and its existing same-day limit are unchanged.

`/api/employee/add-on-availability` requires employee authentication and uses
the same start-date horizon, slot count, and midnight continuation rules.
The local preview simulates those rules with in-memory reservations only.

Run from the feature checkout:

```sh
EMPLOYEE_LOCAL_PREVIEW=1 npm run dev -- -H 127.0.0.1 -p 3011
```

Open `http://localhost:3011/employee/preview/`. Use fictional client data.
Reservations exist only in that tab's memory and disappear on reload. The local
preview explicitly says nothing is emailed or charged.

The sign-in screen at `/employee/` uses the approved red monogram and a black
background and Email me a sign-in link. Continue with Google appears when its
provider flag is enabled or in the development preview. Development
preview interactions use fictional data, make no provider requests, and say that
nothing was sent. `/employee/preview/team/` and `/employee/preview/bookings/`
allow safe review of invitations and history with the same production guards.
No preview route is available in a production build.

Automated tests exercise canonical prices, strict authentication, origin
protection, concurrent and repeated submissions, invoice/email failures,
late-retry protection, cancellation ordering, Stripe invoice parameters,
webhook reconciliation, room-only occupancy, turnaround, global teleprompter
inventory and preservation of public checkout rules. Provider tests use
in-memory fakes, not live services.

Deployment is authorized and pending; production prebuild verification and
post-deployment sign-in checks still need to finish at this checkpoint.
Google sign-in remains unavailable until its provider setup is completed.
Automated validation does not create real reservations, invoices, charges or
client emails, and does not claim an end-to-end paid booking test. Any such
operational test must stay within the exact external actions authorized by Tay.

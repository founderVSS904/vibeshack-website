# Employee booking

Implementation updated September 28, 2026, checked against production commit
`f67aaaf`. Email/password sign-in and Continue with Google are live, with no
mandatory authenticator step. Payment choices, Mark as paid and the hourly
staff follow-ups shipped in that commit.

## Routes and behavior

- `/employee/`: email/password sign-in for registered team members, linked from
  the website footer. Google appears only when its provider is configured and
  `EMPLOYEE_GOOGLE_ENABLED=1`.
- `/employee/password/`: request a link to set a first password or reset an
  existing one. The response does not reveal whether an email has team access.
- `/employee/book/`: authenticated three-step booking flow: Session, Setup &
  extras, and Client & review. Staff never enter card details; step three
  asks how the booking will be paid (see Payment choices).
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
existing POST sign-out action. Sign-in remains a standalone screen outside the
team header, and public site navigation is unchanged. Account actions have
moved out of the workspace footer.

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

Unpaid bookings are never cancelled or released automatically. This is the
decided policy. Invoices request payment before the booked start time, but an
overdue invoice keeps the room. Staff get one reminder instead when an unpaid
booking starts within 48 hours.

## Payment choices

Step three (Client & review) has a Payment section. The server checks every
choice again.

| Choice | What happens | Shows as |
| --- | --- | --- |
| Send payment link (default) | The Stripe flow below: the client is emailed a hosted Stripe invoice. | Payment link sent |
| We'll bill them | No Stripe call and nothing sent to the client. | Awaiting payment |
| Already paid | Staff pick cash, Zelle, Venmo, card, bank transfer, check or other, plus an optional note of up to 200 characters. No Stripe call and nothing sent to the client. | Paid immediately, for example Paid in cash |
| No charge | Superadmin only; the server returns 403 for anyone else. No Stripe call and nothing sent to the client. The normal total is still recorded. | No charge |

The same payment label appears in the Calendar event title, the internal email
and the Bookings list.

**Mark as paid.** `POST /api/employee/bookings/paid`, offered on
`/employee/bookings/`, records a method and optional note for an unpaid Send
payment link or We'll bill them booking. Only the creator or the Superadmin
can use it. For a Stripe booking the server first marks the invoice paid out
of band in Stripe, so the client can no longer pay it online. If the client
already paid online, the booking shows Paid online and the chosen method is
not recorded. A repeat request reports that the booking was already paid. An
invoice that does not match needs administrator review in Stripe. A later
`invoice.paid` webhook never replaces a payment staff recorded. An invoice
marked paid directly in Stripe shows Paid (other) only if Stripe reports
`amount_paid` as 0; if it reports the full amount, it shows Paid online.
Which one Stripe reports is unverified (see the status at the end).

**Cancellation.** Cancelling releases the studio and equipment holds and
removes the room event.

- Send payment link: creator or Superadmin while unpaid; the invoice is
  voided first. Once paid, online or marked paid, review it in Stripe instead.
- We'll bill them: creator or Superadmin before payment, without Stripe. Once
  marked paid, Superadmin only.
- Already paid: Superadmin only. Any refund happens outside the website.
- No charge: creator or Superadmin.

**Internal email.** The New Booking email to `founder@vibeshackstudios.com`
goes when a booking becomes paid by any route: at creation for Already paid and
No charge, on Mark as paid, or when the Stripe webhook confirms payment. It
includes Booked by, the payment label, any payment note and, when someone other
than the creator recorded it, Marked paid by. Client emails are unchanged.

**Hourly follow-ups.** The hourly `/api/cron/booking-reminders/` job runs staff
follow-ups after the public reminders, only when `EMPLOYEE_BOOKING_ENABLED=1`:

- One reminder to the same internal address when an unpaid booking (Payment
  link sent or Awaiting payment) starts within 48 hours. It copies the creator
  while their team account is still active.
- A retry for paid bookings whose internal email did not go out, for up to
  seven days after payment.

Each run skips records changed in the last 10 minutes or held by a lease, and
sends at most 20 messages. The delivery ledger prevents repeats. A follow-up
failure never changes the public reminder response. Nothing is cancelled,
released or sent to a client by these follow-ups.

## Employee creator attribution

The booking creator comes from the authenticated Supabase user and current
active employee membership, never from the booking form. The stable user ID,
verified email and admin-maintained employee name are captured server-side.
The private booking record snapshots that name and the employee email when the
reservation is first created. Retries preserve the original creator even if
the account's display name changes later. Older sessions or profiles without a
name remain attributable by email; the system does not invent a name.

The private studio Calendar event shows `Booked by: Name (email)` from creation
onward, with no guest attendees or Calendar update emails. New named Send
payment link bookings also store `bookedByName` and `bookedByEmail` as internal
Stripe invoice metadata. These fields are excluded from invoice descriptions,
line items, booking API results and all client/guest email templates. Legacy
records retain their original invoice-creation parameters for safe idempotent
retries.

As Tay confirmed, the internal notification waits for payment. A dedicated New
Booking email goes only to the existing internal address,
`founder@vibeshackstudios.com`, once the booking is paid by any route (see
Payment choices), including the Booked by line. For a Stripe payment, a
signature-verified invoice webhook first retrieves and validates the invoice,
then the booking is marked paid and Calendar is updated. Apart from the 48-hour
unpaid reminder, no internal email is sent for an unpaid reservation or a
cancellation. Client invoice emails and the public checkout's confirmation,
prep and invited-guest emails stay unchanged. The preview never sends mail or
invents a signed-in employee.

The internal email uses the existing Gmail transport and durable message
delivery ledger. Verified rejections can retry; accepted messages are not
repeated. Ambiguous SMTP outcomes require inspection instead of blind resend.
On the webhook path, a notification failure returns a retryable webhook error
while retaining the paid reservation. Repeated webhooks resume notification
delivery without recreating the reservation/invoice or resending the client's
invoice email. When staff record the payment, a failed send is left for the
hourly follow-up instead.

## Accounts, roles and production activation

The current implementation uses Supabase Auth and PostgreSQL for staff access.
The old direct-Google allowlist and signed-session helpers remain only as legacy
code/test references. Production routes do not accept those cookies.

The migration seeds `founder@vibeshackstudios.com` as an invited Superadmin
without an Auth user ID. The founder can first visit `/employee/password/` to
receive a password setup link at that exact address, or use Google if its
verified Google identity has that exact email and the provider is configured.
An invitation is not an authenticated account: the confirmed email or OAuth
identity must pass the service-only acceptance function before the membership
becomes active and binds to a stable Auth user ID. Employees are invited from
`/employee/team/`; name and email are the only invitation inputs. They cannot
assign their own roles.

Every protected operation verifies the Supabase user and signed claims, then
reads the current membership from the database. Disabled accounts lose access
even with an existing valid session. Both employees and the Superadmin can sign
in with email/password or configured Google. No mandatory authenticator
enrollment or challenge follows sign-in. Server-side role checks, confirmed
email checks and the protected employee registry remain required for every
protected operation.

Invitation and password reset links are generated by Supabase Admin and sent
through the website's existing Gmail transport. No additional Supabase SMTP
configuration is required for these application routes. New invitations use
an `invite` token; an existing Auth identity uses a `recovery` token instead.
For a registered member without an Auth identity, a reset request can generate
an invitation so the initial password can be set. Invitation resends also lead
to password setup. Routine sign-in uses a password or Google, not a magic link;
previously issued email sign-in tokens remain supported for compatibility.

The confirmation GET displays new-password and confirmation fields for
`invite`/`recovery` tokens without consuming them. Its same-origin POST checks
the password fields, verifies the single-use token, accepts only an authorized
confirmed employee identity, then calls Supabase `updateUser` with the new
password in that same request. Successful setup enters the workspace; failed
setup does not retain an authenticated session. Old email tokens keep an
explicit Continue form. This avoids consuming tokens merely when an email
scanner opens the link. Tokens and passwords are never returned by team APIs
or written into audit records. Delivery acceptance is not described as inbox
delivery. Unknown/disabled reset requests return a generic response without
granting access. Database throttles serialize repeated recipient requests and
Superadmin invitation sends.

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
| `EMPLOYEE_GOOGLE_ENABLED` | `1` shows Continue with Google, as production does now; the prebuild check fails if it is set while the Supabase Google provider is unavailable |
| `EMPLOYEE_BOOKING_ENABLED` | `1` only after authentication and booking integrations are verified |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Existing website mail transport |
| `STRIPE_SECRET_KEY` | Existing server-side Stripe account used for employee customers, invoices and payment reconciliation |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the existing `/api/webhook/` endpoint |
| `GCAL_TOKEN_JSON` or `GCAL_TOKEN_B64` | Existing server-side Calendar credentials; configure one production credential source |
| `CRON_SECRET` | Existing secret that authorizes the hourly `/api/cron/booking-reminders/` job, which also runs the staff follow-ups |

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
The existing Calendar credentials remain separate. Configure short invitation
and recovery-token expiry and a suitable session lifetime. Keep the provider's
AAL1 session-duration limit off so a first-factor session does not expire
waiting for an authenticator challenge. The earlier mandatory Superadmin
authenticator step was removed in PR #34 (`/employee/security/` now redirects
to sign-in). The September 26 handoff records that the founder Auth account
had no MFA factors then, so none were removed. If a factor ever needs removal,
a trusted Supabase administrator does it; login code never removes factors. Google authentication may create an Auth
identity, but it grants no portal access without founder identity verification
or an invited membership.
Disable unused public authentication methods; never enable anonymous users
for the employee portal.

Production `npm run build` runs `scripts/verify-employee-config.mjs` first,
followed by `scripts/verify-employee-booking.ts`.
When Supabase variables are present, this performs read-only checks of the
service account's membership-table access, the shared request-limit store,
denied anonymous table access and Auth provider settings. It requires email
authentication, checks Google when the Google flag is enabled, and checks that
mail transport variables exist. The script prints no keys, tokens, employee
rows or email contents, and creates no records or messages. Partial or rejected
configuration fails the build, and so does a production build with no Supabase
configuration. Elsewhere, no Supabase configuration reports closed employee
access and per-instance request limits for the public booking and contact
routes.

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
confirm the webhook signing secret matches the endpoint, verify the provider's
AAL1 duration setting, prove password setup/sign-in, or prove a paid booking
end to end. Keep the existing verified
webhook signing secret when updating its event subscriptions.
`EMPLOYEE_BOOKING_ENABLED=1` requires working employee access and the booking
provider checks; Supabase setup alone does not activate those providers. Keep
`EMPLOYEE_LOCAL_PREVIEW` out of the production configuration.

The password and Google release is live: the production sign-in page shows
email/password fields and Continue with Google, and Tay confirmed the founder
portal password is set. No live end-to-end test of invitation or reset email
delivery has been run; each needs Tay's approval for that exact action.

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
Paid Stripe invoices still require a separate Stripe refund/cancellation
process. Payment choices lists who may cancel each kind of booking.

### Request limits

Request limits use the shared Supabase store
(`supabase/migrations/202609270002_request_rate_limits.sql`). Public
availability, add-on availability, tour availability, booking confirmation,
checkout create and cancel, contact and book-tour (IP and recipient caps)
opt into a local fallback. If the store is missing, errors, answers badly or
takes more than 2 seconds, those routes keep serving on this server instance's
own limit, skip the store for 30 seconds, then let one request probe it. A 429
from a working store is still final. During an outage each instance counts on
its own, so the overall cap is looser. Employee password sign-in, reset,
email-link and confirmation routes stay fail-closed: they return 503 when the
store cannot answer.

### Owner recovery

Before operational use, the verified project owner must retain secure recovery
access to the Supabase project and the founder email account. A forgotten
password can be reset through `/employee/password/` using the verified founder
inbox; configured Google sign-in must use the exact founder Google identity.
If account or inbox recovery requires administration, use trusted Supabase and
email-provider administrative access, preserve the existing stable Auth user
ID and Superadmin membership, and revoke sessions when compromise is suspected.
Any MFA factor cleanup also uses that trusted administrative path, never login
code. Never recover by accepting a client-supplied role, sharing an employee
session, or creating a public bypass.

### Booking provider readiness

The existing Stripe webhook at `/api/webhook/` has been configured to receive
`invoice.paid` and `invoice.voided` while retaining `checkout.session.completed`,
`checkout.session.expired` and its existing signing secret. Employee invoices
carry `source=vibeshack-employee-booking` and an exact
booking reference. Verified webhook signatures, retrieved invoice identity,
amount and currency are required before calendar reconciliation. No real
booking, charge, invitation or client email is part of automated validation.

References: [Supabase server authentication](https://supabase.com/docs/guides/auth/server-side/creating-a-client),
[Supabase password authentication](https://supabase.com/docs/guides/auth/passwords),
[Supabase password update](https://supabase.com/docs/reference/javascript/auth-updateuser),
[Stripe invoice finalization](https://docs.stripe.com/api/invoices/finalize).

## Reservation and payment lifecycle

Steps 4 to 6 apply only to Send payment link. The other payment choices never
call Stripe or email the client: after step 3 the booking is saved as Awaiting
payment, or as paid for Already paid and No charge, which sends the internal
email.

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
7. A verified payment webhook marks a Stripe booking Paid in Calendar; Mark as
   paid does the same for Send payment link and We'll bill them. No duplicate
   public booking event or customer checkout fulfillment is created.
8. Staff cancellation of a Stripe booking voids the unpaid invoice first, then
   removes the room event and releases room/equipment ledgers. Paid invoices
   cannot be cancelled by this endpoint. Voiding the invoice in Stripe also
   reconciles via webhook.

The employee page supports cancelling the unpaid reservation just created.
History is available at `/employee/bookings/`, with Mark as paid and Cancel
where the rules allow; in-place rescheduling remains outside this release.
Existing reservations can also be managed through Calendar and Stripe; void
the invoice in Stripe to release through the webhook. Do not delete only the
calendar event, because the resource ledger also needs release.

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

The sign-in screen at `/employee/` uses the approved red monogram, a black
background and labeled email/password fields. Continue with Google appears
when its provider flag is enabled or in the development preview. Forgot
password opens `/employee/password/` for first-time setup or password reset;
expired or invalid setup links display a friendly request-new-link notice.
Development preview sign-in and reset interactions make no authentication or
email requests and say that nothing was sent. `/employee/preview/team/` and
`/employee/preview/bookings/` allow safe review of invitations and history with
fictional data and the same production guards, including one row per payment
state with local Mark as paid and Cancel. No preview route is available in a
production build.

Automated tests exercise canonical prices, strict authentication, origin
protection, concurrent and repeated submissions, invoice/email failures,
late-retry protection, cancellation ordering, Stripe invoice parameters,
webhook reconciliation, room-only occupancy, turnaround, global teleprompter
inventory, payment choices, Mark as paid, cancellation per payment choice, the
hourly follow-ups, the public rate-limit fallback and preservation of public
checkout rules. Provider tests use in-memory fakes, not live services.

Status on September 28, 2026: email/password sign-in and Continue with Google
are live in production, with no mandatory authenticator step. Automated
validation does not create real reservations, invoices, charges or client
emails. These remain unverified live: invitation and reset email delivery, a
paid employee booking end to end, the internal New Booking email, and how
Stripe reports `amount_paid` for an invoice paid out of band on API version
`2026-02-25.clover` (the code accepts either 0 or the full amount, but only 0
labels a payment marked in the Stripe dashboard as Paid (other); confirm in
Stripe test mode). Any such operational test must stay within the exact
external actions authorized by Tay.

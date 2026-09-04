# Booking email delivery and recovery

The booking webhook stores independent delivery states for customer confirmation,
preparation, each team recipient, staff notification, and conflict alerts. State
lives in private transparent Google Calendar events on the hold calendar. These
system records have `source=vibeshack-message-delivery`, contain no email body or
recipient, and are dated January 1, 2020 so they do not clutter current bookings.

A completed customer confirmation still stamps `vbsConfirmationSentAt` in Stripe
for compatibility with the confirmation page. Completion of that message does
not prevent retrying a failed preparation, team, or staff message.

## Normal retry behavior

Concurrent webhook deliveries claim individual messages through an ETag update.
A successful message is marked `sent` and skipped by later webhook deliveries.
Explicit SMTP rejections and failures before the DATA phase are marked `failed`.
An incomplete mail sequence returns HTTP 500 so Stripe can retry only those
messages. Team recipients are sent individually to track each outcome.

Every message receives a stable Message-ID consisting of the first 40 hexadecimal
SHA-256 characters of its Stripe session ID, a period, its message key, and
`@vibeshackstudios.com`. Conflict alerts hash `attention:` plus the session ID.
A stable Message-ID helps lookup; it is not a provider guarantee of deduplication.

## Uncertain outcomes need operator review

SMTP cannot atomically commit delivery together with the Calendar record. A
connection failure during or after DATA, or a successful send whose state write
fails, might already have delivered mail. Such a message is `uncertain`, or remains
`sending` until its 15-minute lease expires and becomes `uncertain`. The webhook
returns HTTP 500 and does not automatically resend that message. Other messages
can still complete.

Recovery requires access to private provider data and external writes. Do not run
it as part of ordinary smoke tests or without authorization for that action.

1. Identify the affected Stripe session from the failed webhook, without copying
   customer details or credentials into a public issue or repository.
2. Locate the private state event. Its ID is `vbsm` plus the first 48 hexadecimal
   SHA-256 characters of the session ID. For a conflict alert, hash `attention:`
   plus that ID instead. Read only the record needed for this booking.
3. Confirm that the active invocation has stopped. Do not override an active
   `sending` lease.
4. Search the sending mailbox/provider delivery log for the stable Message-ID.
   Check the specific recipient's outcome when available. An absent Sent search
   result alone may be insufficient to prove nondelivery.
5. If delivery is confirmed, change only that message state to `sent`, retaining
   its attempt identity and a completion timestamp. If nondelivery is confirmed,
   change only that state to `failed`. Preserve all other messages and update the
   event with its current ETag through `If-Match`.
6. Replay the affected Stripe event once. Successful messages remain skipped;
   failed ones retry. Verify the webhook response and delivery state privately.
7. If the outcome cannot be established, contact the customer through the
   approved support process and decide whether a clearly identified replacement
   message is appropriate. Do not blindly clear the entire outbox.

## Legacy sessions

An old session with `vbsConfirmationSentAt` and no outbox keeps its old aggregate
completion semantics. It is not possible to infer which historical preparation
or team emails were skipped. Automatic resending would risk duplicates, so those
sessions require an explicit operator review when a missing message is reported.
Old incomplete sessions without the aggregate marker enter the new delivery flow.

Historical referral payout fields in Stripe are ignored. The website no longer
calculates, emits, or exposes compensation terms. This code change does not erase
historical provider records or modify earlier shared calendar invitations.

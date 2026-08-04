import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { releaseBookingHolds } from '@/lib/booking/calendar'
import {
  hasCompleteBookingCartMetadata,
  parseBookingCartItems,
} from '@/lib/booking/checkout-metadata'
import {
  isManagedCheckoutHold,
  reconcileCheckoutHold,
  watchdogAlertIsDue,
  watchdogAction,
} from '@/lib/booking/hold-watchdog'
import { getStripeClient } from '@/lib/booking/stripe'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const LOOKBACK_SECONDS = 72 * 60 * 60
const MAX_SESSIONS_PER_RUN = 500
const ALERT_COOLDOWN_MS = 6 * 60 * 60 * 1000
const ALERT_RESERVATION_COOLDOWN_MS = 30 * 60 * 1000
const CRON_INTERVAL_MINUTES = 10
const SCAN_ALERT_INTERVAL_MINUTES = 6 * 60

type WatchdogFailure = {
  sessionId: string
  bookingRef: string
  reason: string
  shouldAlert: boolean
}

type WatchdogStats = {
  scanned: number
  managed: number
  candidates: number
  released: number
  alreadyReleased: number
  protected: number
  active: number
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  return Boolean(secret) && req.headers.get('authorization') === `Bearer ${secret}`
}

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown reconciliation error'
  return message.replace(/[\r\n\t]+/g, ' ').slice(0, 400)
}

function alertIsDue(metadata: Stripe.Metadata | null) {
  return watchdogAlertIsDue(
    metadata,
    Date.now(),
    ALERT_COOLDOWN_MS,
    ALERT_RESERVATION_COOLDOWN_MS,
  )
}

function scanAlertIsDue(nowMs = Date.now()) {
  const currentMinute = Math.floor(nowMs / 60_000)
  return currentMinute % SCAN_ALERT_INTERVAL_MINUTES < CRON_INTERVAL_MINUTES
}

async function listRecentCheckoutSessions() {
  const stripe = getStripeClient()
  const sessions: Stripe.Checkout.Session[] = []
  const createdAfter = Math.floor(Date.now() / 1000) - LOOKBACK_SECONDS
  let startingAfter: string | undefined
  let truncated = false

  while (sessions.length < MAX_SESSIONS_PER_RUN) {
    const page = await stripe.checkout.sessions.list({
      created: { gte: createdAfter },
      limit: Math.min(100, MAX_SESSIONS_PER_RUN - sessions.length),
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })

    sessions.push(...page.data)
    if (!page.has_more || !page.data.length) break
    startingAfter = page.data[page.data.length - 1].id
    if (sessions.length >= MAX_SESSIONS_PER_RUN) truncated = true
  }

  return { sessions, truncated }
}

async function reconcileExpiredSession(
  listedSession: Stripe.Checkout.Session,
  stats: WatchdogStats,
) {
  const stripe = getStripeClient()
  const outcome = await reconcileCheckoutHold(listedSession.id, {
    retrieveSession: (sessionId) => stripe.checkout.sessions.retrieve(sessionId),
    expireSession: (sessionId) => stripe.checkout.sessions.expire(sessionId),
    parseCart: parseBookingCartItems,
    hasCompleteCart: hasCompleteBookingCartMetadata,
    releaseHolds: releaseBookingHolds,
    markReleased: async (sessionId, reconciledAt) => {
      await stripe.checkout.sessions.update(sessionId, {
        metadata: {
          vbsBookingHoldReleasedAt: reconciledAt,
          vbsWatchdogReconciledAt: reconciledAt,
          vbsWatchdogLastFailureAt: '',
          vbsWatchdogLastFailure: '',
        },
      })
    },
  })

  if (outcome === 'released') stats.released += 1
  else if (outcome === 'already-released') stats.alreadyReleased += 1
  else if (outcome === 'protected') stats.protected += 1
  else if (outcome === 'active') stats.active += 1
}

async function markFailure(failure: WatchdogFailure) {
  if (!failure.sessionId) return

  try {
    await getStripeClient().checkout.sessions.update(failure.sessionId, {
      metadata: {
        vbsWatchdogLastFailureAt: new Date().toISOString(),
        vbsWatchdogLastFailure: failure.reason,
      },
    })
  } catch (error) {
    console.error('Booking hold watchdog could not record a failure in Stripe:', {
      sessionId: failure.sessionId,
      error,
    })
  }
}

async function sendFailureAlert(failures: WatchdogFailure[], stats: WatchdogStats) {
  const globalFailures = failures.filter((failure) => (
    !failure.sessionId && failure.shouldAlert
  ))
  const sessionFailures = failures.filter((failure) => (
    failure.sessionId && failure.shouldAlert
  ))
  if (!globalFailures.length && !sessionFailures.length) return false

  const gmailUser = process.env.GMAIL_USER || 'founder@vibeshackstudios.com'
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  if (!gmailPass) throw new Error('GMAIL_APP_PASSWORD is not configured')

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  })
  const reservationTime = new Date()
  const reservationIso = reservationTime.toISOString()
  const reservedFailures: WatchdogFailure[] = [...globalFailures]
  const stripe = sessionFailures.length ? getStripeClient() : null

  // Reserve the cooldown in Stripe before sending. If email delivery succeeds
  // but the follow-up metadata write fails, this reservation still prevents
  // the same alert from being sent every ten minutes.
  for (const failure of sessionFailures) {
    try {
      const session = await stripe!.checkout.sessions.retrieve(failure.sessionId)
      if (!watchdogAlertIsDue(
        session.metadata,
        reservationTime.getTime(),
        ALERT_COOLDOWN_MS,
        ALERT_RESERVATION_COOLDOWN_MS,
      )) {
        continue
      }

      const reservedSession = await stripe!.checkout.sessions.update(failure.sessionId, {
        metadata: { vbsWatchdogAlertReservedAt: reservationIso },
      })
      if (reservedSession.metadata?.vbsWatchdogAlertReservedAt !== reservationIso) {
        throw new Error('Stripe did not persist the watchdog alert reservation')
      }
      reservedFailures.push(failure)
    } catch (error) {
      console.error('Booking hold watchdog could not reserve an alert cooldown:', {
        sessionId: failure.sessionId,
        error,
      })
    }
  }

  if (!reservedFailures.length) return false

  const rows = reservedFailures.map((failure) => (
    `Session: ${failure.sessionId}\n`
    + `Booking ref: ${failure.bookingRef || 'unknown'}\n`
    + `Reason: ${failure.reason}`
  )).join('\n\n')

  await transporter.sendMail({
    from: `"VibeShack Studios" <${gmailUser}>`,
    to: gmailUser,
    subject: `[ACTION NEEDED] Booking hold watchdog found ${reservedFailures.length} issue${reservedFailures.length === 1 ? '' : 's'}`,
    text: [
      'The booking hold watchdog found a checkout it could not safely reconcile.',
      'No paid or completed booking was released.',
      '',
      `Scanned: ${stats.scanned}`,
      `Released: ${stats.released}`,
      `Protected paid/completed: ${stats.protected}`,
      '',
      rows,
    ].join('\n'),
  })

  const alertedAt = new Date().toISOString()
  const sessionReservations = reservedFailures.filter((failure) => failure.sessionId)
  const markerResults = await Promise.allSettled(sessionReservations
    .map((failure) => stripe!.checkout.sessions.update(failure.sessionId, {
      metadata: {
        vbsWatchdogAlertedAt: alertedAt,
        vbsWatchdogAlertReservedAt: '',
      },
    })))
  markerResults.forEach((result, index) => {
    if (result.status === 'rejected') {
      // The reservation remains in Stripe if this write did not commit, so
      // the failure is logged without opening a repeat-email window.
      console.error('Booking hold watchdog could not finalize an alert marker:', {
        sessionId: sessionReservations[index].sessionId,
        error: result.reason,
      })
    }
  })

  return true
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stats: WatchdogStats = {
    scanned: 0,
    managed: 0,
    candidates: 0,
    released: 0,
    alreadyReleased: 0,
    protected: 0,
    active: 0,
  }
  const failures: WatchdogFailure[] = []

  try {
    const { sessions, truncated } = await listRecentCheckoutSessions()
    stats.scanned = sessions.length
    stats.managed = sessions.filter(isManagedCheckoutHold).length
    const candidates = sessions.filter((session) => (
      ['expire', 'release'].includes(watchdogAction(session))
    ))
    stats.candidates = candidates.length

    for (const listedSession of candidates) {
      try {
        await reconcileExpiredSession(listedSession, stats)
      } catch (error) {
        const metadata = listedSession.metadata || {}
        const failure = {
          sessionId: listedSession.id,
          bookingRef: metadata.bookingRef || '',
          reason: errorMessage(error),
          shouldAlert: alertIsDue(metadata),
        }
        failures.push(failure)
        await markFailure(failure)
        console.error('Booking hold watchdog reconciliation failed:', failure)
      }
    }

    if (truncated) {
      failures.push({
        sessionId: '',
        bookingRef: '',
        reason: `Stripe scan reached the ${MAX_SESSIONS_PER_RUN}-session safety limit`,
        // This cron runs every ten minutes. A fixed six-hour alert window is
        // stable across serverless instances and avoids an email every run
        // without requiring a separate database solely for alert state.
        shouldAlert: scanAlertIsDue(),
      })
    }

    let alertSent = false
    let alertError = ''
    if (failures.length) {
      try {
        alertSent = await sendFailureAlert(failures, stats)
      } catch (error) {
        alertError = errorMessage(error)
        console.error('Booking hold watchdog alert failed:', error)
      }
    }

    const failed = failures.length > 0
    return NextResponse.json({
      ok: !failed,
      ...stats,
      failures: failures.length,
      alertSent,
      alertDeferred: failures.some((failure) => !failure.shouldAlert),
      ...(alertError ? { alertError } : {}),
    }, {
      status: failed ? 500 : 200,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('Booking hold watchdog scan failed:', error)
    const failure: WatchdogFailure = {
      sessionId: '',
      bookingRef: '',
      reason: errorMessage(error),
      shouldAlert: scanAlertIsDue(),
    }
    let alertSent = false
    let alertError = ''
    try {
      alertSent = await sendFailureAlert([failure], stats)
    } catch (sendError) {
      alertError = errorMessage(sendError)
      console.error('Booking hold watchdog scan alert failed:', sendError)
    }
    return NextResponse.json({
      ok: false,
      error: 'Booking hold reconciliation could not run',
      alertSent,
      alertDeferred: !failure.shouldAlert,
      ...(alertError ? { alertError } : {}),
    }, {
      status: 500,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}

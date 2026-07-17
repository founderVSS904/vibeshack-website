import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { addBookingEvents, assertCartSlotsAvailable, hasBookingEventsForRef, type BookingCartItem } from '@/lib/booking/calendar'
import { getStudioById } from '@/lib/booking/catalog'
import { buildReferralInfo, formatMoneyFromCents, type ReferralInfo } from '@/lib/booking/referrals'
import { addHours, describeSlotRanges, formatDateForDisplay, isValidBookingDate, slotIsoSetForDate } from '@/lib/booking/time'
import { escapeHtml, isEmail, parseEmailList, stripControlChars } from '@/lib/server/sanitize'
import { siteUrl } from '@/lib/seo/site'

function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(secret, { apiVersion: '2026-02-25.clover' })
}

function parseCartItems(metadata: Record<string, string>) {
  const items: BookingCartItem[] = []
  const totalSessions = Number.parseInt(metadata.totalSessions || '0', 10)
  const limit = Number.isFinite(totalSessions) && totalSessions > 0 ? totalSessions : 20

  for (let i = 0; i < Math.min(limit, 20); i++) {
    const raw = metadata[`cart_${i}`]
    if (!raw) break
    try {
      const compact = JSON.parse(raw)
      // Current format stores the first slot plus hour offsets so long sessions
      // fit in Stripe's 500-char metadata cap; older sessions carry full slot
      // arrays. Every reconstructed slot is re-validated against the booking
      // date in validateCompletedSession.
      let slots: string[] = []
      if (typeof compact.t0 === 'string' && Array.isArray(compact.off)) {
        const baseMs = Date.parse(compact.t0)
        if (Number.isFinite(baseMs)) {
          slots = compact.off
            .filter((offset: unknown): offset is number => Number.isInteger(offset) && (offset as number) >= 0 && (offset as number) < 48)
            .map((offset: number) => new Date(baseMs + offset * 3600000).toISOString())
        }
      } else if (Array.isArray(compact.s ?? compact.slots)) {
        slots = compact.s ?? compact.slots
      }

      const studioId = stripControlChars(compact.id ?? compact.studioId, 80)
      items.push({
        studioId,
        studioName: stripControlChars(compact.n ?? compact.studioName, 120) || getStudioById(studioId)?.name || '',
        date: stripControlChars(compact.d ?? compact.date, 20),
        slots: slots.map((slot: unknown) => stripControlChars(slot, 40)).filter(Boolean),
        hours: Number(compact.h ?? compact.hours ?? slots.length),
        price: Number(compact.p ?? compact.price ?? 0),
      })
    } catch (error) {
      console.error('Failed to parse cart metadata item:', error)
    }
  }

  if (!items.length && metadata.cartJson) {
    try {
      const legacy = JSON.parse(metadata.cartJson)
      if (Array.isArray(legacy)) {
        for (const item of legacy.slice(0, 20)) {
          items.push({
            studioId: stripControlChars(item.studioId, 80),
            studioName: stripControlChars(item.studioName, 120),
            date: stripControlChars(item.date, 20),
            slots: Array.isArray(item.slots) ? item.slots.map((slot: unknown) => stripControlChars(slot, 40)).filter(Boolean) : [],
            hours: Number(item.hours || item.slots?.length || 1),
            price: Number(item.price || 0),
          })
        }
      }
    } catch (error) {
      console.error('Failed to parse legacy cart metadata:', error)
    }
  }

  return items.filter((item) => item.studioName && item.date && item.slots.length)
}

function parseReferralInfo(metadata: Record<string, string>, amountTotal: number): ReferralInfo | null {
  const referral = buildReferralInfo(metadata.referralSource, amountTotal)
  if (!referral) return null

  const metadataCommission = Number.parseInt(metadata.referralCommissionCents || '', 10)
  const metadataRate = Number.parseFloat(metadata.referralCommissionRate || '')

  return {
    ...referral,
    partnerName: stripControlChars(metadata.referralPartner || referral.partnerName, 120),
    commissionRate: Number.isFinite(metadataRate) && metadataRate > 0 ? metadataRate : referral.commissionRate,
    commissionCents: Number.isFinite(metadataCommission) && metadataCommission >= 0
      ? metadataCommission
      : referral.commissionCents,
  }
}

function validateCompletedSession(
  session: Stripe.Checkout.Session,
  cartItems: BookingCartItem[],
  customerEmail: string,
  metadata: Record<string, string>,
) {
  if (session.payment_status !== 'paid') {
    return { ok: false, status: 200, error: `Checkout session is not paid: ${session.payment_status}` }
  }

  if (!isEmail(customerEmail)) {
    return { ok: false, status: 400, error: 'Checkout session is missing a valid customer email' }
  }

  const expectedTotalCents = Number.parseInt(metadata.computedTotalCents || '', 10)
  if (!Number.isFinite(expectedTotalCents) || expectedTotalCents <= 0) {
    return { ok: false, status: 400, error: 'Checkout session is missing server-computed total metadata' }
  }

  if (typeof session.amount_total !== 'number' || session.amount_total !== expectedTotalCents) {
    return { ok: false, status: 400, error: 'Checkout amount did not match server-computed metadata' }
  }

  const seenSlots = new Set<string>()
  for (const item of cartItems) {
    const studio = getStudioById(item.studioId)
    if (!studio) return { ok: false, status: 400, error: 'Checkout session contains an invalid studio' }
    if (!isValidBookingDate(item.date)) return { ok: false, status: 400, error: 'Checkout session contains an invalid date' }
    if (!Array.isArray(item.slots) || item.slots.length < 1 || item.slots.length > 24) {
      return { ok: false, status: 400, error: 'Checkout session contains invalid slot count' }
    }

    const validSlots = slotIsoSetForDate(item.date)
    for (const slot of item.slots) {
      if (!validSlots.has(slot)) {
        return { ok: false, status: 400, error: 'Checkout session contains a slot outside the booked date' }
      }

      const key = `${item.studioId}|${item.date}|${slot}`
      if (seenSlots.has(key)) {
        return { ok: false, status: 400, error: 'Checkout session contains duplicate slots' }
      }
      seenSlots.add(key)
    }

    item.studioName = studio.name
    item.hours = item.slots.length
    item.price = studio.price * item.slots.length
  }

  return { ok: true, status: 200, error: '' }
}

function attributionHtml(metadata: Record<string, string>) {
  const rows = [
    ['Source', metadata.trackingSource],
    ['Medium', metadata.trackingMedium],
    ['Campaign', metadata.trackingCampaign],
    ['Content', metadata.trackingContent],
    ['Term', metadata.trackingTerm],
    ['Landing path', metadata.trackingLandingPath],
    ['Referrer', metadata.trackingReferrer],
    ['Click ID', metadata.trackingClickId],
    ['Captured at', metadata.trackingCapturedAt],
  ].filter(([, value]) => value)

  if (!rows.length) return ''

  return `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin:24px 0;color:#111;">
        <p style="font-weight:900;font-size:14px;margin:0 0 8px;">Booking attribution</p>
        <p style="font-size:14px;line-height:1.7;margin:0;">
          ${rows.map(([label, value]) => `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}<br>`).join('')}
        </p>
      </div>`
}

async function getStripeReceiptUrl(session: Stripe.Checkout.Session) {
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id

  if (!paymentIntentId) return ''

  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge'],
    })
    const charge = paymentIntent.latest_charge

    if (charge && typeof charge !== 'string') {
      return charge.receipt_url || ''
    }
  } catch (error) {
    console.error('Stripe receipt lookup failed:', error)
  }

  return ''
}

async function getCurrentSessionMetadata(session: Stripe.Checkout.Session) {
  try {
    const currentSession = await getStripe().checkout.sessions.retrieve(session.id)
    return (currentSession.metadata || {}) as Record<string, string>
  } catch (error) {
    console.error('Stripe session metadata lookup failed:', error)
    return (session.metadata || {}) as Record<string, string>
  }
}

async function markSessionFulfillmentStep(sessionId: string, key: string) {
  await getStripe().checkout.sessions.update(sessionId, {
    metadata: {
      [key]: new Date().toISOString(),
    },
  })
}

function emailLogoHtml() {
  return `
    <a href="${siteUrl}" style="display:inline-block;color:#ef1100;text-decoration:none;font-size:20px;font-weight:950;letter-spacing:-0.055em;line-height:1;">
      VibeShack Studios
    </a>`
}

function getPrepBlocks(cartItems: BookingCartItem[]) {
  const seen = new Set<string>()

  return cartItems.flatMap((item) => {
    const key = item.studioId || item.studioName
    if (seen.has(key)) return []
    seen.add(key)

    const studio = getStudioById(item.studioId)
    return [{
      studioName: item.studioName,
      prep: studio?.prep?.length ? studio.prep : [
        'Bring your shot list, script, talking points, or creative brief so the session has a clear target.',
        'Confirm guests, crew, wardrobe, products, props, and file backups before arrival.',
        'Send any brand direction, reference images, or special setup notes before your session if possible.',
      ],
    }]
  })
}

function buildPrepEmailHtml(cartItems: BookingCartItem[], customer: { name: string; email: string; phone: string }) {
  const firstName = escapeHtml(customer.name.split(' ')[0] || customer.name)
  const sessionRows = cartItems.map((item) => {
    const dateStr = formatDateForDisplay(item.date)
    const slotRanges = describeSlotRanges(item.slots)

    return `
      <tr>
        <td style="padding:18px 0;border-top:1px solid #e5e7eb;">
          <p style="color:#111827;font-size:16px;font-weight:900;margin:0 0 6px;">${escapeHtml(item.studioName)}</p>
          <p style="color:#4b5563;font-size:14px;line-height:1.65;margin:0;">${escapeHtml(dateStr)}<br>${escapeHtml(slotRanges)} PT</p>
        </td>
        <td align="right" style="padding:18px 0;border-top:1px solid #e5e7eb;color:#111827;font-size:14px;font-weight:800;vertical-align:top;white-space:nowrap;">
          ${escapeHtml(String(item.hours))} hr${item.hours === 1 ? '' : 's'}
        </td>
      </tr>`
  }).join('')

  const prepBlocks = getPrepBlocks(cartItems).map((block, index) => `
    <div style="background:#0b0b0b;border:1px solid #232323;border-radius:18px;padding:22px;margin:0 0 14px;">
      <p style="color:#ff2b1c;font-size:11px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;margin:0 0 12px;">${String(index + 1).padStart(2, '0')} / ${escapeHtml(block.studioName)}</p>
      <ul style="padding-left:18px;margin:0;color:#d8dde7;font-size:14px;line-height:1.75;">
        ${block.prep.map((tip) => `<li style="margin:0 0 9px;">${escapeHtml(tip)}</li>`).join('')}
      </ul>
    </div>`).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#050505;color:#fff;margin:0;padding:0;">
  <div style="display:none;max-height:0;overflow:hidden;color:#050505;">A short preparation note for your upcoming VibeShack Studios session.</div>
  <div style="max-width:660px;margin:0 auto;padding:36px 22px 48px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 26px;">
      <tr>
        <td style="vertical-align:middle;">${emailLogoHtml()}</td>
        <td align="right" style="vertical-align:middle;color:#6b7280;font-size:12px;line-height:1.55;">
          <span style="color:#f3f4f6;font-weight:800;">Booking Preparation</span><br>
          San Francisco / 950 Battery St
        </td>
      </tr>
    </table>

    <div style="background:#0c0c0c;border:1px solid #1f1f1f;border-radius:28px;padding:32px;margin:0 0 18px;">
      <p style="display:inline-block;border:1px solid #333;color:#aeb6c5;font-size:11px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;margin:0 0 18px;padding:8px 10px;">Session prep</p>
      <h1 style="font-size:38px;font-weight:950;letter-spacing:-0.045em;line-height:1.02;margin:0 0 16px;color:#fff;">Your session is confirmed. Here&apos;s how to arrive ready.</h1>
      <p style="color:#aeb6c5;font-size:16px;line-height:1.7;margin:0;">${firstName}, this is your production prep note. It keeps the day focused: what to bring, what the room needs, and how to help the team start on time.</p>
    </div>

    <div style="background:#fff;color:#111827;border-radius:24px;padding:26px;margin:18px 0 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:0 0 14px;">
            <p style="font-size:11px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;color:#ef1100;margin:0 0 8px;">Confirmed session</p>
            <p style="font-size:24px;font-weight:950;letter-spacing:-0.035em;line-height:1.1;margin:0;color:#111827;">Your studio time</p>
          </td>
        </tr>
        ${sessionRows}
      </table>
    </div>

    <div style="margin:0 0 28px;">
      <p style="font-size:12px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;margin:0 0 10px;">Room-specific notes</p>
      <h2 style="font-size:28px;font-weight:950;letter-spacing:-0.04em;line-height:1.05;margin:0 0 18px;color:#fff;">Details that protect the shoot.</h2>
      ${prepBlocks}
    </div>

    <div style="background:#111;border:1px solid #252525;border-radius:22px;padding:24px;margin:0 0 18px;">
      <p style="font-size:12px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;margin:0 0 16px;">Production checklist</p>
      <p style="font-size:15px;line-height:1.7;color:#e5e7eb;margin:0 0 14px;"><strong style="color:#fff;">Arrive 10 minutes early.</strong> That gives the team time to get you settled without taking time from the session.</p>
      <p style="font-size:15px;line-height:1.7;color:#e5e7eb;margin:0 0 14px;"><strong style="color:#fff;">Bring the assets.</strong> Scripts, shot lists, products, wardrobe, props, slides, logo files, reference images, and backup drives all help the room move faster.</p>
      <p style="font-size:15px;line-height:1.7;color:#e5e7eb;margin:0;"><strong style="color:#fff;">Know the deliverables.</strong> Full episodes, clips, headshots, product stills, vertical edits, thumbnails, campaign assets: the clearer the target, the better the session.</p>
    </div>

    <div style="background:#080808;border:1px solid #202020;border-radius:22px;padding:24px;margin:0 0 24px;">
      <p style="color:#fff;font-size:16px;font-weight:900;margin:0 0 10px;">VibeShack Studios</p>
      <p style="color:#aeb6c5;font-size:14px;line-height:1.7;margin:0;">950 Battery St, San Francisco, CA 94111<br>Northern Waterfront<br>Open 24/7</p>
      <p style="color:#6b7280;font-size:13px;line-height:1.7;margin:16px 0 0;">Street parking is usually the simplest option. If guests, crew, or setup notes change before the session, reply to this email and we will route it to the team.</p>
    </div>

    <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 26px;">Questions or setup notes? Reply to this email or reach us at <a href="mailto:founder@vibeshackstudios.com" style="color:#ff2b1c;text-decoration:none;font-weight:800;">founder@vibeshackstudios.com</a>.</p>
    <div style="border-top:1px solid #111;padding-top:22px;color:#444;font-size:12px;line-height:1.8;">
      <p style="margin:0 0 4px;">Free cancellation up to 48 hours before your session.</p>
      <p style="margin:0;">VibeShack Studios - San Francisco</p>
    </div>
  </div>
</body>
</html>`
}

async function sendDoubleBookingAlert(
  cartItems: BookingCartItem[],
  customer: { name: string; email: string; phone: string },
  bookingRef: string,
  reason: string,
  calendarInserted: boolean,
) {
  const gmailUser = process.env.GMAIL_USER || 'founder@vibeshackstudios.com'
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  if (!gmailPass) throw new Error('GMAIL_APP_PASSWORD is not configured')

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  })

  const sessionRows = cartItems
    .map((item) => `<li style="margin:0 0 6px;">${escapeHtml(item.studioName)} on ${escapeHtml(formatDateForDisplay(item.date))}: ${escapeHtml(describeSlotRanges(item.slots))}</li>`)
    .join('')

  await transporter.sendMail({
    from: `VibeShack Studios <${gmailUser}>`,
    to: gmailUser,
    subject: `[ACTION NEEDED] Possible double booking - ${bookingRef}`,
    html: `
      <h2 style="margin:0 0 12px;">Possible double booking</h2>
      <p style="margin:0 0 12px;">A completed payment overlaps a slot that is no longer free. ${calendarInserted ? 'The booking was still added to the calendar.' : 'The calendar insert failed on this attempt; the webhook will retry it.'} Review the overlap and contact the customer to resolve it.</p>
      <p style="margin:0 0 12px;"><strong>Reason:</strong> ${escapeHtml(reason)}</p>
      <p style="margin:0 0 12px;">
        <strong>Booking ref:</strong> ${escapeHtml(bookingRef)}<br>
        <strong>Customer:</strong> ${escapeHtml(customer.name)} (${escapeHtml(customer.email)}${customer.phone ? `, ${escapeHtml(customer.phone)}` : ''})
      </p>
      <ul style="margin:0;padding-left:18px;">${sessionRows}</ul>
    `,
  })
}

async function sendConfirmationEmail(
  cartItems: BookingCartItem[],
  customer: { name: string; email: string; phone: string },
  amountTotal: number,
  teamEmails: string[],
  referralInfo: ReferralInfo | null,
  attributionDetails = '',
  receiptUrl = '',
) {
  const gmailUser = process.env.GMAIL_USER || 'founder@vibeshackstudios.com'
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  if (!gmailPass) throw new Error('GMAIL_APP_PASSWORD is not configured')

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  })
  const criticalFailures: string[] = []
  const sendMail = async (
    label: string,
    mailOptions: Parameters<typeof transporter.sendMail>[0],
    critical = false,
  ) => {
    try {
      await transporter.sendMail(mailOptions)
    } catch (error) {
      console.error(`${label} email failed:`, error)
      if (critical) criticalFailures.push(label)
    }
  }

  const firstName = escapeHtml(customer.name.split(' ')[0] || customer.name)
  const subjectStudio = cartItems.length === 1 ? cartItems[0].studioName : `${cartItems.length} Studios`
  const firstDate = formatDateForDisplay(cartItems[0].date).replace(/^\w+,\s*/, '')
  const totalFormatted = `$${(amountTotal / 100).toFixed(2)}`
  const internalSubjectPrefix = referralInfo ? `[${referralInfo.partnerName}] ` : ''
  const receiptHtml = receiptUrl ? `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;margin:28px 0;color:#111;">
      <p style="font-size:12px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin:0 0 8px;">Stripe receipt</p>
      <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 18px;">Stripe will also send the official payment receipt to ${escapeHtml(customer.email)}. You can view it anytime here:</p>
      <a href="${escapeHtml(receiptUrl)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;border-radius:999px;padding:12px 18px;font-size:13px;font-weight:800;">View Stripe receipt</a>
    </div>` : `
    <div style="background:#0a0a0a;border:1px solid #222;border-radius:14px;padding:18px;margin:28px 0;color:#fff;">
      <p style="font-size:13px;line-height:1.7;color:#999;margin:0;">Stripe will also send the official payment receipt to ${escapeHtml(customer.email)}.</p>
    </div>`
  const referralHtml = referralInfo ? `
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:18px;margin:24px 0;color:#111;">
        <p style="font-weight:900;font-size:14px;margin:0 0 8px;">Partner referral</p>
        <p style="font-size:14px;line-height:1.7;margin:0;">
          <strong>Partner:</strong> ${escapeHtml(referralInfo.partnerName)}<br>
          <strong>Source:</strong> ${escapeHtml(referralInfo.source)}<br>
          <strong>Commission:</strong> ${escapeHtml(formatMoneyFromCents(referralInfo.commissionCents))} (${escapeHtml(String(Math.round(referralInfo.commissionRate * 100)))}%)
        </p>
      </div>` : ''

  const bookingRows = cartItems.map((item) => {
    const dateStr = formatDateForDisplay(item.date)
    const slotRanges = describeSlotRanges(item.slots)
    return `
      <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #222;">
        <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:12px;">
          <div>
            <p style="color:#fff;font-weight:900;font-size:16px;margin:0 0 4px;">${escapeHtml(item.studioName)}</p>
            <p style="color:#e11d48;font-size:12px;margin:0;text-transform:uppercase;letter-spacing:0.1em;">VibeShack Studios</p>
          </div>
          <span style="color:#fff;font-weight:900;font-size:18px;">$${escapeHtml(item.price)}</span>
        </div>
        <div style="border-top:1px solid #222;padding-top:12px;">
          <p style="color:#fff;font-size:13px;font-weight:600;margin:0 0 8px;">${escapeHtml(dateStr)}</p>
          <p style="color:#999;font-size:13px;margin:0 0 8px;">${escapeHtml(slotRanges)} PT</p>
          <p style="color:#666;font-size:13px;margin:0;">${escapeHtml(item.hours)} hour${item.hours === 1 ? '' : 's'}</p>
        </div>
      </div>`
  }).join('')
  const teamBookingRows = cartItems.map((item) => {
    const dateStr = formatDateForDisplay(item.date)
    const slotRanges = describeSlotRanges(item.slots)
    return `
      <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #222;">
        <p style="color:#fff;font-weight:900;font-size:16px;margin:0 0 4px;">${escapeHtml(item.studioName)}</p>
        <p style="color:#e11d48;font-size:12px;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.1em;">VibeShack Studios</p>
        <div style="border-top:1px solid #222;padding-top:12px;">
          <p style="color:#fff;font-size:13px;font-weight:600;margin:0 0 8px;">${escapeHtml(dateStr)}</p>
          <p style="color:#999;font-size:13px;margin:0 0 8px;">${escapeHtml(slotRanges)} PT</p>
          <p style="color:#666;font-size:13px;margin:0;">${escapeHtml(item.hours)} hour${item.hours === 1 ? '' : 's'}</p>
        </div>
      </div>`
  }).join('')

  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#000;color:#fff;margin:0;padding:0;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="border-bottom:1px solid #222;padding-bottom:28px;margin-bottom:32px;">
      <div style="margin:0 0 24px;">${emailLogoHtml()}</div>
      <h1 style="font-size:36px;font-weight:900;letter-spacing:-0.04em;margin:0 0 8px;line-height:1.1;">You're booked.</h1>
      <p style="color:#666;font-size:15px;margin:0;">See you at the studio, ${firstName}.</p>
    </div>
    ${bookingRows}
    <div style="display:flex;justify-content:space-between;padding:16px 20px;background:#0a0a0a;border:1px solid #222;border-radius:8px;margin:32px 0;">
      <span style="color:#fff;font-weight:700;font-size:15px;">Total Paid</span>
      <span style="color:#fff;font-weight:900;font-size:20px;">${escapeHtml(totalFormatted)}</span>
    </div>
    ${receiptHtml}
    <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:32px;border:1px solid #222;">
      <p style="color:#fff;font-weight:700;margin:0 0 8px;">VibeShack Studios</p>
      <p style="color:#999;font-size:14px;margin:0 0 4px;">950 Battery St, San Francisco, CA 94111</p>
      <p style="color:#555;font-size:13px;margin:0;">Northern Waterfront - Open 24/7</p>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.7;margin-bottom:32px;">Questions? Reply to this email or reach us at <a href="mailto:founder@vibeshackstudios.com" style="color:#e11d48;text-decoration:none;">founder@vibeshackstudios.com</a></p>
    <div style="border-top:1px solid #111;padding-top:24px;color:#333;font-size:12px;line-height:1.8;">
      <p style="margin:0 0 4px;">Free cancellation up to 48 hours before your session.</p>
      <p style="margin:0;">VibeShack Studios - San Francisco</p>
    </div>
  </div>
</body>
</html>`

  const internalHtml = cartItems.map((item) => {
    const dateStr = formatDateForDisplay(item.date)
    const start = new Date(item.slots[0])
    const end = addHours(new Date(item.slots[item.slots.length - 1]), 1)
    return `<li><strong>${escapeHtml(item.studioName)}</strong> - ${escapeHtml(dateStr)} - ${escapeHtml(start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' }))}-${escapeHtml(end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' }))} PT - $${escapeHtml(item.price)}</li>`
  }).join('')
  const prepEmailHtml = buildPrepEmailHtml(cartItems, customer)

  await sendMail('Booking confirmation', {
    from: `"VibeShack Studios" <${gmailUser}>`,
    to: customer.email,
    subject: `You're booked - ${subjectStudio} - ${firstDate}`,
    html: emailHtml,
  }, true)

  await sendMail('Session prep', {
    from: `"VibeShack Studios" <${gmailUser}>`,
    to: customer.email,
    subject: `Session prep - ${subjectStudio} - ${firstDate}`,
    html: prepEmailHtml,
  })

  if (teamEmails.length) {
    await sendMail('Team session details', {
      from: `"VibeShack Studios" <${gmailUser}>`,
      to: teamEmails,
      subject: `Session details - ${subjectStudio} - ${firstDate}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#000;color:#fff;margin:0;padding:0;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="border-bottom:1px solid #222;padding-bottom:28px;margin-bottom:32px;">
      <div style="margin:0 0 24px;">${emailLogoHtml()}</div>
      <h1 style="font-size:34px;font-weight:900;letter-spacing:-0.04em;margin:0 0 8px;line-height:1.1;">Session details.</h1>
      <p style="color:#666;font-size:15px;line-height:1.7;margin:0;">${escapeHtml(customer.name)} added you to a VibeShack Studios booking.</p>
    </div>
    ${teamBookingRows}
    <div style="background:#111;border-radius:12px;padding:20px;margin:32px 0;border:1px solid #222;">
      <p style="color:#fff;font-weight:700;margin:0 0 8px;">VibeShack Studios</p>
      <p style="color:#999;font-size:14px;margin:0 0 4px;">950 Battery St, San Francisco, CA 94111</p>
      <p style="color:#555;font-size:13px;margin:0;">Northern Waterfront - Open 24/7</p>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.7;margin-bottom:32px;">Questions? Reply to this email or reach us at <a href="mailto:founder@vibeshackstudios.com" style="color:#e11d48;text-decoration:none;">founder@vibeshackstudios.com</a></p>
    <div style="border-top:1px solid #111;padding-top:24px;color:#333;font-size:12px;line-height:1.8;">
      <p style="margin:0;">VibeShack Studios - San Francisco</p>
    </div>
  </div>
</body>
</html>`,
    })
  }

  await sendMail('Internal booking', {
    from: `"VibeShack Booking" <${gmailUser}>`,
    to: 'founder@vibeshackstudios.com',
    subject: `${internalSubjectPrefix}New Booking: ${customer.name} - ${subjectStudio} - ${firstDate}`,
    html: `
      <p><strong>New booking received.</strong></p>
      <p>
        <strong>Client:</strong> ${escapeHtml(customer.name)}<br>
        <strong>Email:</strong> ${escapeHtml(customer.email)}<br>
        <strong>Phone:</strong> ${escapeHtml(customer.phone || 'N/A')}<br>
        <strong>Team confirmations:</strong> ${escapeHtml(teamEmails.join(', ') || 'none')}<br>
        <strong>Total:</strong> ${escapeHtml(totalFormatted)}
      </p>
      ${receiptUrl ? `<p><strong>Stripe receipt:</strong> <a href="${escapeHtml(receiptUrl)}">${escapeHtml(receiptUrl)}</a></p>` : ''}
      ${referralHtml}
      ${attributionDetails}
      <ul style="line-height:2;">${internalHtml}</ul>
    `,
  }, true)

  if (criticalFailures.length) {
    throw new Error(`Critical booking emails failed: ${criticalFailures.join(', ')}`)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: 'Webhook signature required' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Stripe webhook signature failed:', error)
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = (session.metadata || {}) as Record<string, string>
    const cartItems = parseCartItems(metadata)

    // Sessions this site did not create (payment links, dashboard sales) carry
    // no bookingRef and have nothing to fulfill; unpaid sessions are handled by
    // validateCompletedSession. Both get acknowledged, never retried.
    const isPaidWebsiteBooking = session.payment_status === 'paid' && Boolean(metadata.bookingRef)
    const expectedSessions = Number.parseInt(metadata.totalSessions || '0', 10)
    const cartIncomplete = !cartItems.length
      || (Number.isFinite(expectedSessions) && expectedSessions > 0 && cartItems.length !== expectedSessions)

    if (cartIncomplete) {
      if (!isPaidWebsiteBooking) {
        return NextResponse.json({ received: true })
      }
      // A paid website booking with a missing or partially parsed cart must not
      // be acknowledged, or it silently vanishes (or fulfills only part of what
      // the customer paid for). A 5xx keeps Stripe retrying and flags the
      // endpoint as failing in the dashboard so a human investigates.
      console.error('Cart metadata missing or incomplete for paid booking', {
        sessionId: session.id,
        eventId: event.id,
        bookingRef: metadata.bookingRef,
        parsedItems: cartItems.length,
        expectedSessions,
      })
      return NextResponse.json({ error: 'Cart metadata missing or incomplete' }, { status: 500 })
    }

    const customer = {
      name: stripControlChars(metadata.customerName || 'Guest', 120),
      email: stripControlChars(metadata.customerEmail || session.customer_email || '', 254).toLowerCase(),
      phone: stripControlChars(metadata.customerPhone || '', 40),
    }

    const validation = validateCompletedSession(session, cartItems, customer.email, metadata)
    if (!validation.ok) {
      console.error('Rejected checkout webhook:', validation.error, {
        sessionId: session.id,
        eventId: event.id,
        bookingRef: metadata.bookingRef,
      })
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }

    let teamEmails: string[] = []
    try {
      teamEmails = parseEmailList(JSON.parse(metadata.teamEmails || '[]'), 10)
    } catch {
      teamEmails = []
    }

    const referralInfo = parseReferralInfo(metadata, session.amount_total || 0)
    const attributionDetails = attributionHtml(metadata)
    const receiptUrl = await getStripeReceiptUrl(session)
    const currentMetadata = await getCurrentSessionMetadata(session)
    const bookingRef = metadata.bookingRef || session.id
    const fulfillmentErrors: string[] = []

    if (!currentMetadata.vbsCalendarSyncedAt) {
      // Availability was checked when the checkout session was created, but a
      // competing payment can land in between. The customer has already paid,
      // so a conflict here never blocks fulfillment; it alerts the team to
      // resolve the overlap by hand. Two false-positive guards: skip the check
      // when this booking's own events already exist (a retry after a partial
      // failure would see them as conflicts), and only re-check slots that have
      // not started yet (getAvailabilityForDate marks past-start slots
      // unavailable even when nothing is booked).
      let conflictReason = ''
      try {
        const alreadyInserted = await hasBookingEventsForRef(bookingRef, cartItems.map((item) => item.studioId))
        const futureCart = cartItems
          .map((item) => ({ ...item, slots: item.slots.filter((slot) => Date.parse(slot) > Date.now()) }))
          .filter((item) => item.slots.length)
        if (!alreadyInserted && futureCart.length) {
          const availability = await assertCartSlotsAvailable(futureCart)
          if (!availability.ok && availability.status === 409) {
            conflictReason = availability.error
            console.error('Possible double booking detected after payment:', {
              bookingRef,
              sessionId: session.id,
              error: availability.error,
            })
          }
        }
      } catch (error) {
        console.error('Post-payment availability check failed:', error)
      }

      let calendarInserted = false
      try {
        await addBookingEvents(cartItems, customer, teamEmails, referralInfo, bookingRef, event.id)
        calendarInserted = true
        await markSessionFulfillmentStep(session.id, 'vbsCalendarSyncedAt')
      } catch (error) {
        console.error('Calendar event creation failed:', error)
        fulfillmentErrors.push('calendar')
      }

      if (conflictReason && !currentMetadata.vbsDoubleBookingAlertedAt) {
        try {
          await sendDoubleBookingAlert(cartItems, customer, bookingRef, conflictReason, calendarInserted)
          await markSessionFulfillmentStep(session.id, 'vbsDoubleBookingAlertedAt')
        } catch (alertError) {
          console.error('Double booking alert email failed:', alertError)
        }
      }
    }

    if (!fulfillmentErrors.length && !currentMetadata.vbsConfirmationSentAt) {
      try {
        await sendConfirmationEmail(cartItems, customer, session.amount_total || 0, teamEmails, referralInfo, attributionDetails, receiptUrl)
        await markSessionFulfillmentStep(session.id, 'vbsConfirmationSentAt')
      } catch (error) {
        console.error('Booking email failed:', error)
        fulfillmentErrors.push('email')
      }
    }

    if (fulfillmentErrors.length) {
      return NextResponse.json(
        { error: `Booking fulfillment failed: ${fulfillmentErrors.join(', ')}` },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({ received: true })
}

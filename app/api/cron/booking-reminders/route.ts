import { NextRequest, NextResponse } from 'next/server'
import {
  type BookingReminderEvent,
  listBookingEventsForReminderWindow,
  markBookingReminderSent,
} from '@/lib/booking/calendar'
import { getStudioById } from '@/lib/booking/catalog'
import { BOOKING_TIME_ZONE, formatDateForDisplay, formatTimeForDisplay } from '@/lib/booking/time'
import { escapeHtml } from '@/lib/server/sanitize'
import { siteUrl } from '@/lib/seo/site'

export const dynamic = 'force-dynamic'

type ReminderGroup = {
  customerName: string
  customerEmail: string
  bookingRef: string
  events: BookingReminderEvent[]
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

function groupReminderEvents(events: BookingReminderEvent[]) {
  const groups = new Map<string, ReminderGroup>()

  for (const event of events) {
    const key = `${event.bookingRef || event.eventId}|${event.customerEmail}`
    const group = groups.get(key) || {
      customerName: event.customerName,
      customerEmail: event.customerEmail,
      bookingRef: event.bookingRef,
      events: [],
    }
    group.events.push(event)
    groups.set(key, group)
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    events: group.events.sort((a, b) => Date.parse(a.start) - Date.parse(b.start)),
  }))
}

function eventDateLabel(event: BookingReminderEvent) {
  const start = new Date(event.start)
  const date = start.toLocaleDateString('en-CA', { timeZone: BOOKING_TIME_ZONE })
  return formatDateForDisplay(date)
}

function eventTimeLabel(event: BookingReminderEvent) {
  return `${formatTimeForDisplay(new Date(event.start))}-${formatTimeForDisplay(new Date(event.end))} PT`
}

function prepItemsForGroup(group: ReminderGroup) {
  const items = new Set<string>([
    'Arrive 10 minutes early so we can get you settled without taking time from your session.',
    'Bring scripts, shot lists, talking points, product, wardrobe, props, reference images, logo files, and any other assets that support the shoot.',
    'If guests, crew, or setup notes have changed, reply to this email before your session.',
    'Street parking is usually the simplest option near 950 Battery St. Give yourself a little buffer for downtown traffic.',
  ])

  for (const event of group.events) {
    const studio = event.studioId ? getStudioById(event.studioId) : undefined
    for (const tip of studio?.prep || []) {
      items.add(tip)
    }
  }

  return Array.from(items).slice(0, 10)
}

function buildReminderHtml(group: ReminderGroup) {
  const firstName = escapeHtml(group.customerName.split(' ')[0] || group.customerName)
  const rows = group.events.map((event) => `
    <tr>
      <td style="padding:18px 0;border-top:1px solid #e5e7eb;">
        <p style="font-size:16px;font-weight:900;color:#111827;margin:0 0 6px;">${escapeHtml(event.studioName)}</p>
        <p style="font-size:14px;line-height:1.65;color:#4b5563;margin:0;">${escapeHtml(eventDateLabel(event))}<br>${escapeHtml(eventTimeLabel(event))}</p>
      </td>
    </tr>`).join('')
  const prepItems = prepItemsForGroup(group).map((item) => `<li style="margin:0 0 9px;">${escapeHtml(item)}</li>`).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#050505;color:#fff;margin:0;padding:0;">
  <div style="display:none;max-height:0;overflow:hidden;color:#050505;">Your VibeShack Studios session is tomorrow.</div>
  <div style="max-width:660px;margin:0 auto;padding:36px 22px 48px;">
    <div style="margin:0 0 26px;">
      <a href="${siteUrl}" style="display:inline-block;color:#ef1100;text-decoration:none;font-size:20px;font-weight:950;letter-spacing:-0.055em;line-height:1;">VibeShack Studios</a>
    </div>
    <div style="background:#0c0c0c;border:1px solid #1f1f1f;border-radius:28px;padding:32px;margin:0 0 18px;">
      <p style="display:inline-block;border:1px solid #333;color:#aeb6c5;font-size:11px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;margin:0 0 18px;padding:8px 10px;">24-hour reminder</p>
      <h1 style="font-size:38px;font-weight:950;letter-spacing:-0.045em;line-height:1.02;margin:0 0 16px;color:#fff;">Your session is tomorrow.</h1>
      <p style="color:#aeb6c5;font-size:16px;line-height:1.7;margin:0;">${firstName}, here is the final prep note for your VibeShack Studios booking.</p>
    </div>
    <div style="background:#fff;color:#111827;border-radius:24px;padding:26px;margin:18px 0 28px;">
      <p style="font-size:11px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;color:#ef1100;margin:0 0 8px;">Confirmed session</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>
    </div>
    <div style="background:#111;border:1px solid #252525;border-radius:22px;padding:24px;margin:0 0 18px;">
      <p style="font-size:12px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;margin:0 0 16px;">Before you arrive</p>
      <ul style="padding-left:18px;margin:0;color:#e5e7eb;font-size:15px;line-height:1.75;">${prepItems}</ul>
    </div>
    <div style="background:#080808;border:1px solid #202020;border-radius:22px;padding:24px;margin:0 0 24px;">
      <p style="color:#fff;font-size:16px;font-weight:900;margin:0 0 10px;">VibeShack Studios</p>
      <p style="color:#aeb6c5;font-size:14px;line-height:1.7;margin:0;">950 Battery St, San Francisco, CA 94111<br>Northern Waterfront<br>Open 24/7</p>
    </div>
    <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0;">Questions or setup notes? Reply to this email or reach us at <a href="mailto:founder@vibeshackstudios.com" style="color:#ff2b1c;text-decoration:none;font-weight:800;">founder@vibeshackstudios.com</a>.</p>
  </div>
</body>
</html>`
}

async function sendReminderEmail(group: ReminderGroup) {
  const gmailUser = process.env.GMAIL_USER || 'founder@vibeshackstudios.com'
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  if (!gmailPass) throw new Error('GMAIL_APP_PASSWORD is not configured')

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  })
  const firstStudio = group.events.length === 1 ? group.events[0].studioName : `${group.events.length} sessions`
  const firstDate = eventDateLabel(group.events[0]).replace(/^\w+,\s*/, '')

  await transporter.sendMail({
    from: `"VibeShack Studios" <${gmailUser}>`,
    to: group.customerEmail,
    subject: `Reminder: your VibeShack session is tomorrow - ${firstStudio} - ${firstDate}`,
    html: buildReminderHtml(group),
  })
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dryRun = new URL(req.url).searchParams.get('dryRun') === '1'
  const events = await listBookingEventsForReminderWindow()
  if (!events) {
    return NextResponse.json({ error: 'Calendar credentials are not configured' }, { status: 503 })
  }

  const groups = groupReminderEvents(events)
  let sent = 0
  const failures: string[] = []

  for (const group of groups) {
    if (!dryRun) {
      try {
        await sendReminderEmail(group)
        await markBookingReminderSent(group.events)
      } catch (error) {
        console.error('Booking reminder failed:', {
          bookingRef: group.bookingRef,
          customerEmail: group.customerEmail,
          error,
        })
        failures.push(group.bookingRef || group.customerEmail)
        continue
      }
    }
    sent += 1
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    groups: groups.length,
    events: events.length,
    sent: dryRun ? 0 : sent,
    failures,
  }, { status: failures.length ? 500 : 200 })
}

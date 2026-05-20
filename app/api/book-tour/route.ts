import { NextRequest, NextResponse } from 'next/server'
import { addTourEvent, assertTourSlotAvailable, formatTourSlotRange } from '@/lib/booking/calendar'
import { getStudioById } from '@/lib/booking/catalog'
import { formatDateForDisplay, isValidBookingDate } from '@/lib/booking/time'
import { jsonBodyErrorResponse, rateLimit, readJsonBody } from '@/lib/server/request-guards'
import { escapeHtml, isEmail, stripControlChars } from '@/lib/server/sanitize'

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 6
const MIN_FORM_AGE_MS = 1500
const MAX_BODY_BYTES = 10 * 1024

async function sendTourEmails(tour: {
  name: string
  email: string
  phone: string
  date: string
  slot: string
  studioName: string
  notes: string
}) {
  const gmailUser = process.env.GMAIL_USER || 'founder@vibeshackstudios.com'
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  if (!gmailPass) throw new Error('GMAIL_APP_PASSWORD is not configured')

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: gmailUser, pass: gmailPass },
  })

  const dateStr = formatDateForDisplay(tour.date)
  const timeStr = `${formatTourSlotRange(tour.slot)} PT`
  const firstName = escapeHtml(tour.name.split(' ')[0] || tour.name)

  await transporter.sendMail({
    from: `"VibeShack Studios" <${gmailUser}>`,
    to: tour.email,
    subject: `Your VibeShack studio tour is booked - ${dateStr}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#000;color:#fff;margin:0;padding:40px 20px;">
        <div style="max-width:560px;margin:0 auto;">
          <p style="font-size:18px;font-weight:900;letter-spacing:-0.04em;color:#fff;margin:0 0 28px;">Vibe<span style="color:#e11d48;">Shack</span> <span style="color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;">Studios</span></p>
          <h1 style="font-size:34px;line-height:1.05;letter-spacing:-0.04em;margin:0 0 10px;">Your tour is booked.</h1>
          <p style="color:#777;font-size:15px;line-height:1.7;margin:0 0 28px;">See you soon, ${firstName}. We&apos;ll walk you through the rooms, answer questions, and help you decide what setup fits your shoot.</p>
          <div style="background:#111;border:1px solid #222;border-radius:14px;padding:22px;margin-bottom:24px;">
            <p style="color:#fff;font-weight:900;margin:0 0 8px;">${escapeHtml(dateStr)}</p>
            <p style="color:#e11d48;font-weight:800;margin:0 0 12px;">${escapeHtml(timeStr)}</p>
            <p style="color:#999;margin:0 0 4px;">950 Battery St, San Francisco, CA 94111</p>
            <p style="color:#666;margin:0;">Studio interest: ${escapeHtml(tour.studioName)}</p>
          </div>
          <p style="color:#666;font-size:14px;line-height:1.7;margin:0;">Need to change anything? Reply to this email and we&apos;ll help.</p>
        </div>
      </div>
    `,
  })

  await transporter.sendMail({
    from: `"VibeShack Tour Booking" <${gmailUser}>`,
    to: 'founder@vibeshackstudios.com',
    replyTo: tour.email,
    subject: `New Studio Tour: ${tour.name} - ${dateStr} - ${timeStr}`,
    html: `
      <h2 style="color:#E50000;">New studio tour booked</h2>
      <p>
        <strong>Name:</strong> ${escapeHtml(tour.name)}<br>
        <strong>Email:</strong> ${escapeHtml(tour.email)}<br>
        <strong>Phone:</strong> ${escapeHtml(tour.phone || 'N/A')}<br>
        <strong>Date:</strong> ${escapeHtml(dateStr)}<br>
        <strong>Time:</strong> ${escapeHtml(timeStr)}<br>
        <strong>Studio interest:</strong> ${escapeHtml(tour.studioName)}
      </p>
      ${tour.notes ? `<p><strong>Notes:</strong></p><p style="white-space:pre-wrap;">${escapeHtml(tour.notes)}</p>` : ''}
      <hr style="margin-top:24px;"/>
      <p style="color:#888;font-size:12px;">Booked via vibeshackstudios.com/tour</p>
    `,
  })
}

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, { key: 'tour-booking', max: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW_MS })
    if (limited) return limited

    const body = await readJsonBody(req, MAX_BODY_BYTES)
    const name = stripControlChars(body.name, 120)
    const email = stripControlChars(body.email, 254).toLowerCase()
    const phone = stripControlChars(body.phone, 40)
    const date = stripControlChars(body.date, 20)
    const slot = stripControlChars(body.slot, 40)
    const studioId = stripControlChars(body.studioId, 80)
    const notes = stripControlChars(body.notes, 1200)
    const honeypot = stripControlChars(body.company, 120)
    const startedAt = Number(body.startedAt || 0)

    if (honeypot) {
      return NextResponse.json({ ok: true })
    }

    if (startedAt && Date.now() - startedAt < MIN_FORM_AGE_MS) {
      return NextResponse.json({ error: 'Please try again.' }, { status: 400 })
    }

    if (!name || !isEmail(email)) {
      return NextResponse.json({ error: 'Name and valid email are required' }, { status: 400 })
    }

    if (!isValidBookingDate(date) || !slot || Number.isNaN(Date.parse(slot))) {
      return NextResponse.json({ error: 'Choose a valid tour date and time' }, { status: 400 })
    }

    const studio = studioId ? getStudioById(studioId) : undefined
    if (studioId && !studio) {
      return NextResponse.json({ error: 'Choose a valid studio interest' }, { status: 400 })
    }

    const availability = await assertTourSlotAvailable(date, slot)
    if (!availability.ok) {
      return NextResponse.json({ error: availability.error }, { status: availability.status })
    }

    const studioName = studio?.name || 'Not sure yet'
    const tour = { name, email, phone, date, slot, studioId: studio?.id, studioName, notes }

    await addTourEvent(tour)

    try {
      await sendTourEmails(tour)
    } catch (error) {
      console.error('Tour confirmation email failed:', error)
    }

    return NextResponse.json({
      ok: true,
      tour: {
        date,
        time: formatTourSlotRange(slot),
        studioName,
      },
    })
  } catch (error) {
    const bodyError = jsonBodyErrorResponse(error)
    if (bodyError) return bodyError

    console.error('Tour booking error:', error)
    return NextResponse.json({ error: 'Tour booking failed. Please try again or email founder@vibeshackstudios.com.' }, { status: 500 })
  }
}

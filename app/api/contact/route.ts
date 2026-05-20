import { NextRequest, NextResponse } from 'next/server'
import { jsonBodyErrorResponse, rateLimit, readJsonBody } from '@/lib/server/request-guards'
import { escapeHtml, isEmail, stripControlChars } from '@/lib/server/sanitize'

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const MIN_FORM_AGE_MS = 3000
const MAX_BODY_BYTES = 12 * 1024

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, { key: 'contact', max: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW_MS })
    if (limited) return limited

    const body = await readJsonBody(req, MAX_BODY_BYTES)
    const name = stripControlChars(body.name, 120)
    const email = stripControlChars(body.email, 254).toLowerCase()
    const phone = stripControlChars(body.phone, 40)
    const projectType = stripControlChars(body.project_type, 80)
    const preferredDate = stripControlChars(body.preferred_date, 40)
    const message = stripControlChars(body.message, 2500)
    const honeypot = stripControlChars(body.company, 120)
    const startedAt = Number(body.startedAt || 0)

    if (honeypot) {
      return NextResponse.json({ ok: true })
    }

    if (startedAt && Date.now() - startedAt < MIN_FORM_AGE_MS) {
      return NextResponse.json({ error: 'Please try again.' }, { status: 400 })
    }

    if (!name || !isEmail(email) || !message) {
      return NextResponse.json({ error: 'Name, valid email, and message are required' }, { status: 400 })
    }

    const nodemailer = await import('nodemailer')
    const gmailUser = process.env.GMAIL_USER || 'founder@vibeshackstudios.com'
    const gmailPass = process.env.GMAIL_APP_PASSWORD

    if (!gmailPass) {
      throw new Error('GMAIL_APP_PASSWORD is not configured')
    }

    const transporter = nodemailer.default.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: gmailUser, pass: gmailPass },
    })

    const subject = projectType.toLowerCase().includes('canvas podcast custom')
      ? `Canvas Podcast Custom Setup Request - ${name}`
      : `New Contact Form Submission - ${name}`
    const html = `
      <h2 style="color:#E50000;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
      ${projectType ? `<p><strong>Project Type:</strong> ${escapeHtml(projectType)}</p>` : ''}
      ${preferredDate ? `<p><strong>Preferred Date:</strong> ${escapeHtml(preferredDate)}</p>` : ''}
      <hr />
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
      <hr style="margin-top:24px;"/>
      <p style="color:#888;font-size:12px;">Sent via VibeShack Studios contact form - vibeshackstudios.com</p>
    `

    await transporter.sendMail({
      from: `"VibeShack Studios" <${gmailUser}>`,
      to: 'founder@vibeshackstudios.com',
      replyTo: email,
      subject,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const bodyError = jsonBodyErrorResponse(err)
    if (bodyError) return bodyError

    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

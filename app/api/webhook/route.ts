import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { google } from 'googleapis'
import fs from 'fs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

interface CartItem {
  studioId: string
  studioName: string
  date: string
  slots: string[]
  hours: number
  price: number
}

async function addToCalendar(cartItems: CartItem[], customerName: string, customerEmail: string, customerPhone: string) {
  try {
    const tokenPath = process.env.GCAL_TOKEN_PATH || '/root/.openclaw/workspace/scripts/gcal/token.json'
    if (!fs.existsSync(tokenPath)) return

    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'))
    const auth = new google.auth.OAuth2()
    auth.setCredentials(tokenData)
    const calendar = google.calendar({ version: 'v3', auth })

    for (const item of cartItems) {
      try {
        const firstSlot = item.slots[0]
        const lastSlot = item.slots[item.slots.length - 1]
        const startTime = new Date(firstSlot)
        const endTime = new Date(lastSlot)
        endTime.setHours(endTime.getHours() + 1)

        const dateStr = new Date(item.date + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })

        await calendar.events.insert({
          calendarId: process.env.GCAL_CALENDAR_ID || 'founder@vibeshackstudios.com',
          requestBody: {
            summary: `📹 ${item.studioName} — ${customerName}`,
            description: `Studio: ${item.studioName}\nClient: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\nDate: ${dateStr}\nDuration: ${item.hours}hr\nAmount: $${item.price}\n\nBooked via VibeShack website`,
            start: { dateTime: startTime.toISOString(), timeZone: 'America/Los_Angeles' },
            end: { dateTime: endTime.toISOString(), timeZone: 'America/Los_Angeles' },
            attendees: [{ email: customerEmail, displayName: customerName }],
            colorId: '11',
          },
        })
      } catch (err) {
        console.error(`Calendar event creation failed for ${item.studioName}:`, err)
      }
    }
  } catch (err) {
    console.error('Calendar setup error:', err)
  }
}

async function sendConfirmationEmail(
  cartItems: CartItem[],
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  amountTotal: number,
) {
  try {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'founder@vibeshackstudios.com',
        pass: process.env.GMAIL_APP_PASSWORD || '',
      },
    })

    // Build booking rows for each cart item
    const bookingRows = cartItems.map(item => {
      const dateStr = new Date(item.date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
      const firstSlot = item.slots[0]
      const lastSlot = item.slots[item.slots.length - 1]
      const startTime = new Date(firstSlot).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles',
      })
      const endDate = new Date(lastSlot)
      endDate.setHours(endDate.getHours() + 1)
      const endTime = endDate.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles',
      })

      return `
        <div style="background: #111; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid #222;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <p style="color: #fff; font-weight: 900; font-size: 16px; margin: 0 0 4px;">${item.studioName}</p>
              <p style="color: #e11d48; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">VibeShack Studios</p>
            </div>
            <span style="color: #fff; font-weight: 900; font-size: 18px;">$${item.price}</span>
          </div>
          <div style="border-top: 1px solid #222; padding-top: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #666; font-size: 13px;">Date</span>
              <span style="color: #fff; font-size: 13px; font-weight: 600;">${dateStr}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #666; font-size: 13px;">Time</span>
              <span style="color: #fff; font-size: 13px; font-weight: 600;">${startTime} – ${endTime} PT</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #666; font-size: 13px;">Duration</span>
              <span style="color: #fff; font-size: 13px; font-weight: 600;">${item.hours} hour${item.hours > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>`
    }).join('')

    const firstName = customerName.split(' ')[0]
    const totalFormatted = `$${(amountTotal / 100).toFixed(2)}`

    // Subject line — use first studio name if only one, otherwise "Multiple Studios"
    const subjectStudio = cartItems.length === 1 ? cartItems[0].studioName : `${cartItems.length} Studios`
    const firstDate = new Date(cartItems[0].date + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    })

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Booking Confirmation — VibeShack Studios</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: #000; color: #fff; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="border-bottom: 1px solid #222; padding-bottom: 28px; margin-bottom: 32px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <span style="font-size: 18px; font-weight: 900; letter-spacing: -0.04em; color: #fff;">Vibe<span style="color: #e11d48;">Shack</span></span>
        <span style="color: #333; font-size: 12px;">·</span>
        <span style="color: #555; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em;">Studios</span>
      </div>
      <h1 style="font-size: 36px; font-weight: 900; letter-spacing: -0.04em; margin: 0 0 8px; line-height: 1.1;">You're booked.</h1>
      <p style="color: #666; font-size: 15px; margin: 0;">See you at the studio, ${firstName}.</p>
    </div>

    <!-- Booking Summary -->
    <div style="margin-bottom: 32px;">
      <p style="color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; margin: 0 0 16px;">
        ${cartItems.length > 1 ? `${cartItems.length} Sessions Booked` : 'Your Session'}
      </p>
      ${bookingRows}
    </div>

    <!-- Total -->
    <div style="display: flex; justify-content: space-between; padding: 16px 20px; background: #0a0a0a; border: 1px solid #222; border-radius: 8px; margin-bottom: 32px;">
      <span style="color: #fff; font-weight: 700; font-size: 15px;">Total Paid</span>
      <span style="color: #fff; font-weight: 900; font-size: 20px;">${totalFormatted}</span>
    </div>

    <!-- Studio Address -->
    <div style="background: #111; border-radius: 12px; padding: 20px; margin-bottom: 32px; border: 1px solid #222;">
      <p style="color: #fff; font-weight: 700; margin: 0 0 8px;">📍 VibeShack Studios</p>
      <p style="color: #999; font-size: 14px; margin: 0 0 4px;">950 Battery St, San Francisco, CA 94111</p>
      <p style="color: #555; font-size: 13px; margin: 0;">Northern Waterfront · Open 24/7</p>
    </div>

    <!-- Contact info -->
    <p style="color: #555; font-size: 14px; line-height: 1.7; margin-bottom: 32px;">
      Questions? Reply to this email or reach us at
      <a href="mailto:founder@vibeshackstudios.com" style="color: #e11d48; text-decoration: none;">founder@vibeshackstudios.com</a>
    </p>

    <!-- Footer -->
    <div style="border-top: 1px solid #111; padding-top: 24px; color: #333; font-size: 12px; line-height: 1.8;">
      <p style="margin: 0 0 4px;">Free cancellation up to 48 hours before your session.</p>
      <p style="margin: 0;">© VibeShack Studios · San Francisco</p>
    </div>

  </div>
</body>
</html>`

    // Internal notification HTML
    const internalHtml = cartItems.map(item => {
      const dateStr = new Date(item.date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
      const firstSlot = item.slots[0]
      const startTime = new Date(firstSlot).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles',
      })
      return `<li>📹 <strong>${item.studioName}</strong> — ${dateStr} at ${startTime} PT — $${item.price}/hr × ${item.hours}hr</li>`
    }).join('')

    // Send to customer
    await transporter.sendMail({
      from: '"VibeShack Studios" <founder@vibeshackstudios.com>',
      to: customerEmail,
      subject: `You're booked — ${subjectStudio} · ${firstDate}`,
      html: emailHtml,
    })

    // Internal notification
    await transporter.sendMail({
      from: '"VibeShack Booking" <founder@vibeshackstudios.com>',
      to: 'founder@vibeshackstudios.com',
      subject: `🎬 New Booking: ${customerName} — ${subjectStudio} — ${firstDate}`,
      html: `
        <p><strong>New booking received.</strong></p>
        <p>
          <strong>Client:</strong> ${customerName}<br>
          <strong>Email:</strong> ${customerEmail}<br>
          <strong>Phone:</strong> ${customerPhone || 'N/A'}<br>
          <strong>Total:</strong> ${totalFormatted}
        </p>
        <ul style="line-height: 2;">${internalHtml}</ul>
      `,
    })
  } catch (err) {
    console.error('Email error:', err)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      event = JSON.parse(body)
    }
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata as Record<string, string>
    const amountTotal = session.amount_total || 0

    const customerName = metadata.customerName || 'Guest'
    const customerEmail = metadata.customerEmail || ''
    const customerPhone = metadata.customerPhone || ''

    // Parse cart items from split metadata keys (cart_0, cart_1, ...)
    let cartItems: CartItem[] = []
    try {
      const totalSessions = parseInt(metadata.totalSessions || '0', 10)
      for (let i = 0; i < Math.max(totalSessions, 20); i++) {
        const key = `cart_${i}`
        if (!metadata[key]) break
        const compact = JSON.parse(metadata[key])
        // Support both compact keys (id/n/d/s/h/p) and full keys for backwards compat
        cartItems.push({
          studioId: compact.id ?? compact.studioId ?? '',
          studioName: compact.n ?? compact.studioName ?? '',
          date: compact.d ?? compact.date ?? '',
          slots: compact.s ?? compact.slots ?? [],
          hours: compact.h ?? compact.hours ?? 1,
          price: compact.p ?? compact.price ?? 0,
        })
      }
    } catch (err) {
      console.error('Failed to parse cart metadata:', err)
    }

    // Fallback: try legacy cartJson if present
    if (cartItems.length === 0 && metadata.cartJson) {
      try {
        cartItems = JSON.parse(metadata.cartJson)
      } catch (err) {
        console.error('Failed to parse legacy cartJson:', err)
      }
    }

    if (cartItems.length === 0) {
      console.error('No cart items found in webhook metadata')
      return NextResponse.json({ received: true })
    }

    // Send email regardless of calendar success
    await sendConfirmationEmail(cartItems, customerName, customerEmail, customerPhone, amountTotal)

    // Calendar — errors are caught per-event inside the function
    await addToCalendar(cartItems, customerName, customerEmail, customerPhone)
  }

  return NextResponse.json({ received: true })
}

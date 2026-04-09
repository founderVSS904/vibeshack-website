import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, project_type, preferred_date, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const nodemailer = await import('nodemailer')
    const gmailUser = process.env.GMAIL_USER || 'founder@vibeshackstudios.com'
    const gmailPass = process.env.GMAIL_APP_PASSWORD || ''

    const transporter = nodemailer.default.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    })

    const subject = `New Contact Form Submission — ${name}`
    const html = `
      <h2 style="color:#E50000;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      ${project_type ? `<p><strong>Project Type:</strong> ${project_type}</p>` : ''}
      ${preferred_date ? `<p><strong>Preferred Date:</strong> ${preferred_date}</p>` : ''}
      <hr />
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap;">${message}</p>
      <hr style="margin-top:24px;"/>
      <p style="color:#888;font-size:12px;">Sent via VibeShack Studios contact form · vibeshackstudios.com</p>
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
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

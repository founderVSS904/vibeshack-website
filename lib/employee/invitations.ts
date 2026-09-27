import 'server-only'
import nodemailer from 'nodemailer'
import { employeeAdmin } from './supabase'
import { employeeOrigin } from './auth'
import { escapeHtml } from '../server/sanitize'

// Tokens are never returned to the browser, logs, activity history, or team API.
export async function sendEmployeeAccessLink(email: string, name: string, kind: 'invite' | 'magiclink') {
  const admin = employeeAdmin()
  let tokenType = kind
  let { data, error } = await admin.auth.admin.generateLink({ type: kind, email })
  // A prior Google attempt may already have created an Auth identity without
  // granting any portal access. The invitation registry remains authoritative.
  if (kind === 'invite' && error && ['email_exists', 'user_already_exists'].includes(error.code || '')) {
    tokenType = 'magiclink'
    const retried = await admin.auth.admin.generateLink({ type: tokenType, email })
    data = retried.data; error = retried.error
  }
  if (error || !data.properties?.hashed_token || !['invite', 'magiclink', 'signup'].includes(data.properties.verification_type)) throw new Error('Sign-in link could not be generated')
  const url = new URL('/api/employee/auth/confirm', employeeOrigin())
  url.searchParams.set('token_hash', data.properties.hashed_token)
  url.searchParams.set('type', data.properties.verification_type)
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) throw new Error('Employee email is not configured')
  const greeting = name ? `Hi ${name},` : 'Hi,'
  const title = kind === 'invite' ? 'You’re invited to VibeShack Team' : 'Sign in to VibeShack Team'
  const text = `${greeting}\n\n${title}.\n\nOpen this link, then select Continue to sign in:\n${url.toString()}\n\nThis link expires and can be used once. If it expires, request a new link on the employee sign-in page.\n\nVibeShack Studios`
  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass }, connectionTimeout: 15_000, greetingTimeout: 15_000, socketTimeout: 30_000 })
  try {
    const result = await transport.sendMail({ from: `VibeShack Team <${user}>`, to: email, subject: title, text,
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#171717"><p style="font-weight:bold;letter-spacing:2px;color:#ec0000">VIBESHACK STUDIOS</p><h1 style="font-size:25px">${escapeHtml(title)}</h1><p>${escapeHtml(greeting)}</p><p>Your team workspace is ready.</p><p><a href="${escapeHtml(url.toString())}" style="display:inline-block;background:#111;color:white;padding:14px 24px;border-radius:10px;text-decoration:none">Continue to VibeShack</a></p><p style="color:#666;font-size:13px">This link expires and can be used once. If it expires, request a new link on the employee sign-in page.</p></div>` })
    if (!result.accepted?.length) throw new Error('Invitation was not accepted by the mail provider')
  } finally { transport.close() }
}

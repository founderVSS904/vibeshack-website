'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'
import styles from './EmployeeSignIn.module.css'

export default function EmployeeSignIn({ preview, configured, googleConfigured = true, failed = false }: { preview: boolean; configured: boolean; googleConfigured?: boolean; failed?: boolean }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function sendLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError(''); setNotice('')
    if (preview) { setNotice('Preview only. No sign-in email was sent. Explore the booking or team preview below.'); return }
    setBusy(true)
    try {
      const response = await fetch('/api/employee/auth/email', { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'The sign-in link could not be requested. Please try again.')
      setNotice('If this email has access, a sign-in link is on its way. Check your inbox and open the link on this device.')
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The sign-in link could not be requested. Please try again.') }
    finally { setBusy(false) }
  }

  return <section className={styles.screen} aria-labelledby="employee-signin-title">
    <div className={styles.center}><div className={styles.panel}>
      <Link href="/" className={styles.logoLink} aria-label="VibeShack Studios home"><BrandMark variant="monogram" className={styles.logo} priority /></Link>
      <h1 id="employee-signin-title" className={styles.title}>Employee sign in</h1>
      <p className={styles.intro}>Your team. Your workspace.</p>
      {failed && <p className={styles.error} role="alert">We couldn’t sign you in. Try again with an approved account.</p>}
      {configured || preview ? <>
        {(preview || googleConfigured) && <>{preview ? <button type="button" className={styles.google} onClick={() => { setError(''); setNotice('Google sign-in is not used in this preview. No account is connected.') }}><GoogleMark />Continue with Google</button> : <a href="/api/employee/auth/login" className={styles.google}><GoogleMark />Continue with Google</a>}
        <div className={styles.divider}><span>or use an email link</span></div></>}
        <form className={styles.controls} onSubmit={sendLink} aria-label={preview ? 'Employee sign-in preview' : 'Email sign in'}>
          <label htmlFor="employee-signin-email" className={styles.label}>Work email</label>
          <div className={styles.field}><input id="employee-signin-email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@company.com" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} /></div>
          <button type="submit" className={styles.primary} disabled={busy}>{busy ? 'Requesting link…' : 'Email me a sign-in link'}<span aria-hidden="true">→</span></button>
        </form>
        {preview && <div className={styles.preview}><p>No account access or emails are created in this preview.</p><Link href="/employee/preview/">Explore booking preview <span aria-hidden="true">→</span></Link><Link href="/employee/preview/team/">Explore team preview <span aria-hidden="true">→</span></Link></div>}
        <p className={styles.status} role="status" aria-live="polite">{notice}</p>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </> : <div className={styles.liveAccess}><p role="status">Secure sign-in is awaiting administrator setup. Public access is closed.</p></div>}
    </div></div>
    <div className={styles.signature}>VIBESHACK STUDIOS</div>
  </section>
}

function GoogleMark() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.4ZM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22ZM6.4 14a6 6 0 0 1 0-4V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14ZM12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.9 5.4L6.4 10C7.2 7.6 9.4 5.9 12 5.9Z" /></svg>
}

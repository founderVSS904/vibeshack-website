'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'
import styles from './EmployeeSignIn.module.css'

export default function EmployeePasswordReset({ preview = false, failed = false }: { preview?: boolean; failed?: boolean }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function requestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError(''); setNotice('')
    if (preview) { setNotice('Preview only. No password reset email was sent.'); return }
    setBusy(true)
    try {
      const response = await fetch('/api/employee/auth/password/reset', { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'The reset link could not be requested. Please try again.')
      setNotice('If this email has access, a password reset link is on its way. Check your inbox to choose your password.')
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The reset link could not be requested. Please try again.') }
    finally { setBusy(false) }
  }

  return <section className={styles.screen} aria-labelledby="employee-password-title">
    <div className={styles.center}><div className={styles.panel}>
      <Link href="/" className={styles.logoLink} aria-label="VibeShack Studios home"><BrandMark variant="monogram" className={styles.logo} priority /></Link>
      <h1 id="employee-password-title" className={styles.title}>Set or reset your password</h1>
      <p className={styles.intro + ' ' + styles.resetIntro}>Enter your work email. We’ll send a link to choose a password for your account.</p>
      {failed && <p className={styles.error} role="alert">This link could not be used to save your password. Request a new link below.</p>}
      <form className={styles.controls} onSubmit={requestReset} aria-label={preview ? 'Password reset preview' : 'Request password reset'}>
        <label htmlFor="employee-password-email" className={styles.label}>Work email</label>
        <div className={styles.field}><input id="employee-password-email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@company.com" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} /></div>
        <button type="submit" className={styles.primary} disabled={busy}>{busy ? 'Requesting link…' : 'Send reset link'}<span aria-hidden="true">→</span></button>
      </form>
      <p className={styles.status} role="status" aria-live="polite">{notice}</p>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {preview && <div className={styles.preview}><p>No password reset emails are sent in this preview.</p></div>}
      <Link className={styles.back} href="/employee/">Back to sign in</Link>
    </div></div>
    <div className={styles.signature}>VIBESHACK STUDIOS</div>
  </section>
}

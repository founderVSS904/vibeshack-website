'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BrandMark } from '@/components/BrandMark'
import styles from './SecurityPage.module.css'

type Factor = { id: string; friendlyName?: string }
type Enrollment = { factorId: string; qrCode: string; secret: string }

export default function SecurityPage({ email, mfaVerified = false }: { email: string; mfaVerified?: boolean }) {
  const [factors, setFactors] = useState<Factor[]>([])
  const [factorId, setFactorId] = useState('')
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(!mfaVerified)
  const [busy, setBusy] = useState(false)
  const [verified, setVerified] = useState(mfaVerified)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (mfaVerified) return
    const controller = new AbortController()
    setLoading(true); setError('')
    fetch('/api/employee/auth/mfa', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Account security could not be loaded.'); return data })
      .then((data) => { setFactors(data.factors || []); setFactorId(data.factors?.[0]?.id || ''); setVerified(Boolean(data.mfaVerified)) })
      .catch((failure) => { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Account security could not be loaded.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [mfaVerified, refresh])

  async function post(path: string, body: object) {
    const response = await fetch('/api/employee/auth/mfa/' + path, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Account verification could not finish. Please try again.')
    return data
  }

  async function enroll() {
    if (busy) return
    setBusy(true); setError('')
    try {
      const data = await post('enroll', {})
      if (!data.factorId || !data.secret) throw new Error('Authenticator setup could not be completed. Please try again.')
      setEnrollment({ factorId: data.factorId, qrCode: data.qrCode || '', secret: data.secret })
      setFactorId(data.factorId)
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Authenticator setup could not be completed.') }
    finally { setBusy(false) }
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !factorId) return
    setBusy(true); setError('')
    try {
      const challenge = await post('challenge', { factorId })
      await post('verify', { factorId, challengeId: challenge.challengeId, code })
      setEnrollment(null); setCode(''); setVerified(true)
      window.location.assign('/employee/book/')
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'That code could not be verified. Try a new code.'); setCode('') }
    finally { setBusy(false) }
  }

  return <section className={styles.screen} aria-labelledby="security-title">
    <div className={styles.panel}>
      <Link href="/" className={styles.logoLink} aria-label="VibeShack Studios home"><BrandMark variant="monogram" className={styles.logo} priority /></Link>
      <span className={styles.eyebrow}>SUPERADMIN SECURITY</span>
      <h1 id="security-title">{verified ? 'Your account is protected.' : enrollment || factors.length ? 'Verify it’s you.' : 'Secure your workspace.'}</h1>
      <p className={styles.intro}>{verified ? 'Two-step verification is active for this session.' : enrollment ? 'Add VibeShack to your authenticator app, then enter the six-digit code.' : factors.length ? 'Enter the six-digit code from your authenticator app.' : 'An authenticator adds a second layer of protection to your Superadmin account.'}</p>
      <p className={styles.email}>{email}</p>
      {loading ? <p className={styles.loading} role="status">Checking account security…</p> : verified ? <Link className={styles.primary} href="/employee/book/">Continue to workspace <span aria-hidden="true">→</span></Link> : <>
        {enrollment && <div className={styles.enrollment}>
          {enrollment.qrCode.startsWith('data:image/') && <div className={styles.qr}><Image src={enrollment.qrCode} alt="Scan this QR code with your authenticator app" width={208} height={208} unoptimized /></div>}
          <details className={styles.manual}><summary>Can’t scan the code?</summary><p>Enter this setup key in your authenticator app. Keep it private.</p><code>{enrollment.secret}</code></details>
        </div>}
        {!enrollment && !factors.length && !error && <button type="button" className={styles.primary} onClick={enroll} disabled={busy}>{busy ? 'Preparing setup…' : 'Set up authenticator'}<span aria-hidden="true">→</span></button>}
        {(enrollment || factors.length > 0) && <form onSubmit={verify} className={styles.form}>
          {factors.length > 1 && !enrollment && <label htmlFor="security-factor">Authenticator<select id="security-factor" value={factorId} onChange={(event) => setFactorId(event.target.value)} disabled={busy}>{factors.map((factor, index) => <option key={factor.id} value={factor.id}>{factor.friendlyName || 'Authenticator ' + (index + 1)}</option>)}</select></label>}
          <label htmlFor="security-code">Verification code<input id="security-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" disabled={busy} /></label>
          <button type="submit" className={styles.primary} disabled={busy || code.length !== 6}>{busy ? 'Verifying…' : 'Verify and continue'}<span aria-hidden="true">→</span></button>
        </form>}
      </>}
      {error && <div className={styles.error} role="alert"><p>{error}</p>{!enrollment && !factors.length && <button type="button" disabled={busy} onClick={() => setRefresh((value) => value + 1)}>Try again</button>}</div>}
      <form className={styles.signOut} action="/api/employee/auth/logout" method="post"><button type="submit">Use a different account</button></form>
    </div>
  </section>
}

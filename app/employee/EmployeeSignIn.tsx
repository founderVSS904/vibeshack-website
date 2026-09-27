'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'
import styles from './EmployeeSignIn.module.css'

function SignInIcon({ kind }: { kind: 'email' | 'lock' | 'eye' | 'eye-off' | 'arrow' }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'email' && <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>}
    {kind === 'lock' && <><rect x="5.5" y="10" width="13" height="11" rx="2" /><path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10M12 14v3" /></>}
    {(kind === 'eye' || kind === 'eye-off') && <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{kind === 'eye-off' && <path d="m3 3 18 18" />}</>}
    {kind === 'arrow' && <path d="M4 12h16m-6-6 6 6-6 6" />}
  </svg>
}

export default function EmployeeSignIn({ preview, configured, failed = false }: { preview: boolean; configured: boolean; failed?: boolean }) {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')

  return <section className={styles.screen} aria-labelledby="employee-signin-title">
    <div className={styles.center}>
      <div className={styles.panel}>
        <Link href="/" className={styles.logoLink} aria-label="VibeShack Studios home"><BrandMark variant="monogram" className={styles.logo} priority /></Link>
        <h1 id="employee-signin-title" className={styles.title}>Employee sign in</h1>
        {failed && <p className={styles.error} role="alert">We couldn’t sign you in. Try again with an approved account.</p>}
        {preview ? <>
          {/* Design-only controls. No form, credential submission, storage, or authentication. */}
          <div className={styles.controls} role="group" aria-label="Employee sign-in preview">
            <div className={styles.field}>
              <label className="sr-only" htmlFor="employee-signin-email">Email</label>
              <span className={styles.fieldIcon}><SignInIcon kind="email" /></span>
              <input id="employee-signin-email" type="email" inputMode="email" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Email" />
            </div>
            <div className={styles.field}>
              <label className="sr-only" htmlFor="employee-signin-password">Password</label>
              <span className={styles.fieldIcon}><SignInIcon kind="lock" /></span>
              <input id="employee-signin-password" type={showPassword ? 'text' : 'password'} autoComplete="off" placeholder="Password" />
              <button type="button" className={styles.visibility} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}><SignInIcon kind={showPassword ? 'eye-off' : 'eye'} /></button>
            </div>
            <div className={styles.options}>
              <label className={styles.remember}><input type="checkbox" defaultChecked /> <span>Keep me signed in</span></label>
              <button type="button" className={styles.forgot} onClick={() => setNotice('Password reset isn’t connected in this local preview.')}>Forgot password?</button>
            </div>
            <button type="button" className={styles.primary} onClick={() => setNotice('Password sign-in isn’t connected yet. Select Explore booking preview to view the booking screen.')}><span>Sign In</span><SignInIcon kind="arrow" /></button>
          </div>
          <div className={styles.preview}>
            <Link href="/employee/preview/">Explore booking preview <span aria-hidden="true">→</span></Link>
          </div>
          <p className={styles.status} role="status" aria-live="polite">{notice}</p>
        </> : <div className={styles.liveAccess}>
          {configured ? <><p>Use your approved VibeShack Google account.</p><a href="/api/employee/auth/login" className={styles.primary}><span>Continue with Google</span><SignInIcon kind="arrow" /></a></> : <p role="status">Secure sign-in is awaiting administrator setup. Public access is closed.</p>}
          <p className={styles.accessNote}>Invite-only access. No shared passwords.</p>
        </div>}
      </div>
    </div>
    <div className={styles.signature}>VIBESHACK STUDIOS</div>
  </section>
}

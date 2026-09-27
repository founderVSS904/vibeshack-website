'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { BrandMark } from '@/components/BrandMark'
import styles from './EmployeeHeader.module.css'

export default function EmployeeHeader({ email, preview, role = 'employee', active = 'book' }: { email: string; preview: boolean; role?: 'superadmin' | 'employee'; active?: 'book' | 'team' | 'bookings' | 'activity' }) {
  const accountRef = useRef<HTMLDetailsElement>(null)
  const toggleRef = useRef<HTMLElement>(null)
  const links = preview
    ? [{ id: 'book', label: 'Book a client', href: '/employee/preview/' }, { id: 'bookings', label: 'Bookings', href: '/employee/preview/bookings/' }, { id: 'team', label: 'Team', href: '/employee/preview/team/' }]
    : [{ id: 'book', label: 'Book a client', href: '/employee/book/' }, { id: 'bookings', label: 'Bookings', href: '/employee/bookings/' }, ...(role === 'superadmin' ? [{ id: 'team', label: 'Team', href: '/employee/team/' }, { id: 'activity', label: 'Activity', href: '/employee/activity/' }] : [])]

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !accountRef.current?.contains(event.target)) {
        accountRef.current?.removeAttribute('open')
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [])

  return <header className={styles.header} role="banner" aria-label="VibeShack team">
    <div className={styles.inner}>
      <div className={styles.brand}>
        <BrandMark variant="lockup" priority className={styles.logo} />
        <span className={styles.team}>Team</span>
      </div>
      <nav className={styles.navigation} aria-label="Team workspace">{links.map((link) => active === link.id ? <span key={link.id} aria-current="page">{link.label}</span> : <Link key={link.id} href={link.href}>{link.label}</Link>)}</nav>
      <div className={styles.actions}>
        <a className={styles.website} href="/" target="_blank" rel="noopener noreferrer" aria-label="View website (opens in a new tab)"><span>View website</span><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 15 15 5M5 5h10v10" /></svg></a>
        <details ref={accountRef} className={styles.account} onKeyDown={(event) => {
          if (event.key === 'Escape' && accountRef.current?.open) {
            event.preventDefault()
            accountRef.current.removeAttribute('open')
            toggleRef.current?.focus()
          }
        }} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.removeAttribute('open')
        }}>
          <summary ref={toggleRef} aria-label="Account options">
            <svg className={styles.person} viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="14" /><circle cx="16" cy="12" r="4" /><path d="M7 26v-1a9 9 0 0 1 18 0v1" /></svg>
            <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3 6 5 5 5-5" /></svg>
          </summary>
          <div className={styles.panel}>
            <div className={styles.identity}><strong>{preview ? 'Local preview' : role === 'superadmin' ? 'Superadmin' : 'Signed in'}</strong><p>{preview ? 'You’re exploring the team workspace. No employee account is signed in.' : email}</p></div>
            <nav className={styles.mobileNavigation} aria-label="Workspace navigation">{links.map((link) => <Link key={link.id} className={styles.menuAction} href={link.href} aria-current={active === link.id ? 'page' : undefined}>{link.label}{active === link.id && <span aria-hidden="true">✓</span>}</Link>)}</nav>
            {!preview && <Link className={styles.menuAction} href="/employee/password/">Reset password</Link>}
            {preview ? <Link className={styles.menuAction} href="/employee/">Employee sign in <span aria-hidden="true">→</span></Link> : <form action="/api/employee/auth/logout" method="post"><button className={styles.menuAction} type="submit">Sign out <span aria-hidden="true">→</span></button></form>}
          </div>
        </details>
      </div>
    </div>
  </header>
}

'use client'

import { useEffect, useRef, useState } from 'react'
import EmployeeHeader from './EmployeeHeader'
import styles from './TeamPage.module.css'

type Member = { id: string; email: string; name: string; role: 'superadmin' | 'employee'; status: 'invited' | 'active' | 'disabled'; invited_at: string | null; last_sign_in_at?: string | null }
type Action = 'disable' | 'restore' | 'resend' | 'revoke'
const sampleMembers: Member[] = [
  { id: 'sample-owner', name: 'Studio owner', email: 'owner@example.test', role: 'superadmin', status: 'active', invited_at: null },
  { id: 'sample-alex', name: 'Alex Morgan', email: 'alex@example.test', role: 'employee', status: 'active', invited_at: '2026-09-26T18:00:00Z', last_sign_in_at: '2026-09-27T18:00:00Z' },
  { id: 'sample-jordan', name: 'Jordan Lee', email: 'jordan@example.test', role: 'employee', status: 'invited', invited_at: '2026-09-27T18:00:00Z' },
]
const statusLabel = { invited: 'Invited', active: 'Active', disabled: 'Disabled' }
function dateLabel(value?: string | null) {
  if (!value) return 'Not available'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' })
}

export default function TeamPage({ email, preview = false }: { email: string; preview?: boolean }) {
  const [members, setMembers] = useState<Member[]>(preview ? sampleMembers : [])
  const [loading, setLoading] = useState(!preview)
  const [refresh, setRefresh] = useState(0)
  const [name, setName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [message, setMessage] = useState('')
  const [confirmation, setConfirmation] = useState<{ member: Member; action: 'disable' | 'revoke' } | null>(null)
  const actionOrigin = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (preview) return
    const controller = new AbortController()
    setLoading(true)
    fetch('/api/employee/team', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Team access could not be loaded.'); return data.members as Member[] })
      .then((data) => { setMembers(data); setLoadError('') })
      .catch((failure) => { if (!controller.signal.aborted) setLoadError(failure instanceof Error ? failure.message : 'Team access could not be loaded.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [preview, refresh])

  async function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError(''); setMessage('')
    if (preview) {
      if (members.some((member) => member.email.toLowerCase() === inviteEmail.trim().toLowerCase())) { setError('That email already appears in this preview.'); return }
      setMembers((current) => [...current, { id: crypto.randomUUID(), name: name.trim(), email: inviteEmail.trim().toLowerCase(), role: 'employee', status: 'invited', invited_at: new Date().toISOString() }])
      setName(''); setInviteEmail(''); setMessage('Sample invitation added. No invitation emails are sent in this preview.'); return
    }
    setBusy('invite')
    try {
      const response = await fetch('/api/employee/team', { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inviteEmail.trim(), name: name.trim() }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'The invitation could not be sent. Please try again.')
      setName(''); setInviteEmail(''); setMessage(data.message || 'Invitation requested.'); setRefresh((value) => value + 1)
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The invitation could not be sent. Please try again.'); setRefresh((value) => value + 1) }
    finally { setBusy('') }
  }

  async function update(member: Member, action: Action) {
    if (busy || member.role === 'superadmin' || member.email.toLowerCase() === 'founder@vibeshackstudios.com') return
    setError(''); setMessage('')
    if (preview) {
      setMembers((current) => current.map((item) => item.id !== member.id ? item : { ...item, status: action === 'disable' || action === 'revoke' ? 'disabled' : action === 'restore' ? item.last_sign_in_at ? 'active' : 'invited' : item.status }))
      setConfirmation(null); setMessage('Preview updated. No account access was changed and no invitation emails were sent.'); return
    }
    setBusy(member.id)
    try {
      const response = await fetch('/api/employee/team', { method: 'PATCH', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: member.id, action }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'This account could not be updated. Please try again.')
      setConfirmation(null); setMessage(data.message || 'Team access updated.'); setRefresh((value) => value + 1)
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'This account could not be updated. Please try again.'); setRefresh((value) => value + 1) }
    finally { setBusy('') }
  }

  return <>
    <EmployeeHeader email={email} preview={preview} role="superadmin" active="team" />
    <div id="employee-content" tabIndex={-1} className={styles.workspace}>
      <div className={styles.heading}><div><h1>Your team.</h1><p>Invite the people who help bring every session together.</p></div><span className={styles.accessLabel}>{preview ? 'Local preview' : 'Superadmin access'}</span></div>
      <section className={styles.inviteCard} aria-labelledby="invite-heading">
        <div className={styles.inviteIntro}><h2 id="invite-heading">Invite an employee</h2><p>They’ll receive an email link to join the workspace.</p></div>
        <form className={styles.inviteForm} onSubmit={invite}>
          <label htmlFor="team-name">Full name<input id="team-name" name="employee-name" required maxLength={120} autoComplete="off" value={name} onChange={(event) => setName(event.target.value)} placeholder="Employee name" disabled={Boolean(busy)} /></label>
          <label htmlFor="team-email">Email address<input id="team-email" name="employee-email" type="email" inputMode="email" autoComplete="off" autoCapitalize="none" spellCheck={false} required maxLength={254} value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="name@company.com" disabled={Boolean(busy)} /></label>
          <button className={styles.primary} type="submit" disabled={Boolean(busy)}>{busy === 'invite' ? 'Sending…' : preview ? 'Preview invitation' : 'Send invitation'}<span aria-hidden="true">↗</span></button>
        </form>
        <p className={styles.note}>{preview ? 'No invitation emails are sent in this preview. Use fictional details only.' : 'Invited employees can book clients. Only the Superadmin manages team access.'}</p>
      </section>
      {message && <p className={styles.notice} role="status">{message}</p>}
      {(error || loadError) && <div className={styles.error} role="alert">{error && <p>{error}</p>}{loadError && <p>{loadError}</p>}{!preview && !busy && <button type="button" onClick={() => setRefresh((value) => value + 1)}>Reload team</button>}</div>}
      <section className={styles.members} aria-labelledby="members-heading" aria-busy={loading}>
        <div className={styles.sectionHeading}><h2 id="members-heading">People with access</h2><span>{loading ? 'Loading…' : members.length + (members.length === 1 ? ' person' : ' people')}</span></div>
        {loading && !members.length ? <p className={styles.empty} role="status">Loading your team…</p> : !members.length ? <p className={styles.empty}>No team members to display.</p> : <table className={styles.table}>
          <caption className="sr-only">Employee access and invitation status</caption>
          <thead><tr><th scope="col">Team member</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Added</th><th scope="col"><span className="sr-only">Account actions</span></th></tr></thead>
          <tbody>{members.map((member) => {
            const protectedAccount = member.role === 'superadmin' || member.email.toLowerCase() === 'founder@vibeshackstudios.com'
            const confirm = confirmation?.member.id === member.id ? confirmation : null
            return <tr key={member.id}>
              <th scope="row" className={styles.member}><span className={styles.avatar} aria-hidden="true">{member.name.trim().charAt(0).toUpperCase() || '•'}</span><div><strong>{member.name || 'Team member'}</strong><span>{member.email}</span></div></th>
              <td data-label="Role">{member.role === 'superadmin' ? 'Superadmin' : 'Employee'}</td>
              <td data-label="Status"><span className={styles.status} data-status={member.status}>{statusLabel[member.status]}</span></td>
              <td data-label="Added" className={styles.date}>{dateLabel(member.invited_at)}</td>
              <td className={styles.actions}>{protectedAccount ? <span className={styles.protected}>Protected account</span> : <>
                <div className={styles.rowActions}>
                  {member.status === 'invited' && <button type="button" disabled={Boolean(busy)} onClick={() => update(member, 'resend')} aria-label={'Resend invitation to ' + member.name}>{busy === member.id ? 'Updating…' : 'Resend'}</button>}
                  {member.status === 'disabled' ? <button type="button" disabled={Boolean(busy)} onClick={() => update(member, 'restore')} aria-label={'Restore access for ' + member.name}>{busy === member.id ? 'Updating…' : 'Restore access'}</button> : <button type="button" disabled={Boolean(busy)} aria-expanded={Boolean(confirm)} aria-label={(member.status === 'invited' ? 'Revoke invitation for ' : 'Disable access for ') + member.name} onClick={(event) => { actionOrigin.current = event.currentTarget; setConfirmation({ member, action: member.status === 'invited' ? 'revoke' : 'disable' }) }}>{member.status === 'invited' ? 'Revoke' : 'Disable access'}</button>}
                </div>
                {confirm && <div className={styles.confirmation} role="group" aria-label="Confirm access change"><p>{confirm.action === 'revoke' ? 'Withdraw the invitation for ' : 'Disable access for '}{member.name || member.email}?</p><span>Booking history will be preserved.</span><div><button type="button" disabled={Boolean(busy)} onClick={() => update(member, confirm.action)}>{busy === member.id ? 'Updating…' : confirm.action === 'revoke' ? 'Revoke invitation' : 'Disable access'}</button><button type="button" disabled={Boolean(busy)} onClick={() => { setConfirmation(null); actionOrigin.current?.focus() }}>Keep access</button></div></div>}
              </>}</td>
            </tr>
          })}</tbody>
        </table>}
      </section>
      <p className={styles.footer}>Account access can change. The original creator stays attached to every booking.</p>
    </div>
  </>
}

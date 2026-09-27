import { redirect } from 'next/navigation'
import { currentEmployee } from '@/lib/employee/access'
import { employeeAdmin } from '@/lib/employee/supabase'
import EmployeeHeader from '../EmployeeHeader'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'
const descriptions: Record<string, string> = {
  'account.activated': 'Activated account',
  'team.invite': 'Invited employee',
  'team.resend': 'Requested another invitation',
  'team.revoke': 'Revoked invitation',
  'team.disable': 'Disabled employee access',
  'team.restore': 'Restored employee access',
  'invitation.delivery_unconfirmed': 'Invitation delivery could not be confirmed',
}

export default async function EmployeeActivity() {
  const employee = await currentEmployee()
  if (!employee) redirect('/employee/')
  if (employee.role !== 'superadmin') redirect('/employee/book/')
  const { data, error } = await employeeAdmin().from('employee_activity').select('id,actor_email,action,target_email,created_at').order('id', { ascending: false }).limit(100)
  return <>
    <EmployeeHeader email={employee.email} role={employee.role} active="activity" preview={false} />
    <main id="employee-content" tabIndex={-1} className={styles.page}>
      <p className={styles.eyebrow}>VIBESHACK TEAM</p><h1>Account activity</h1>
      <p className={styles.intro}>The latest 100 account and invitation actions. All times Pacific.</p>
      {error ? <p role="alert" className={styles.empty}>Activity is temporarily unavailable. Please reload to retry.</p> : !data?.length ? <p className={styles.empty}>Account activity will appear here as your team joins.</p> : <ol className={styles.list}>
        {data.map((event) => <li key={event.id}>
          <div><strong>{descriptions[event.action] || 'Account updated'}</strong><p>{event.target_email}</p><span>By {event.actor_email}</span></div>
          <time dateTime={event.created_at}>{new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.created_at))}</time>
        </li>)}
      </ol>}
    </main>
  </>
}

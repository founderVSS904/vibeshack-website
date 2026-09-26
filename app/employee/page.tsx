import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { EMPLOYEE_COOKIE, employeeAuthConfigured, localEmployeePreview, readEmployeeSession } from '@/lib/employee/auth'
export const dynamic = 'force-dynamic'
export default async function EmployeeLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (readEmployeeSession((await cookies()).get(EMPLOYEE_COOKIE)?.value)) redirect('/employee/book/')
  const configured = employeeAuthConfigured()
  const params = await searchParams
  return <>
    <header className="employee-topbar"><Link href="/" className="employee-wordmark">VibeShack<span>STUDIOS</span></Link><Link href="/">Back to website ↗</Link></header>
    <div className="employee-login">
      <div className="employee-login-icon" aria-hidden="true">VS</div><span className="employee-eyebrow">FOR THE TEAM</span>
      <h1>Good to have you back.</h1><p>Reserve a studio for your client.<br />They can take care of payment later.</p>
      <div className="employee-card employee-login-card"><h2>Employee sign-in</h2><p>Use your approved VibeShack Google account.</p>
        {params.error && <p role="alert" className="employee-notice">We couldn’t sign you in. Try again with an approved account.</p>}
        {configured ? <a className="employee-primary" href="/api/employee/auth/login">Continue with Google <span aria-hidden="true">↗</span></a> : <p className="employee-notice">Secure sign-in is awaiting administrator setup. Public access is closed.</p>}
        {localEmployeePreview() && <Link className="employee-primary" href="/employee/preview/">Explore local booking preview →</Link>}
        <small>Invite-only access. No shared passwords.</small>
      </div>
    </div>
  </>
}

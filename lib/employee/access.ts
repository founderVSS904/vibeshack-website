import 'server-only'
import { employeeDisplayName } from './identity'
import { employeeAdmin, employeeSupabase, employeeSupabaseConfigured } from './supabase'

export type CurrentEmployee = {
  id: string; email: string; name?: string; role: 'superadmin' | 'employee'; status: 'active'; mfaVerified: boolean
}

export async function currentEmployee(): Promise<CurrentEmployee | null> {
  if (!employeeSupabaseConfigured()) return null
  try {
    const supabase = await employeeSupabase()
    const { data: identity, error: identityError } = await supabase.auth.getUser()
    if (identityError || !identity.user?.email || !identity.user.email_confirmed_at) return null
    const { data: verified, error: claimsError } = await supabase.auth.getClaims()
    if (claimsError || !verified?.claims || verified.claims.sub !== identity.user.id) return null
    const { data: member, error } = await employeeAdmin().from('employee_members')
      .select('user_id,email,name,role,status').eq('user_id', identity.user.id).maybeSingle()
    if (error || !member || member.status !== 'active' || member.email !== identity.user.email.toLowerCase()) return null
    if (member.role !== 'employee' && member.role !== 'superadmin') return null
    if (member.role === 'superadmin' && member.email !== 'founder@vibeshackstudios.com') return null
    const mfaVerified = verified.claims.aal === 'aal2'
    return { id: identity.user.id, email: member.email, name: employeeDisplayName(member.name) || employeeDisplayName(identity.user.user_metadata?.full_name || identity.user.user_metadata?.name), role: member.role, status: 'active', mfaVerified }
  } catch { return null }
}

// Only a verified password, OAuth code, or email token reaches this function.
// The service-only SQL function checks the confirmed Auth user and invitation.
export async function acceptEmployeeIdentity() {
  const supabase = await employeeSupabase()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user?.email_confirmed_at) throw new Error('Employee identity was not verified')
  const accepted = await employeeAdmin().rpc('employee_accept_identity', { p_user_id: data.user.id })
  if (accepted.error) throw new Error('Employee access is not available')
  const employee = await currentEmployee()
  if (!employee) throw new Error('Employee access is not available')
  return employee
}

export function employeeDestination(employee: CurrentEmployee) {
  return employee.status === 'active' ? '/employee/book/' : '/employee/'
}

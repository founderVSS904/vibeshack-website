import { NextRequest } from 'next/server'
import { employeeGuard, employeeJson } from '@/lib/employee/http'
import { employeeAdmin } from '@/lib/employee/supabase'
import { sendEmployeeAccessLink } from '@/lib/employee/invitations'
import { readJsonBody, jsonBodyErrorResponse } from '@/lib/server/request-guards'
import { isEmail, stripControlChars } from '@/lib/server/sanitize'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const guard = await employeeGuard(req, false, { superadmin: true })
  if (guard.response) return guard.response
  try {
    const { data, error } = await employeeAdmin().from('employee_members').select('id,email,name,role,status,invited_at,updated_at').order('invited_at', { ascending: true }).limit(500)
    if (error) throw error
    return employeeJson({ members: data || [] })
  } catch { return employeeJson({ error: 'The team list is unavailable. Please retry.' }, 503) }
}

async function manage(req: NextRequest, invite: boolean) {
  const guard = await employeeGuard(req, true, { superadmin: true })
  if (guard.response) return guard.response
  try {
    const body = await readJsonBody(req, 2000)
    const email = stripControlChars(body?.email, 254).trim().toLowerCase()
    const name = stripControlChars(body?.name, 120).trim()
    const action = invite ? 'invite' : body?.action
    if (invite && (!isEmail(email) || !name)) return employeeJson({ error: 'Enter the employee’s name and a valid email.' }, 400)
    if (!invite && (!['disable','restore','resend','revoke'].includes(action) || typeof body?.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.id))) return employeeJson({ error: 'Invalid account action.' }, 400)
    const admin = employeeAdmin()
    const { data, error } = await admin.rpc('employee_manage_member', { p_actor: guard.employee.id, p_action: action, p_email: invite ? email : null, p_name: invite ? name : null, p_member_id: invite ? null : body.id })
    if (error || !data) {
      const safe = ['Account already exists','Superadmin is protected','Only pending invitations can be resent','Wait a minute before resending','Invitation limit reached','Only pending invitations can be revoked','Only active employees can be disabled','Only disabled accounts can be restored']
      return employeeJson({ error: safe.includes(error?.message || '') ? error!.message : 'The account action could not be completed. Refresh and retry.' }, 409)
    }
    if (action === 'invite' || action === 'resend') {
      try {
        await sendEmployeeAccessLink(data.email, data.name, action === 'invite' ? 'invite' : 'magiclink')
      } catch {
        await admin.from('employee_activity').insert({ actor_user_id: guard.employee.id, actor_email: guard.employee.email, action: 'invitation.delivery_unconfirmed', target_email: data.email })
        return employeeJson({ error: 'Access is invited, but email delivery could not be confirmed. Check the inbox before resending after one minute.' }, 503)
      }
      return employeeJson({ ok: true, message: 'Invitation accepted by the email provider. The employee can now check their inbox.' })
    }
    return employeeJson({ ok: true, message: action === 'restore' ? 'Account access restored.' : action === 'revoke' ? 'Invitation revoked.' : 'Employee access disabled.' })
  } catch (error) { return jsonBodyErrorResponse(error) || employeeJson({ error: 'The account action could not be completed. Please retry.' }, 503) }
}
export async function POST(req: NextRequest) { return manage(req, true) }
export async function PATCH(req: NextRequest) { return manage(req, false) }

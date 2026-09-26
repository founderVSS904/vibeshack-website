import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { google } from 'googleapis'

export const EMPLOYEE_COOKIE = 'vs_employee'
export const OAUTH_COOKIE = 'vs_employee_oauth'
export const SESSION_SECONDS = 8 * 60 * 60
export type EmployeeSession = { email: string; exp: number; purpose: 'employee-session' }

function secret() {
  const value = process.env.EMPLOYEE_SESSION_SECRET || ''
  if (value.length < 32) throw new Error('Employee access is not configured')
  return value
}
export function allowedEmployee(email: string) {
  return (process.env.EMPLOYEE_ALLOWED_EMAILS || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase())
}
export function employeeOrigin() {
  const url = new URL(process.env.EMPLOYEE_BASE_URL || 'https://www.vibeshackstudios.com')
  if (url.protocol !== 'https:' && !(process.env.NODE_ENV === 'development' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new Error('Invalid employee origin')
  return url.origin
}
export function employeeAuthConfigured() {
  try {
    secret(); employeeOrigin()
    return Boolean(process.env.EMPLOYEE_GOOGLE_CLIENT_ID && process.env.EMPLOYEE_GOOGLE_CLIENT_SECRET && process.env.EMPLOYEE_ALLOWED_EMAILS?.trim())
  } catch { return false }
}
export function signEmployeeToken(value: object) {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${payload}.${createHmac('sha256', secret()).update(payload).digest('base64url')}`
}
export function readEmployeeToken<T extends { exp: number; purpose: string }>(token: string | undefined, purpose: string): T | null {
  try {
    if (!token || token.length > 4096) return null
    const parts = token.split('.')
    if (parts.length !== 2) return null
    const expected = createHmac('sha256', secret()).update(parts[0]).digest()
    const actual = Buffer.from(parts[1], 'base64url')
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const value = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as T
    return value.purpose === purpose && Number.isFinite(value.exp) && value.exp > Date.now() ? value : null
  } catch { return null }
}
export function readEmployeeSession(token?: string) {
  const value = readEmployeeToken<EmployeeSession>(token, 'employee-session')
  return value && typeof value.email === 'string' && allowedEmployee(value.email) ? value : null
}
export function employeeCookieOptions(maxAge = SESSION_SECONDS) {
  return { httpOnly: true, secure: employeeOrigin().startsWith('https:'), sameSite: 'lax' as const, path: '/', maxAge }
}
export function employeeOAuthClient() {
  if (!employeeAuthConfigured()) throw new Error('Employee access is not configured')
  return new google.auth.OAuth2(process.env.EMPLOYEE_GOOGLE_CLIENT_ID, process.env.EMPLOYEE_GOOGLE_CLIENT_SECRET, `${employeeOrigin()}/api/employee/auth/callback`)
}
export function newOAuthAttempt() {
  return { purpose: 'employee-oauth', state: randomBytes(32).toString('base64url'), nonce: randomBytes(32).toString('base64url'), verifier: randomBytes(48).toString('base64url'), exp: Date.now() + 10 * 60_000 }
}
// UI-only fixture. This never authenticates an API request or supplies provider credentials.
export function localEmployeePreview() {
  return process.env.NODE_ENV === 'development' && !process.env.VERCEL && process.env.EMPLOYEE_LOCAL_PREVIEW === '1'
}

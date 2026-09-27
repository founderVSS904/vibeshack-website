import { createClient } from '@supabase/supabase-js'

const names = ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SECRET_KEY']
const configured = names.filter((name) => Boolean(process.env[name]))
if (!configured.length) {
  if (process.env.VERCEL_ENV === 'production') {
    console.error('Production requires the private account and request-limit database configuration.')
    process.exitCode = 1
  } else {
    console.log('Private account and request-limit integration is not configured in this environment. Provider-backed requests remain closed.')
  }
} else {
  try {
    if (configured.length !== names.length) throw new Error('Incomplete employee account configuration')
    const options = { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15_000) }) } }
    const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, options)
    const result = await admin.from('employee_members').select('role,status').limit(1)
    if (result.error) throw new Error('Employee account store is unavailable or the migration has not been applied')
    const rateLimits = await admin.rpc('request_rate_limit_ready')
    if (rateLimits.error || rateLimits.data !== true) throw new Error('Private request limits are unavailable or their access restrictions could not be verified')
    const anonymous = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, options)
    const denied = await anonymous.from('employee_members').select('id').limit(1)
    if (!denied.error || denied.error.code !== '42501') throw new Error('Employee membership access restrictions could not be verified')
    const response = await fetch(new URL('/auth/v1/settings', process.env.SUPABASE_URL), { headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY }, signal: AbortSignal.timeout(15_000) })
    if (!response.ok) throw new Error('Employee authentication is unavailable')
    const settings = await response.json()
    if (!settings.external?.email) throw new Error('Employee email authentication is disabled')
    if (process.env.EMPLOYEE_GOOGLE_ENABLED === '1' && !settings.external?.google) throw new Error('Google sign-in is enabled in the app but unavailable at the provider')
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) throw new Error('Employee invitation mail transport is not configured')
    console.log('Employee account database, private request limits, private access, authentication, and mail configuration verified. No records or emails were created.')
  } catch (error) {
    // Never expose provider objects, request headers, keys, or database records.
    console.error(error instanceof Error && ['Incomplete employee account configuration','Employee account store is unavailable or the migration has not been applied','Private request limits are unavailable or their access restrictions could not be verified','Employee membership access restrictions could not be verified','Employee authentication is unavailable','Employee email authentication is disabled','Google sign-in is enabled in the app but unavailable at the provider','Employee invitation mail transport is not configured'].includes(error.message) ? error.message : 'Employee integration verification failed. Inspect the secure provider configuration.')
    process.exitCode = 1
  }
}

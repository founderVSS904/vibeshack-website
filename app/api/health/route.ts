import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const REQUIRED_ENV_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'GMAIL_APP_PASSWORD',
  'CRON_SECRET',
]

function missingEnvVars() {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name])
  const hasStripePublishableKey = Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
  )
  if (!hasStripePublishableKey) {
    missing.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY|STRIPE_PUBLISHABLE_KEY')
  }
  const hasCalendarToken = Boolean(
    process.env.GCAL_TOKEN_JSON || process.env.GCAL_TOKEN_B64 || process.env.GCAL_TOKEN_PATH,
  )
  if (!hasCalendarToken) missing.push('GCAL_TOKEN_JSON|GCAL_TOKEN_B64|GCAL_TOKEN_PATH')
  return missing
}

export async function GET(req: NextRequest) {
  const missing = missingEnvVars()
  // Variable names are only listed for callers holding the cron secret, so the
  // public endpoint reveals nothing about server configuration.
  const cronSecret = process.env.CRON_SECRET
  const authorized = Boolean(cronSecret) && req.headers.get('authorization') === `Bearer ${cronSecret}`

  return NextResponse.json({
    status: 'ok',
    service: 'vibeshack-website',
    timestamp: new Date().toISOString(),
    envConfigured: missing.length === 0,
    ...(authorized ? { missingEnv: missing } : {}),
  }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

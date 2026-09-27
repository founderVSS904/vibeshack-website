import 'server-only'
import { createHmac } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, rateLimit } from './request-guards'

type DistributedRateLimitOptions = {
  key: string
  max: number
  windowMs: number
  // A subject replaces the IP identity, for a separate account/recipient cap.
  subject?: string
}

export function rateLimitSubjectHash(key: string, subject: string) {
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!secret || !key || !subject) throw new Error('Rate limiting is unavailable')
  return createHmac('sha256', secret).update(JSON.stringify(['vibeshack-rate-limit-v1', key, subject])).digest('hex')
}

function rateLimitStore() {
  const url = new URL(process.env.SUPABASE_URL || '')
  const local = process.env.NODE_ENV === 'development' && ['localhost', '127.0.0.1'].includes(url.hostname)
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || !process.env.SUPABASE_SECRET_KEY) throw new Error('Rate limiting is unavailable')
  return createClient(url.toString(), process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(5_000) }) },
  })
}

// The database owns the clock and atomically counts across server instances.
// Fixed windows may allow two bursts across a boundary; they do not impose a
// sliding account lockout. Fail closed when the shared store is unavailable.
export async function distributedRateLimit(req: NextRequest, options: DistributedRateLimitOptions): Promise<NextResponse | null> {
  try {
    const { key, max, windowMs, subject } = options
    if (!key || key.length > 120 || !Number.isInteger(max) || max < 1 || max > 10_000 || !Number.isInteger(windowMs) || windowMs < 1_000 || windowMs > 86_400_000) throw new Error('Invalid rate limit')
    const scope = subject === undefined ? 'ip' : 'subject'
    const bucket = rateLimitSubjectHash(`${key}:${scope}:${windowMs}`, subject === undefined ? getClientIp(req) : subject)
    // Reject repeated local bursts before making another database request.
    // Passing this filter never grants access without the durable claim below.
    const local = rateLimit(req, { key: `durable:${bucket}`, max, windowMs })
    if (local) return local
    const { data, error } = await rateLimitStore().rpc('request_rate_limit_claim', { p_bucket_hash: bucket, p_max: max, p_window_ms: windowMs })
    if (error || typeof data?.allowed !== 'boolean' || !Number.isInteger(data.retry_after_seconds) || data.retry_after_seconds < 0 || data.retry_after_seconds > 86_400) throw new Error('Rate limit claim failed')
    if (data.allowed) return null
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.max(1, data.retry_after_seconds)), 'Cache-Control': 'private, no-store' },
    })
  } catch {
    return NextResponse.json({ error: 'This request is temporarily unavailable. Please try again shortly.' }, {
      status: 503, headers: { 'Retry-After': '30', 'Cache-Control': 'private, no-store' },
    })
  }
}

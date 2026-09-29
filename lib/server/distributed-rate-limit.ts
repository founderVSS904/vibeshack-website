import 'server-only'
import { createHash, createHmac } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, rateLimit } from './request-guards'

type DistributedRateLimitOptions = {
  key: string
  max: number
  windowMs: number
  // A subject replaces the IP identity, for a separate account/recipient cap.
  subject?: string
  // Public booking and lead routes keep serving on this instance's limit when
  // the shared store cannot answer. Omit it to fail closed (employee auth).
  fallback?: 'local'
}

// After a store failure, fallback callers skip the store until this moment so
// a dead store does not add its timeout to every public request.
const STORE_RETRY_MS = 30_000
let storeRetryAt = 0

export function rateLimitSubjectHash(key: string, subject: string) {
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!secret || !key || !subject) throw new Error('Rate limiting is unavailable')
  return createHmac('sha256', secret).update(JSON.stringify(['vibeshack-rate-limit-v1', key, subject])).digest('hex')
}

// Without the HMAC secret a fallback caller still needs a stable local bucket.
// This unkeyed digest only names an in-memory counter and is never stored.
function localBucketHash(key: string, subject: string) {
  if (!key || !subject) throw new Error('Invalid rate limit')
  return createHash('sha256').update(JSON.stringify(['vibeshack-rate-limit-local-v1', key, subject])).digest('hex')
}

function rateLimitStore(timeoutMs: number) {
  const url = new URL(process.env.SUPABASE_URL || '')
  const local = process.env.NODE_ENV === 'development' && ['localhost', '127.0.0.1'].includes(url.hostname)
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || !process.env.SUPABASE_SECRET_KEY) throw new Error('Rate limiting is unavailable')
  return createClient(url.toString(), process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) }) },
  })
}

// Resolves to null or a 429 from the shared store; throws when it cannot answer.
async function claimSharedLimit(bucket: string, max: number, windowMs: number, timeoutMs: number) {
  const { data, error } = await rateLimitStore(timeoutMs).rpc('request_rate_limit_claim', { p_bucket_hash: bucket, p_max: max, p_window_ms: windowMs })
  if (error || typeof data?.allowed !== 'boolean' || !Number.isInteger(data.retry_after_seconds) || data.retry_after_seconds < 0 || data.retry_after_seconds > 86_400) throw new Error('Rate limit claim failed')
  if (data.allowed) return null
  return NextResponse.json({ error: 'Too many requests. Please try again later.' }, {
    status: 429,
    headers: { 'Retry-After': String(Math.max(1, data.retry_after_seconds)), 'Cache-Control': 'private, no-store' },
  })
}

// The database owns the clock and atomically counts across server instances.
// Fixed windows may allow two bursts across a boundary; they do not impose a
// sliding account lockout. By default fail closed when the shared store is
// unavailable. With `fallback: 'local'` a store outage (missing config, error,
// timeout or a malformed reply) degrades to the in-process limit instead. That
// keeps bookings open, but during an outage each server instance counts on its
// own, so the overall cap grows with the number of warm instances. A 429 from
// a store that answers is still final.
export async function distributedRateLimit(req: NextRequest, options: DistributedRateLimitOptions): Promise<NextResponse | null> {
  try {
    const { key, max, windowMs, subject, fallback } = options
    if (!key || key.length > 120 || !Number.isInteger(max) || max < 1 || max > 10_000 || !Number.isInteger(windowMs) || windowMs < 1_000 || windowMs > 86_400_000) throw new Error('Invalid rate limit')
    const scope = subject === undefined ? 'ip' : 'subject'
    const keyed = !fallback || Boolean(process.env.SUPABASE_SECRET_KEY)
    const bucket = (keyed ? rateLimitSubjectHash : localBucketHash)(`${key}:${scope}:${windowMs}`, subject === undefined ? getClientIp(req) : subject)
    // Reject repeated local bursts before making another database request.
    // The counter follows the bucket, so a subject cap spans every address.
    // Passing this filter never grants access without the durable claim below,
    // except for fallback callers while the store cannot answer.
    const local = rateLimit(req, { key: 'durable', identity: bucket, max, windowMs })
    if (local) return local
    if (!fallback) return await claimSharedLimit(bucket, max, windowMs, 5_000)
    if (Date.now() < storeRetryAt) return null
    try {
      if (!keyed) throw new Error('Rate limiting is unavailable')
      return await claimSharedLimit(bucket, max, windowMs, 2_000)
    } catch {
      // One warning per retry window, with no address, subject or provider detail.
      if (Date.now() >= storeRetryAt) {
        storeRetryAt = Date.now() + STORE_RETRY_MS
        console.warn(`Shared rate limit store unavailable; using local limits for ${key}`)
      }
      return null
    }
  } catch {
    return NextResponse.json({ error: 'This request is temporarily unavailable. Please try again shortly.' }, {
      status: 503, headers: { 'Retry-After': '30', 'Cache-Control': 'private, no-store' },
    })
  }
}

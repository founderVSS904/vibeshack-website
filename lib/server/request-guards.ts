import { NextRequest, NextResponse } from 'next/server'

interface RateLimitOptions {
  key: string
  max: number
  windowMs: number
}

const buckets = new Map<string, { count: number; resetAt: number }>()
const MAX_BUCKETS = 10_000

function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json({ error: 'Too many requests. Please try again later.' }, {
    status: 429,
    headers: { 'Retry-After': String(retryAfterSeconds), 'Cache-Control': 'private, no-store' },
  })
}

export function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const vercelForwardedFor = req.headers.get('x-vercel-forwarded-for')
  const nextIp = (req as unknown as { ip?: string }).ip

  return (vercelForwardedFor || forwardedFor || realIp || nextIp || 'unknown')
    .split(',')[0]
    .trim()
}

export function rateLimit(req: NextRequest, { key, max, windowMs }: RateLimitOptions) {
  const now = Date.now()
  const bucketKey = `${key}:${getClientIp(req)}`
  const current = buckets.get(bucketKey)

  if (!current || current.resetAt <= now) {
    if (!current && buckets.size >= MAX_BUCKETS) {
      for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key)
      // Keep active limits intact instead of evicting them to admit more keys.
      if (buckets.size >= MAX_BUCKETS) return tooManyRequests(60)
    }
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs })
    return null
  }

  current.count += 1
  if (current.count <= max) return null

  const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000))
  return tooManyRequests(retryAfterSeconds)
}

export async function readTextBody(req: Request, maxBytes: number) {
  const contentLength = Number(req.headers.get('content-length') || 0)
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    void req.body?.cancel().catch(() => {})
    throw new Error('REQUEST_TOO_LARGE')
  }
  if (!req.body) return ''
  const reader = req.body.getReader()
  const chunks: Uint8Array[] = []
  let bytes = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > maxBytes) {
        void reader.cancel().catch(() => {})
        throw new Error('REQUEST_TOO_LARGE')
      }
      chunks.push(value)
    }
    return Buffer.concat(chunks, bytes).toString('utf8')
  } finally {
    reader.releaseLock()
  }
}

export async function readJsonBody(req: NextRequest, maxBytes: number) {
  const contentType = req.headers.get('content-type') || ''
  if (contentType.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
    throw new Error('UNSUPPORTED_MEDIA_TYPE')
  }
  const raw = await readTextBody(req, maxBytes)
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('INVALID_JSON')
  }
}

export function jsonBodyErrorResponse(error: unknown) {
  if (!(error instanceof Error)) return null

  if (error.message === 'UNSUPPORTED_MEDIA_TYPE') {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
  }

  if (error.message === 'REQUEST_TOO_LARGE') {
    return NextResponse.json({ error: 'Request body is too large' }, { status: 413 })
  }

  if (error.message === 'INVALID_JSON') {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  return null
}

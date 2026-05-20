import { NextRequest, NextResponse } from 'next/server'

interface RateLimitOptions {
  key: string
  max: number
  windowMs: number
}

const buckets = new Map<string, { count: number; resetAt: number }>()

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
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs })
    return null
  }

  current.count += 1
  if (current.count <= max) return null

  const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000))
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    },
  )
}

export async function readJsonBody(req: NextRequest, maxBytes: number) {
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error('UNSUPPORTED_MEDIA_TYPE')
  }

  const contentLength = Number(req.headers.get('content-length') || 0)
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error('REQUEST_TOO_LARGE')
  }

  const raw = await req.text()
  if (Buffer.byteLength(raw, 'utf8') > maxBytes) {
    throw new Error('REQUEST_TOO_LARGE')
  }

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

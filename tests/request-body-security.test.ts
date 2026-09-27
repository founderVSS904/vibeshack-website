import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NextRequest } from 'next/server'
import { jsonBodyErrorResponse, rateLimit, readJsonBody, readTextBody } from '../lib/server/request-guards'

function streamed(chunks: Uint8Array[], headers: Record<string, string> = {}) {
  let reads = 0
  let cancelled = false
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (reads === chunks.length) controller.close()
      else controller.enqueue(chunks[reads++])
    },
    cancel() { cancelled = true },
  }, { highWaterMark: 0 })
  const req = new NextRequest('https://fixture.invalid/api/test', {
    method: 'POST', body: stream, headers,
    duplex: 'half',
  } as NonNullable<ConstructorParameters<typeof NextRequest>[1]>)
  return { req, reads: () => reads, cancelled: () => cancelled }
}

test('stream limits stop oversized bodies before reading the remaining payload', async () => {
  for (const headers of [{}, { 'content-length': '1' }] as Record<string, string>[]) {
    const f = streamed([new Uint8Array(8), new Uint8Array(8), new Uint8Array(1_000_000)], headers)
    await assert.rejects(readTextBody(f.req, 12), /REQUEST_TOO_LARGE/)
    assert.equal(f.reads(), 2)
    assert.equal(f.cancelled(), true)
  }
})

test('declared oversized bodies are rejected without reading a chunk', async () => {
  const f = streamed([new Uint8Array(16)], { 'content-length': '1000' })
  await assert.rejects(readTextBody(f.req, 12), /REQUEST_TOO_LARGE/)
  assert.equal(f.reads(), 0)
  assert.equal(f.cancelled(), true)
  assert.equal(jsonBodyErrorResponse(new Error('REQUEST_TOO_LARGE'))?.status, 413)
})

test('body limits count UTF-8 bytes while preserving split characters at the boundary', async () => {
  const encoded = new TextEncoder().encode('{"name":"café"}')
  const split = encoded.indexOf(0xc3) + 1
  const chunks = [encoded.slice(0, split), encoded.slice(split)]
  const f = streamed(chunks, { 'content-type': 'application/json; charset=utf-8' })
  assert.deepEqual(await readJsonBody(f.req, encoded.length), { name: 'café' })
  const oversized = streamed(chunks, { 'content-type': 'application/json' })
  await assert.rejects(readJsonBody(oversized.req, encoded.length - 1), /REQUEST_TOO_LARGE/)
})

test('JSON parsing rejects deceptive content types and malformed input', async () => {
  const deceptive = streamed([new TextEncoder().encode('{}')], { 'content-type': 'text/plain; application/json' })
  await assert.rejects(readJsonBody(deceptive.req, 100), /UNSUPPORTED_MEDIA_TYPE/)
  assert.equal(deceptive.reads(), 0)
  const malformed = streamed([new TextEncoder().encode('{')], { 'content-type': 'application/json' })
  await assert.rejects(readJsonBody(malformed.req, 100), /INVALID_JSON/)
})

test('the local prefilter stays bounded without evicting active limits', () => {
  const req = new NextRequest('https://fixture.invalid/api/test')
  for (let i = 0; i < 10_000; i++) {
    assert.equal(rateLimit(req, { key: `bounded-${i}`, max: 1, windowMs: 60_000 }), null)
  }
  assert.equal(rateLimit(req, { key: 'overflow', max: 1, windowMs: 60_000 })?.status, 429)
  assert.equal(rateLimit(req, { key: 'bounded-0', max: 1, windowMs: 60_000 })?.status, 429)
  const now = Date.now
  try {
    Date.now = () => now() + 61_000
    assert.equal(rateLimit(req, { key: 'after-expiry', max: 1, windowMs: 60_000 }), null)
  } finally { Date.now = now }
})

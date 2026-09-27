import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { after, before, test } from 'node:test'
import { PGlite } from '@electric-sql/pglite'
import { NextRequest, NextResponse } from 'next/server'
import ts from 'typescript'
import { getClientIp, rateLimit } from '../lib/server/request-guards'

function limiterFixture({ error = false, allowed = true, malformed = false, secret = 'synthetic-server-secret', throws = false, localFilter = false } = {}) {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = []
  const source = readFileSync('lib/server/distributed-rate-limit.ts', 'utf8')
  const ast = ts.createSourceFile('fixture.ts', source, ts.ScriptTarget.ES2022, true)
  const functions = ast.statements.filter(ts.isFunctionDeclaration).map((node) => node.getText(ast).replace(/^export\s+/, '')).join('\n')
  const context = vm.createContext({
    createHmac, URL, Number, NextResponse, getClientIp, AbortSignal,
    rateLimit: localFilter ? rateLimit : () => null,
    process: { env: { SUPABASE_URL: 'https://fixture.supabase.invalid', SUPABASE_SECRET_KEY: secret, NODE_ENV: 'production' } },
    fetch: () => { throw new Error('Network forbidden') },
    createClient: (url: string, key: string, options: { auth: Record<string, boolean> }) => {
      assert.equal(url, 'https://fixture.supabase.invalid/'); assert.equal(key, secret)
      assert.equal(options.auth.persistSession, false); assert.equal(options.auth.autoRefreshToken, false)
      return { rpc: async (name: string, args: Record<string, unknown>) => {
        calls.push({ name, args })
        if (throws) throw new Error('Synthetic private provider exception')
        return { data: malformed ? {} : { allowed, retry_after_seconds: allowed ? 0 : 42 }, error: error ? { message: 'Synthetic private provider error' } : null }
      } }
    },
  })
  vm.runInContext(ts.transpileModule(functions, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, context)
  const request = (ip = '192.0.2.55') => new NextRequest('https://example.invalid/api/fixture', { headers: { 'x-vercel-forwarded-for': ip } })
  return { calls, run: (options: { key: string; max: number; windowMs: number; subject?: string }, ip?: string) => context.distributedRateLimit(request(ip), options) as Promise<NextResponse | null>, hash: (key: string, subject: string) => context.rateLimitSubjectHash(key, subject) as string }
}

test('distributed limits send only stable HMAC identifiers to the private atomic store', async () => {
  const a = limiterFixture(); const b = limiterFixture()
  const options = { key: 'fixture-login', max: 10, windowMs: 600_000 }
  assert.equal(await a.run(options), null); assert.equal(await b.run(options), null)
  assert.equal(a.calls[0].name, 'request_rate_limit_claim')
  assert.equal(a.calls[0].args.p_bucket_hash, b.calls[0].args.p_bucket_hash)
  assert.match(String(a.calls[0].args.p_bucket_hash), /^[a-f0-9]{64}$/)
  assert.doesNotMatch(JSON.stringify(a.calls), /192\.0\.2|fixture-login|synthetic-server-secret/)
  await a.run({ ...options, subject: 'staff@example.invalid' })
  await a.run({ ...options, subject: 'staff@example.invalid' }, '192.0.2.99')
  assert.equal(a.calls[1].args.p_bucket_hash, a.calls[2].args.p_bucket_hash)
  assert.notEqual(a.calls[0].args.p_bucket_hash, a.calls[1].args.p_bucket_hash)
  assert.doesNotMatch(JSON.stringify(a.calls), /staff@example/)
  assert.notEqual(a.hash('recovery', 'staff@example.invalid'), limiterFixture({ secret: 'another-synthetic-secret' }).hash('recovery', 'staff@example.invalid'))
})

test('durable denial exposes only Retry-After and store failures fail closed without provider details', async () => {
  const options = { key: 'fixture', max: 2, windowMs: 60_000 }
  const denied = await limiterFixture({ allowed: false }).run(options)
  assert.equal(denied?.status, 429); assert.equal(denied?.headers.get('Retry-After'), '42')
  assert.equal(denied?.headers.get('Cache-Control'), 'private, no-store')
  for (const settings of [{ error: true }, { malformed: true }, { throws: true }, { secret: '' }]) {
    const fixture = limiterFixture(settings)
    const response = await fixture.run(options)
    assert.equal(response?.status, 503)
    assert.doesNotMatch(await response!.text(), /Synthetic|private provider|secret/)
    if (settings.secret === '') assert.equal(fixture.calls.length, 0)
  }
})

test('invalid limit configuration never calls the database', async () => {
  for (const bad of [{ max: 0 }, { max: 10001 }, { max: 1.2 }, { windowMs: 0 }, { windowMs: 86400001 }, { key: '' }, { subject: '' }]) {
    const fixture = limiterFixture()
    assert.equal((await fixture.run({ key: 'fixture', max: 2, windowMs: 60_000, ...bad }))?.status, 503)
    assert.equal(fixture.calls.length, 0)
  }
})

test('the bounded local prefilter stops repeated bursts without replacing the durable decision', async () => {
  const fixture = limiterFixture({ localFilter: true })
  const options = { key: 'local-filter-fixture', max: 2, windowMs: 60_000 }
  assert.equal(await fixture.run(options), null)
  assert.equal(await fixture.run(options), null)
  assert.equal((await fixture.run(options))?.status, 429)
  assert.equal(fixture.calls.length, 2)
  const denied = limiterFixture({ localFilter: true, allowed: false })
  assert.equal((await denied.run({ ...options, key: 'durable-denial-fixture' }))?.status, 429)
  assert.equal(denied.calls.length, 1)
})

// Actual PostgreSQL functions and grants, with no Supabase project or network.
const db = new PGlite()
const hash = (value: number) => value.toString(16).padStart(64, '0')
before(async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');`)
  for (const migration of ['202609270001_employee_accounts.sql', '202609270002_request_rate_limits.sql']) await db.exec(readFileSync(`supabase/migrations/${migration}`, 'utf8'))
  await db.exec(`insert into public.employee_members(email,name,status) values('recovery@example.invalid','Synthetic Recovery','active'),('disabled@example.invalid','Synthetic Disabled','disabled')`)
})
after(async () => { await db.close() })

async function claim(key: string, max = 10, windowMs = 600_000) {
  const result = await db.query<{ result: { allowed: boolean; retry_after_seconds: number } }>('select public.request_rate_limit_claim($1,$2,$3) as result', [key, max, windowMs])
  return result.rows[0].result
}

test('independent concurrent database claims share one atomic limit and expired windows reopen', async () => {
  const responses = await Promise.all(Array.from({ length: 24 }, () => claim(hash(1))))
  assert.equal(responses.filter((result) => result.allowed).length, 10)
  for (const response of responses.filter((result) => !result.allowed)) assert.ok(response.retry_after_seconds >= 1 && response.retry_after_seconds <= 600)
  await db.query(`update public.request_rate_limits set reset_at=now()-interval '1 second' where bucket_hash=$1`, [hash(1)])
  assert.equal((await claim(hash(1))).allowed, true)
  const count = await db.query<{ requests: number }>('select requests from public.request_rate_limits where bucket_hash=$1', [hash(1)])
  assert.equal(count.rows[0].requests, 1)
})

test('expired-counter cleanup is bounded to 100 rows and excludes current windows', async () => {
  await db.exec(`insert into public.request_rate_limits(bucket_hash,requests,reset_at) select lpad(to_hex(i),64,'0'),1,now()-interval '2 days' from generate_series(1000,1249) i`)
  await claim(hash(2))
  const expired = await db.query<{ count: string }>(`select count(*) from public.request_rate_limits where reset_at < now()-interval '1 day'`)
  assert.equal(Number(expired.rows[0].count), 150)
  const current = await db.query<{ count: string }>('select count(*) from public.request_rate_limits where bucket_hash=$1', [hash(1)])
  assert.equal(Number(current.rows[0].count), 1)
})

test('recipient recovery caps enforce cooldown, five per hour and ten per day atomically', async () => {
  const subject = hash(500)
  const recover = async (email = 'recovery@example.invalid') => (await db.query<{ allowed: boolean }>('select public.employee_claim_recovery_email($1,$2) as allowed', [email, subject])).rows[0].allowed
  assert.equal(await recover('unknown@example.invalid'), false)
  assert.equal(await recover('disabled@example.invalid'), false)
  assert.equal(await recover(), true)
  assert.equal(await recover(), false)
  const elapseMinute = () => db.query(`update public.employee_recovery_limits set last_sent_at=now()-interval '61 seconds' where subject_hash=$1`, [subject])
  for (let attempt = 1; attempt < 5; attempt++) { await elapseMinute(); assert.equal(await recover(), true) }
  await elapseMinute(); assert.equal(await recover(), false)
  await db.query(`update public.employee_recovery_limits set hour_started_at=now()-interval '61 minutes' where subject_hash=$1`, [subject])
  for (let attempt = 0; attempt < 5; attempt++) { await elapseMinute(); assert.equal(await recover(), true) }
  await db.query(`update public.employee_recovery_limits set hour_started_at=now()-interval '61 minutes',last_sent_at=now()-interval '61 seconds' where subject_hash=$1`, [subject])
  assert.equal(await recover(), false)
  await db.query(`update public.employee_recovery_limits set day_started_at=now()-interval '25 hours' where subject_hash=$1`, [subject])
  const simultaneous = await Promise.all(Array.from({ length: 8 }, () => recover()))
  assert.equal(simultaneous.filter(Boolean).length, 1)
  const record = await db.query('select * from public.employee_recovery_limits where subject_hash=$1', [subject])
  assert.doesNotMatch(JSON.stringify(record.rows), /recovery@example|disabled@example/)
})

test('new migration preserves the previous release sign-in RPC during rollout', async () => {
  const result = await db.query<{ allowed: boolean }>(`select public.employee_claim_signin_email('recovery@example.invalid') as allowed`)
  assert.equal(result.rows[0].allowed, true)
})

test('only service role can access counters and RPCs; readiness checks produce no writes', async () => {
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`)
    try {
      for (const table of ['request_rate_limits', 'employee_recovery_limits']) await assert.rejects(db.query(`select * from public.${table}`), /permission denied/)
      await assert.rejects(claim(hash(600)), /permission denied/)
      await assert.rejects(db.query(`select public.employee_claim_recovery_email('recovery@example.invalid',$1)`, [hash(600)]), /permission denied/)
      await assert.rejects(db.query('select public.request_rate_limit_ready()'), /permission denied/)
    } finally { await db.exec('reset role') }
  }
  await db.exec('set role service_role')
  try {
    const beforeRows = await db.query('select * from public.request_rate_limits order by bucket_hash')
    assert.equal((await db.query<{ ready: boolean }>('select public.request_rate_limit_ready() as ready')).rows[0].ready, true)
    assert.deepEqual((await db.query('select * from public.request_rate_limits order by bucket_hash')).rows, beforeRows.rows)
    assert.equal((await claim(hash(601))).allowed, true)
    await assert.rejects(claim('raw-address@example.invalid'), /Invalid rate limit/)
    await assert.rejects(claim(hash(602), 0), /Invalid rate limit/)
  } finally { await db.exec('reset role') }
})

import assert from 'node:assert/strict'
import { createHash, createHmac } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import vm from 'node:vm'
import { after, before, test } from 'node:test'
import { PGlite } from '@electric-sql/pglite'
import { NextRequest, NextResponse } from 'next/server'
import ts from 'typescript'
import { getClientIp, rateLimit } from '../lib/server/request-guards'

type LimitOptions = { key: string; max: number; windowMs: number; subject?: string; fallback?: 'local' }

function limiterFixture({ error = false, allowed = true, malformed = false, secret = 'synthetic-server-secret', throws = false, hang = false, localFilter = false, url = 'https://fixture.supabase.invalid', now = () => Date.now() } = {}) {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = []
  const timeouts: number[] = []
  const warnings: unknown[][] = []
  const state = { error, allowed, malformed, throws, hang }
  const source = readFileSync('lib/server/distributed-rate-limit.ts', 'utf8')
  const ast = ts.createSourceFile('fixture.ts', source, ts.ScriptTarget.ES2022, true)
  // Functions plus module state, so each fixture has its own store retry window.
  const functions = ast.statements.filter((node) => ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)).map((node) => node.getText(ast).replace(/^export\s+/, '')).join('\n')
  const context = vm.createContext({
    createHash, createHmac, URL, Number, NextResponse, getClientIp, Date: { now },
    AbortSignal: { timeout: (ms: number) => { timeouts.push(ms); return AbortSignal.timeout(1) } },
    console: { warn: (...args: unknown[]) => { warnings.push(args) } },
    rateLimit: localFilter ? rateLimit : () => null,
    process: { env: { SUPABASE_URL: url, SUPABASE_SECRET_KEY: secret, NODE_ENV: 'production' } },
    // Never reaches the network: it answers at once or waits for its timeout.
    fetch: (_input: string, init: { signal: AbortSignal }) => state.hang ? new Promise((_resolve, reject) => {
      if (init.signal.aborted) reject(init.signal.reason)
      init.signal.addEventListener('abort', () => reject(init.signal.reason))
    }) : Promise.resolve(new Response('{}')),
    createClient: (url: string, key: string, options: { auth: Record<string, boolean>; global: { fetch: (input: string, init: RequestInit) => Promise<Response> } }) => {
      assert.equal(url, 'https://fixture.supabase.invalid/'); assert.equal(key, secret)
      assert.equal(options.auth.persistSession, false); assert.equal(options.auth.autoRefreshToken, false)
      return { rpc: async (name: string, args: Record<string, unknown>) => {
        calls.push({ name, args })
        await options.global.fetch('https://fixture.supabase.invalid/rest/v1/rpc/request_rate_limit_claim', {})
        if (state.throws) throw new Error('Synthetic private provider exception')
        return { data: state.malformed ? {} : { allowed: state.allowed, retry_after_seconds: state.allowed ? 0 : 42 }, error: state.error ? { message: 'Synthetic private provider error' } : null }
      } }
    },
  })
  vm.runInContext(ts.transpileModule(functions, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, context)
  const request = (ip = '192.0.2.55') => new NextRequest('https://example.invalid/api/fixture', { headers: { 'x-vercel-forwarded-for': ip } })
  return { calls, timeouts, warnings, state, run: (options: LimitOptions, ip?: string) => context.distributedRateLimit(request(ip), options) as Promise<NextResponse | null>, hash: (key: string, subject: string) => context.rateLimitSubjectHash(key, subject) as string }
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

test('only fallback callers keep serving when the store errors, times out, replies badly or is not configured', async () => {
  const options = { key: 'fallback-fixture', max: 2, windowMs: 60_000 }
  for (const settings of [{ error: true }, { malformed: true }, { throws: true }, { hang: true }, { secret: '' }, { url: '' }, { url: 'http://fixture.supabase.invalid' }]) {
    const failClosed = limiterFixture(settings)
    assert.equal((await failClosed.run(options))?.status, 503)
    assert.ok(failClosed.timeouts.every((ms) => ms === 5_000))
    assert.equal(failClosed.warnings.length, 0)
    const fixture = limiterFixture(settings)
    assert.equal(await fixture.run({ ...options, fallback: 'local' }), null)
    assert.ok(fixture.timeouts.every((ms) => ms === 2_000))
    assert.equal(fixture.calls.length, 'secret' in settings || 'url' in settings ? 0 : 1)
    if ('hang' in settings) assert.deepEqual([failClosed.timeouts, fixture.timeouts], [[5_000], [2_000]])
    assert.deepEqual(fixture.warnings, [['Shared rate limit store unavailable; using local limits for fallback-fixture']])
  }
})

test('during a store outage fallback callers stay capped by the local bucket', async () => {
  for (const [label, settings] of [['keyed', { error: true }], ['unkeyed', { secret: '' }]] as const) {
    const fixture = limiterFixture({ ...settings, localFilter: true })
    const options = { key: `outage-${label}`, max: 2, windowMs: 60_000, fallback: 'local' as const }
    assert.equal(await fixture.run(options), null)
    assert.equal(await fixture.run(options), null)
    const limited = await fixture.run(options)
    assert.equal(limited?.status, 429); assert.ok(Number(limited?.headers.get('Retry-After')) >= 1)
    assert.equal(await fixture.run(options, '192.0.2.77'), null)
    // A recipient cap follows the recipient across addresses.
    const recipient = { ...options, key: `outage-${label}-recipient`, subject: 'guest@example.invalid' }
    assert.equal(await fixture.run(recipient, '192.0.2.1'), null)
    assert.equal(await fixture.run(recipient, '192.0.2.2'), null)
    assert.equal((await fixture.run(recipient, '192.0.2.3'))?.status, 429)
    assert.equal(fixture.calls.length, label === 'keyed' ? 1 : 0)
    assert.equal(fixture.warnings.length, 1)
  }
})

test('a store that answers with a denial still wins for fallback callers', async () => {
  const fixture = limiterFixture({ allowed: false, localFilter: true })
  const denied = await fixture.run({ key: 'fallback-denial-fixture', max: 5, windowMs: 60_000, fallback: 'local' })
  assert.equal(denied?.status, 429); assert.equal(denied?.headers.get('Retry-After'), '42')
  assert.equal(fixture.calls.length, 1); assert.equal(fixture.warnings.length, 0)
})

test('after a store failure fallback callers skip the store for thirty seconds, then try again', async () => {
  let clock = 1_000_000
  const fixture = limiterFixture({ hang: true, now: () => clock })
  const options = { key: 'breaker-fixture', max: 100, windowMs: 60_000, fallback: 'local' as const }
  // Requests already waiting on the store share one warning.
  assert.deepEqual(await Promise.all([fixture.run(options), fixture.run(options)]), [null, null])
  assert.equal(fixture.calls.length, 2); assert.equal(fixture.warnings.length, 1)
  clock += 29_999
  assert.equal(await fixture.run(options), null); assert.equal(fixture.calls.length, 2)
  // Fail-closed callers never skip the store.
  assert.equal((await fixture.run({ ...options, fallback: undefined }))?.status, 503); assert.equal(fixture.calls.length, 3)
  clock += 1
  assert.equal(await fixture.run(options), null); assert.equal(fixture.calls.length, 4); assert.equal(fixture.warnings.length, 2)
  fixture.state.hang = false; fixture.state.allowed = false
  clock += 30_000
  assert.equal((await fixture.run(options))?.status, 429); assert.equal(fixture.calls.length, 5)
  fixture.state.allowed = true
  assert.equal(await fixture.run(options), null); assert.equal(fixture.calls.length, 6); assert.equal(fixture.warnings.length, 2)
})

test('public booking and lead routes opt into the local fallback while employee auth stays fail closed', () => {
  const publicRoutes = ['add-on-availability', 'availability', 'book-tour', 'booking-confirmation', 'cancel-checkout-session', 'contact', 'create-checkout-session', 'tour-availability']
  const limits = new Map<string, string[]>()
  for (const file of readdirSync('app/api', { recursive: true }).map(String).filter((file) => file.endsWith('route.ts'))) {
    const route = file.replace(/\/route\.ts$/, '')
    const ast = ts.createSourceFile(file, readFileSync(`app/api/${file}`, 'utf8'), ts.ScriptTarget.ES2022, true)
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && node.expression.getText(ast) === 'distributedRateLimit' && ts.isObjectLiteralExpression(node.arguments[1])) {
        const fallback = node.arguments[1].properties.find((property) => property.name?.getText(ast) === 'fallback')
        limits.set(route, [...(limits.get(route) || []), fallback && ts.isPropertyAssignment(fallback) ? fallback.initializer.getText(ast) : 'none'])
      }
      ts.forEachChild(node, visit)
    }
    visit(ast)
  }
  assert.deepEqual([...limits.keys()].filter((route) => !route.startsWith('employee/auth/')).sort(), publicRoutes)
  assert.equal(limits.get('book-tour')?.length, 2)
  for (const [route, fallbacks] of limits) assert.ok(fallbacks.every((value) => value === (route.startsWith('employee/auth/') ? 'none' : "'local'")), route)
  assert.ok(['confirm', 'email', 'password', 'password/reset'].every((route) => limits.has(`employee/auth/${route}`)))
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

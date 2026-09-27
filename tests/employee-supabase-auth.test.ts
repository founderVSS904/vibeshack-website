import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'
import { NextRequest, NextResponse } from 'next/server'
import { employeeDisplayName } from '../lib/employee/identity'
import { escapeHtml, isEmail, stripControlChars } from '../lib/server/sanitize'
import { jsonBodyErrorResponse, readJsonBody, readTextBody } from '../lib/server/request-guards'

// Execute actual route/helper declarations in isolated contexts with synthetic
// Auth, database and email providers. No credentials or network are available.
function sourceFunction(name: string, file: string) {
  const source = fs.readFileSync(file, 'utf8')
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true)
  const declaration = ast.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === name)
  assert.ok(declaration, `${name} exists`)
  return ts.transpileModule(declaration.getText(ast).replace(/^export\s+/, ''), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText
}
function contextFor(file: string, names: string[], bindings: Record<string, unknown> = {}) {
  const context = vm.createContext({
    Date, Buffer, URL, URLSearchParams, NextRequest, NextResponse, encodeURIComponent,
    employeeDisplayName, escapeHtml, isEmail, stripControlChars,
    employeeOrigin: () => 'https://example.invalid', rateLimit: () => null,
    distributedRateLimit: async () => null, rateLimitSubjectHash: () => 'f'.repeat(64),
    employeeJson: (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } }),
    readJsonBody, readTextBody, jsonBodyErrorResponse,
    ...bindings,
  })
  vm.runInContext(names.map((name) => sourceFunction(name, file)).join('\n'), context)
  return context
}
const employee = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', email: 'employee@example.invalid', name: 'Verified Employee', role: 'employee', status: 'active', mfaVerified: false }
const founder = { ...employee, email: 'founder@vibeshackstudios.com', role: 'superadmin' }
function request(path: string, body?: unknown, origin = 'https://example.invalid') {
  return new NextRequest(`https://example.invalid${path}`, body === undefined ? undefined : { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}

test('server Supabase clients keep credentials on the server and session cookies HTTP-only', async () => {
  const writes: Array<{ name: string; value: string; options: Record<string, unknown> }> = []
  const env = { SUPABASE_URL: 'https://fixture.supabase.invalid', SUPABASE_PUBLISHABLE_KEY: 'fixture-public', SUPABASE_SECRET_KEY: 'fixture-private', NODE_ENV: 'production' }
  let adminCreated = false
  const context = contextFor('lib/employee/supabase.ts', ['employeeSupabaseConfigured', 'employeeSupabase', 'employeeAdmin'], {
    process: { env },
    cookies: async () => ({ getAll: () => [], set: (name: string, value: string, options: Record<string, unknown>) => { writes.push({ name, value, options }) } }),
    createServerClient: (url: string, key: string, options: { cookieOptions: Record<string, unknown>; cookies: { setAll: (values: unknown[]) => void } }) => {
      assert.equal(url, env.SUPABASE_URL); assert.equal(key, env.SUPABASE_PUBLISHABLE_KEY)
      assert.equal(options.cookieOptions.httpOnly, true); assert.equal(options.cookieOptions.secure, true)
      assert.equal(options.cookieOptions.sameSite, 'lax')
      options.cookies.setAll([{ name: 'fixture-cookie', value: 'fixture-session', options: options.cookieOptions }])
      return {}
    },
    createClient: (_url: string, key: string, options: { auth: Record<string, unknown> }) => {
      assert.equal(key, env.SUPABASE_SECRET_KEY)
      assert.equal(options.auth.persistSession, false); assert.equal(options.auth.autoRefreshToken, false)
      adminCreated = true
      return {}
    },
  })
  await context.employeeSupabase(); context.employeeAdmin()
  assert.equal(writes.length, 1); assert.equal(adminCreated, true)
  env.SUPABASE_SECRET_KEY = ''
  assert.equal(context.employeeSupabaseConfigured(), false)
})

function accessFixture() {
  const state = {
    configured: true, userError: false, claimsError: false, databaseError: false, calls: 0,
    user: { id: employee.id, email: employee.email, email_confirmed_at: '2026-09-01', user_metadata: { name: 'Mutable Profile Name', role: 'superadmin' } },
    claims: { sub: employee.id, aal: 'aal1' },
    member: { user_id: employee.id, email: employee.email, name: employee.name, role: 'employee', status: 'active' },
  }
  const context = contextFor('lib/employee/access.ts', ['currentEmployee', 'employeeDestination'], {
    employeeSupabaseConfigured: () => state.configured,
    employeeSupabase: async () => ({ auth: {
      getUser: async () => ({ data: { user: state.user }, error: state.userError }),
      getClaims: async () => ({ data: { claims: state.claims }, error: state.claimsError }),
    } }),
    employeeAdmin: () => ({ from: (table: string) => {
      assert.equal(table, 'employee_members')
      return { select: () => ({ eq: (key: string, value: string) => {
        assert.equal(key, 'user_id'); assert.equal(value, employee.id); state.calls++
        return { maybeSingle: async () => ({ data: structuredClone(state.member), error: state.databaseError }) }
      } }) }
    } }),
  })
  return { state, run: (options = {}) => context.currentEmployee(options), destination: (value: unknown) => context.employeeDestination(value) }
}

test('Supabase access verifies identity and claims, uses registry name/role, and rechecks revocation on each request', async () => {
  const fixture = accessFixture()
  const result = await fixture.run()
  assert.equal(result.name, employee.name)
  assert.equal(result.role, 'employee')
  assert.equal(result.id, employee.id)
  fixture.state.member.status = 'disabled'
  assert.equal(await fixture.run(), null)
  assert.equal(fixture.state.calls, 2)
})

for (const [label, mutate] of [
  ['unconfigured service', (s: ReturnType<typeof accessFixture>['state']) => { s.configured = false }],
  ['invalid Auth session', (s: ReturnType<typeof accessFixture>['state']) => { s.userError = true }],
  ['unconfirmed email', (s: ReturnType<typeof accessFixture>['state']) => { s.user.email_confirmed_at = '' }],
  ['unverified claims', (s: ReturnType<typeof accessFixture>['state']) => { s.claimsError = true }],
  ['claims/user mismatch', (s: ReturnType<typeof accessFixture>['state']) => { s.claims.sub = 'another-user' }],
  ['database failure', (s: ReturnType<typeof accessFixture>['state']) => { s.databaseError = true }],
  ['unaccepted invitation', (s: ReturnType<typeof accessFixture>['state']) => { s.member.status = 'invited' }],
  ['changed email', (s: ReturnType<typeof accessFixture>['state']) => { s.member.email = 'different@example.invalid' }],
  ['unrecognized role', (s: ReturnType<typeof accessFixture>['state']) => { s.member.role = 'owner' }],
  ['non-founder Superadmin', (s: ReturnType<typeof accessFixture>['state']) => { s.member.role = 'superadmin' }],
] as const) {
  test(`Supabase employee access fails closed for ${label}`, async () => {
    const fixture = accessFixture(); mutate(fixture.state)
    assert.equal(await fixture.run(), null)
  })
}

test('verified active founder can use protected access at aal1 without an authenticator gate', async () => {
  const fixture = accessFixture()
  fixture.state.user.email = founder.email
  fixture.state.member.email = founder.email
  fixture.state.member.role = 'superadmin'
  const signedIn = await fixture.run()
  assert.equal(signedIn.role, 'superadmin')
  assert.equal(signedIn.email, founder.email)
  assert.equal(fixture.destination(signedIn), '/employee/book/')
  fixture.state.member.status = 'disabled'
  assert.equal(await fixture.run(), null)
})

test('employee identity acceptance runs the service RPC only for a verified authenticated user', async () => {
  let confirmed = false
  let accepted = 0
  const context = contextFor('lib/employee/access.ts', ['acceptEmployeeIdentity'], {
    employeeSupabase: async () => ({ auth: { getUser: async () => ({ data: { user: { id: employee.id, email_confirmed_at: confirmed ? '2026-09-01' : null } }, error: null }) } }),
    employeeAdmin: () => ({ rpc: async (name: string, params: { p_user_id: string }) => {
      assert.equal(name, 'employee_accept_identity'); assert.equal(params.p_user_id, employee.id); accepted++; return { error: null }
    } }),
    currentEmployee: async () => employee,
  })
  await assert.rejects(context.acceptEmployeeIdentity(), /not verified/)
  assert.equal(accepted, 0)
  confirmed = true
  assert.equal((await context.acceptEmployeeIdentity()).id, employee.id)
  assert.equal(accepted, 1)
})

test('employee guard rejects legacy cookies and unauthorized roles while allowing active founder aal1 actions', async () => {
  let identity: typeof employee | null = null
  const context = contextFor('lib/employee/http.ts', ['employeeGuard'], { currentEmployee: async () => identity })
  const legacy = new NextRequest('https://example.invalid/api/employee/bookings', { headers: { cookie: 'vs_employee=legacy-signed-fixture' } })
  assert.equal((await context.employeeGuard(legacy)).response.status, 401)
  identity = employee
  assert.equal((await context.employeeGuard(request('/api/employee/bookings', {}, 'https://attacker.invalid'), true)).response.status, 403)
  assert.equal((await context.employeeGuard(legacy, false, { superadmin: true })).response.status, 403)
  identity = founder
  assert.ok((await context.employeeGuard(legacy)).employee)
  assert.ok((await context.employeeGuard(legacy, false, { superadmin: true })).employee)
})

test('Google OAuth uses only the canonical callback and requests basic identity scopes', async () => {
  let options: Record<string, unknown> = {}
  const context = contextFor('app/api/employee/auth/login/route.ts', ['GET'], {
    employeeSupabase: async () => ({ auth: { signInWithOAuth: async (input: Record<string, unknown>) => { options = input; return { data: { url: 'https://provider.example.invalid/authorize' }, error: null } } } }),
  })
  const response = await context.GET(request('/api/employee/auth/login?next=https://attacker.invalid'))
  assert.equal(response.headers.get('location'), 'https://provider.example.invalid/authorize')
  assert.equal(options.provider, 'google')
  const flow = options.options as Record<string, unknown>
  assert.equal(flow.redirectTo, 'https://example.invalid/api/employee/auth/callback')
  assert.equal(flow.scopes, 'openid email profile')
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
  assert.equal(response.headers.get('Referrer-Policy'), 'strict-origin')
})

test('OAuth callback exchanges code before accepting membership and ignores forged redirect/name parameters', async () => {
  const calls: string[] = []
  let exchangeError = false
  let denied = false
  const context = contextFor('app/api/employee/auth/callback/route.ts', ['GET'], {
    employeeSupabase: async () => ({ auth: {
      exchangeCodeForSession: async (code: string) => { assert.equal(code, 'fixture-code'); calls.push('exchange'); return { error: exchangeError } },
      signOut: async () => { calls.push('signout') },
    } }),
    acceptEmployeeIdentity: async () => { calls.push('accept'); if (denied) throw new Error('Disabled'); return employee },
    employeeDestination: () => '/employee/book/',
  })
  const req = request('/api/employee/auth/callback?code=fixture-code&next=https://attacker.invalid&name=Forged')
  const response = await context.GET(req)
  assert.equal(response.headers.get('location'), 'https://example.invalid/employee/book/')
  assert.equal(response.headers.get('Referrer-Policy'), 'strict-origin')
  assert.deepEqual(calls, ['exchange', 'accept'])
  calls.length = 0; exchangeError = true
  assert.match((await context.GET(req)).headers.get('location'), /error=signin$/)
  assert.deepEqual(calls, ['exchange'])
  calls.length = 0; exchangeError = false; denied = true
  assert.match((await context.GET(req)).headers.get('location'), /error=signin$/)
  assert.deepEqual(calls, ['exchange', 'accept', 'signout'])
})

for (const route of ['email', 'password/reset']) {
test(`${route} gives the same recovery response for unknown, disabled and approved emails`, async () => {
  let status: string | null = null
  let claimed = false
  let sends = 0
  let databaseError = false
  let sendError = false
  const context = contextFor(`app/api/employee/auth/${route}/route.ts`, ['POST'], {
    employeeAdmin: () => ({
      from: () => ({ select: () => ({ eq: (_key: string, email: string) => {
        assert.equal(email, employee.email)
        return { maybeSingle: async () => ({ data: status ? { email, name: employee.name, status } : null, error: databaseError }) }
      } }) }),
      rpc: async (name: string, args: { p_email: string; p_subject_hash: string }) => {
        assert.equal(name, 'employee_claim_recovery_email'); assert.equal(args.p_email, employee.email)
        assert.equal(args.p_subject_hash, 'f'.repeat(64)); return { data: claimed, error: null }
      },
    }),
    sendEmployeeAccessLink: async (email: string, _name: string, kind: string) => { assert.equal(email, employee.email); assert.equal(kind, 'recovery'); sends++; if (sendError) throw new Error('Private provider failure') },
  })
  const run = () => context.POST(request(`/api/employee/auth/${route}`, { email: employee.email.toUpperCase() }))
  const unknown = await (await run()).json()
  status = 'disabled'; assert.deepEqual(await (await run()).json(), unknown)
  status = 'active'; assert.deepEqual(await (await run()).json(), unknown); assert.equal(sends, 0)
  claimed = true; assert.deepEqual(await (await run()).json(), unknown); assert.equal(sends, 1)
  status = 'invited'; assert.deepEqual(await (await run()).json(), unknown); assert.equal(sends, 2)
  databaseError = true; assert.deepEqual(await (await run()).json(), unknown); assert.equal(sends, 2)
  databaseError = false; sendError = true; assert.deepEqual(await (await run()).json(), unknown); assert.equal(sends, 3)
})
}

function passwordFixture({ providerError = false, providerThrows = false, denied = false, limited = false } = {}) {
  const calls: string[] = []
  const context = contextFor('app/api/employee/auth/password/route.ts', ['POST'], {
    distributedRateLimit: async () => limited ? NextResponse.json({ error: 'Too many requests' }, { status: 429 }) : null,
    employeeSupabase: async () => ({ auth: {
      signInWithPassword: async (input: { email: string; password: string }) => {
        calls.push('signin')
        assert.equal(input.email, employee.email)
        assert.equal(input.password, '  Fixture password 123!  ')
        if (providerThrows) throw new Error('Private provider detail')
        return { data: { user: { id: employee.id } }, error: providerError ? { message: 'Private invalid credentials' } : null }
      },
      signOut: async () => { calls.push('signout'); return { error: null } },
    } }),
    acceptEmployeeIdentity: async () => { calls.push('accept'); if (denied) throw new Error('Private disabled member detail'); return founder },
    employeeDestination: () => '/employee/book/',
  })
  return { calls, run: (req = request('/api/employee/auth/password', { email: ` ${employee.email.toUpperCase()} `, password: '  Fixture password 123!  ', role: 'superadmin', next: 'https://attacker.invalid' })) => context.POST(req) as Promise<NextResponse> }
}

test('email/password sign-in preserves password bytes and grants only accepted membership with a canonical destination', async () => {
  const fixture = passwordFixture()
  const response = await fixture.run()
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { ok: true, redirect: '/employee/book/' })
  assert.deepEqual(fixture.calls, ['signin', 'accept'])
})

test('bad credentials, provider failures and denied membership return the same generic password error', async () => {
  let error: unknown
  for (const options of [{ providerError: true }, { providerThrows: true }, { denied: true }]) {
    const fixture = passwordFixture(options)
    const response = await fixture.run()
    assert.equal(response.status, 401)
    const body = await response.json()
    if (error === undefined) error = body
    else assert.deepEqual(body, error)
    assert.doesNotMatch(JSON.stringify(body), /Private|Fixture password|disabled member/)
    assert.deepEqual(fixture.calls, options.denied ? ['signin', 'accept', 'signout'] : ['signin'])
  }
})

test('password sign-in rejects unsafe origins, invalid payloads, oversized bodies and throttled requests before authentication', async () => {
  const fixture = passwordFixture()
  for (const origin of ['https://attacker.invalid', 'null', undefined]) {
    const req = new NextRequest('https://example.invalid/api/employee/auth/password', {
      method: 'POST', headers: { ...(origin === undefined ? {} : { origin }), 'content-type': 'application/json' },
      body: JSON.stringify({ email: employee.email, password: 'synthetic' }),
    })
    assert.equal((await fixture.run(req)).status, 403)
  }
  for (const body of [{ email: 'invalid', password: 'synthetic' }, { email: employee.email, password: '' }, { email: employee.email, password: 'x'.repeat(129) }, { email: employee.email, password: 123 }]) {
    assert.equal((await fixture.run(request('/api/employee/auth/password', body))).status, 400)
  }
  assert.equal((await fixture.run(request('/api/employee/auth/password', { email: employee.email, password: 'synthetic', padding: 'x'.repeat(4096) }))).status, 413)
  assert.deepEqual(fixture.calls, [])
  const throttled = passwordFixture({ limited: true })
  assert.equal((await throttled.run()).status, 429)
  assert.deepEqual(throttled.calls, [])
})

test('password recovery blocks unsafe origins and oversized input before any lookup or mail', async () => {
  let called = false
  const context = contextFor('app/api/employee/auth/password/reset/route.ts', ['POST'], {
    employeeAdmin: () => { called = true; throw new Error('Should not query') },
    sendEmployeeAccessLink: () => { called = true; throw new Error('Should not send') },
  })
  for (const origin of ['https://attacker.invalid', 'null', undefined]) {
    const req = new NextRequest('https://example.invalid/api/employee/auth/password/reset', {
      method: 'POST', headers: { ...(origin === undefined ? {} : { origin }), 'content-type': 'application/json' }, body: JSON.stringify({ email: employee.email }),
    })
    assert.equal((await context.POST(req)).status, 403)
  }
  assert.equal((await context.POST(request('/api/employee/auth/password/reset', { email: employee.email, padding: 'x'.repeat(2048) }))).status, 413)
  assert.equal((await context.POST(request('/api/employee/auth/password/reset', { email: 'invalid' }))).status, 200)
  assert.equal(called, false)
  const throttled = contextFor('app/api/employee/auth/password/reset/route.ts', ['POST'], {
    distributedRateLimit: async () => NextResponse.json({ error: 'Too many requests' }, { status: 429 }),
    employeeAdmin: () => { called = true; throw new Error('Should not query') },
  })
  assert.equal((await throttled.POST(request('/api/employee/auth/password/reset', { email: employee.email }))).status, 429)
  assert.equal(called, false)
})

test('legacy magiclink GET does not consume tokens; same-origin POST still verifies and accepts membership', async () => {
  let consumed = 0
  const context = contextFor('app/api/employee/auth/confirm/route.ts', ['validToken', 'GET', 'POST'], {
    employeeSupabase: async () => ({ auth: { verifyOtp: async (input: { type: string; token_hash: string }) => {
      assert.equal(input.type, 'magiclink'); assert.equal(input.token_hash, 'a'.repeat(64)); consumed++; return { error: null }
    } } }),
    acceptEmployeeIdentity: async () => founder,
    employeeDestination: () => '/employee/book/',
  })
  const response = await context.GET(request(`/api/employee/auth/confirm?token_hash=${'a'.repeat(64)}&type=magiclink`))
  const html = await response.text()
  assert.equal(consumed, 0)
  assert.match(html, /method="post"/)
  assert.doesNotMatch(html, /<script|onload=|autofocus/)
  assert.doesNotMatch(html, /name="(?:password|confirm_password)"/)
  // Native form POSTs preserve Origin under strict-origin without putting the
  // confirmation token's path/query into Referer. Null Origin stays forbidden.
  assert.equal(response.headers.get('Referrer-Policy'), 'strict-origin')
  const post = (origin?: string) => new NextRequest('https://example.invalid/api/employee/auth/confirm', {
    method: 'POST', headers: { ...(origin === undefined ? {} : { origin }), 'content-type': 'application/x-www-form-urlencoded' },
    body: `token_hash=${'a'.repeat(64)}&type=magiclink`,
  })
  for (const origin of ['https://attacker.invalid', 'null', undefined]) {
    assert.equal((await context.POST(post(origin))).status, 403, `Reject ${origin ?? 'missing'} Origin`)
    assert.equal(consumed, 0)
  }
  const accepted = await context.POST(post('https://example.invalid'))
  assert.equal(accepted.headers.get('location'), 'https://example.invalid/employee/book/')
  assert.equal(accepted.headers.get('Referrer-Policy'), 'strict-origin')
  assert.equal(consumed, 1)
})

function confirmationFixture(type: 'invite' | 'recovery', { tokenError = false, denied = false, updateError = false } = {}) {
  const calls: string[] = []
  let updatedPassword = ''
  const context = contextFor('app/api/employee/auth/confirm/route.ts', ['validToken', 'GET', 'POST'], {
    employeeSupabase: async () => ({ auth: {
      verifyOtp: async (input: { type: string; token_hash: string }) => {
        assert.equal(input.type, type); assert.equal(input.token_hash, 'c'.repeat(64))
        calls.push('verify')
        return { error: tokenError ? { message: 'Private expired token' } : null }
      },
      updateUser: async (input: { password: string }) => {
        calls.push('password')
        updatedPassword = input.password
        return { error: updateError ? { message: 'Private password provider failure' } : null }
      },
      signOut: async () => { calls.push('signout'); return { error: null } },
    } }),
    acceptEmployeeIdentity: async () => { calls.push('accept'); if (denied) throw new Error('Private disabled member'); return founder },
    employeeDestination: () => '/employee/book/',
  })
  return {
    calls, password: () => updatedPassword,
    get: () => context.GET(request(`/api/employee/auth/confirm?token_hash=${'c'.repeat(64)}&type=${type}`)) as Promise<NextResponse>,
    post: (password = 'Fixture password 123!', confirmation = password, origin: string | undefined = 'https://example.invalid') => context.POST(new NextRequest('https://example.invalid/api/employee/auth/confirm', {
      method: 'POST', headers: { ...(origin === undefined ? {} : { origin }), 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token_hash: 'c'.repeat(64), type, password, confirm_password: confirmation }).toString(),
    })) as Promise<NextResponse>,
  }
}

for (const type of ['invite', 'recovery'] as const) {
  test(`${type} GET is scanner-safe and POST sets a password only after token and membership verification`, async () => {
    const fixture = confirmationFixture(type)
    const page = await fixture.get()
    assert.equal(page.status, 200)
    assert.equal(page.headers.get('Referrer-Policy'), 'strict-origin')
    const html = await page.text()
    assert.match(html, /method="post"/)
    assert.match(html, /name="password"/)
    assert.match(html, /name="confirm_password"/)
    assert.doesNotMatch(html, /<script|onload=/)
    assert.deepEqual(fixture.calls, [])
    const response = await fixture.post()
    assert.equal(response.status, 303)
    assert.equal(response.headers.get('location'), 'https://example.invalid/employee/book/')
    assert.deepEqual(fixture.calls, ['verify', 'accept', 'password'])
    assert.equal(fixture.password(), 'Fixture password 123!')
  })
}

test('password setup retains its unconsumed token and clears password values when validation needs a retry', async () => {
  for (const [password, confirmation] of [['short77', 'short77'], ['x'.repeat(129), 'x'.repeat(129)], ['Fixture password', 'Different password'], ['', '']]) {
    const fixture = confirmationFixture('recovery')
    const response = await fixture.post(password, confirmation)
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.match(html, /name="token_hash" value="c{64}"/)
    assert.match(html, /name="password"/)
    assert.doesNotMatch(html, /name="(?:password|confirm_password)"[^>]*value=/)
    if (password) assert.equal(html.includes(password), false)
    assert.deepEqual(fixture.calls, [])
  }
  for (const length of [8, 128]) {
    const fixture = confirmationFixture('recovery')
    const password = 'x'.repeat(length)
    assert.equal((await fixture.post(password)).headers.get('location'), 'https://example.invalid/employee/book/')
    assert.equal(fixture.password(), password)
  }
})

test('password setup failures never disclose tokens and revoke the local session after denied membership or password update', async () => {
  for (const options of [{ tokenError: true }, { denied: true }, { updateError: true }]) {
    const fixture = confirmationFixture('recovery', options)
    const response = await fixture.post()
    assert.equal(response.status, 303)
    assert.equal(response.headers.get('location'), 'https://example.invalid/employee/password/?error=reset')
    assert.equal(response.headers.get('location')?.includes('c'.repeat(64)), false)
    const body = await response.text()
    assert.doesNotMatch(body, /Private|Fixture password/)
    if (options.tokenError) {
      assert.equal(fixture.calls.includes('accept'), false)
      assert.equal(fixture.calls.includes('password'), false)
    } else {
      assert.deepEqual(fixture.calls, options.denied ? ['verify', 'accept', 'signout'] : ['verify', 'accept', 'password', 'signout'])
    }
  }
})

test('signup verification links remain scanner-safe and require accepted employee membership', async () => {
  for (const authorized of [true, false]) {
    const calls: string[] = []
    const context = contextFor('app/api/employee/auth/confirm/route.ts', ['validToken', 'GET', 'POST'], {
      employeeSupabase: async () => ({ auth: {
        verifyOtp: async (input: { type: string; token_hash: string }) => {
          assert.equal(input.type, 'signup')
          assert.equal(input.token_hash, 'b'.repeat(64))
          calls.push('verify')
          return { error: null }
        },
        signOut: async () => { calls.push('signout'); return { error: null } },
      } }),
      acceptEmployeeIdentity: async () => {
        calls.push('accept')
        if (!authorized) throw new Error('No active invitation')
        return employee
      },
      employeeDestination: () => '/employee/book/',
    })
    const link = `/api/employee/auth/confirm?token_hash=${'b'.repeat(64)}&type=signup`
    const page = await context.GET(request(link))
    assert.equal(page.status, 200)
    assert.equal(page.headers.get('Referrer-Policy'), 'strict-origin')
    const html = await page.text()
    assert.match(html, /method="post"/)
    assert.match(html, /name="type" value="signup"/)
    assert.doesNotMatch(html, /<script|onload=/)
    assert.doesNotMatch(html, /name="(?:password|confirm_password)"/)
    assert.deepEqual(calls, [])
    const response = await context.POST(new NextRequest('https://example.invalid/api/employee/auth/confirm', {
      method: 'POST', headers: { origin: 'https://example.invalid', 'content-type': 'application/x-www-form-urlencoded' },
      body: `token_hash=${'b'.repeat(64)}&type=signup`,
    }))
    assert.equal(response.status, 303)
    assert.equal(response.headers.get('location'), `https://example.invalid${authorized ? '/employee/book/' : '/employee/?error=signin'}`)
    assert.deepEqual(calls, authorized ? ['verify', 'accept'] : ['verify', 'accept', 'signout'])
  }
})

test('native logout allows revoked employees to leave but rejects foreign, null and missing origins', async () => {
  let signedOut = 0
  const context = contextFor('app/api/employee/auth/logout/route.ts', ['POST'], {
    EMPLOYEE_COOKIE: 'vs_employee', employeeCookieOptions: () => ({ maxAge: 0 }),
    employeeSupabase: async () => ({ auth: { signOut: async () => { signedOut++; return { error: null } } } }),
  })
  const post = (origin?: string) => new NextRequest('https://example.invalid/api/employee/auth/logout', {
    method: 'POST', headers: { ...(origin === undefined ? {} : { origin }), 'content-type': 'application/x-www-form-urlencoded' }, body: '',
  })
  for (const origin of ['https://attacker.invalid', 'null', undefined]) {
    assert.equal((await context.POST(post(origin))).status, 403, `Reject ${origin ?? 'missing'} Origin`)
    assert.equal(signedOut, 0)
  }
  assert.equal((await context.POST(post('https://example.invalid'))).status, 303)
  assert.equal(signedOut, 1)
})

test('middleware preserves slash redirects and refreshes employee cookies without affecting public pages', async () => {
  let refreshed = 0
  const context = contextFor('middleware.ts', ['shouldSkipSlashRedirect', 'middleware'], {
    process: { env: { SUPABASE_URL: 'https://fixture.supabase.invalid', SUPABASE_PUBLISHABLE_KEY: 'fixture-publishable' } },
    createServerClient: (_url: string, _key: string, options: { cookieOptions: { httpOnly: boolean }; cookies: { setAll: (values: unknown[], headers: Record<string, string>) => void } }) => {
      assert.equal(options.cookieOptions.httpOnly, true)
      return { auth: { getClaims: async () => {
        refreshed++
        options.cookies.setAll([{ name: 'fixture-auth', value: 'refreshed', options: { httpOnly: true, secure: true, sameSite: 'lax', path: '/' } }], { Pragma: 'no-cache' })
      } } }
    },
  })
  const redirect = await context.middleware(request('/pricing?fixture=1'))
  assert.equal(redirect.status, 308)
  assert.equal(redirect.headers.get('location'), 'https://example.invalid/pricing/?fixture=1')
  const publicResponse = await context.middleware(request('/pricing/'))
  assert.equal(publicResponse.headers.get('Referrer-Policy'), null)
  assert.equal(refreshed, 0)
  const response = await context.middleware(request('/employee/book/'))
  assert.equal(refreshed, 1)
  assert.equal(response.cookies.get('fixture-auth')?.value, 'refreshed')
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
  assert.equal(response.headers.get('Referrer-Policy'), 'strict-origin')
  assert.equal(response.headers.get('Pragma'), 'no-cache')
  assert.match(response.headers.get('set-cookie'), /HttpOnly/)
})

test('employee document middleware keeps native forms compatible when no session cookies refresh', async () => {
  for (const configured of [false, true]) {
    let checked = 0
    const context = contextFor('middleware.ts', ['shouldSkipSlashRedirect', 'middleware'], {
      process: { env: configured ? { SUPABASE_URL: 'https://fixture.supabase.invalid', SUPABASE_PUBLISHABLE_KEY: 'fixture-publishable' } : {} },
      createServerClient: () => ({ auth: { getClaims: async () => { checked++ } } }),
    })
    for (const path of ['/employee/book/', '/employee/password/', '/api/employee/auth/confirm']) {
      const response = await context.middleware(request(path))
      assert.equal(response.headers.get('Referrer-Policy'), 'strict-origin', path)
      assert.equal(response.headers.get('Cache-Control'), 'private, no-store', path)
      assert.equal(response.headers.get('set-cookie'), null)
    }
    assert.equal(checked, configured ? 3 : 0)
  }
})

test('both recovery URLs consume the same durable IP bucket before account lookup', async () => {
  let attempts = 0
  let lookups = 0
  const options: Array<{ key: string; max: number; windowMs: number }> = []
  const bindings = {
    distributedRateLimit: async (_req: NextRequest, limit: { key: string; max: number; windowMs: number }) => {
      options.push(limit); attempts++
      return attempts > limit.max ? NextResponse.json({ error: 'Too many requests' }, { status: 429 }) : null
    },
    employeeAdmin: () => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => { lookups++; return { data: null, error: null } } }) }) }) }),
  }
  const routes = ['email', 'password/reset'].map((route) => contextFor(`app/api/employee/auth/${route}/route.ts`, ['POST'], bindings))
  for (let attempt = 0; attempt < 6; attempt++) {
    const response = await routes[attempt % 2].POST(request('/api/employee/auth/password/reset', { email: employee.email }))
    assert.equal(response.status, attempt < 5 ? 200 : 429)
  }
  assert.equal(lookups, 5)
  assert.equal(new Set(options.map((item) => item.key)).size, 1)
  assert.ok(options.every((item) => item.max === 5 && item.windowMs === 600_000))
})

test('password auth applies durable IP and short account caps before the identity provider', async () => {
  const limits: Array<{ key: string; max: number; windowMs: number; subject?: string }> = []
  let providerCalls = 0
  const context = contextFor('app/api/employee/auth/password/route.ts', ['POST'], {
    distributedRateLimit: async (_req: NextRequest, options: { key: string; max: number; windowMs: number; subject?: string }) => {
      limits.push(options)
      return options.subject ? NextResponse.json({ error: 'Too many requests' }, { status: 429 }) : null
    },
    employeeSupabase: () => { providerCalls++; throw new Error('Provider must not be reached') },
  })
  const response = await context.POST(request('/api/employee/auth/password', { email: ` ${employee.email.toUpperCase()} `, password: 'synthetic-password' }))
  assert.equal(response.status, 429); assert.equal(providerCalls, 0)
  assert.equal(limits.length, 2)
  assert.equal(limits[0].subject, undefined); assert.equal(limits[0].max, 10); assert.equal(limits[0].windowMs, 600_000)
  assert.equal(limits[1].subject, employee.email); assert.equal(limits[1].max, 20); assert.equal(limits[1].windowMs, 60_000)
})

test('failed durable limits stop password, recovery and token confirmation before any provider or body work', async () => {
  for (const route of ['password', 'password/reset', 'email', 'confirm']) {
    let providers = 0
    let bodyReads = 0
    const context = contextFor(`app/api/employee/auth/${route}/route.ts`, route === 'confirm' ? ['validToken', 'GET', 'POST'] : ['POST'], {
      distributedRateLimit: async () => NextResponse.json({ error: 'Temporarily unavailable' }, { status: 503 }),
      readJsonBody: () => { bodyReads++; throw new Error('Body must not be read') },
      readTextBody: () => { bodyReads++; throw new Error('Body must not be read') },
      employeeSupabase: () => { providers++; throw new Error('Provider must not be reached') },
      employeeAdmin: () => { providers++; throw new Error('Provider must not be reached') },
      sendEmployeeAccessLink: () => { providers++; throw new Error('Provider must not be reached') },
    })
    assert.equal((await context.POST(request(`/api/employee/auth/${route}`, { email: employee.email }))).status, 503)
    assert.equal(providers, 0, route); assert.equal(bodyReads, 0, route)
  }
})

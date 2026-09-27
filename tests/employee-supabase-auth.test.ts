import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'
import { NextRequest, NextResponse } from 'next/server'
import { employeeDisplayName } from '../lib/employee/identity'
import { escapeHtml, isEmail, stripControlChars } from '../lib/server/sanitize'

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
    Date, Buffer, URL, URLSearchParams, NextResponse, encodeURIComponent,
    employeeDisplayName, escapeHtml, isEmail, stripControlChars,
    employeeOrigin: () => 'https://example.invalid', rateLimit: () => null,
    employeeJson: (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } }),
    readJsonBody: async (req: NextRequest) => req.json(), jsonBodyErrorResponse: () => null,
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

test('founder must have verified aal2 for protected access, while aal1 can reach only MFA setup', async () => {
  const fixture = accessFixture()
  fixture.state.user.email = founder.email
  fixture.state.member.email = founder.email
  fixture.state.member.role = 'superadmin'
  assert.equal(await fixture.run(), null)
  const pending = await fixture.run({ allowUnverifiedMfa: true })
  assert.equal(pending.mfaVerified, false)
  assert.equal(fixture.destination(pending), '/employee/security/')
  fixture.state.claims.aal = 'aal2'
  const verified = await fixture.run()
  assert.equal(verified.mfaVerified, true)
  assert.equal(fixture.destination(verified), '/employee/book/')
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

test('employee guard rejects old cookie-only auth, cross-origin writes, staff administration and founder aal1 actions', async () => {
  let identity: typeof employee | null = null
  const context = contextFor('lib/employee/http.ts', ['employeeGuard'], { currentEmployee: async () => identity })
  const legacy = new NextRequest('https://example.invalid/api/employee/bookings', { headers: { cookie: 'vs_employee=legacy-signed-fixture' } })
  assert.equal((await context.employeeGuard(legacy)).response.status, 401)
  identity = employee
  assert.equal((await context.employeeGuard(request('/api/employee/bookings', {}, 'https://attacker.invalid'), true)).response.status, 403)
  assert.equal((await context.employeeGuard(legacy, false, { superadmin: true })).response.status, 403)
  identity = founder
  const blocked = await context.employeeGuard(legacy)
  assert.equal(blocked.response.status, 403)
  assert.equal((await blocked.response.json()).code, 'MFA_REQUIRED')
  assert.ok((await context.employeeGuard(legacy, false, { allowUnverifiedMfa: true })).employee)
  identity = { ...founder, mfaVerified: true }
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
  assert.equal((await context.GET(req)).headers.get('location'), 'https://example.invalid/employee/book/')
  assert.deepEqual(calls, ['exchange', 'accept'])
  calls.length = 0; exchangeError = true
  assert.match((await context.GET(req)).headers.get('location'), /error=signin$/)
  assert.deepEqual(calls, ['exchange'])
  calls.length = 0; exchangeError = false; denied = true
  assert.match((await context.GET(req)).headers.get('location'), /error=signin$/)
  assert.deepEqual(calls, ['exchange', 'accept', 'signout'])
})

test('email sign-in gives the same response for unknown/disabled/active emails and sends only after the distributed claim', async () => {
  let status: string | null = null
  let claimed = false
  let sends = 0
  const context = contextFor('app/api/employee/auth/email/route.ts', ['POST'], {
    employeeAdmin: () => ({
      from: () => ({ select: () => ({ eq: (_key: string, email: string) => {
        assert.equal(email, employee.email)
        return { maybeSingle: async () => ({ data: status ? { email, name: employee.name, status } : null, error: null }) }
      } }) }),
      rpc: async (name: string) => { assert.equal(name, 'employee_claim_signin_email'); return { data: claimed, error: null } },
    }),
    sendEmployeeAccessLink: async (email: string, _name: string, kind: string) => { assert.equal(email, employee.email); assert.equal(kind, 'magiclink'); sends++ },
  })
  const run = () => context.POST(request('/api/employee/auth/email', { email: employee.email.toUpperCase() }))
  const unknown = await (await run()).json()
  status = 'disabled'; assert.deepEqual(await (await run()).json(), unknown)
  status = 'active'; assert.deepEqual(await (await run()).json(), unknown); assert.equal(sends, 0)
  claimed = true; assert.deepEqual(await (await run()).json(), unknown); assert.equal(sends, 1)
})

test('email link GET does not consume tokens; same-origin POST alone verifies and accepts membership', async () => {
  let consumed = 0
  const context = contextFor('app/api/employee/auth/confirm/route.ts', ['validToken', 'GET', 'POST'], {
    employeeSupabase: async () => ({ auth: { verifyOtp: async (input: { type: string; token_hash: string }) => {
      assert.equal(input.type, 'invite'); assert.equal(input.token_hash, 'a'.repeat(64)); consumed++; return { error: null }
    } } }),
    acceptEmployeeIdentity: async () => founder,
    employeeDestination: () => '/employee/security/',
  })
  const response = await context.GET(request(`/api/employee/auth/confirm?token_hash=${'a'.repeat(64)}&type=invite`))
  const html = await response.text()
  assert.equal(consumed, 0)
  assert.match(html, /method="post"/)
  assert.doesNotMatch(html, /<script|onload=|autofocus/)
  assert.equal(response.headers.get('Referrer-Policy'), 'no-referrer')
  const post = (origin: string) => new NextRequest('https://example.invalid/api/employee/auth/confirm', { method: 'POST', headers: { origin, 'content-type': 'application/x-www-form-urlencoded' }, body: `token_hash=${'a'.repeat(64)}&type=invite` })
  assert.equal((await context.POST(post('https://attacker.invalid'))).status, 403)
  assert.equal(consumed, 0)
  assert.equal((await context.POST(post('https://example.invalid'))).headers.get('location'), 'https://example.invalid/employee/security/')
  assert.equal(consumed, 1)
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
    const html = await page.text()
    assert.match(html, /method="post"/)
    assert.match(html, /name="type" value="signup"/)
    assert.doesNotMatch(html, /<script|onload=/)
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

test('revoked employees can sign out without a membership check, but cross-origin logout is rejected', async () => {
  let signedOut = 0
  const context = contextFor('app/api/employee/auth/logout/route.ts', ['POST'], {
    EMPLOYEE_COOKIE: 'vs_employee', employeeCookieOptions: () => ({ maxAge: 0 }),
    employeeSupabase: async () => ({ auth: { signOut: async () => { signedOut++; return { error: null } } } }),
  })
  assert.equal((await context.POST(request('/api/employee/auth/logout', {}, 'https://attacker.invalid'))).status, 403)
  assert.equal(signedOut, 0)
  assert.equal((await context.POST(request('/api/employee/auth/logout', {}))).status, 303)
  assert.equal(signedOut, 1)
})

test('aal1 cannot replace an existing verified authenticator by enrolling a new one', async () => {
  let enrolled = false
  const context = contextFor('app/api/employee/auth/mfa/enroll/route.ts', ['POST'], {
    employeeGuard: async () => ({ employee: founder }),
    employeeSupabase: async () => ({ auth: { mfa: {
      listFactors: async () => ({ data: { totp: [{ id: 'owned' }], all: [] }, error: null }),
      enroll: async () => { enrolled = true; throw new Error('Should not enroll') },
    } } }),
  })
  assert.equal((await context.POST(request('/api/employee/auth/mfa/enroll', {}))).status, 403)
  assert.equal(enrolled, false)
})

test('MFA challenge rejects another account factor before calling the provider', async () => {
  let challenged = false
  const context = contextFor('app/api/employee/auth/mfa/challenge/route.ts', ['POST'], {
    employeeGuard: async () => ({ employee: founder }),
    employeeSupabase: async () => ({ auth: { mfa: {
      listFactors: async () => ({ data: { all: [] }, error: null }),
      challenge: async () => { challenged = true; throw new Error('Should not challenge') },
    } } }),
  })
  assert.equal((await context.POST(request('/api/employee/auth/mfa/challenge', { factorId: employee.id }))).status, 400)
  assert.equal(challenged, false)
})

test('MFA verification grants access only after refreshed signed claims actually report aal2', async () => {
  let verified = false
  const context = contextFor('app/api/employee/auth/mfa/verify/route.ts', ['POST'], {
    employeeGuard: async () => ({ employee: founder }),
    currentEmployee: async () => ({ ...founder, mfaVerified: verified }),
    employeeSupabase: async () => ({ auth: { mfa: {
      listFactors: async () => ({ data: { all: [{ id: employee.id, factor_type: 'totp' }] }, error: null }),
      verify: async () => ({ error: null }),
    } } }),
  })
  const run = () => context.POST(request('/api/employee/auth/mfa/verify', { factorId: employee.id, challengeId: employee.id, code: '123456' }))
  assert.equal((await run()).status, 403)
  verified = true
  assert.deepEqual(await (await run()).json(), { ok: true, redirect: '/employee/book/' })
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
  await context.middleware(request('/pricing/')); assert.equal(refreshed, 0)
  const response = await context.middleware(request('/employee/book/'))
  assert.equal(refreshed, 1)
  assert.equal(response.cookies.get('fixture-auth')?.value, 'refreshed')
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
  assert.equal(response.headers.get('Pragma'), 'no-cache')
  assert.match(response.headers.get('set-cookie'), /HttpOnly/)
})

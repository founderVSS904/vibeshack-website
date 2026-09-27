import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { isEmail, stripControlChars, escapeHtml } from '../lib/server/sanitize'

function load(file: string, imports: Record<string, unknown>, environment: Record<string, string> = {}) {
  const exports: Record<string, (...args: any[]) => any> = {}
  const context = vm.createContext({ exports, URL, Date, process: { env: environment }, require: (key: string) => {
    if (!(key in imports)) throw new Error(`Unexpected import: ${key}`)
    return imports[key]
  } })
  vm.runInContext(ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, context)
  return exports
}

function teamFixture({ denied = false, failMail = false, rpcError = '' } = {}) {
  const calls: Array<{ name: string; data: any }> = []
  let body: any = {}
  const row = { id: '12345678-1234-1234-1234-123456789012', email: 'employee@example.test', name: 'Fixture Employee' }
  const routes = load('app/api/employee/team/route.ts', {
    'next/server': {},
    '@/lib/employee/http': {
      employeeGuard: async (_req: unknown, write: boolean, options: unknown) => {
        calls.push({ name: 'guard', data: { write, options } })
        return denied ? { response: { status: 403 } } : { employee: { id: 'verified-founder', email: 'founder@example.test' } }
      },
      employeeJson: (value: unknown, status = 200) => ({ status, value }),
    },
    '@/lib/employee/supabase': { employeeAdmin: () => ({
      rpc: async (name: string, data: unknown) => { calls.push({ name, data }); return { data: row, error: rpcError ? { message: rpcError } : null } },
      from: () => ({ insert: async (data: unknown) => { calls.push({ name: 'audit', data }) } }),
    }) },
    '@/lib/employee/invitations': { sendEmployeeAccessLink: async (...args: unknown[]) => { calls.push({ name: 'send', data: args }); if (failMail) throw new Error('private provider detail') } },
    '@/lib/server/request-guards': { readJsonBody: async () => body, jsonBodyErrorResponse: () => null },
    '@/lib/server/sanitize': { isEmail, stripControlChars },
  })
  return { calls, setBody(value: unknown) { body = value }, post: () => routes.POST({}), patch: () => routes.PATCH({}), get: () => routes.GET({}) }
}

test('team writes require verified Superadmin before parsing input or invoking a provider', async () => {
  const f = teamFixture({ denied: true })
  f.setBody({ email: 'employee@example.test', name: 'Fixture' })
  assert.equal((await f.post()).status, 403)
  assert.equal(f.calls.length, 1)
  assert.equal(f.calls[0].data.write, true)
  assert.equal(f.calls[0].data.options.superadmin, true)
  assert.equal((await f.get()).status, 403)
})

test('invitation creation uses the verified actor and cannot accept browser-supplied role or user ID', async () => {
  const f = teamFixture()
  f.setBody({ email: ' EMPLOYEE@example.test ', name: 'Fixture\nEmployee', role: 'superadmin', actor: 'attacker', user_id: 'attacker' })
  assert.equal((await f.post()).status, 200)
  const rpc = f.calls.find((call) => call.name === 'employee_manage_member')!
  assert.equal(rpc.data.p_actor, 'verified-founder')
  assert.equal(rpc.data.p_email, 'employee@example.test')
  assert.equal(rpc.data.p_name, 'Fixture Employee')
  assert.equal(rpc.data.role, undefined)
  assert.equal(f.calls.find((call) => call.name === 'send')!.data[2], 'invite')
})

test('invalid invitation and unsupported role-change actions never invoke database or mail', async () => {
  const f = teamFixture()
  f.setBody({ email: 'invalid', name: 'Fixture' })
  assert.equal((await f.post()).status, 400)
  f.setBody({ id: '12345678-1234-1234-1234-123456789012', action: 'promote' })
  assert.equal((await f.patch()).status, 400)
  assert.equal(f.calls.every((call) => call.name === 'guard'), true)
})

test('database rejection blocks email and returns only an approved user-facing reason', async () => {
  const f = teamFixture({ rpcError: 'Superadmin is protected' })
  f.setBody({ id: '12345678-1234-1234-1234-123456789012', action: 'disable' })
  const result = await f.patch()
  assert.equal(result.status, 409)
  assert.equal(result.value.error, 'Superadmin is protected')
  assert.equal(f.calls.some((call) => call.name === 'send'), false)
  const hidden = teamFixture({ rpcError: 'database connection secret detail' })
  hidden.setBody({ email: 'employee@example.test', name: 'Fixture' })
  assert.equal(JSON.stringify(await hidden.post()).includes('secret'), false)
})

test('uncertain invitation delivery retains invited access and reports uncertainty without claiming inbox delivery', async () => {
  const f = teamFixture({ failMail: true })
  f.setBody({ email: 'employee@example.test', name: 'Fixture' })
  const result = await f.post()
  assert.equal(result.status, 503)
  assert.match(result.value.error, /delivery could not be confirmed/)
  assert.equal(f.calls.filter((call) => call.name === 'send').length, 1)
  assert.equal(f.calls.find((call) => call.name === 'audit')!.data.action, 'invitation.delivery_unconfirmed')
  assert.equal(JSON.stringify(result).includes('private provider'), false)
})

test('revocation and restoration do not send an unsolicited sign-in email', async () => {
  const f = teamFixture()
  for (const action of ['disable', 'restore', 'revoke']) {
    f.setBody({ id: '12345678-1234-1234-1234-123456789012', action })
    assert.equal((await f.patch()).status, 200)
  }
  assert.equal(f.calls.some((call) => call.name === 'send'), false)
})

test('invitation email uses only the approved recipient, canonical confirmation path, and escaped display name', async () => {
  let mail: any
  let closed = false
  const invitationModule = load('lib/employee/invitations.ts', {
    'server-only': {},
    nodemailer: { createTransport: () => ({ sendMail: async (message: unknown) => { mail = message; return { accepted: ['employee@example.test'] } }, close: () => { closed = true } }) },
    './supabase': { employeeAdmin: () => ({ auth: { admin: { generateLink: async () => ({ data: { properties: { hashed_token: 'synthetic-one-use-token', verification_type: 'invite', action_link: 'https://untrusted.example.test/' } }, error: null }) } } }) },
    './auth': { employeeOrigin: () => 'https://www.example.test' },
    '../server/sanitize': { escapeHtml },
  }, { GMAIL_USER: 'sender@example.test', GMAIL_APP_PASSWORD: 'synthetic-fixture-only' })
  const result = await invitationModule.sendEmployeeAccessLink('employee@example.test', '<script>Fixture</script>', 'invite')
  assert.equal(result, undefined)
  assert.equal(mail.to, 'employee@example.test')
  assert.equal(mail.cc, undefined)
  assert.equal(mail.bcc, undefined)
  assert.match(mail.text, /https:\/\/www.example.test\/api\/employee\/auth\/confirm\?token_hash=synthetic-one-use-token&type=invite/)
  assert.equal(mail.html.includes('<script>'), false)
  assert.equal(mail.html.includes('untrusted.example'), false)
  assert.equal(closed, true)
})

test('existing Google users can receive invitations and provider signup token types are preserved', async () => {
  for (const scenario of ['existing', 'signup']) {
    const types: string[] = []
    let mail: any
    const invitationModule = load('lib/employee/invitations.ts', {
      'server-only': {},
      nodemailer: { createTransport: () => ({ sendMail: async (value: unknown) => { mail = value; return { accepted: ['employee@example.test'] } }, close() {} }) },
      './supabase': { employeeAdmin: () => ({ auth: { admin: { generateLink: async ({ type }: { type: string }) => {
        types.push(type)
        if (scenario === 'existing' && types.length === 1) return { data: {}, error: { code: 'email_exists' } }
        return { data: { properties: { hashed_token: 'synthetic-single-use-token', verification_type: scenario === 'existing' ? 'magiclink' : 'signup' } }, error: null }
      } } } }) },
      './auth': { employeeOrigin: () => 'https://www.example.test' },
      '../server/sanitize': { escapeHtml },
    }, { GMAIL_USER: 'sender@example.test', GMAIL_APP_PASSWORD: 'synthetic-fixture-only' })
    await invitationModule.sendEmployeeAccessLink('employee@example.test', 'Fixture', scenario === 'existing' ? 'invite' : 'magiclink')
    assert.equal(types.join(','), scenario === 'existing' ? 'invite,magiclink' : 'magiclink')
    assert.equal(mail.text.includes(`type=${scenario === 'existing' ? 'magiclink' : 'signup'}`), true)
  }
})

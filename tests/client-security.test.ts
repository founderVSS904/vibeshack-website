import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { auditClientSecurity, scanClientBoundaries, scanCredentialText, scanKnownSecretText } from '../scripts/check-client-security.mjs'

function syntheticJwt(role: string) {
  return Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url') + '.' + Buffer.from(JSON.stringify({ role, exp: 1 })).toString('base64url') + '.' + 'fixture'.repeat(8)
}

test('credential scanner catches recognizable synthetic secrets without returning their values', () => {
  const fixtures = [
    ['stripe_secret', 'sk_' + 'live_' + 'A'.repeat(24)],
    ['stripe_webhook_secret', 'whsec_' + 'B'.repeat(24)],
    ['supabase_secret', 'sb_' + 'secret_' + 'C'.repeat(24)],
    ['google_oauth_secret', 'GOCSPX-' + 'D'.repeat(24)],
    ['google_access_token', 'ya29.' + 'E'.repeat(40)],
    ['google_refresh_token', '1//' + 'F'.repeat(60)],
    ['github_token', 'ghp_' + 'G'.repeat(40)],
    ['npm_token', 'npm_' + 'N'.repeat(40)],
    ['openai_secret', 'sk-' + 'proj-' + 'H'.repeat(48)],
    ['aws_access_key', 'AKIA' + 'I'.repeat(16)],
    ['slack_token', 'xoxb-' + 'J'.repeat(24)],
    ['private_key', '-----BEGIN ' + 'PRIVATE KEY-----'],
    ['credential_url', 'postgresql://' + 'fixture:synthetic-password@example.invalid/database'],
    ['access_jwt', syntheticJwt('service_role')],
  ]
  for (const [type, secret] of fixtures) {
    const findings = scanCredentialText('app/fixture.ts', '// synthetic fixture\n' + secret)
    assert.ok(findings.some((entry: { type: string }) => entry.type === type), type)
    assert.ok(findings.every((entry: { line: number }) => entry.line === 2))
    assert.equal(JSON.stringify(findings).includes(secret), false)
    assert.deepEqual(Object.keys(findings[0]).sort(), ['line', 'path', 'type'])
  }
})

test('public identifiers, placeholder references and ordinary strings are not reported as secrets', () => {
  const source = [
    'process.env.GMAIL_APP_PASSWORD', 'process.env.STRIPE_SECRET_KEY',
    'pk_live_' + 'A'.repeat(32), 'sb_publishable_' + 'B'.repeat(32),
    'AIza' + 'C'.repeat(35), syntheticJwt('anon'),
    'NEXT_PUBLIC_SUPABASE_URL=https://project.example.invalid',
    'sk_live_your_key_here', '0123456789abcdef'.repeat(6),
  ].join('\n')
  assert.deepEqual(scanCredentialText('lib/server/config.ts', source), [])
})

test('known-secret equality catches raw, JSON-escaped, URL-escaped and HTML-escaped values with redacted output', () => {
  const secret = 'fixture password\nwith / punctuation<&'
  const environment = { GMAIL_APP_PASSWORD: secret, NEXT_PUBLIC_TOKEN: 'public-visible-fixture', SHORT_SECRET: 'tiny' }
  const variants = [secret, JSON.stringify(secret).slice(1, -1), encodeURIComponent(secret), secret.replace(/&/g, '&amp;').replace(/</g, '&lt;')]
  for (const variant of variants) {
    const findings = scanKnownSecretText('.next/static/fixture.js', '/* fixture */\n' + variant, environment)
    assert.deepEqual(findings, [{ path: '.next/static/fixture.js', line: 2, type: 'known_server_secret_match', environment: 'GMAIL_APP_PASSWORD' }])
    assert.equal(JSON.stringify(findings).includes(secret), false)
    assert.equal(JSON.stringify(findings).includes(variant), false)
  }
  assert.deepEqual(scanKnownSecretText('public/fixture.txt', 'public-visible-fixture tiny', environment), [])
  assert.equal(scanKnownSecretText('public/fixture.txt', secret, { NEXT_PUBLIC_PASSWORD: secret })[0].environment, 'NEXT_PUBLIC_PASSWORD')
})

test('Calendar JSON and base64 credentials compare private fields without treating public identifiers as secrets', () => {
  const credentials = { client_id: 'public-client.example.invalid', token_uri: 'https://accounts.example.invalid/token', nested: { refresh_token: 'synthetic-refresh-for-audit', client_secret: 'synthetic-client-secret-for-audit' } }
  const json = JSON.stringify(credentials)
  for (const [name, value] of [['GCAL_TOKEN_JSON', json], ['GCAL_TOKEN_B64', Buffer.from(json).toString('base64')]]) {
    const findings = scanKnownSecretText('.next/static/fixture.js', credentials.nested.refresh_token, { [name]: value })
    assert.equal(findings.length, 1)
    assert.equal(findings[0].environment, name)
    assert.deepEqual(scanKnownSecretText('.next/static/fixture.js', credentials.client_id + credentials.token_uri, { [name]: value }), [])
  }
})

test('client boundary follows local aliases, barrels and dynamic imports to server-only code', () => {
  const files = new Map([
    ['app/Page.tsx', "'use client'\nimport { load } from '@/lib/barrel'\nvoid import('../lib/provider')"],
    ['lib/barrel.ts', "export { load } from './credentials'"],
    ['lib/credentials.ts', "import 'server-only'\nexport const load = () => process.env.GMAIL_APP_PASSWORD"],
    ['lib/provider.ts', "import mail from 'nodemailer'\nexport default mail"],
  ])
  const result = scanClientBoundaries(files)
  assert.equal(result.entries, 1)
  assert.equal(result.reachableModules, 4)
  assert.ok(result.findings.some((entry: { path: string; type: string }) => entry.path === 'lib/credentials.ts' && entry.type === 'client_server_import'))
  assert.ok(result.findings.some((entry: { path: string; type: string }) => entry.path === 'lib/credentials.ts' && entry.type === 'client_private_environment_access'))
  assert.ok(result.findings.some((entry: { path: string; type: string }) => entry.path === 'lib/provider.ts' && entry.type === 'client_server_import'))
})

test('client boundary rejects computed environment reads and secrets disguised as public variables', () => {
  const result = scanClientBoundaries(new Map([['app/Page.tsx', [
    "'use client'", 'const a = process.env.SECRET_KEY',
    'const b = process.env[whichKey]', 'const c = { ...process.env }',
    'const d = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
    "const e = process.env['GMAIL_APP_PASSWORD']",
    "const f = process['env']['STRIPE_SECRET_KEY']",
  ].join('\n')]]))
  assert.equal(result.findings.length, 6)
  assert.ok(result.findings.every((entry: { type: string }) => entry.type === 'client_private_environment_access'))
})

test('type-only boundaries and public client settings remain allowed', () => {
  const files = new Map([
    ['app/Page.tsx', "'use client'\nimport type { User } from '@/lib/private'\nimport { type Role } from '@/lib/private'\nimport { format } from '../lib/shared'\nconst a = process.env.NODE_ENV\nconst b = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"],
    ['lib/private.ts', "import 'server-only'\nexport const key = process.env.SUPABASE_SECRET_KEY"],
    ['lib/shared.ts', 'export const format = String'],
  ])
  const result = scanClientBoundaries(files)
  assert.equal(result.reachableModules, 2)
  assert.deepEqual(result.findings, [])
})

function fixtureFiles(files: Record<string, string>) {
  const root = mkdtempSync(path.join(tmpdir(), 'vibeshack-client-security-'))
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
    writeFileSync(path.join(root, file), text)
  }
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) }
}

test('filesystem fallback scans deployable code without reading local env or test/media fixtures', () => {
  const secret = 'sk_' + 'live_' + 'K'.repeat(24)
  const fixture = fixtureFiles({
    'app/page.tsx': "'use client'\nexport default function Page() { return null }",
    '.env.local': secret, 'tests/synthetic.test.ts': secret, 'public/photo.jpg': secret,
  })
  try {
    const result = auditClientSecurity({ root: fixture.root, gitRoot: path.join(fixture.root, 'absent') })
    assert.equal(result.trackedInventory, 'unavailable')
    assert.equal(result.sourceFiles, 1)
    assert.deepEqual(result.findings, [])
    const tracked = auditClientSecurity({ root: fixture.root, trackedFiles: ['.env.local'] })
    assert.ok(tracked.findings.some((entry: { type: string }) => entry.type === 'tracked_credential_file'))
    assert.equal(JSON.stringify(tracked).includes(secret), false)
    writeFileSync(path.join(fixture.root, 'public/.env.local'), 'placeholder')
    const publicFile = auditClientSecurity({ root: fixture.root, trackedFiles: [] })
    assert.ok(publicFile.findings.some((entry: { path: string; type: string }) => entry.path === 'public/.env.local' && entry.type === 'public_private_file'))
  } finally { fixture.cleanup() }
})

test('production check requires a real build and scans browser assets and source maps', () => {
  const secret = 'sb_' + 'secret_' + 'L'.repeat(24)
  const fixture = fixtureFiles({ 'app/page.tsx': 'export default function Page() { return null }' })
  try {
    const missing = auditClientSecurity({ root: fixture.root, trackedFiles: [], requireBuild: true })
    assert.ok(missing.findings.some((entry: { type: string }) => entry.type === 'production_build_required'))
    mkdirSync(path.join(fixture.root, '.next/static/chunks'), { recursive: true })
    writeFileSync(path.join(fixture.root, '.next/BUILD_ID'), 'fixture-build')
    writeFileSync(path.join(fixture.root, '.next/static/chunks/page.js'), 'const exposed = ' + JSON.stringify(secret))
    writeFileSync(path.join(fixture.root, '.next/static/chunks/page.js.map'), '{}')
    mkdirSync(path.join(fixture.root, '.next/server/app'), { recursive: true })
    writeFileSync(path.join(fixture.root, '.next/server/app/index.html'), '<p>synthetic-app-password</p>')
    mkdirSync(path.join(fixture.root, 'public'), { recursive: true })
    writeFileSync(path.join(fixture.root, 'public/exposed.txt'), 'synthetic-app-password')
    const built = auditClientSecurity({ root: fixture.root, trackedFiles: [], requireBuild: true, environment: { GMAIL_APP_PASSWORD: 'synthetic-app-password' } })
    assert.equal(built.builtFiles, 2)
    assert.ok(built.findings.some((entry: { type: string }) => entry.type === 'supabase_secret'))
    assert.ok(built.findings.some((entry: { type: string }) => entry.type === 'public_source_map'))
    assert.ok(built.findings.some((entry: { path: string; type: string }) => entry.path === '.next/server/app/index.html' && entry.type === 'known_server_secret_match'))
    assert.ok(built.findings.some((entry: { path: string; type: string }) => entry.path === 'public/exposed.txt' && entry.type === 'known_server_secret_match'))
    assert.equal(built.knownSecretsChecked, 1)
    assert.equal(JSON.stringify(built).includes(secret), false)
  } finally { fixture.cleanup() }
})

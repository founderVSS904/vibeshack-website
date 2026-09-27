import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { describe, test } from 'node:test'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'
import EmployeeSignIn from '../app/employee/EmployeeSignIn'
import EmployeePasswordReset from '../app/employee/EmployeePasswordReset'

Object.assign(globalThis, { React })

describe('employee sign-in design', () => {
  test('preview offers password and Google design without a real provider link', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSignIn, { preview: true, configured: false }))
    assert.match(html, /monogram-red-transparent\.png/)
    assert.match(html, /Employee sign in/)
    assert.match(html, /for="employee-signin-email"/)
    assert.match(html, /id="employee-signin-email" type="email" inputMode="email"/)
    assert.match(html, /type="password" autoComplete="current-password"/)
    assert.match(html, /aria-label="Show password" aria-pressed="false"/)
    assert.match(html, /aria-controls="employee-signin-password"/)
    assert.match(html, /href="\/employee\/password\/?"/)
    assert.match(html, /Forgot password\?/)
    assert.match(html, /Continue with Google/)
    assert.match(html, /No account access or emails are created in this preview/)
    assert.match(html, /href="\/employee\/preview\/?"/)
    assert.match(html, /href="\/employee\/preview\/team\/?"/)
    assert.doesNotMatch(html, /Keep me signed in|href="\/api\/employee\/auth\/login|Invite-only access|No password to remember|Email me a sign-in link/)
    const source = readFileSync(new URL('../app/employee/EmployeeSignIn.tsx', import.meta.url), 'utf8')
    assert.doesNotMatch(source, /localStorage|sessionStorage|document\.cookie/)
  })

  test('keeps unconfigured access closed outside the local preview', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSignIn, { preview: false, configured: false }))
    assert.match(html, /Secure sign-in is awaiting administrator setup\. Public access is closed\./)
    assert.doesNotMatch(html, /<input|<form|\/employee\/preview|\/api\/employee\/auth\/login/)
  })

  test('configured sign-in provides Google or an accessible email and password form', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSignIn, { preview: false, configured: true }))
    assert.match(html, /href="\/api\/employee\/auth\/login"/)
    assert.match(html, /aria-label="Email and password sign in"/)
    assert.match(html, /autoComplete="email"/)
    assert.match(html, /type="password" autoComplete="current-password"/)
    assert.doesNotMatch(html, /\/employee\/preview|Invite-only access|No password to remember/)
    const emailOnly = renderToStaticMarkup(createElement(EmployeeSignIn, { preview: false, configured: true, googleConfigured: false }))
    assert.match(emailOnly, /type="password"/)
    assert.doesNotMatch(emailOnly, /Continue with Google|or sign in with email/)
  })

  test('announces sign-in failures accessibly', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSignIn, { preview: false, configured: true, failed: true }))
    assert.match(html, /role="alert"/)
    assert.match(html, /Try again with an approved account/)
  })

  test('reset request supports first-time password setup and exposes link errors', () => {
    const html = renderToStaticMarkup(createElement(EmployeePasswordReset, { failed: true }))
    for (const text of ['Set or reset your password', 'Send reset link', 'Back to sign in', 'This link could not be used to save your password.']) assert.ok(html.includes(text), text)
    assert.match(html, /role="alert"/)
    assert.match(html, /id="employee-password-email" type="email" inputMode="email" autoComplete="email"/)
    assert.doesNotMatch(html, /type="password"|authenticator|\/api\/employee\/auth\/login/)
    const preview = renderToStaticMarkup(createElement(EmployeePasswordReset, { preview: true }))
    assert.match(preview, /No password reset emails are sent in this preview/)
    const route = readFileSync(new URL('../app/employee/password/page.tsx', import.meta.url), 'utf8')
    assert.match(route, /preview=\{localEmployeePreview\(\)\}/)
    assert.match(route, /params\.error === 'reset'/)
    assert.doesNotMatch(route, /redirect\(|currentEmployee|employeeSupabase/)
  })
})

// Execute the actual component submit functions with isolated browser bindings.
// These fixtures cannot reach a provider, real credential, or browser storage.
function submitFixture(component: 'EmployeeSignIn' | 'EmployeePasswordReset', handler: 'signIn' | 'requestReset', options: { preview?: boolean; ok?: boolean; data?: Record<string, unknown> } = {}) {
  const source = readFileSync(new URL('../app/employee/' + component + '.tsx', import.meta.url), 'utf8')
  const ast = ts.createSourceFile('component.tsx', source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX)
  let declaration: ts.FunctionDeclaration | undefined
  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && node.name?.text === handler) declaration = node
    else ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.ok(declaration)
  const requests: Array<{ url: string; options: { method: string; cache: string; headers: Record<string, string>; body: string } }> = []
  const redirects: string[] = []
  const state: Record<string, unknown[]> = { error: [], notice: [], password: [], busy: [] }
  const context = vm.createContext({
    email: ' staff@example.test ', password: '  Fixture password  ', busy: false, preview: options.preview || false,
    setError: (value: unknown) => state.error.push(value), setNotice: (value: unknown) => state.notice.push(value),
    setPassword: (value: unknown) => state.password.push(value), setBusy: (value: unknown) => state.busy.push(value),
    fetch: async (url: string, request: typeof requests[number]['options']) => {
      requests.push({ url, options: request })
      return { ok: options.ok !== false, json: async () => options.data || { redirect: '/employee/book/' } }
    },
    window: { location: { assign: (url: string) => redirects.push(url) } },
  })
  const code = ts.transpileModule(declaration.getText(ast), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText
  vm.runInContext(code + '\nglobalThis.run = ' + handler, context)
  return { requests, redirects, state, run: () => context.run({ preventDefault() {} }) as Promise<void> }
}

test('password sign-in posts the exact credential contract and navigates only on authenticated success', async () => {
  const fixture = submitFixture('EmployeeSignIn', 'signIn')
  await fixture.run()
  assert.equal(fixture.requests.length, 1)
  const request = fixture.requests[0]
  assert.equal(request.url, '/api/employee/auth/password')
  assert.equal(request.options.method, 'POST')
  assert.equal(request.options.cache, 'no-store')
  assert.deepEqual(JSON.parse(request.options.body), { email: 'staff@example.test', password: '  Fixture password  ' })
  assert.deepEqual(fixture.redirects, ['/employee/book/'])
  assert.deepEqual(fixture.state.password, [''])
})

test('preview password and reset submits never send credentials or email requests', async () => {
  for (const [component, handler] of [['EmployeeSignIn', 'signIn'], ['EmployeePasswordReset', 'requestReset']] as const) {
    const fixture = submitFixture(component, handler, { preview: true })
    await fixture.run()
    assert.equal(fixture.requests.length, 0)
    assert.equal(fixture.redirects.length, 0)
    assert.match(String(fixture.state.notice.at(-1)), /Preview only/)
  }
})

test('failed or unexpected sign-in responses remain on the form with an accessible error message', async () => {
  const failure = submitFixture('EmployeeSignIn', 'signIn', { ok: false, data: { error: 'Email or password could not be verified.' } })
  await failure.run()
  assert.equal(failure.redirects.length, 0)
  assert.equal(failure.state.error.at(-1), 'Email or password could not be verified.')
  const unexpected = submitFixture('EmployeeSignIn', 'signIn', { data: { redirect: 'https://example.test/' } })
  await unexpected.run()
  assert.equal(unexpected.redirects.length, 0)
  assert.equal(unexpected.state.error.at(-1), 'Sign-in could not finish. Please try again.')
})

test('password reset requests show a generic result without exposing account membership', async () => {
  const fixture = submitFixture('EmployeePasswordReset', 'requestReset', { data: { ok: true, message: 'Provider-specific detail must not be exposed' } })
  await fixture.run()
  assert.equal(fixture.requests[0].url, '/api/employee/auth/password/reset')
  assert.equal(fixture.requests[0].options.method, 'POST')
  assert.equal(fixture.requests[0].options.cache, 'no-store')
  assert.deepEqual(JSON.parse(fixture.requests[0].options.body), { email: 'staff@example.test' })
  assert.match(String(fixture.state.notice.at(-1)), /^If this email has access,/)
  assert.equal(fixture.redirects.length, 0)
  assert.doesNotMatch(String(fixture.state.notice.at(-1)), /Provider-specific/)
})

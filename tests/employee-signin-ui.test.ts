import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import EmployeeSignIn from '../app/employee/EmployeeSignIn'

Object.assign(globalThis, { React })

describe('employee sign-in design', () => {
  test('preview offers the real sign-in design without a provider link or password collection', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSignIn, { preview: true, configured: false }))
    assert.match(html, /monogram-red-transparent\.png/)
    assert.match(html, /Employee sign in/)
    assert.match(html, /for="employee-signin-email"/)
    assert.match(html, /id="employee-signin-email" type="email" inputMode="email"/)
    assert.match(html, /Email me a sign-in link/)
    assert.match(html, /Continue with Google/)
    assert.match(html, /No account access or emails are created in this preview/)
    assert.match(html, /href="\/employee\/preview\/?"/)
    assert.match(html, /href="\/employee\/preview\/team\/?"/)
    assert.doesNotMatch(html, /type="password"|Forgot password|Keep me signed in|href="\/api\/employee\/auth\/login/)
    const source = readFileSync(new URL('../app/employee/EmployeeSignIn.tsx', import.meta.url), 'utf8')
    assert.ok(source.indexOf('if (preview)') < source.indexOf("fetch('/api/employee/auth/email'"))
    assert.doesNotMatch(source, /localStorage|sessionStorage|document\.cookie/)
  })

  test('keeps unconfigured access closed outside the local preview', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSignIn, { preview: false, configured: false }))
    assert.match(html, /Secure sign-in is awaiting administrator setup\. Public access is closed\./)
    assert.doesNotMatch(html, /<input|<form|\/employee\/preview|\/api\/employee\/auth\/login/)
  })

  test('configured sign-in provides Google and passwordless email access', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSignIn, { preview: false, configured: true }))
    assert.match(html, /href="\/api\/employee\/auth\/login"/)
    assert.match(html, /aria-label="Email sign in"/)
    assert.match(html, /autoComplete="email"/)
    assert.doesNotMatch(html, /type="password"|\/employee\/preview/)
  })

  test('announces sign-in failures accessibly', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSignIn, { preview: false, configured: true, failed: true }))
    assert.match(html, /role="alert"/)
    assert.match(html, /Try again with an approved account/)
  })
})

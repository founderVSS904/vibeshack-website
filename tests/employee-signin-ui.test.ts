import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import EmployeeSignIn from '../app/employee/EmployeeSignIn'

Object.assign(globalThis, { React })

describe('employee sign-in design', () => {
  test('renders the requested local design without submitting or persisting credentials', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSignIn, { preview: true, configured: false }))
    assert.match(html, /monogram-red-transparent\.png/)
    assert.match(html, /Employee sign in/)
    assert.match(html, /for="employee-signin-email"/)
    assert.match(html, /id="employee-signin-email" type="email" inputMode="email"/)
    assert.match(html, /for="employee-signin-password"/)
    assert.match(html, /id="employee-signin-password" type="password"/)
    assert.match(html, /aria-label="Show password" aria-pressed="false"/)
    assert.match(html, /type="checkbox" checked=""/)
    assert.match(html, /Keep me signed in/)
    assert.match(html, /Forgot password\?/)
    assert.match(html, /Sign In/)
    assert.doesNotMatch(html, /Local preview\. Sign-in is not connected yet\.|employee-signin-preview-note/)
    assert.match(html, /href="\/employee\/preview\/?"/)
    assert.doesNotMatch(html, /<form|type="submit"|action=|\/api\/employee\/auth\/login/)
    const source = readFileSync(new URL('../app/employee/EmployeeSignIn.tsx', import.meta.url), 'utf8')
    assert.doesNotMatch(source, /fetch\(|localStorage|sessionStorage|document\.cookie|FormData/)
  })

  test('keeps unconfigured access closed outside the local preview', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSignIn, { preview: false, configured: false }))
    assert.match(html, /Secure sign-in is awaiting administrator setup\. Public access is closed\./)
    assert.doesNotMatch(html, /<input|Forgot password|Keep me signed in|\/employee\/preview|\/api\/employee\/auth\/login/)
  })

  test('preserves the configured Google sign-in without enabling password authentication', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSignIn, { preview: false, configured: true }))
    assert.match(html, /href="\/api\/employee\/auth\/login"/)
    assert.match(html, /Continue with Google/)
    assert.doesNotMatch(html, /<input|\/employee\/preview/)
  })

  test('announces sign-in failures accessibly', () => {
    const html = renderToStaticMarkup(createElement(EmployeeSignIn, { preview: false, configured: true, failed: true }))
    assert.match(html, /role="alert"/)
    assert.match(html, /Try again with an approved account/)
  })
})

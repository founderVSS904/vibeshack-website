import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import EmployeeHeader from '../app/employee/EmployeeHeader'
import TeamPage from '../app/employee/TeamPage'

Object.assign(globalThis, { React })

test('employee navigation does not expose Superadmin controls and mobile links retain current-page context', () => {
  const employee = renderToStaticMarkup(createElement(EmployeeHeader, { email: 'staff@example.test', preview: false, role: 'employee', active: 'bookings' }))
  assert.match(employee, /href="\/employee\/book\/?"/)
  assert.match(employee, /aria-current="page">Bookings/)
  assert.doesNotMatch(employee, /href="\/employee\/(team|activity|security)/)
  const owner = renderToStaticMarkup(createElement(EmployeeHeader, { email: 'owner@example.test', preview: false, role: 'superadmin', active: 'team' }))
  for (const path of ['team', 'activity', 'password']) assert.ok(owner.includes('/employee/' + path), path)
  assert.match(owner, /aria-label="Workspace navigation"/)
  assert.match(owner, /aria-current="page">Team/)
})

test('team preview uses fictional identities, protects its sample owner and makes invitation simulation clear', () => {
  const html = renderToStaticMarkup(createElement(TeamPage, { email: '', preview: true }))
  for (const text of ['owner@example.test', 'alex@example.test', 'jordan@example.test', 'Preview invitation', 'No invitation emails are sent in this preview.', 'Protected account']) assert.ok(html.includes(text), text)
  assert.doesNotMatch(html, /founder@vibeshackstudios\.com|\/api\/employee\/auth\/logout/)
  assert.match(html, /aria-label="Revoke invitation for Jordan Lee"/)
  assert.match(html, /aria-label="Resend invitation to Jordan Lee"/)
  assert.match(html, /aria-label="Disable access for Alex Morgan"/)
  assert.doesNotMatch(html, /aria-label="(?:Disable|Revoke)[^"]*Studio owner/)
  assert.match(html, /id="employee-content" tabindex="-1"/)
  assert.doesNotMatch(html, /<select|type="password"/)
})

test('real team screen starts with loading state and no preview membership data', () => {
  const html = renderToStaticMarkup(createElement(TeamPage, { email: 'owner@example.test' }))
  assert.match(html, /Loading your team/)
  assert.match(html, /Send invitation/)
  assert.doesNotMatch(html, /alex@example.test|jordan@example.test|Preview invitation|No invitation emails/)
  const source = readFileSync(new URL('../app/employee/team/page.tsx', import.meta.url), 'utf8')
  assert.match(source, /await currentEmployee\(\)/)
  assert.match(source, /employee\.role !== 'superadmin'/)
  assert.match(source, /redirect\('\/employee\/'\)/)
  const preview = readFileSync(new URL('../app/employee/preview/team/page.tsx', import.meta.url), 'utf8')
  assert.match(preview, /if \(!localEmployeePreview\(\)\) notFound\(\)/)
})

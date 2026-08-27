import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ContactForm from '../app/contact/ContactForm'
import {
  contactFieldError,
  firstInvalidContactField,
  sendContactBrief,
  validateContactBrief,
  type ContactBrief,
} from '../lib/contact/form'
import { getContactInquiry } from '../lib/contact/inquiry'

const brief: ContactBrief = {
  name: 'Test Visitor',
  email: 'visitor+project@example.test',
  phone: '',
  project_type: 'podcast',
  preferred_date: '',
  message: 'Please help me plan a two-person podcast.\nI would like to confirm the setup.',
  company: '',
  startedAt: 1_750_000_000_000,
}

const reply = (status: number): typeof fetch => async () => new Response(null, { status })

describe('contact field validation', () => {
  test('identifies all required fields without requiring optional details', () => {
    assert.deepEqual(validateContactBrief({ name: '', email: '', message: '' }), {
      name: 'Enter your name.',
      email: 'Enter your email address so we can reply.',
      message: 'Tell us a little about your project.',
    })
    const optionalDetailsEmpty = { ...brief, project_type: '' }
    assert.deepEqual(validateContactBrief(optionalDetailsEmpty), {})
  })

  test('rejects whitespace and control-only text using the server sanitization rules', () => {
    for (const value of [' ', '\n\t', '\u0000\u007f']) {
      assert.ok(contactFieldError('name', value))
      assert.ok(contactFieldError('email', value))
      assert.ok(contactFieldError('message', value))
    }
  })

  test('distinguishes an empty email from a malformed address', () => {
    assert.match(contactFieldError('email', '') || '', /Enter your email address/)
    for (const value of ['visitor', 'visitor@', 'visitor@example', 'a@b@example.test', 'a b@example.test']) {
      assert.match(contactFieldError('email', value) || '', /valid email address/)
    }
    for (const value of ['visitor@example.test', 'visitor+project@example.test', ' visitor@example.test ']) {
      assert.equal(contactFieldError('email', value), undefined)
    }
  })

  test('returns the first invalid field in visual order, not object insertion order', () => {
    assert.equal(firstInvalidContactField({ message: 'Required', email: 'Invalid', name: 'Required' }), 'name')
    assert.equal(firstInvalidContactField({ message: 'Required', email: 'Invalid' }), 'email')
    assert.equal(firstInvalidContactField({ message: 'Required' }), 'message')
    assert.equal(firstInvalidContactField({}), undefined)
  })

  test('clears a field error once the corrected value is valid', () => {
    assert.ok(contactFieldError('name', ''))
    assert.equal(contactFieldError('name', 'Test Visitor'), undefined)
    assert.ok(contactFieldError('message', ' '))
    assert.equal(contactFieldError('message', brief.message), undefined)
  })
})

describe('mocked contact delivery', () => {
  test('preserves the exact existing payload and anti-spam fields', async () => {
    let calls = 0
    const request: typeof fetch = async (input, init) => {
      calls += 1
      assert.equal(input, '/api/contact/')
      assert.equal(init?.method, 'POST')
      assert.deepEqual(init?.headers, { 'Content-Type': 'application/json' })
      assert.deepEqual(JSON.parse(String(init?.body)), brief)
      return new Response(null, { status: 200 })
    }
    const original = structuredClone(brief)
    assert.deepEqual(await sendContactBrief(Object.freeze({ ...brief }), request), { ok: true })
    assert.deepEqual(brief, original)
    assert.equal(calls, 1)
  })

  test('keeps project, studio-finder, and exact studio-setup context intact after delivery failure', async () => {
    const queries = [
      new URLSearchParams({ service: 'portfolio-inquiry', project: 'body-is-tea' }),
      new URLSearchParams({ from: 'studio-finder', service: 'podcast', on_camera: '5', crew: 'no' }),
      new URLSearchParams({ service: 'studio-setup', studio: 'the-wing', setup: 'two-black-chairs' }),
      new URLSearchParams({ service: 'studio-setup', studio: 'the-executive', setup: 'three-black-armchairs' }),
    ]
    for (const query of queries) {
      const inquiry = getContactInquiry(query)
      assert.ok(inquiry)
      assert.ok(inquiry.message)
      const contextualBrief = Object.freeze({ ...brief, project_type: inquiry.projectType, message: inquiry.message })
      const original = structuredClone(contextualBrief)
      const request: typeof fetch = async (_input, init) => {
        assert.deepEqual(JSON.parse(String(init?.body)), original)
        return new Response(null, { status: 500 })
      }
      assert.equal((await sendContactBrief(contextualBrief, request)).ok, false)
      assert.deepEqual(contextualBrief, original)
    }
  })

  test('maps rate limits, retryable rejection, and oversized requests to useful global errors', async () => {
    const cases = [
      { status: 429, kind: 'rate-limit', message: /wait a few minutes/ },
      { status: 400, kind: 'retry', message: /wait a few seconds/ },
      { status: 413, kind: 'server', message: /shorten it/ },
      { status: 500, kind: 'server', message: /details are still here/ },
    ]
    for (const expected of cases) {
      const result = await sendContactBrief(brief, reply(expected.status))
      assert.equal(result.ok, false)
      if (result.ok) throw new Error('Expected a failed delivery')
      assert.equal(result.kind, expected.kind)
      assert.match(result.message, expected.message)
    }
  })

  test('distinguishes an unconfirmed network failure from a server rejection', async () => {
    const request: typeof fetch = async () => { throw new Error('Private transport diagnostics') }
    const result = await sendContactBrief(brief, request)
    assert.equal(result.ok, false)
    if (result.ok) throw new Error('Expected a failed delivery')
    assert.equal(result.kind, 'network')
    assert.match(result.message, /could not confirm delivery/)
    assert.doesNotMatch(result.message, /Private transport diagnostics/)
  })
})

describe('contact form initial accessible markup', () => {
  test('keeps native labels, required fields, and stable error descriptions', () => {
    const markup = renderToStaticMarkup(createElement(ContactForm))
    assert.match(markup, /<form\b[^>]*novalidate=""/i)
    for (const field of ['name', 'email', 'message']) {
      assert.match(markup, new RegExp(`<label[^>]*for="${field}"`))
      const input = markup.match(new RegExp(`<(?:input|textarea)\\b[^>]*id="${field}"[^>]*>`))?.[0]
      assert.ok(input)
      assert.match(input, /required=""/)
      assert.match(input, /aria-invalid="false"/)
      assert.ok(input.includes(`aria-describedby="contact-${field}-error"`))
      assert.ok(markup.includes(`id="contact-${field}-error"`))
    }
    assert.doesNotMatch(markup, /aria-invalid="true"/)
    assert.match(markup, /role="status" aria-live="polite" aria-atomic="true"/)
    assert.match(markup, /name="company"[^>]*tabindex="-1"[^>]*aria-hidden="true"/)
    assert.match(markup, /type="hidden" name="startedAt"/)
    assert.match(markup, /name="project_type"/)
    assert.match(markup, /name="preferred_date"/)
  })
})

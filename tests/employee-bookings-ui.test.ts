import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import vm from 'node:vm'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'
import BookingsPage, { bookingActionNote, bookingCancelCopy, bookingCancelledMessage, bookingPaidMessage } from '../app/employee/bookings/BookingsPage'
import type { EmployeeHistoryItem, EmployeeHistoryPage } from '../lib/employee/history'
import * as payment from '../lib/employee/payment'
import { previewBookingHistory } from '../lib/employee/preview'

Object.assign(globalThis, { React })

type Element = React.ReactElement<Record<string, unknown>>
type Props = { email: string; role: 'superadmin' | 'employee'; enabled: boolean; preview?: boolean; initial?: EmployeeHistoryPage }
type Call = { url: string; init: { method?: string; body?: string } }

function children(node: React.ReactNode): Element[] {
  if (Array.isArray(node)) return node.flatMap(children)
  return React.isValidElement<Record<string, unknown>>(node) ? [node, ...children(node.props.children as React.ReactNode)] : []
}
function text(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(text).join('')
  return React.isValidElement<Record<string, unknown>>(node) ? text(node.props.children as React.ReactNode) : ''
}

// Runs the real Bookings component with isolated hook state and a fake fetch.
// Its rendered handlers are called directly; no browser, Calendar or Stripe is used.
function bookingsFixture(props: Props, responses: Array<{ status: number; body: object }> = []) {
  const states: unknown[] = []
  const calls: Call[] = []
  let cursor = 0
  const hooks = {
    ...React,
    useState: (initial: unknown) => {
      const index = cursor++
      if (!(index in states)) states[index] = typeof initial === 'function' ? (initial as () => unknown)() : initial
      return [states[index], (value: unknown) => { states[index] = typeof value === 'function' ? (value as (previous: unknown) => unknown)(states[index]) : value }]
    },
    useRef: (current: unknown) => {
      const index = cursor++
      if (!(index in states)) states[index] = { current }
      return states[index]
    },
    useEffect: () => {},
  }
  const componentModule = { exports: {} as { default: (props: Props) => React.ReactNode } }
  const source = readFileSync(new URL('../app/employee/bookings/BookingsPage.tsx', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText
  const context = vm.createContext({
    module: componentModule, exports: componentModule.exports, React, console,
    fetch: async (url: string, init: Call['init']) => {
      calls.push({ url, init })
      const response = responses.shift()
      assert.ok(response, `Unexpected request to ${url}`)
      return { ok: response.status < 400, status: response.status, json: async () => response.body }
    },
    require: (name: string) => {
      if (name === 'react') return hooks
      if (name === 'next/link') return { __esModule: true, default: 'a' }
      if (name === '@/lib/employee/payment') return payment
      if (name === '../EmployeeHeader') return { __esModule: true, default: 'header' }
      if (name === '../EmployeeBookingUI') return { EmployeeSelect: 'select' }
      if (name === './BookingsPage.module.css') return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) }
      throw new Error(`Unexpected component dependency: ${name}`)
    },
  })
  vm.runInContext(compiled, context)
  const render = () => { cursor = 0; return componentModule.exports.default(props) }
  const all = () => children(render())
  const row = (client: string) => {
    const item = all().find((element) => element.type === 'li' && text(element).includes(client))
    assert.ok(item, client)
    return children(item)
  }
  const button = (nodes: Element[], label: string) => {
    const found = nodes.find((element) => element.type === 'button' && text(element) === label)
    assert.ok(found, label)
    return found
  }
  const flush = () => new Promise((resolve) => setImmediate(resolve))
  return {
    calls, row, button, flush,
    page: () => text(render()),
    status: (client: string) => text(row(client).find((element) => element.props.className === 'status')!),
    click: async (client: string, label: string) => { (button(row(client), label).props.onClick as () => void)(); await flush() },
    choose: (client: string, value: string) => (row(client).find((element) => element.type === 'select')!.props.onChange as (event: object) => void)({ target: { value } }),
    note: (client: string, value: string) => (row(client).find((element) => element.type === 'input')!.props.onChange as (event: object) => void)({ target: { value } }),
    submit: async (client: string) => { (row(client).find((element) => element.type === 'form')!.props.onSubmit as (event: object) => void)({ preventDefault() {} }); await flush() },
  }
}
function history(items: Array<Partial<EmployeeHistoryItem> & Pick<EmployeeHistoryItem, 'clientName'>>): EmployeeHistoryPage {
  return { scope: 'team', nextCursor: null, updatedSince: '2026-07-01T00:00:00Z', items: items.map((item, index) => ({
    ref: `emp-${String(index + 1).repeat(40)}`, createdAt: 1790460000000 - index, updatedAt: '2026-09-26T20:00:00Z', clientEmail: 'client@example.invalid', studioName: 'The Executive',
    start: '2026-09-29T21:00:00Z', end: '2026-09-29T23:00:00Z', total: 60000, phase: 'ready', bookedBy: 'Fixture Employee (staff@example.invalid)', canCancel: true,
    payment: 'external', paymentLabel: 'Awaiting payment', canMarkPaid: true, ...item,
  })) }
}

describe('employee bookings list', () => {
  test('preview shows one booking in each payment state with quiet, state-aware pills', () => {
    const html = renderToStaticMarkup(createElement(BookingsPage, { email: 'Local preview', role: 'superadmin', enabled: true, preview: true, initial: previewBookingHistory() }))
    const pills = [...html.matchAll(/<span class="status" data-phase="([a-z]+)" data-payment="([a-z]+)">([^<]+)<\/span>/g)].map((match) => match.slice(1).join(':'))
    assert.deepEqual(pills, ['ready:stripe:Payment link sent', 'ready:external:Awaiting payment', 'paid:prepaid:Paid by Zelle', 'paid:none:No charge', 'paid:stripe:Paid online', 'cancelled:stripe:Cancelled'])
    assert.equal((html.match(/>Mark as paid</g) || []).length, 2)
    assert.equal((html.match(/>Cancel reservation</g) || []).length, 4)
    for (const text of ['Paid reservations need an administrator review to change.', 'Room released', 'Local preview']) assert.ok(html.includes(text), text)
    assert.doesNotMatch(html, /Payment setup|>Paid</)
    const css = readFileSync(new URL('../app/employee/bookings/BookingsPage.module.css', import.meta.url), 'utf8')
    for (const rule of ['.status[data-phase=ready]', '.status[data-phase=paid]', '.status[data-phase=paid][data-payment=none]', '.status[data-phase=cancelled]']) assert.ok(css.includes(rule), rule)
    assert.doesNotMatch(css, /#ec0000|#d40000|red/)
  })

  test('the real list starts loading without preview rows, and the preview route keeps its development guard', () => {
    const html = renderToStaticMarkup(createElement(BookingsPage, { email: 'staff@example.invalid', role: 'employee', enabled: true }))
    assert.match(html, /Loading booking history/)
    assert.doesNotMatch(html, /aria-label="Employee bookings"|Avery Morgan|Mark as paid|Local preview/)
    const route = readFileSync(new URL('../app/employee/preview/bookings/page.tsx', import.meta.url), 'utf8')
    assert.match(route, /if \(!localEmployeePreview\(\)\) notFound\(\)/)
    assert.match(route, /initial=\{previewBookingHistory\(\)\}/)
  })

  test('status copy under the actions is accurate for each payment choice and role', () => {
    assert.equal(bookingActionNote({ phase: 'cancelled', payment: 'external' }, 'superadmin', true), 'Room released')
    assert.equal(bookingActionNote({ phase: 'ready', payment: 'stripe' }, 'employee', false), 'Booking changes are not activated.')
    assert.equal(bookingActionNote({ phase: 'reserved', payment: 'stripe' }, 'employee', true), 'Setup is still in progress.')
    assert.equal(bookingActionNote({ phase: 'paid', payment: 'stripe' }, 'superadmin', true), 'Paid reservations need an administrator review to change.')
    for (const payment of ['prepaid', 'external'] as const) assert.equal(bookingActionNote({ phase: 'paid', payment }, 'employee', true), 'Only an administrator can cancel a paid booking.')
    assert.equal(bookingActionNote({ phase: 'ready', payment: 'external' }, 'employee', true), 'Being updated. Refresh in a moment.')
  })

  test('cancel copy follows the payment rules', () => {
    assert.equal(bookingCancelCopy({ phase: 'ready', payment: 'stripe' }), 'The unpaid payment request will be voided and the studio will become available again.')
    assert.equal(bookingCancelCopy({ phase: 'ready', payment: 'external' }), 'The studio will become available again. Nothing is sent to the client.')
    assert.equal(bookingCancelCopy({ phase: 'paid', payment: 'none' }), 'The studio will become available again. Nothing is sent to the client.')
    for (const payment of ['prepaid', 'external'] as const) assert.equal(bookingCancelCopy({ phase: 'paid', payment }), 'The studio will become available again. Refunds are handled outside the website.')
    assert.match(bookingCancelledMessage({ phase: 'ready', payment: 'stripe' }, false), /payment request is void/)
    assert.equal(bookingCancelledMessage({ phase: 'ready', payment: 'external' }, false), 'Reservation cancelled. The room has been released.')
    assert.match(bookingCancelledMessage({ phase: 'paid', payment: 'prepaid' }, false), /Handle any refund outside the website\.$/)
    assert.match(bookingCancelledMessage({ phase: 'paid', payment: 'prepaid' }, true), /^Preview reservation cancelled\. No real booking was changed\.$/)
    assert.match(bookingPaidMessage({ phase: 'paid', payment: 'stripe', paymentLabel: 'Paid online', outcome: 'paid-online' }, false), /^The client already paid online/)
    assert.equal(bookingPaidMessage({ phase: 'paid', payment: 'external', paymentLabel: 'Paid in cash', outcome: 'already-paid' }, false), 'This booking was already paid. It shows Paid in cash.')
  })

  test('preview Mark as paid needs a method, stays local and updates the row honestly', async () => {
    const fixture = bookingsFixture({ email: 'Local preview', role: 'superadmin', enabled: true, preview: true, initial: previewBookingHistory() })
    await fixture.click('Avery Morgan', 'Mark as paid')
    const panel = fixture.row('Avery Morgan')
    const form = panel.find((element) => element.type === 'form')!
    assert.equal(form.props['aria-label'], 'Mark the booking for Avery Morgan as paid')
    assert.ok(text(form).includes('The team gets the booking email. If a website invoice was sent, it will show as paid so the client can’t pay twice.'))
    const select = panel.find((element) => element.type === 'select')!
    assert.equal(select.props.required, true)
    assert.equal(select.props.value, '')
    assert.deepEqual(children(select).filter((element) => element.type === 'option').map((element) => text(element)), ['Choose a method', 'Cash', 'Zelle', 'Venmo', 'Card', 'Bank transfer', 'Check', 'Other'])
    assert.equal(panel.find((element) => element.type === 'input')!.props.maxLength, 200)
    assert.equal(fixture.button(panel, 'Confirm payment').props.disabled, true)
    assert.equal(fixture.button(panel, 'Keep unpaid').props.type, 'button')
    await fixture.submit('Avery Morgan')
    assert.equal(fixture.status('Avery Morgan'), 'Payment link sent')
    fixture.choose('Avery Morgan', 'zelle')
    assert.equal(fixture.button(fixture.row('Avery Morgan'), 'Confirm payment').props.disabled, false)
    await fixture.submit('Avery Morgan')
    assert.equal(fixture.calls.length, 0)
    assert.equal(fixture.status('Avery Morgan'), 'Paid by Zelle')
    assert.ok(fixture.page().includes('Preview booking now shows Paid by Zelle. No real booking was changed.'))
    assert.ok(text(fixture.row('Avery Morgan')).includes('Paid reservations need an administrator review to change.'))
    assert.doesNotMatch(text(fixture.row('Avery Morgan')), /Mark as paid|Cancel reservation/)
    await fixture.click('Morgan Blake', 'Mark as paid')
    fixture.choose('Morgan Blake', 'cash')
    await fixture.click('Morgan Blake', 'Keep unpaid')
    assert.equal(fixture.status('Morgan Blake'), 'Awaiting payment')
    assert.doesNotMatch(text(fixture.row('Morgan Blake')), /Confirm payment/)
  })

  test('preview cancel shows the refund note for money taken outside the website', async () => {
    const fixture = bookingsFixture({ email: 'Local preview', role: 'superadmin', enabled: true, preview: true, initial: previewBookingHistory() })
    await fixture.click('Riley Park', 'Cancel reservation')
    assert.ok(text(fixture.row('Riley Park')).includes('Refunds are handled outside the website.'))
    await fixture.click('Riley Park', 'Confirm cancellation')
    assert.equal(fixture.calls.length, 0)
    assert.equal(fixture.status('Riley Park'), 'Cancelled')
    assert.ok(fixture.page().includes('Preview reservation cancelled. No real booking was changed.'))
    assert.ok(text(fixture.row('Riley Park')).includes('Room released'))
  })

  test('Mark as paid posts only the ref, method and trimmed note, then reflects the server result', async () => {
    const response = (patch: object) => ({ status: 200, body: { ref: `emp-${'1'.repeat(40)}`, phase: 'paid', emailed: false, total: 60000, payment: 'external', paymentLabel: 'Paid in cash', outcome: 'marked', ...patch } })
    for (const [role, cancel] of [['superadmin', true], ['employee', false]] as const) {
      const fixture = bookingsFixture({ email: 'staff@example.invalid', role, enabled: true, initial: history([{ clientName: 'Avery Morgan' }]) }, [response({})])
      await fixture.click('Avery Morgan', 'Mark as paid')
      fixture.choose('Avery Morgan', 'cash')
      fixture.note('Avery Morgan', '  Front desk  ')
      await fixture.submit('Avery Morgan')
      assert.equal(fixture.calls.length, 1)
      assert.equal(fixture.calls[0].url, '/api/employee/bookings/paid')
      assert.equal(fixture.calls[0].init.method, 'POST')
      assert.deepEqual(JSON.parse(fixture.calls[0].init.body!), { ref: `emp-${'1'.repeat(40)}`, method: 'cash', note: 'Front desk' })
      assert.equal(fixture.status('Avery Morgan'), 'Paid in cash')
      assert.ok(fixture.page().includes('Payment recorded. This booking now shows Paid in cash.'))
      assert.equal(text(fixture.row('Avery Morgan')).includes('Cancel reservation'), cancel)
      if (!cancel) assert.ok(text(fixture.row('Avery Morgan')).includes('Only an administrator can cancel a paid booking.'))
    }
    const online = bookingsFixture({ email: 'staff@example.invalid', role: 'superadmin', enabled: true, initial: history([{ clientName: 'Avery Morgan', payment: 'stripe', paymentLabel: 'Payment link sent' }]) }, [response({ payment: 'stripe', paymentLabel: 'Paid online', outcome: 'paid-online' })])
    await online.click('Avery Morgan', 'Mark as paid')
    online.choose('Avery Morgan', 'zelle')
    await online.submit('Avery Morgan')
    assert.deepEqual(JSON.parse(online.calls[0].init.body!), { ref: `emp-${'1'.repeat(40)}`, method: 'zelle' })
    assert.equal(online.status('Avery Morgan'), 'Paid online')
    assert.ok(online.page().includes('The client already paid online, so this booking now shows Paid online. The method you chose was not recorded.'))
    assert.doesNotMatch(text(online.row('Avery Morgan')), /Cancel reservation|Mark as paid/)
  })

  test('a refused payment keeps the row unchanged and the panel open for a retry', async () => {
    const fixture = bookingsFixture({ email: 'staff@example.invalid', role: 'employee', enabled: true, initial: history([{ clientName: 'Avery Morgan' }]) }, [{ status: 409, body: { error: 'This booking was cancelled, so it cannot be marked as paid.' } }])
    await fixture.click('Avery Morgan', 'Mark as paid')
    fixture.choose('Avery Morgan', 'venmo')
    await fixture.submit('Avery Morgan')
    assert.ok(fixture.page().includes('This booking was cancelled, so it cannot be marked as paid.'))
    assert.equal(fixture.status('Avery Morgan'), 'Awaiting payment')
    assert.equal(fixture.button(fixture.row('Avery Morgan'), 'Confirm payment').props.disabled, false)
  })

  test('cancelling a staff-billed booking uses its own copy and never mentions a payment link', async () => {
    const fixture = bookingsFixture({ email: 'staff@example.invalid', role: 'employee', enabled: true, initial: history([{ clientName: 'Avery Morgan' }]) }, [{ status: 200, body: { ref: `emp-${'1'.repeat(40)}`, phase: 'cancelled', payment: 'external', paymentLabel: 'Cancelled' } }])
    await fixture.click('Avery Morgan', 'Cancel reservation')
    assert.ok(text(fixture.row('Avery Morgan')).includes('The studio will become available again. Nothing is sent to the client.'))
    await fixture.click('Avery Morgan', 'Confirm cancellation')
    assert.equal(fixture.calls[0].url, '/api/employee/bookings/cancel')
    assert.deepEqual(JSON.parse(fixture.calls[0].init.body!), { ref: `emp-${'1'.repeat(40)}` })
    assert.equal(fixture.status('Avery Morgan'), 'Cancelled')
    assert.ok(fixture.page().includes('Reservation cancelled. The room has been released.'))
    assert.doesNotMatch(fixture.page(), /payment request is void|payment link/i)
  })

  test('no action buttons appear while booking changes are switched off', () => {
    const fixture = bookingsFixture({ email: 'staff@example.invalid', role: 'superadmin', enabled: false, initial: history([{ clientName: 'Avery Morgan' }]) })
    assert.doesNotMatch(text(fixture.row('Avery Morgan')), /Mark as paid|Cancel reservation/)
    assert.ok(text(fixture.row('Avery Morgan')).includes('Booking changes are not activated.'))
  })
})

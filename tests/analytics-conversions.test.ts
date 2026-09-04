import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { analyticsBootstrap, analyticsLocation, analyticsReferrer, validMeasurementId } from '../lib/analytics-config'
import { createPurchaseTracker, isConfirmedTourResponse, purchaseEvent, recordSuccessfulLead } from '../lib/analytics-conversions'
import type { BookingConfirmation } from '../lib/booking/confirmation-state'

const confirmed: BookingConfirmation = {
  status: 'confirmed',
  purchase: { transactionId: 'vbs_' + 'a'.repeat(32), value: 640, currency: 'USD', items: [{ itemId: 'the-executive', quantity: 1 }] },
}

describe('conversion measurement boundaries', () => {
  test('only a verified, fulfilled purchase can produce revenue', () => {
    for (const status of ['missing', 'unverified', 'not_paid', 'expired', 'processing', 'attention', 'error'] as const) {
      assert.equal(purchaseEvent({ ...confirmed, status }), null)
    }
    assert.equal(purchaseEvent({ status: 'confirmed' }), null)
    assert.equal(purchaseEvent({ ...confirmed, purchase: { ...confirmed.purchase!, value: NaN } }), null)
    assert.equal(purchaseEvent({ ...confirmed, purchase: { ...confirmed.purchase!, transactionId: 'cs_test_do_not_send' } }), null)
    const event = purchaseEvent(confirmed)!
    assert.equal(event.value, 640)
    assert.deepEqual(event.items, [{ item_id: 'the-executive', quantity: 1 }])
    assert.doesNotMatch(JSON.stringify(event), /email|phone|date|token|secret|cs_test/)
  })

  test('polling, strict effect replay and revisits do not resend a recorded purchase', () => {
    const values = new Map<string, string>()
    const storage = { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => { values.set(key, value) } }
    const calls: string[] = []
    const emit = (event: string) => { calls.push(event); return true }
    const track = createPurchaseTracker()
    assert.equal(track(confirmed, emit, storage), true)
    assert.equal(track(confirmed, emit, storage), false)
    assert.equal(createPurchaseTracker()(confirmed, emit, storage), false)
    assert.deepEqual(calls, ['purchase'])
  })

  test('unavailable analytics does not mark revenue sent; storage failures do not block confirmation', () => {
    const track = createPurchaseTracker()
    const blocked = { getItem: () => { throw new Error('Storage denied') }, setItem: () => { throw new Error('Storage denied') } }
    assert.equal(track(confirmed, () => false, blocked), false)
    assert.equal(track(confirmed, () => { throw new Error('Tag blocked') }, blocked), false)
    assert.equal(track(confirmed, () => true, blocked), true)
    assert.equal(track(confirmed, () => true, blocked), false)
  })

  test('leads emit only after delivery succeeds and contain no submitted fields', () => {
    const calls: unknown[] = []
    const emit = (name: string, params: Record<string, unknown>) => { calls.push({ name, params }); return true }
    assert.equal(recordSuccessfulLead('project_inquiry', false, emit), false)
    assert.equal(recordSuccessfulLead('project_inquiry', true, emit), true)
    assert.equal(recordSuccessfulLead('tour', true, emit), true)
    assert.deepEqual(calls, [
      { name: 'generate_lead', params: { lead_type: 'project_inquiry' } },
      { name: 'generate_lead', params: { lead_type: 'tour' } },
    ])
  })

  test('analytics strips booking query values and external referrer paths', () => {
    assert.equal(analyticsLocation('https://www.vibeshackstudios.com/book/confirmation/?session_id=cs_test_private#token'), 'https://www.vibeshackstudios.com/book/confirmation/')
    assert.equal(analyticsReferrer('https://example.invalid/private/customer?email=private@example.invalid'), 'https://example.invalid')
    assert.equal(analyticsLocation('javascript:alert(1)'), '')
    assert.equal(analyticsReferrer('not-a-url'), '')
    assert.equal(validMeasurementId('G-PLACEHOLDER'), false)
    assert.equal(validMeasurementId("G-123456';alert(1)//"), false)
    assert.equal(analyticsBootstrap('not-a-measurement-id'), '')
    assert.match(analyticsBootstrap('G-ABC1234567'), /send_page_view:false/)
    assert.match(analyticsBootstrap('G-ABC1234567'), /window.location.origin\+window.location.pathname/)
  })

  test('tour acknowledgments require a real reservation receipt before lead tracking', () => {
    for (const response of [null, undefined, {}, { ok: true }, { ok: true, tour: {} }, { ok: false, tour: { date: '2026-09-12', time: '10:00-10:30 AM', studioName: 'The Executive' } }]) {
      assert.equal(isConfirmedTourResponse(response), false)
    }
    for (const created of [true, false]) {
      const response = { ok: true, created, tour: { date: '2026-09-12', time: '10:00-10:30 AM', studioName: 'The Executive' } }
      assert.equal(isConfirmedTourResponse(response), true)
      const events: string[] = []
      recordSuccessfulLead('tour', response.created, (event) => { events.push(event); return true })
      assert.equal(events.length, created ? 1 : 0)
    }
  })
})

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import PricingFaqs, { faqIdFromHash } from '../app/pricing/PricingFaqs'

const faqs = [
  { id: 'faq-booking', question: 'How do I book?', answer: 'Choose your studio, date, and time.' },
  { id: 'faq-parking', question: 'Is parking available?', answer: 'Street parking is available on Battery St.' },
] as const
const ids = faqs.map((faq) => faq.id)

describe('pricing FAQ deep links', () => {
  test('accepts only an existing answer ID, including a valid encoded ID', () => {
    assert.equal(faqIdFromHash('#faq-booking', ids), 'faq-booking')
    assert.equal(faqIdFromHash('#faq%2Dparking', ids), 'faq-parking')
    assert.equal(faqIdFromHash('#faq-booking-answer', ids), undefined)
    assert.equal(faqIdFromHash('#missing-answer', ids), undefined)
    assert.equal(faqIdFromHash('faq-booking', ids), undefined)
    assert.equal(faqIdFromHash('', ids), undefined)
  })

  test('ignores malformed encoding and selector-like fragments without throwing', () => {
    for (const hash of ['#%', '#%E0%A4%A', '#faq-booking,details', '#__proto__', '#constructor', '#<script>']) {
      assert.equal(faqIdFromHash(hash, ids), undefined)
    }
  })
})

describe('pricing FAQ accessible markup', () => {
  test('uses native collapsed disclosure controls with all answers in the rendered document', () => {
    const markup = renderToStaticMarkup(createElement(PricingFaqs, { faqs }))
    assert.equal((markup.match(/<details\b/g) || []).length, faqs.length)
    assert.equal((markup.match(/<summary\b/g) || []).length, faqs.length)
    assert.doesNotMatch(markup, /<details\b[^>]*\bopen(?:=|\s|>)/)
    for (const faq of faqs) {
      assert.ok(markup.includes(`id="${faq.id}"`))
      assert.ok(markup.includes(`aria-controls="${faq.id}-answer"`))
      assert.ok(markup.includes(`id="${faq.id}-answer"`))
      assert.ok(markup.includes(faq.question))
      assert.ok(markup.includes(faq.answer))
      assert.ok(markup.includes(`href="#${faq.id}"`))
      assert.ok(markup.includes(`aria-label="Link to answer: ${faq.question}"`))
    }
    assert.match(markup, /focus-visible:outline-2/)
    assert.match(markup, /aria-hidden="true"/)
  })

  test('renders text as text without treating answer copy as HTML', () => {
    const markup = renderToStaticMarkup(createElement(PricingFaqs, {
      faqs: [{ id: 'faq-text', question: 'A & B?', answer: '<strong>Plain text</strong>' }],
    }))
    assert.ok(markup.includes('A &amp; B?'))
    assert.ok(markup.includes('&lt;strong&gt;Plain text&lt;/strong&gt;'))
    assert.doesNotMatch(markup, /<strong>/)
  })
})

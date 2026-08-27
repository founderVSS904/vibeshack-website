import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import React from 'react'
import BookPage from '../app/book/page'
import BookPageClient from '../app/book/BookPageClient'
import { WING_SETUPS, EXECUTIVE_SETUPS } from '../lib/booking/studio-setups'

Object.assign(globalThis, { React })

describe('server-to-client booking selection handoff', () => {
  for (const { studioId, setup } of [
    ...WING_SETUPS.map((setup) => ({ studioId: 'the-wing', setup })),
    ...EXECUTIVE_SETUPS.map((setup) => ({ studioId: 'the-executive', setup })),
  ]) {
    test(`passes ${setup.id} without depending on window.location timing`, async () => {
      const page = await BookPage({ searchParams: Promise.resolve({ studio: studioId, setup: setup.id }) })
      assert.equal(page.props.initialStudioId, studioId)
      assert.equal(page.props.initialSetupId, setup.id)
      assert.equal(page.props.hasSetupRequest, true)
    })
  }

  test('does not guess a setup from missing, invalid, empty, or duplicated parameters', async () => {
    for (const studio of ['the-wing', 'the-executive']) {
      for (const setup of [undefined, '', 'invalid', ['one-black-chair'], ['one-black-chair', 'two-black-chairs'], ['three-black-armchairs'], ['one-office-chair-desk', 'three-black-armchairs']]) {
        const page = await BookPage({ searchParams: Promise.resolve({ studio, setup }) })
        assert.equal(page.props.initialStudioId, studio)
        assert.equal(page.props.initialSetupId, undefined)
        assert.equal(page.props.hasSetupRequest, setup !== undefined)
      }
    }
  })

  test('keeps generic booking unselected', async () => {
    const page = await BookPage({ searchParams: Promise.resolve({}) })
    assert.equal(page.props.initialStudioId, '')
    assert.equal(page.props.initialSetupId, undefined)
    assert.equal(page.props.hasSetupRequest, false)
  })

  test('never assigns Wing chairs to another studio', async () => {
    const page = await BookPage({ searchParams: Promise.resolve({ studio: 'the-executive', setup: 'two-black-chairs' }) })
    assert.equal(page.props.initialStudioId, 'the-executive')
    assert.equal(page.props.initialSetupId, undefined)
  })

  test('retains redirect handling for unknown or ambiguous studio queries', async () => {
    for (const studio of ['unknown-studio', ['the-wing', 'the-executive'], ['the-wing', 'the-wing']]) {
      await assert.rejects(BookPage({ searchParams: Promise.resolve({ studio, setup: 'one-black-chair' }) }), /NEXT_REDIRECT/)
    }
  })

  test('remounts for each new requested selection while distinguishing absent and invalid setup requests', () => {
    const keys = [
      ...WING_SETUPS.map((setup) => BookPageClient({ initialStudioId: 'the-wing', initialSetupId: setup.id, hasSetupRequest: true }).key),
      ...EXECUTIVE_SETUPS.map((setup) => BookPageClient({ initialStudioId: 'the-executive', initialSetupId: setup.id, hasSetupRequest: true }).key),
    ]
    assert.equal(new Set(keys).size, 7)
    assert.notEqual(
      BookPageClient({ initialStudioId: 'the-wing' }).key,
      BookPageClient({ initialStudioId: 'the-wing', hasSetupRequest: true }).key,
    )
  })
})

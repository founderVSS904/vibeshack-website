import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { getContactInquiry, getWorkProjectInquiryHref } from '../lib/contact/inquiry'
import { absoluteUrl } from '../lib/seo/site'
import { allWorkProjects } from '../lib/seo/workProjects'

describe('portfolio inquiry context', () => {
  test('every project links directly to an inquiry with its trusted reference', () => {
    for (const project of allWorkProjects) {
      const url = new URL(getWorkProjectInquiryHref(project.slug), 'https://example.test')
      assert.equal(url.pathname, '/contact/')
      assert.equal(url.hash, '#project-inquiry')
      assert.equal(url.searchParams.get('service'), 'portfolio-inquiry')
      assert.equal(url.searchParams.get('project'), project.slug)

      const inquiry = getContactInquiry(url.searchParams)
      assert.ok(inquiry)
      assert.ok(inquiry.message.includes(project.title))
      assert.ok(inquiry.message.includes(project.categoryLabel))
      assert.ok(inquiry.message.includes(absoluteUrl(`/our-work/${project.slug}/`)))
    }
  })

  test('music-video references choose the music-video project type', () => {
    const query = new URLSearchParams({ service: 'portfolio-inquiry', project: 'body-is-tea' })
    assert.equal(getContactInquiry(query)?.projectType, 'music-video')
  })

  test('unknown project slugs do not enter the link or message', () => {
    const untrusted = '<script>alert(1)</script>'
    const url = new URL(getWorkProjectInquiryHref(untrusted), 'https://example.test')
    assert.equal(url.searchParams.has('project'), false)
    assert.deepEqual(
      getContactInquiry(new URLSearchParams({ service: 'portfolio-inquiry', project: untrusted })),
      { projectType: 'other', message: '' }
    )
  })

  test('query text cannot replace trusted project titles or references', () => {
    const query = new URLSearchParams({
      service: 'portfolio-inquiry',
      project: 'the-buzzer',
      title: 'Untrusted title',
      message: '<img src=x onerror=alert(1)>',
      url: 'https://untrusted.example',
    })
    const inquiry = getContactInquiry(query)
    assert.ok(inquiry?.message.includes('The Buzzer'))
    assert.ok(!inquiry?.message.includes('Untrusted'))
    assert.ok(!inquiry?.message.includes('onerror'))
    assert.ok(!inquiry?.message.includes('untrusted.example'))
  })
})

describe('contact service and studio-finder context', () => {
  test('preserves existing service-prefill mappings without inventing a message', () => {
    const mappings = [
      ['branding', 'branding'],
      ['commercials', 'brand-commercial'],
      ['documentary', 'documentary'],
      ['editorials', 'editorial'],
      ['photo-services', 'photo-services'],
      ['video-production', 'video-interview'],
    ]
    for (const [service, projectType] of mappings) {
      assert.deepEqual(getContactInquiry(new URLSearchParams({ service })), { projectType, message: '' })
    }
  })

  test('ignores absent and unrecognized service values', () => {
    assert.equal(getContactInquiry(new URLSearchParams()), null)
    for (const service of ['unknown', '__proto__', 'constructor', '<script>']) {
      assert.equal(getContactInquiry(new URLSearchParams({ service })), null)
    }
  })

  test('uses the validated studio-finder inquiry when present', () => {
    const query = new URLSearchParams({
      from: 'studio-finder', service: 'podcast', on_camera: '5', crew: 'no',
    })
    const inquiry = getContactInquiry(query)
    assert.equal(inquiry?.projectType, 'podcast')
    assert.ok(inquiry?.message.includes('5 people will be on camera'))
    assert.ok(inquiry?.message.includes('production support from VibeShack'))
    assert.ok(inquiry?.message.includes('confirm the room capacity'))
  })

  test('does not copy invalid studio-finder values into the message', () => {
    const query = new URLSearchParams({
      from: 'studio-finder', service: 'podcast', on_camera: '<script>', crew: 'no',
    })
    assert.deepEqual(getContactInquiry(query), { projectType: 'podcast', message: '' })
  })
})

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { getContactInquiry, getWorkProjectInquiryHref } from '../lib/contact/inquiry'
import { absoluteUrl } from '../lib/seo/site'
import { allWorkProjects, shotAtVibeshack } from '../lib/seo/workProjects'

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
      assert.equal(
        inquiry.message,
        `I'd like to discuss a project similar to ${project.title} (${project.categoryLabel}).\nReference: ${absoluteUrl(`/our-work/${project.slug}/`)}`,
      )
    }
  })

  test('every studio-shot project retains its trusted title, client, and YouTube reference', () => {
    for (const project of shotAtVibeshack) {
      const url = new URL(getWorkProjectInquiryHref(project.slug), 'https://example.test')
      assert.equal(url.pathname, '/contact/')
      assert.equal(url.hash, '#project-inquiry')
      assert.deepEqual([...url.searchParams.entries()], [
        ['service', 'portfolio-inquiry'],
        ['project', project.slug],
      ])

      assert.deepEqual(getContactInquiry(url.searchParams), {
        projectType: project.collection === 'podcasts' ? 'podcast' : 'other',
        message: `I'd like to discuss a project similar to ${project.title} (${project.client}).\nReference: https://www.youtube.com/watch?v=${encodeURIComponent(project.youtubeId)}`,
      })
    }
  })

  test('music-video references choose the music-video project type', () => {
    const query = new URLSearchParams({ service: 'portfolio-inquiry', project: 'body-is-tea' })
    assert.equal(getContactInquiry(query)?.projectType, 'music-video')
  })

  test('unknown project slugs do not enter the link or message', () => {
    for (const untrusted of [
      '', 'unknown-project', '__proto__', 'constructor', 'toString',
      '<script>alert(1)</script>', '../../contact', 'https://untrusted.example',
      'pearl-sitdown-matt-cross&service=branding', 'BODY-IS-TEA',
    ]) {
      const url = new URL(getWorkProjectInquiryHref(untrusted), 'https://example.test')
      assert.equal(url.searchParams.has('project'), false)
      assert.deepEqual(
        getContactInquiry(new URLSearchParams({ service: 'portfolio-inquiry', project: untrusted })),
        { projectType: 'other', message: '' },
      )
    }
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

  test('query text cannot change a studio-shot project reference, client, or project type', () => {
    const query = new URLSearchParams({
      service: 'portfolio-inquiry',
      project: 'pearl-sitdown-matt-cross',
      title: 'Untrusted title',
      client: 'Untrusted client',
      message: '<img src=x onerror=alert(1)>',
      url: 'https://untrusted.example',
      youtubeId: 'untrusted-video',
      projectType: 'branding',
    })
    const inquiry = getContactInquiry(query)
    assert.deepEqual(inquiry, {
      projectType: 'podcast',
      message: "I'd like to discuss a project similar to The Sitdown: Matt Cross (Pearl).\nReference: https://www.youtube.com/watch?v=kwK2mkeZBEA",
    })
  })

  test('duplicate project parameters never replace the first validated selection', () => {
    const query = new URLSearchParams({ service: 'portfolio-inquiry', project: 'body-is-tea' })
    query.append('project', 'https://untrusted.example')
    assert.equal(getContactInquiry(query)?.projectType, 'music-video')
    assert.ok(!getContactInquiry(query)?.message.includes('untrusted.example'))

    const unknownFirst = new URLSearchParams({ service: 'portfolio-inquiry', project: 'unknown' })
    unknownFirst.append('project', 'body-is-tea')
    assert.deepEqual(getContactInquiry(unknownFirst), { projectType: 'other', message: '' })
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

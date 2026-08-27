import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { cinemaProjects } from '../lib/cinema/cinemaCatalog'
import { getContactInquiry, getWorkProjectInquiryHref } from '../lib/contact/inquiry'
import { allWorkProjects, shotAtVibeshack } from '../lib/seo/workProjects'

describe('cinema inquiry links', () => {
  test('every cinema selection receives a project-specific internal inquiry link', () => {
    assert.equal(cinemaProjects.length, allWorkProjects.length + shotAtVibeshack.length)
    for (const project of cinemaProjects) {
      assert.equal(project.inquiryHref, getWorkProjectInquiryHref(project.slug))
      const url = new URL(project.inquiryHref, 'https://example.test')
      assert.equal(url.origin, 'https://example.test')
      assert.equal(url.pathname, '/contact/')
      assert.equal(url.hash, '#project-inquiry')
      assert.equal(url.searchParams.get('project'), project.slug)
      assert.ok(getContactInquiry(url.searchParams)?.message.includes(project.title))
    }
  })

  test('inquiry links do not replace existing portfolio navigation or credits', () => {
    for (const project of allWorkProjects) {
      const cinemaProject = cinemaProjects.find((item) => item.slug === project.slug)
      assert.ok(cinemaProject)
      assert.equal(cinemaProject.href, `/our-work/${project.slug}/`)
      assert.equal(cinemaProject.external, false)
      assert.equal(cinemaProject.playback, 'hosted')
      assert.equal(cinemaProject.title, project.title)
      assert.equal(cinemaProject.creditLabel, project.creditLabel)
      assert.equal(cinemaProject.relationship, project.relationship)
      assert.equal(cinemaProject.summary, project.summary)
    }
  })

  test('inquiry links do not replace studio-shot watch links or playback metadata', () => {
    for (const project of shotAtVibeshack) {
      const cinemaProject = cinemaProjects.find((item) => item.slug === project.slug)
      assert.ok(cinemaProject)
      assert.equal(cinemaProject.href, `https://www.youtube.com/watch?v=${project.youtubeId}`)
      assert.equal(cinemaProject.external, true)
      assert.equal(cinemaProject.playback, project.playback)
      assert.equal(cinemaProject.collection, project.collection)
      assert.equal(cinemaProject.title, project.title)
      assert.equal(cinemaProject.creditLabel, project.creditLabel)
      assert.equal(cinemaProject.relationship, project.relationship)
      assert.equal(cinemaProject.summary, project.detail)
    }
  })
})

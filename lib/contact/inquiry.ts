import { getStudioFinderInquiry } from '../booking/studio-finder'
import { getStudioById } from '../booking/catalog'
import { getStudioSetup, getStudioSetups } from '../booking/studio-setups'
import { absoluteUrl } from '../seo/site'
import { getWorkProject, type WorkCategorySlug } from '../seo/workProjects'

type ContactInquiry = {
  projectType: string
  message: string
}

const projectTypeByService = new Map([
  ['branding', 'branding'],
  ['commercials', 'brand-commercial'],
  ['documentary', 'documentary'],
  ['editorials', 'editorial'],
  ['photo-services', 'photo-services'],
  ['portfolio-inquiry', 'other'],
  ['video-production', 'video-interview'],
  ['podcast', 'podcast'],
  ['green-screen', 'green-screen'],
  ['studio-finder', 'other'],
  ['studio-setup', 'podcast'],
])

const projectTypeByWorkCategory: Record<WorkCategorySlug, string> = {
  'music-videos': 'music-video',
  films: 'other',
  series: 'video-interview',
  sports: 'video-interview',
  events: 'other',
}

export function getWorkProjectInquiryHref(slug: string): string {
  const project = getWorkProject(slug)
  const searchParams = new URLSearchParams({ service: 'portfolio-inquiry' })
  if (project) searchParams.set('project', project.slug)
  return `/contact/?${searchParams.toString()}#project-inquiry`
}

export function getContactInquiry(searchParams: URLSearchParams): ContactInquiry | null {
  const studioInquiry = getStudioFinderInquiry(searchParams)
  if (studioInquiry) return studioInquiry

  const service = searchParams.get('service')
  const projectType = service ? projectTypeByService.get(service) : undefined
  if (!projectType) return null

  if (service === 'studio-setup') {
    const studio = getStudioById(searchParams.get('studio') || '')
    if (studio && getStudioSetups(studio.id).length) {
      const setup = getStudioSetup(studio.id, searchParams.get('setup'))
      return {
        projectType,
        message: `I'd like to discuss a custom setup for ${studio.name}.${setup ? `\nThe photo option I'm considering is: ${setup.label}.` : ''}\n\nHere's what I have in mind:`,
      }
    }
    return { projectType, message: "I'd like to discuss a custom studio setup." }
  }

  if (service === 'portfolio-inquiry') {
    const project = getWorkProject(searchParams.get('project') || '')
    if (project) {
      return {
        projectType: projectTypeByWorkCategory[project.category],
        message: `I'd like to discuss a project similar to ${project.title} (${project.categoryLabel}).\nReference: ${absoluteUrl(`/our-work/${project.slug}/`)}`,
      }
    }
  }

  return { projectType, message: '' }
}

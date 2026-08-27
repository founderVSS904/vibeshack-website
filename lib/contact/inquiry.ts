import { getStudioFinderInquiry } from '../booking/studio-finder'
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

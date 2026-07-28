import { getStudioById, STUDIOS } from './catalog'

export const SHARED_STAGE_GROUP_ID = 'shared-stage'
export const PODCAST_PRODUCTION_GROUP_ID = 'podcast-production'

const SHARED_STAGE_STUDIO_IDS = new Set([
  'canvas-rental',
  'canvas-podcast',
  'parlor',
  'horizon',
  'the-wing',
  'green-screen',
])

function studioGroupId(studioId: string | undefined) {
  return `studio:${studioId || 'all'}`
}

export function studioResourceGroups(studioId: string | undefined) {
  const groups = new Set<string>([studioGroupId(studioId)])

  if (studioId && SHARED_STAGE_STUDIO_IDS.has(studioId)) {
    groups.add(SHARED_STAGE_GROUP_ID)
  }

  if (studioId && getStudioById(studioId)?.type === 'podcast') {
    groups.add(PODCAST_PRODUCTION_GROUP_ID)
  }

  return Array.from(groups)
}

export function studiosShareResources(firstStudioId: string | undefined, secondStudioId: string | undefined) {
  const secondStudioGroups = new Set(studioResourceGroups(secondStudioId))
  return studioResourceGroups(firstStudioId).some((groupId) => secondStudioGroups.has(groupId))
}

export function studioIdsThatAffectAvailability(studioId: string | undefined) {
  if (!studioId) return []

  return STUDIOS
    .filter((studio) => studiosShareResources(studioId, studio.id))
    .map((studio) => studio.id)
}

export function primaryStudioResourceGroup(studioId: string | undefined) {
  const groups = studioResourceGroups(studioId)

  if (groups.includes(SHARED_STAGE_GROUP_ID)) return SHARED_STAGE_GROUP_ID
  if (groups.includes(PODCAST_PRODUCTION_GROUP_ID)) return PODCAST_PRODUCTION_GROUP_ID
  return groups[0]
}

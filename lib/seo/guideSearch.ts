import type { StudioGuide } from './studioGuides'

export const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()

// The words visitors actually arrive with, mapped to the guide they mean. The
// guides say "photography" and "cyclorama"; people type "photoshoot", "headshots",
// "chroma key", "cyc". Without this the search only finds our vocabulary, not
// theirs, which is how "photoshoot" used to return nothing.
export const ALIASES: Record<string, string> = {
  'podcast-studio-prep':
    'podcast podcasts podcasting pod interview interviews episode episodes show shows mic microphone mics audio sound guest guests host hosts cohost talk talking conversation recording record sit down two person',
  'green-screen-studio-prep':
    'green screen greenscreen chroma chromakey key keyed keying vfx composite compositing effects background backdrop replacement virtual explainer weather ad commercial',
  'photography-studio-prep':
    'photo photos photograph photography photographer photoshoot shoot shooting shoots headshot headshots portrait portraits beauty model modeling fashion lookbook editorial ecommerce product products still stills image images picture pictures campaign brand branding',
  'white-cyc-studio-prep':
    'cyc cyclorama seamless infinity wall white background clean plain minimal product products apparel clothing dance dancing movement motion jump full body',
  'best-studio-for-your-shoot':
    'best which choose choosing pick picking room rooms space spaces studio studios where compare comparing comparison decide deciding not sure unsure help recommend recommendation option options right fit',
}

// Ranks guides by how well they answer the query. Scores rather than filters:
// with five guides, dropping to zero results is never the useful answer.
export function rankGuides(guides: StudioGuide[], query: string) {
  const tokens = normalize(query).split(' ').filter(Boolean)
  if (!tokens.length) return guides

  return guides
    .map((guide) => {
      const alias = ALIASES[guide.slug] ?? ''
      const aliasWords = new Set(alias.split(' '))
      const title = normalize([guide.title, guide.shortTitle].join(' '))
      const blob = `${title} ${normalize([guide.keyword, guide.intro, guide.description].join(' '))} ${alias}`
      // Spaces stripped so a typed compound finds a spaced phrase: photoshoot -> photo shoot.
      const squashed = blob.replace(/ /g, '')

      let score = 0
      for (const token of tokens) {
        if (aliasWords.has(token)) score += 10
        else if (new RegExp(`\\b${token}\\b`).test(title)) score += 8
        else if (new RegExp(`\\b${token}`).test(blob)) score += 4
        else if (token.length >= 4 && squashed.includes(token)) score += 3
      }
      return { guide, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.guide)
}

// ─── Icons ────────────────────────────────────────────────────────────────────

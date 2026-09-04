import { parseEmailList } from '../server/sanitize'

const CHUNK_SIZE = 500
const MAX_CHUNKS = 6

export function buildTeamEmailMetadata(emails: string[]): Record<string, string> {
  // Normalization removes control characters, so newline is an unambiguous
  // separator. Unlike truncated JSON this preserves ten full-length addresses.
  const value = parseEmailList(emails, 10).join('\n')
  const chunks: string[] = []
  for (let offset = 0; offset < value.length;) {
    let end = Math.min(offset + CHUNK_SIZE, value.length)
    const last = value.charCodeAt(end - 1)
    if (end < value.length && last >= 0xd800 && last <= 0xdbff) end--
    chunks.push(value.slice(offset, end))
    offset = end
  }
  if (chunks.length > MAX_CHUNKS) throw new Error('Team email metadata exceeds capacity')
  return {
    teamEmailChunks: String(chunks.length),
    ...Object.fromEntries(chunks.map((chunk, index) => [`teamEmail_${index}`, chunk])),
  }
}

export function parseTeamEmailMetadata(metadata: Record<string, string>): string[] {
  if (metadata.teamEmailChunks === undefined) {
    // Old sessions remain readable, including the historical truncated payload.
    try { return parseEmailList(JSON.parse(metadata.teamEmails || '[]'), 10) } catch { return [] }
  }
  const count = Number(metadata.teamEmailChunks)
  if (!Number.isInteger(count) || count < 0 || count > MAX_CHUNKS || String(count) !== metadata.teamEmailChunks) {
    throw new Error('Invalid team email metadata')
  }
  const chunks = Array.from({ length: count }, (_, index) => metadata[`teamEmail_${index}`])
  if (chunks.some((chunk) => typeof chunk !== 'string' || chunk.length > CHUNK_SIZE || !chunk)) {
    throw new Error('Incomplete team email metadata')
  }
  const raw = chunks.join('')
  if (!raw) return []
  const entries = raw.split('\n')
  const normalized = parseEmailList(entries, 10)
  if (normalized.length !== entries.length || normalized.some((email, index) => email !== entries[index])) {
    throw new Error('Invalid team email metadata')
  }
  return normalized
}

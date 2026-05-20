export function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function stripControlChars(value: unknown, maxLength = 500) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function isEmail(value: unknown) {
  const email = stripControlChars(value, 254)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function parseEmailList(value: unknown, max = 10) {
  if (!Array.isArray(value)) return []
  const unique = new Set<string>()
  for (const item of value) {
    const email = stripControlChars(item, 254).toLowerCase()
    if (isEmail(email)) unique.add(email)
    if (unique.size >= max) break
  }
  return Array.from(unique)
}

import { escapeHtml } from '../server/sanitize'
import { bookingSetupDescription, getStudioSetup } from './studio-setups'

export function bookingSetupEmailHtml(studioId: string, setupId: unknown, color = '#cbd5e1') {
  const description = bookingSetupDescription(studioId, setupId)
  return description
    ? `<p style="color:${escapeHtml(color)};font-size:14px;line-height:1.65;margin:8px 0 0;"><strong>${escapeHtml(description)}</strong></p>`
    : ''
}

export function bookingSetupCalendarFields(studioId: string, setupId: unknown) {
  return {
    description: bookingSetupDescription(studioId, setupId),
    privateProperties: { setupId: getStudioSetup(studioId, setupId)?.id || '' },
  }
}

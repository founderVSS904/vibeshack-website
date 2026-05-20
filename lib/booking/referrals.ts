export interface ReferralPartner {
  id: string
  displayName: string
  commissionRate: number
}

export interface ReferralInfo {
  source: string
  partnerName: string
  commissionRate: number
  commissionCents: number
}

export const REFERRAL_COOKIE = 'vibeshack_referral'
export const REFERRAL_STORAGE_KEY = 'vibeshackReferral'
export const REFERRAL_MAX_AGE_SECONDS = 60 * 60 * 24 * 180

export const REFERRAL_PARTNERS: Record<string, ReferralPartner> = {
  'patriot-black': {
    id: 'patriot-black',
    displayName: 'Patriot Black',
    commissionRate: 0.2,
  },
}

export function normalizeReferralSource(value: unknown) {
  if (typeof value !== 'string') return ''
  return value
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 80)
}

export function getReferralPartner(value: unknown) {
  const source = normalizeReferralSource(value)
  return source ? REFERRAL_PARTNERS[source] || null : null
}

export function buildReferralInfo(value: unknown, amountCents: number): ReferralInfo | null {
  const partner = getReferralPartner(value)
  if (!partner) return null

  return {
    source: partner.id,
    partnerName: partner.displayName,
    commissionRate: partner.commissionRate,
    commissionCents: Math.round(Math.max(0, amountCents) * partner.commissionRate),
  }
}

export function formatMoneyFromCents(cents: number) {
  return `$${(Math.max(0, cents) / 100).toFixed(2)}`
}

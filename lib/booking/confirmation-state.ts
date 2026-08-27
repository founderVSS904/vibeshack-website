export const CONFIRMATION_STATUSES = ['missing', 'unverified', 'not_paid', 'expired', 'processing', 'confirmed', 'attention', 'error'] as const
export type BookingConfirmationStatus = typeof CONFIRMATION_STATUSES[number]

export interface BookingConfirmation {
  status: BookingConfirmationStatus
  emailSent?: boolean
  summary?: {
    totalPaid: number
    sessions: Array<{
      studioName: string
      date: string
      time: string
      duration: string
      setupDescription?: string
      addOns: Array<{ name: string; hourlyRate: number; amount: number }>
    }>
  }
}

export const PENDING_CHECKOUT_STORAGE_KEY = 'vbs_pending_checkout_v1'

export function pendingConfirmationToken(raw: string | null, sessionId: string) {
  try {
    const pending = JSON.parse(raw || '')
    return pending?.sessionId === sessionId
      && typeof pending.managementToken === 'string'
      && pending.managementToken.length <= 256
      ? pending.managementToken as string
      : ''
  } catch {
    return ''
  }
}

export function clearConfirmedPendingCheckout(
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  sessionId: string,
  status: BookingConfirmationStatus,
) {
  if (status !== 'confirmed') return
  try {
    const pending = JSON.parse(storage.getItem(PENDING_CHECKOUT_STORAGE_KEY) || '')
    if (pending?.sessionId === sessionId) storage.removeItem(PENDING_CHECKOUT_STORAGE_KEY)
  } catch {}
}

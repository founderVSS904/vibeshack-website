import type { BookingConfirmation } from './booking/confirmation-state'

type EventSender = (name: string, params: Record<string, unknown>) => boolean
type ConversionStorage = Pick<Storage, 'getItem' | 'setItem'>
const STORAGE_KEY = 'vbs_purchase_events_v1'

export function purchaseEvent(confirmation: BookingConfirmation) {
  const data = confirmation.purchase
  if (confirmation.status !== 'confirmed' || !data
    || !/^vbs_[a-f0-9]{32}$/.test(data.transactionId)
    || data.currency !== 'USD' || !Number.isFinite(data.value) || data.value <= 0
    || !Array.isArray(data.items) || !data.items.length || data.items.length > 20
    || data.items.some((item) => !item || !/^[a-z0-9-]+$/.test(item.itemId) || item.quantity !== 1)) return null
  return {
    transaction_id: data.transactionId,
    value: data.value,
    currency: data.currency,
    items: data.items.map((item) => ({ item_id: item.itemId, quantity: item.quantity })),
  }
}

// Local suppression complements GA's transaction_id deduplication. A browser
// storage failure must never interrupt confirmation or suppress an unsent event.
export function createPurchaseTracker() {
  const sent = new Set<string>()
  return (confirmation: BookingConfirmation, emit: EventSender, storage?: ConversionStorage) => {
    const event = purchaseEvent(confirmation)
    if (!event) return false
    let stored: string[] = []
    try {
      const parsed: unknown = JSON.parse(storage?.getItem(STORAGE_KEY) || '[]')
      if (Array.isArray(parsed)) stored = parsed.filter((id): id is string => typeof id === 'string' && /^vbs_[a-f0-9]{32}$/.test(id)).slice(-100)
    } catch {}
    if (sent.has(event.transaction_id) || stored.includes(event.transaction_id)) return false
    try { if (!emit('purchase', event)) return false } catch { return false }
    sent.add(event.transaction_id)
    try { storage?.setItem(STORAGE_KEY, JSON.stringify([...stored, event.transaction_id].slice(-100))) } catch {}
    return true
  }
}

export function recordSuccessfulLead(type: 'project_inquiry' | 'tour', delivered: boolean, emit: EventSender) {
  if (!delivered) return false
  try { return emit('generate_lead', { lead_type: type }) } catch { return false }
}

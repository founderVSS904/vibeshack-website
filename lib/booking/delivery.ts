import { randomUUID } from 'node:crypto'

export interface MessageDelivery {
  state: 'sending' | 'sent' | 'failed' | 'uncertain'
  attempt: string
  startedAt: string
  completedAt?: string
}
export interface DeliveryRecord { version: 1; messages: Record<string, MessageDelivery> }
export interface DeliverySnapshot { etag: string; record: DeliveryRecord }
export interface DeliveryStore {
  read: () => Promise<DeliverySnapshot | null>
  create: () => Promise<void>
  save: (snapshot: DeliverySnapshot, record: DeliveryRecord) => Promise<void>
}
export const DELIVERY_LEASE_MS = 15 * 60_000

function statusOf(error: unknown) {
  return Number((error as { code?: unknown; response?: { status?: unknown } })?.response?.status
    || (error as { code?: unknown })?.code)
}

async function changeRecord<T>(store: DeliveryStore, change: (record: DeliveryRecord) => { record?: DeliveryRecord; value: T }) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const snapshot = await store.read()
    if (!snapshot) {
      try { await store.create() } catch (error) { if (statusOf(error) !== 409) throw error }
      continue
    }
    const result = change(structuredClone(snapshot.record))
    if (!result.record) return result.value
    try {
      await store.save(snapshot, result.record)
      return result.value
    } catch (error) { if (statusOf(error) !== 412) throw error }
  }
  throw new Error('Message delivery state changed too quickly')
}

function definitelyNotDelivered(error: unknown) {
  const value = error as { responseCode?: number; code?: string; command?: string }
  // A provider rejection or failure before the message body was sent is safe
  // to retry. A timeout/disconnect after DATA may already have delivered mail.
  return Number(value?.responseCode) >= 400
    || value?.code === 'EDNS'
    || value?.code === 'EAUTH'
    // Nodemailer uses CONN for generic socket errors, even after DATA. It is
    // not evidence that delivery had not begun, so never infer safety from it.
    || /^(EHLO|HELO|STARTTLS|AUTH(?: |$)|MAIL(?: FROM)?$|RCPT(?: TO)?$)/i.test(value?.command || '')
}

export async function deliverMessage(
  store: DeliveryStore,
  key: string,
  send: (messageId: string) => Promise<void>,
  options: { now?: () => Date; identity: string } ,
) {
  const now = options.now || (() => new Date())
  const attempt = randomUUID()
  const claimed = await changeRecord(store, (record) => {
    const current = record.messages[key]
    if (current?.state === 'sent') return { value: 'sent' as const }
    if (current?.state === 'uncertain') return { value: 'uncertain' as const }
    if (current?.state === 'sending') {
      if (now().getTime() - Date.parse(current.startedAt) < DELIVERY_LEASE_MS) return { value: 'busy' as const }
      record.messages[key] = { ...current, state: 'uncertain' }
      return { record, value: 'uncertain' as const }
    }
    record.messages[key] = { state: 'sending', attempt, startedAt: now().toISOString() }
    return { record, value: 'claimed' as const }
  })
  if (claimed === 'sent') return
  if (claimed !== 'claimed') throw new Error(`Message delivery ${claimed}: ${key}`)

  const finish = async (state: MessageDelivery['state']) => changeRecord(store, (record) => {
    const current = record.messages[key]
    if (current?.attempt !== attempt) throw new Error('Message delivery ownership changed')
    record.messages[key] = { ...current, state, completedAt: now().toISOString() }
    return { record, value: undefined }
  })
  try {
    await send(`<${options.identity}.${key}@vibeshackstudios.com>`)
  } catch (error) {
    await finish(definitelyNotDelivered(error) ? 'failed' : 'uncertain')
    throw error
  }
  // If this write fails, the durable sending state prevents another worker
  // from blindly resending. After the lease, uncertainty requires inspection.
  await finish('sent')
}

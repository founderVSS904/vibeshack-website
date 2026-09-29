import { EmployeeBookingError, withEmployeeBooking, type EmployeeBooking, type EmployeeStore } from './booking'
import { calendarHistorySource, historyDays, historyPageSize, historyRecord, type EmployeeHistorySource } from './history'
import { sendEmployeeBookingNotification, sendEmployeeUnpaidReminder } from './notification'
import { employeeStore } from './providers'

const settleMs = 10 * 60_000
const reminderWindowMs = 48 * 3600_000
const notifyWindowMs = 7 * 86_400_000
export type EmployeeFollowupDependencies = {
  source: EmployeeHistorySource
  store(ref: string): Promise<EmployeeStore>
  notifyPaid(record: EmployeeBooking): Promise<void>
  remindUnpaid(record: EmployeeBooking): Promise<void>
}
export type EmployeeFollowupOptions = { dryRun?: boolean; now?: Date; maxPages?: number; maxSends?: number; budgetMs?: number }
export type EmployeeFollowupSummary = { dryRun: boolean; scanned: number; due: number; notified: number; reminded: number; skipped: number; failed: number; deferred: number }
export type EmployeeFollowupReport = { status: 'disabled' } | { status: 'failed' } | ({ status: 'ok' } & EmployeeFollowupSummary)
const defaults: EmployeeFollowupDependencies = { source: calendarHistorySource, store: employeeStore, notifyPaid: sendEmployeeBookingNotification, remindUnpaid: sendEmployeeUnpaidReminder }

// Staff are only told. Nothing is cancelled, released, or sent to a client here.
function followup(record: EmployeeBooking, now: number) {
  if (record.phase === 'paid' && !record.internalNotifiedAt && (record.paidAt ?? record.createdAt) > now - notifyWindowMs) return 'notify' as const
  const start = Date.parse(record.cart[0].slots[0])
  if (record.phase === 'ready' && !record.unpaidReminderAt && start > now && start - now <= reminderWindowMs) return 'remind' as const
  return null
}

// Bounded provider pages and bounded sends per run. Each action rechecks the
// record under the booking lease, and the delivery ledger prevents repeats.
export async function runEmployeeFollowups(options: EmployeeFollowupOptions = {}, dependencies = defaults): Promise<EmployeeFollowupSummary> {
  const started = Date.now()
  const now = (options.now || new Date()).getTime()
  const summary = { dryRun: Boolean(options.dryRun), scanned: 0, due: 0, notified: 0, reminded: 0, skipped: 0, failed: 0, deferred: 0 }
  const updatedSince = new Date(now - historyDays * 86_400_000).toISOString()
  let cursor: string | undefined
  let attempts = 0
  for (let page = 0; page < (options.maxPages ?? 10); page++) {
    const result = await dependencies.source({ cursor, updatedSince, maxResults: historyPageSize })
    for (const event of result.events.slice(0, historyPageSize)) {
      const record = historyRecord(event)
      if (!record) continue
      summary.scanned++
      // Leave records alone while they are being written or were just changed.
      if (!(Date.parse(event.updated || '') <= now - settleMs) || (record.leaseUntil || 0) > now) continue
      const action = followup(record, now)
      if (!action) continue
      summary.due++
      if (summary.dryRun) continue
      if (attempts >= (options.maxSends ?? 20) || Date.now() - started > (options.budgetMs ?? 40_000)) { summary.deferred++; continue }
      attempts++
      try {
        const done = await withEmployeeBooking(await dependencies.store(record.ref), async (current, save) => {
          if (followup(current, now) !== action) return false
          if (action === 'notify') { await dependencies.notifyPaid(current); current.internalNotifiedAt = Date.now() }
          else { await dependencies.remindUnpaid(current); current.unpaidReminderAt = Date.now() }
          await save(current)
          return true
        })
        if (!done) summary.skipped++
        else if (action === 'notify') summary.notified++
        else summary.reminded++
      } catch (error) {
        if (error instanceof EmployeeBookingError && error.status === 409) { summary.skipped++; continue }
        summary.failed++
        console.error('Employee booking follow-up failed:', { bookingRef: record.ref, action })
      }
    }
    cursor = result.nextCursor || undefined
    if (!cursor) break
  }
  return summary
}

// Runs after the public reminders and never throws, so staff follow-ups cannot
// change the public reminder response or its status.
export async function employeeFollowupsForCron(dryRun: boolean, run: (options: EmployeeFollowupOptions) => Promise<EmployeeFollowupSummary> = runEmployeeFollowups): Promise<EmployeeFollowupReport> {
  if (process.env.EMPLOYEE_BOOKING_ENABLED !== '1') return { status: 'disabled' }
  try { return { status: 'ok', ...await run({ dryRun }) } }
  catch { console.error('Employee booking follow-ups failed'); return { status: 'failed' } }
}

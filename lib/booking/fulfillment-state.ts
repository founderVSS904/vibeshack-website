export function bookingNeedsAttention(metadata: Record<string, string>) {
  // The alert marker also protects sessions fulfilled before attention had
  // its own independent state. An email is not the source of booking truth.
  return Boolean(metadata.vbsBookingAttentionAt || metadata.vbsDoubleBookingAlertedAt)
}

export async function fulfillBookingCalendar(
  needsAttention: boolean,
  dependencies: {
    markAttention: () => Promise<void>
    insertEvents: () => Promise<void>
    markCalendarSynced: () => Promise<void>
  },
) {
  // Fail closed: if recording a known conflict fails, do not publish a
  // calendar-synced marker that could be mistaken for a confirmed booking.
  if (needsAttention) await dependencies.markAttention()
  await dependencies.insertEvents()
  await dependencies.markCalendarSynced()
}

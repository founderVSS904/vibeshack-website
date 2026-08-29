export const EDITABLE_BOOKING_STEPS = ['room', 'datetime', 'extras', 'review'] as const

export type EditableBookingStep = (typeof EDITABLE_BOOKING_STEPS)[number]
export type BookingStep = EditableBookingStep | 'payment'

interface BookingStepReadiness {
  step: BookingStep
  hasStudio: boolean
  hasValidTime: boolean
  setupReady: boolean
  submitting: boolean
}

export function stepAfterPrimarySelection(step: 'room' | 'datetime') {
  return step === 'room' ? 'datetime' : 'extras'
}

export function bookingStepIsReady({
  step,
  hasStudio,
  hasValidTime,
  setupReady,
  submitting,
}: BookingStepReadiness) {
  if (step === 'room') return hasStudio
  if (step === 'datetime') return hasValidTime
  if (step === 'extras') return setupReady
  return !submitting && setupReady
}

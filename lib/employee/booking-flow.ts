export type EmployeeBookingStep = 1 | 2 | 3

export const EMPLOYEE_BOOKING_STEPS = [
  { number: 1, label: 'Session', title: 'Choose the session.', description: 'Pick a studio, date, and time. All times Pacific.' },
  { number: 2, label: 'Setup & extras', title: 'Set up the session.', description: 'Choose the arrangement and any extras for your client.' },
  { number: 3, label: 'Client & review', title: 'Client details & review.', description: 'Add the client, choose how they pay, and reserve the studio.' },
] as const

export function canContinueEmployeeStep(step: EmployeeBookingStep, sessionReady: boolean, extrasReady: boolean, locked: boolean) {
  if (locked || !sessionReady) return false
  return step === 1 || (step === 2 && extrasReady)
}

export function canVisitEmployeeStep(current: EmployeeBookingStep, target: EmployeeBookingStep, reached: EmployeeBookingStep, sessionReady: boolean, extrasReady: boolean, locked: boolean) {
  if (locked || target > reached) return false
  // Always let staff go back to repair a selection if availability changes.
  if (target <= current) return true
  return sessionReady && (target === 2 || extrasReady)
}

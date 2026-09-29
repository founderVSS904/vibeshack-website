import type { EmployeeBooking } from './booking'
import { employeeCreatorLabel } from './identity'

// Client-safe payment vocabulary. No provider, Node, or server imports here, so
// the booking UI may import the choices and labels directly.
export const EMPLOYEE_PAYMENT_MODES = ['stripe', 'external', 'prepaid', 'none'] as const
export const EMPLOYEE_RECORDED_METHODS = ['cash', 'zelle', 'venmo', 'card', 'bank', 'check', 'other'] as const
export type EmployeePaymentMode = typeof EMPLOYEE_PAYMENT_MODES[number]
export type EmployeeRecordedMethod = typeof EMPLOYEE_RECORDED_METHODS[number]
export type EmployeePaidMethod = 'stripe' | EmployeeRecordedMethod | 'none'
export const EMPLOYEE_PAID_METHODS: readonly EmployeePaidMethod[] = ['stripe', ...EMPLOYEE_RECORDED_METHODS, 'none']
export const EMPLOYEE_METHOD_NAMES: Record<EmployeeRecordedMethod, string> = { cash: 'Cash', zelle: 'Zelle', venmo: 'Venmo', card: 'Card', bank: 'Bank transfer', check: 'Check', other: 'Other' }
const paidLabels: Record<EmployeePaidMethod, string> = {
  stripe: 'Paid online', cash: 'Paid in cash', zelle: 'Paid by Zelle', venmo: 'Paid by Venmo', card: 'Paid by card',
  bank: 'Paid by bank transfer', check: 'Paid by check', other: 'Paid (other)', none: 'No charge',
}

// Stored records come from Calendar text. Unknown payment values fail closed.
export function employeePaymentValid(record: Pick<EmployeeBooking, 'payment' | 'paidMethod' | 'paidNote' | 'paidBy'>) {
  return (record.payment === undefined || EMPLOYEE_PAYMENT_MODES.includes(record.payment)) && (record.paidMethod === undefined || EMPLOYEE_PAID_METHODS.includes(record.paidMethod))
    && (record.paidNote === undefined || typeof record.paidNote === 'string') && (record.paidBy === undefined || typeof record.paidBy === 'string')
}
// Records made before payment choices existed have no mode and used Stripe.
export function employeePaymentMode(record: Pick<EmployeeBooking, 'payment'>): EmployeePaymentMode {
  return record.payment || 'stripe'
}
// One label for Calendar, the internal email, and the Bookings list.
export function employeePaymentLabel(record: Pick<EmployeeBooking, 'phase' | 'payment' | 'paidMethod'>) {
  const mode = employeePaymentMode(record)
  if (record.phase === 'cancelled') return 'Cancelled'
  if (record.phase === 'paid') return mode === 'none' ? paidLabels.none : paidLabels[record.paidMethod || (mode === 'stripe' ? 'stripe' : 'other')] || paidLabels.other
  if (record.phase === 'ready') return mode === 'external' ? 'Awaiting payment' : 'Payment link sent'
  return 'In progress'
}
// Internal rows only (Calendar and staff email). Never add these to client payloads.
export function employeePaymentDetails(record: Pick<EmployeeBooking, 'phase' | 'payment' | 'paidMethod' | 'paidNote' | 'paidBy' | 'employee' | 'employeeName'>): Array<[string, string]> {
  return [
    ['Payment', employeePaymentLabel(record)],
    ...(record.paidNote ? [['Payment note', record.paidNote] as [string, string]] : []),
    ...(record.paidBy && record.paidBy !== employeeCreatorLabel(record) ? [['Marked paid by', record.paidBy] as [string, string]] : []),
  ]
}

import { stripControlChars } from '../server/sanitize'

export type EmployeeIdentity = { email: string; name?: string }

export function employeeDisplayName(value: unknown) {
  return typeof value === 'string' ? stripControlChars(value, 120) || undefined : undefined
}

export function employeeCreatorLabel(record: { employee: string; employeeName?: string }) {
  const name = employeeDisplayName(record.employeeName)
  return name ? `${name} (${record.employee})` : record.employee
}

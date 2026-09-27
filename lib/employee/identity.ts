import { stripControlChars } from '../server/sanitize'

export type EmployeeIdentity = { id?: string; email: string; name?: string }

export function employeeUserId(value: unknown) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value.toLowerCase() : undefined
}

export function employeeDisplayName(value: unknown) {
  return typeof value === 'string' ? stripControlChars(value, 120) || undefined : undefined
}

export function employeeCreatorLabel(record: { employee: string; employeeName?: string }) {
  const name = employeeDisplayName(record.employeeName)
  return name ? `${name} (${record.employee})` : record.employee
}

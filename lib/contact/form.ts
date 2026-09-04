import { isEmail, stripControlChars } from '../server/sanitize'

export const CONTACT_REQUIRED_FIELDS = ['name', 'email', 'message'] as const
export type ContactField = typeof CONTACT_REQUIRED_FIELDS[number]
export type ContactFieldErrors = Partial<Record<ContactField, string>>

export type ContactBrief = {
  name: string
  email: string
  phone: string
  project_type: string
  preferred_date: string
  message: string
  company: string
  startedAt: number
}

export function contactFieldError(field: ContactField, value: string): string | undefined {
  if (field === 'name' && !stripControlChars(value, 120)) return 'Enter your name.'
  if (field === 'message' && !stripControlChars(value, 2500)) return 'Tell us a little about your project.'
  if (field === 'email') {
    if (!stripControlChars(value, 254)) return 'Enter your email address so we can reply.'
    if (!isEmail(value)) return 'Enter a valid email address, such as you@example.com.'
  }
  return undefined
}

export function validateContactBrief(brief: Pick<ContactBrief, ContactField>): ContactFieldErrors {
  const errors: ContactFieldErrors = {}
  for (const field of CONTACT_REQUIRED_FIELDS) {
    const error = contactFieldError(field, brief[field])
    if (error) errors[field] = error
  }
  return errors
}

export function firstInvalidContactField(errors: ContactFieldErrors): ContactField | undefined {
  return CONTACT_REQUIRED_FIELDS.find((field) => Boolean(errors[field]))
}

export type ContactDeliveryResult =
  | { ok: true; delivered: boolean }
  | { ok: false; kind: 'network' | 'server' | 'retry' | 'rate-limit'; message: string }

export async function sendContactBrief(brief: ContactBrief, request: typeof fetch): Promise<ContactDeliveryResult> {
  try {
    const response = await request('/api/contact/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brief),
    })
    if (response.ok) {
      const result = await response.json().catch(() => null)
      return { ok: true, delivered: result?.ok === true && result?.delivered === true && !brief.company.trim() }
    }
    if (response.status === 429) {
      return { ok: false, kind: 'rate-limit', message: 'Too many attempts. Please wait a few minutes before trying again.' }
    }
    if (response.status === 400) {
      return { ok: false, kind: 'retry', message: 'Your message could not be sent yet. Please check your details, wait a few seconds, and try again.' }
    }
    if (response.status === 413) {
      return { ok: false, kind: 'server', message: 'Your message is too large to send. Please shorten it and try again.' }
    }
    return { ok: false, kind: 'server', message: 'The form could not send your message. Your details are still here, so you can try again.' }
  } catch {
    return { ok: false, kind: 'network', message: 'We could not confirm delivery. Check your connection before trying again.' }
  }
}

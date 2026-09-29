'use client'
import Image from 'next/image'
import React, { type ReactNode, type SelectHTMLAttributes } from 'react'
import type { StudioSetup } from '@/lib/booking/studio-setups'
import { EMPLOYEE_BOOKING_STEPS, type EmployeeBookingStep } from '@/lib/employee/booking-flow'
import { EMPLOYEE_METHOD_NAMES, EMPLOYEE_RECORDED_METHODS, employeePaymentChoice, employeePaymentChoices, type EmployeePaymentDraft, type EmployeePaymentMode, type EmployeeRecordedMethod } from '@/lib/employee/payment'

type IconName = 'calendar' | 'clock' | 'duration' | 'setup' | 'rate' | 'plus' | 'chevron'

export function EmployeeBookingIcon({ name }: { name: IconName }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name === 'calendar' && <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 11h18" /></>}
    {name === 'clock' && <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
    {name === 'duration' && <><circle cx="12" cy="14" r="7" /><path d="M12 10v4l2 2M9 3h6M12 3v4M18 7l2-2" /></>}
    {name === 'setup' && <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M10 10v10" /></>}
    {name === 'rate' && <><path d="M12 3v18M17 7.5c0-2-2-3-5-3s-5 1.5-5 3.5 2 3 5 4 5 2 5 4-2 3.5-5 3.5-5-1-5-3" /></>}
    {name === 'plus' && <><circle cx="12" cy="12" r="9" /><path d="M8 12h8M12 8v8" /></>}
    {name === 'chevron' && <path d="m7 10 5 5 5-5" />}
  </svg>
}

export function EmployeeSelect({ variant = 'default', children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { variant?: 'default' | 'studio' }) {
  return <span className={`employee-select employee-select--${variant}`}>
    <select {...props}>{children}</select>
    <EmployeeBookingIcon name="chevron" />
  </span>
}

type SessionDetailsProps = {
  date: string
  time: string
  duration: string
  setup: string
  rate: string
  addOns: { id: string; name: string; price: string }[]
}

export function EmployeeSessionDetails({ date, time, duration, setup, rate, addOns }: SessionDetailsProps) {
  const rows: { label: string; value: string; icon: IconName }[] = [
    { label: 'Date', value: date, icon: 'calendar' },
    { label: 'Time', value: time, icon: 'clock' },
    { label: 'Duration', value: duration, icon: 'duration' },
    { label: 'Setup', value: setup, icon: 'setup' },
    { label: 'Studio rate', value: rate, icon: 'rate' },
  ]
  return <dl className="employee-session-details">
    {rows.map(({ label, value, icon }) => <div key={label}><dt><EmployeeBookingIcon name={icon} /><span>{label}</span></dt><dd>{value}</dd></div>)}
    {addOns.map((addOn) => <div key={addOn.id}><dt><EmployeeBookingIcon name="plus" /><span>{addOn.name}</span></dt><dd>{addOn.price}</dd></div>)}
  </dl>
}

export function EmployeeSetupPicker({ options, value, onChange }: { options: readonly StudioSetup[]; value: string; onChange: (id: string) => void }) {
  return <fieldset className="employee-setup-picker"><legend>Studio setup</legend>
    <div className="employee-setup-options">{options.map((option) => <label key={option.id} className={`employee-setup-option${value === option.id ? ' is-selected' : ''}`}>
      <input type="radio" name="studio-setup" value={option.id} checked={value === option.id} onChange={() => onChange(option.id)} required />
      <span className="employee-setup-photo"><Image src={option.image} alt="" fill sizes="(max-width: 600px) 85vw, (max-width: 900px) 42vw, 350px" /></span>
      <span className="employee-setup-caption"><strong>{option.label}</strong><span>{option.chairs} {option.chairs === 1 ? 'seat' : 'seats'}</span></span>
      <span className="employee-setup-check" aria-hidden="true">{value === option.id ? '✓' : ''}</span>
    </label>)}</div>
  </fieldset>
}

export function EmployeeStepPanel({ step, active, children }: { step: EmployeeBookingStep; active: EmployeeBookingStep; children?: ReactNode }) {
  // Inactive fields must not participate in tab order or native form validation.
  // Draft values live in the parent, so unmounting a step does not discard them.
  return step === active ? <>{children}</> : null
}

export function EmployeeBookingProgress({ step, canVisit, onVisit }: { step: EmployeeBookingStep; canVisit: (target: EmployeeBookingStep) => boolean; onVisit: (target: EmployeeBookingStep) => void }) {
  return <nav className="employee-progress" aria-label="Booking steps"><ol>{EMPLOYEE_BOOKING_STEPS.map((item) => <li key={item.number}>
    <button type="button" aria-current={step === item.number ? 'step' : undefined} disabled={!canVisit(item.number)} onClick={() => onVisit(item.number)}>
      <span className="employee-step-number" aria-hidden="true">{item.number < step ? '✓' : item.number}</span><span>{item.label}</span>
    </button>
  </li>)}</ol></nav>
}

export function EmployeeSessionRecap({ studio, date, time, duration, onEdit, locked }: { studio: string; date: string; time: string; duration: string; onEdit: () => void; locked: boolean }) {
  return <section className="employee-session-recap" aria-label="Selected session"><div><strong>{studio}</strong><p>{date} · {time} <span>· {duration}</span></p></div><button type="button" onClick={onEdit} disabled={locked}>Change session</button></section>
}

// Native radios keep arrow-key selection. No charge is offered to superadmins only.
export function EmployeePaymentPicker({ draft, superadmin, onChange }: { draft: EmployeePaymentDraft; superadmin: boolean; onChange: (draft: EmployeePaymentDraft) => void }) {
  return <section className="employee-card employee-details employee-payment" aria-labelledby="employee-payment-heading"><div className="employee-section-heading"><h2 id="employee-payment-heading">Payment</h2><span>How will this session be paid?</span></div>
    <div className="employee-payment-options" role="radiogroup" aria-labelledby="employee-payment-heading">{employeePaymentChoices(superadmin).map((choice) => <label key={choice.mode} className={`employee-payment-option${draft.mode === choice.mode ? ' is-selected' : ''}`}>
      <input type="radio" name="payment-mode" value={choice.mode} checked={draft.mode === choice.mode} onChange={() => onChange({ ...draft, mode: choice.mode })} />
      <span><strong>{choice.title}</strong><small>{choice.description}</small></span>
    </label>)}</div>
    {draft.mode === 'prepaid' && <div className="employee-payment-record">
      <label>How they paid<EmployeeSelect aria-label="How they paid" required value={draft.method} onChange={(event) => onChange({ ...draft, method: event.target.value as EmployeeRecordedMethod })}><option value="" disabled>Choose a method</option>{EMPLOYEE_RECORDED_METHODS.map((method) => <option key={method} value={method}>{EMPLOYEE_METHOD_NAMES[method]}</option>)}</EmployeeSelect></label>
      <label>Payment note <span className="employee-optional">Optional</span><input value={draft.note} onChange={(event) => onChange({ ...draft, note: event.target.value })} placeholder="Zelle confirmation 1234" maxLength={200} /></label>
    </div>}
  </section>
}

export function EmployeeBookingSubmit({ preview, busy, attempted, disabled, help, mode = 'stripe' }: { preview: boolean; busy: boolean; attempted: boolean; disabled: boolean; help: string; mode?: EmployeePaymentMode }) {
  return <><button className="employee-primary" type="submit" disabled={disabled} aria-describedby="employee-next-action">{busy ? 'Creating reservation…' : attempted ? 'Retry this booking' : preview ? 'Create preview booking' : employeePaymentChoice(mode).action}<span aria-hidden="true">→</span></button><p className="employee-summary-help" id="employee-next-action" role="status">{help}</p></>
}

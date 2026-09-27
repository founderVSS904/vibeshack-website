'use client'
import Image from 'next/image'
import React, { useEffect, useState, type SelectHTMLAttributes } from 'react'
import type { StudioSetup } from '@/lib/booking/studio-setups'

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
      <span className="employee-setup-photo"><Image src={option.image} alt="" fill sizes="(max-width: 480px) 80px, (max-width: 1100px) 30vw, 220px" /></span>
      <span className="employee-setup-caption"><strong>{option.label}</strong><span>{option.chairs} {option.chairs === 1 ? 'seat' : 'seats'}</span></span>
      <span className="employee-setup-check" aria-hidden="true">{value === option.id ? '✓' : ''}</span>
    </label>)}</div>
  </fieldset>
}

export function EmployeeMobileReview({ total, detail, onReview }: { total: string; detail: string; onReview: () => void }) {
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  useEffect(() => {
    const update = () => {
      const target = document.activeElement
      const editing = target instanceof HTMLElement && target.matches('input:not([type=radio]):not([type=checkbox]), textarea, select, [contenteditable=true]')
      const reducedViewport = Boolean(window.visualViewport && window.visualViewport.height < window.innerHeight * .75)
      setKeyboardOpen(editing || reducedViewport)
    }
    document.addEventListener('focusin', update)
    document.addEventListener('focusout', update)
    window.visualViewport?.addEventListener('resize', update)
    return () => {
      document.removeEventListener('focusin', update)
      document.removeEventListener('focusout', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])
  return <div className={`employee-mobile-review${keyboardOpen ? ' is-hidden' : ''}`} role="region" aria-label="Booking review shortcut">
    <div><span>Session total</span><strong>{total}</strong><small>{detail}</small></div>
    <button type="button" className="employee-primary" onClick={onReview}>Review booking <span aria-hidden="true">↑</span></button>
  </div>
}

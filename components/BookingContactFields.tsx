import React from 'react'

interface BookingContactFieldsProps {
  name: string
  email: string
  phone: string
  disabled: boolean
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
}

export default function BookingContactFields(props: BookingContactFieldsProps) {
  return (
    <section aria-labelledby="contact-details-heading" className="rounded-[20px] border border-white/10 bg-[#141416] p-5 sm:p-6">
      <h3 id="contact-details-heading" className="brand-sans text-xl font-semibold leading-snug !tracking-[-0.025em] text-white">Your details</h3>
      <p id="contact-details-help" className="mt-2 text-sm leading-relaxed text-zinc-400">We&apos;ll send your booking confirmation here.</p>
      <div className="mt-6 space-y-5">
        {[
          { id: 'detail-full-name', label: 'Full name', name: 'name', type: 'text', autoComplete: 'name', value: props.name, onChange: props.onNameChange, placeholder: 'Your full name', required: true },
          { id: 'detail-email', label: 'Email', name: 'email', type: 'email', autoComplete: 'email', value: props.email, onChange: props.onEmailChange, placeholder: 'you@example.com', required: true },
          { id: 'detail-phone', label: 'Phone', name: 'phone', type: 'tel', autoComplete: 'tel', value: props.phone, onChange: props.onPhoneChange, placeholder: '+1 (415) 000-0000', required: false },
        ].map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="mb-2 flex items-baseline justify-between gap-3 text-sm font-medium text-zinc-200">
              {field.label}{!field.required && <span className="text-xs font-normal text-zinc-400">Optional</span>}
            </label>
            <input
              id={field.id}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              inputMode={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
              autoCapitalize={field.type === 'text' ? 'words' : 'none'}
              spellCheck={false}
              aria-describedby={field.type === 'email' ? 'contact-details-help' : undefined}
              required={field.required}
              disabled={props.disabled}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              placeholder={field.placeholder}
              className="min-h-[52px] w-full rounded-xl border border-white/20 bg-[#0b0b0d] px-4 py-3 text-base text-white placeholder:text-zinc-500 motion-safe:transition-colors hover:border-white/35 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

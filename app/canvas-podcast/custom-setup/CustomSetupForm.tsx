'use client'

import { FormEvent, useState } from 'react'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function CustomSetupForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [validationError, setValidationError] = useState('')
  const [startedAt] = useState(() => Date.now())

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)
    const get = (name: string) => String(data.get(name) || '').trim()

    if (!get('name') || !get('email') || !get('message')) {
      setValidationError('Add your name, email, and a note about your setup so we can reply.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(get('email'))) {
      setValidationError('That email does not look right. Check it and try again.')
      return
    }
    setValidationError('')
    setStatus('sending')

    const message = [
      'Canvas Podcast custom setup request',
      '',
      `Project / episode type: ${get('episode_type') || 'Not provided'}`,
      `Preferred date: ${get('preferred_date') || 'Not provided'}`,
      `Number of people on camera: ${get('people_count') || 'Not provided'}`,
      `Estimated recording length: ${get('recording_length') || 'Not provided'}`,
      `Backdrop / lighting mood: ${get('mood') || 'Not provided'}`,
      `Furniture / set direction: ${get('set_direction') || 'Not provided'}`,
      '',
      'Creative notes:',
      get('message'),
    ].join('\n')

    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: get('name'),
          email: get('email'),
          phone: get('phone'),
          project_type: 'Canvas Podcast Custom Setup',
          preferred_date: get('preferred_date'),
          message,
          company: get('company'),
          startedAt,
        }),
      })

      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) form.reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-lg border border-brand-red/30 bg-brand-red/10 p-10 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-red/20">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M8 16l6 6 10-12" stroke="#E50000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mb-3 text-3xl font-black text-white">Request sent.</h2>
        <p className="text-gray-400">We'll review the setup details and follow up with the best plan for the room.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input type="hidden" name="startedAt" value={startedAt} />

      {status === 'error' && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 p-4">
          <p className="text-sm text-red-400">
            Something went wrong. Email us at{' '}
            <a href="mailto:founder@vibeshackstudios.com" className="underline hover:text-white transition-colors">
              founder@vibeshackstudios.com
            </a>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <Field label="Your Name" name="name" required placeholder="First and last name" />
        <Field label="Email Address" name="email" type="email" required placeholder="you@example.com" />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <Field label="Phone" name="phone" type="tel" placeholder="Best callback number" />
        <Field label="Preferred Date" name="preferred_date" type="date" />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <Select label="Project Type" name="episode_type" options={[
          'Podcast episode',
          'Interview series',
          'Founder content',
          'Brand campaign',
          'Product launch',
          'YouTube show',
          'Other',
        ]} />
        <Select label="People On Camera" name="people_count" options={['1', '2', '3', '4+', 'Not sure yet']} />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <Select label="Recording Length" name="recording_length" options={['1 hour', '2 hours', 'Half day', 'Full day', 'Not sure yet']} />
        <Field label="Backdrop / Lighting Mood" name="mood" placeholder="Warm, moody, brand colors, etc." />
      </div>

      <Field label="Furniture / Set Direction" name="set_direction" placeholder="Table setup, lounge chairs, LED look, props, brand colors…" />

      <div>
        <label htmlFor="message" className="mb-3 block text-xs font-bold uppercase tracking-widest text-gray-500">
          Creative Notes
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us what you want the set to feel like, what you're filming, and any must-haves."
          className="input-clean resize-none"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
        />
      </div>

      {validationError && <p role="alert" className="text-sm text-red-500">{validationError}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending Request…' : 'Send Custom Setup Request'}
        {status !== 'sending' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
  placeholder = '',
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-3 block text-xs font-bold uppercase tracking-widest text-gray-500">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="input-clean"
        style={type === 'date' ? { colorScheme: 'dark' } : undefined}
      />
    </div>
  )
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <div>
      <label htmlFor={name} className="mb-3 block text-xs font-bold uppercase tracking-widest text-gray-500">
        {label}
      </label>
      <select id={name} name={name} className="input-clean appearance-none bg-transparent" style={{ backgroundImage: 'none' }}>
        <option value="" style={{ background: '#111' }}>Select one</option>
        {options.map((option) => (
          <option key={option} value={option} style={{ background: '#111' }}>{option}</option>
        ))}
      </select>
    </div>
  )
}

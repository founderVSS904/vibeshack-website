'use client'

import { useEffect, useState, FormEvent } from 'react'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [validationError, setValidationError] = useState('')
  const [startedAt] = useState(() => Date.now())
  const [projectType, setProjectType] = useState('')

  useEffect(() => {
    const service = new URLSearchParams(window.location.search).get('service')
    const serviceMap: Record<string, string> = {
      branding: 'branding',
      commercials: 'brand-commercial',
      documentary: 'documentary',
      editorials: 'editorial',
      'photo-services': 'photo-services',
      'portfolio-inquiry': 'other',
      'video-production': 'video-interview',
    }

    if (service && serviceMap[service]) {
      setProjectType(serviceMap[service])
    }
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement)?.value || '',
      project_type: (form.elements.namedItem('project_type') as HTMLSelectElement).value,
      preferred_date: (form.elements.namedItem('preferred_date') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      company: (form.elements.namedItem('company') as HTMLInputElement).value,
      startedAt,
    }

    if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
      setValidationError('Add your name, email, and a short message so we can reply.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(data.email.trim())) {
      setValidationError('That email does not look right. Check it and try again.')
      return
    }
    setValidationError('')
    setStatus('sending')

    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-brand-red/30 bg-brand-red/10">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 16l6 6 10-12" stroke="#E50000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mb-3 text-3xl font-black text-white">Message sent.</h3>
        <p className="text-white/50">We will be in touch the same day.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input type="hidden" name="startedAt" value={startedAt} />
      {status === 'error' && (
        <div className="col-span-full rounded-xl border border-red-800 bg-red-950/40 p-4">
          <p className="text-sm text-red-300">
            Something went wrong. Email us at{' '}
            <a href="mailto:founder@vibeshackstudios.com" className="underline hover:text-white transition-colors">
              founder@vibeshackstudios.com
            </a>
          </p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-2.5 block font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
          Your Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="First and last name"
          className="contact-input"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2.5 block font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="you@example.com"
          className="contact-input"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-2.5 block font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
          Phone <span className="text-white/25">/ Optional</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          autoComplete="tel"
          placeholder="(555) 555-5555"
          className="contact-input"
        />
      </div>

      <div>
        <label htmlFor="preferred_date" className="mb-2.5 block font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
          Preferred Date <span className="text-white/25">/ Optional</span>
        </label>
        <input
          type="date"
          id="preferred_date"
          name="preferred_date"
          className="contact-input"
          style={{ colorScheme: 'dark' }}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="project_type" className="mb-2.5 block font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
          Project Type
        </label>
        <div className="relative">
          <select
            id="project_type"
            name="project_type"
            value={projectType}
            onChange={(event) => setProjectType(event.target.value)}
            className="contact-input appearance-none pr-12"
          >
            <option value="">Select your project type</option>
            <option value="podcast">Podcast / Video Podcast</option>
            <option value="brand-commercial">Commercial / Product Launch / Ad</option>
            <option value="documentary">Documentary / Micro Documentary</option>
            <option value="editorial">Editorial / Fashion / Beauty / Campaign</option>
            <option value="branding">Branding / Creative Direction</option>
            <option value="green-screen">Green Screen / VFX</option>
            <option value="photo-services">Photo Services / Headshots / Portraits</option>
            <option value="video-interview">Video / Interview / Corporate</option>
            <option value="music-video">Music Video</option>
            <option value="content-creation">Social Media Content</option>
            <option value="tour">Studio Tour</option>
            <option value="other">Other</option>
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/35" aria-hidden="true">↓</span>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="message" className="mb-2.5 block font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="What are you making? Include the goal, timeline, and deliverables."
          className="contact-input min-h-36 resize-none"
        />
      </div>

      {validationError && <p role="alert" className="col-span-full text-sm text-red-400">{validationError}</p>}

      <div className="col-span-full flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-brand-red px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'sending' && (
            <svg className="mr-2 inline h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          )}
          {status === 'sending' ? 'Sending…' : 'Send project brief'}
          {status !== 'sending' && (
            <span className="transition-transform group-hover:translate-x-1">→</span>
          )}
        </button>
        <p className="text-center text-xs text-white/35 sm:text-right">Same-day response, seven days a week.</p>
      </div>
    </form>
  )
}

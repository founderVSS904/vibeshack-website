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
      <div className="py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-red/20 flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 16l6 6 10-12" stroke="#E50000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-white font-black text-2xl mb-3">Message Sent.</h3>
        <p className="text-gray-400">We respond same day.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input type="hidden" name="startedAt" value={startedAt} />
      {status === 'error' && (
        <div className="p-4 border border-red-800 bg-red-950/40 rounded-lg">
          <p className="text-red-400 text-sm">
            Something went wrong. Email us at{' '}
            <a href="mailto:founder@vibeshackstudios.com" className="underline hover:text-white transition-colors">
              founder@vibeshackstudios.com
            </a>
          </p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-500 mb-3">
          Your Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="First and last name"
          className="input-clean"
        />
      </div>

      <div>
        <label htmlFor="email" className="block font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-500 mb-3">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="you@example.com"
          className="input-clean"
        />
      </div>

      <div>
        <label htmlFor="project_type" className="block font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-500 mb-3">
          Project Type
        </label>
        <select
          id="project_type"
          name="project_type"
          value={projectType}
          onChange={(event) => setProjectType(event.target.value)}
          className="input-clean appearance-none bg-transparent"
          style={{ backgroundImage: 'none' }}
        >
          <option value="" style={{ background: '#111' }}>Select your project type</option>
          <option value="podcast" style={{ background: '#111' }}>Podcast / Video Podcast</option>
          <option value="brand-commercial" style={{ background: '#111' }}>Commercial / Product Launch / Ad</option>
          <option value="documentary" style={{ background: '#111' }}>Documentary / Micro Documentary</option>
          <option value="editorial" style={{ background: '#111' }}>Editorial / Fashion / Beauty / Campaign</option>
          <option value="branding" style={{ background: '#111' }}>Branding / Creative Direction</option>
          <option value="green-screen" style={{ background: '#111' }}>Green Screen / VFX</option>
          <option value="photo-services" style={{ background: '#111' }}>Photo Services / Headshots / Portraits</option>
          <option value="video-interview" style={{ background: '#111' }}>Video / Interview / Corporate</option>
          <option value="music-video" style={{ background: '#111' }}>Music Video</option>
          <option value="content-creation" style={{ background: '#111' }}>Social Media Content</option>
          <option value="tour" style={{ background: '#111' }}>Studio Tour</option>
          <option value="other" style={{ background: '#111' }}>Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="preferred_date" className="block font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-500 mb-3">
          Preferred Date
        </label>
        <input
          type="date"
          id="preferred_date"
          name="preferred_date"
          className="input-clean"
          style={{ colorScheme: 'dark' }}
        />
      </div>

      <div>
        <label htmlFor="message" className="block font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-500 mb-3">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Tell us about your project…"
          className="input-clean resize-none"
        />
      </div>

      {validationError && <p role="alert" className="text-sm text-red-500">{validationError}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="group inline-flex items-center gap-2.5 rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' && (
          <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        )}
        {status === 'sending' ? 'Sending…' : 'Send Message'}
        {status !== 'sending' && (
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        )}
      </button>
      <p className="text-gray-600 text-xs">We respond same day.</p>
    </form>
  )
}

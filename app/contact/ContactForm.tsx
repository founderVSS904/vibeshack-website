'use client'

import { useState, FormEvent } from 'react'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement)?.value || '',
      project_type: (form.elements.namedItem('project_type') as HTMLSelectElement).value,
      preferred_date: (form.elements.namedItem('preferred_date') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch('/api/contact', {
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
        <p className="text-gray-400">We will be in touch within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
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
        <label htmlFor="name" className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">
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
        <label htmlFor="email" className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">
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
        <label htmlFor="project_type" className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">
          Project Type
        </label>
        <select
          id="project_type"
          name="project_type"
          className="input-clean appearance-none bg-transparent"
          style={{ backgroundImage: 'none' }}
        >
          <option value="" style={{ background: '#111' }}>Select your project type</option>
          <option value="podcast" style={{ background: '#111' }}>Podcast / Video Podcast</option>
          <option value="green-screen" style={{ background: '#111' }}>Green Screen / VFX</option>
          <option value="photography" style={{ background: '#111' }}>Photography / Lookbook</option>
          <option value="video-interview" style={{ background: '#111' }}>Video / Interview / Corporate</option>
          <option value="music-video" style={{ background: '#111' }}>Music Video</option>
          <option value="brand-commercial" style={{ background: '#111' }}>Brand Commercial</option>
          <option value="content-creation" style={{ background: '#111' }}>Social Media Content</option>
          <option value="tour" style={{ background: '#111' }}>Studio Tour</option>
          <option value="other" style={{ background: '#111' }}>Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="preferred_date" className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">
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
        <label htmlFor="message" className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Tell us about your project..."
          className="input-clean resize-none"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' && (
          <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        )}
        {status === 'sending' ? 'Sending…' : 'Send Message'}
        {status !== 'sending' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <p className="text-gray-600 text-xs">We respond within 2 business hours.</p>
    </form>
  )
}

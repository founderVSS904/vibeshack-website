'use client'

import React, { useEffect, useRef, useState, type FormEvent } from 'react'
import { getContactInquiry } from '@/lib/contact/inquiry'
import { trackSuccessfulLead } from '@/lib/analytics'
import { contactFieldError, firstInvalidContactField, sendContactBrief, validateContactBrief, type ContactField, type ContactFieldErrors } from '@/lib/contact/form'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({})
  const [deliveryError, setDeliveryError] = useState('')
  const [startedAt] = useState(() => Date.now())
  const [projectType, setProjectType] = useState('')
  const [message, setMessage] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const validationAttempted = useRef(false)
  const focusInvalidAfterRender = useRef(false)
  const sendingRef = useRef(false)

  useEffect(() => {
    const inquiry = getContactInquiry(new URLSearchParams(window.location.search))
    if (!inquiry) return

    setProjectType((current) => current || inquiry.projectType)
    setMessage((current) => current || inquiry.message)
  }, [])

  useEffect(() => {
    if (!focusInvalidAfterRender.current) return
    focusInvalidAfterRender.current = false
    const field = firstInvalidContactField(fieldErrors)
    if (!field) return
    const input = formRef.current?.elements.namedItem(field)
    if (input instanceof HTMLElement) input.focus()
  }, [fieldErrors])

  useEffect(() => {
    if (status === 'success') successRef.current?.focus()
  }, [status])

  function updateFieldValidation(field: ContactField, value: string) {
    if (!validationAttempted.current) return
    setFieldErrors((current) => {
      const next = { ...current }
      const error = contactFieldError(field, value)
      if (error) next[field] = error
      else delete next[field]
      return next
    })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sendingRef.current) return

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

    validationAttempted.current = true
    const errors = validateContactBrief(data)
    focusInvalidAfterRender.current = Boolean(firstInvalidContactField(errors))
    setFieldErrors(errors)
    setDeliveryError('')
    if (firstInvalidContactField(errors)) {
      setStatus('idle')
      return
    }
    sendingRef.current = true
    setStatus('sending')

    const result = await sendContactBrief(data, fetch)
    sendingRef.current = false
    if (result.ok) {
      if (result.delivered) trackSuccessfulLead('project_inquiry')
      setStatus('success')
    } else {
      setDeliveryError(result.message)
      setStatus('error')
    }
  }

  return (
    <>
      <div role="status" aria-live="polite" aria-atomic="true">
        {status === 'success' ? (
          <div ref={successRef} tabIndex={-1} className="border-l-2 border-brand-red py-4 pl-6 focus:outline-none">
            <h3 className="text-3xl font-black text-white">Message sent.</h3>
            <p className="mt-3 text-white/50">We will be in touch the same day.</p>
          </div>
        ) : (
          <span className="sr-only">{status === 'sending' ? 'Sending your message.' : ''}</span>
        )}
      </div>
      {status !== 'success' && (
        <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={status === 'sending'} className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
          <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <input type="hidden" name="startedAt" value={startedAt} />
          {status === 'error' && (
            <div role="alert" className="col-span-full border-l-2 border-brand-red py-2 pl-4">
              <p className="text-sm text-red-300">
                {deliveryError} You can also email us at{' '}
                <a href="mailto:founder@vibeshackstudios.com" className="underline hover:text-white transition-colors">
                  founder@vibeshackstudios.com
                </a>
              </p>
            </div>
          )}
          {firstInvalidContactField(fieldErrors) && (
            <p role="alert" className="col-span-full text-sm text-red-300">Check the highlighted fields and try again.</p>
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
              disabled={status === 'sending'}
              autoComplete="name"
              maxLength={120}
              aria-invalid={fieldErrors.name !== undefined}
              aria-describedby="contact-name-error"
              onBlur={(event) => updateFieldValidation('name', event.currentTarget.value)}
              onChange={(event) => updateFieldValidation('name', event.currentTarget.value)}
              placeholder="First and last name"
              className="contact-input aria-[invalid=true]:border-red-400 focus-visible:ring-1 focus-visible:ring-brand-red"
            />
            <p id="contact-name-error" className="mt-2 text-sm text-red-300 empty:hidden">{fieldErrors.name}</p>
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
              disabled={status === 'sending'}
              autoComplete="email"
              maxLength={254}
              aria-invalid={fieldErrors.email !== undefined}
              aria-describedby="contact-email-error"
              onBlur={(event) => updateFieldValidation('email', event.currentTarget.value)}
              onChange={(event) => updateFieldValidation('email', event.currentTarget.value)}
              placeholder="you@example.com"
              className="contact-input aria-[invalid=true]:border-red-400 focus-visible:ring-1 focus-visible:ring-brand-red"
            />
            <p id="contact-email-error" className="mt-2 text-sm text-red-300 empty:hidden">{fieldErrors.email}</p>
          </div>

          <div>
            <label htmlFor="phone" className="mb-2.5 block font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
              Phone <span className="text-white/25">/ Optional</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              disabled={status === 'sending'}
              autoComplete="tel"
              maxLength={40}
              placeholder="(555) 555-5555"
              className="contact-input focus-visible:ring-1 focus-visible:ring-brand-red"
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
              disabled={status === 'sending'}
              className="contact-input focus-visible:ring-1 focus-visible:ring-brand-red"
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
                disabled={status === 'sending'}
                value={projectType}
                onChange={(event) => setProjectType(event.target.value)}
                className="contact-input appearance-none pr-12 focus-visible:ring-1 focus-visible:ring-brand-red"
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
              value={message}
              onChange={(event) => {
                setMessage(event.currentTarget.value)
                updateFieldValidation('message', event.currentTarget.value)
              }}
              onBlur={(event) => updateFieldValidation('message', event.currentTarget.value)}
              required
              disabled={status === 'sending'}
              maxLength={2500}
              aria-invalid={fieldErrors.message !== undefined}
              aria-describedby="contact-message-error"
              rows={5}
              placeholder="What are you shooting, when is it happening, and what do you need from us?"
              className="contact-input min-h-36 resize-none aria-[invalid=true]:border-red-400 focus-visible:ring-1 focus-visible:ring-brand-red"
            />
            <p id="contact-message-error" className="mt-2 text-sm text-red-300 empty:hidden">{fieldErrors.message}</p>
          </div>

          <div className="col-span-full flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="group inline-flex items-center justify-center gap-2.5 rounded-md bg-brand-red px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'sending' && (
                <svg aria-hidden="true" className="mr-2 inline h-4 w-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              )}
              {status === 'sending' ? 'Sending…' : 'Send project brief'}
              {status !== 'sending' && (
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none">→</span>
              )}
            </button>
            <p className="text-center text-xs text-white/35 sm:text-right">Same-day response, seven days a week.</p>
          </div>
        </form>
      )}
    </>
  )
}

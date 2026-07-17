'use client'

import { useEffect, useMemo, useState } from 'react'
import { STUDIOS } from '@/lib/booking/catalog'

type TourSlot = { time: string; label: string; available: boolean }

function padDatePart(value: number) {
  return String(value).padStart(2, '0')
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${padDatePart(d.getMonth() + 1)}-${padDatePart(d.getDate())}`
}

function getNext45Days() {
  return Array.from({ length: 45 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index + 1)
    return date
  })
}

function fmtDateFull(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default function TourBookingForm() {
  const [studioId, setStudioId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [slots, setSlots] = useState<TourSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [availabilityVerified, setAvailabilityVerified] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [company, setCompany] = useState('')
  const [startedAt] = useState(() => Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState<{ date: string; time: string; studioName: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const studio = params.get('studio') || ''
    if (STUDIOS.some((candidate) => candidate.id === studio)) {
      setStudioId(studio)
    }
  }, [])

  const days = useMemo(() => getNext45Days(), [])
  const daysByMonth = useMemo(() => {
    const groups: Record<string, Date[]> = {}
    days.forEach((date) => {
      const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      if (!groups[key]) groups[key] = []
      groups[key].push(date)
    })
    return groups
  }, [days])
  const months = Object.entries(daysByMonth)
  const [monthOffset, setMonthOffset] = useState(0)
  const [monthLabel, monthDays] = months[Math.min(monthOffset, months.length - 1)] || ['', []]

  async function selectDate(date: string) {
    setSelectedDate(date)
    setSelectedSlot('')
    setSlots([])
    setSlotsLoading(true)
    setAvailabilityVerified(true)
    setError('')

    try {
      const response = await fetch(`/api/tour-availability/?date=${date}`)
      const data = await response.json()
      setSlots(data.slots || [])
      setAvailabilityVerified(data.verified !== false)
      if (!response.ok) {
        setError(data.error || 'Tour availability could not be verified. Please try again.')
      }
    } catch {
      setAvailabilityVerified(false)
      setError('Tour availability could not be verified. Please try again.')
    }

    setSlotsLoading(false)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedDate || !selectedSlot) {
      setError('Choose a tour date and time first.')
      return
    }
    if (!name || !email) {
      setError('Name and email are required.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/book-tour/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioId,
          date: selectedDate,
          slot: selectedSlot,
          name,
          email,
          phone,
          notes,
          company,
          startedAt,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Tour booking failed. Please try another time.')
        setSubmitting(false)
        return
      }
      setConfirmed(data.tour)
    } catch {
      setError('Connection error. Please try again.')
    }

    setSubmitting(false)
  }

  if (confirmed) {
    return (
      <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8 sm:p-10">
        <p className="text-gray-600 text-xs uppercase tracking-widest mb-4">Tour booked</p>
        <h2 className="text-white font-black leading-tight mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.04em' }}>
          You&apos;re on the calendar.
        </h2>
        <div className="space-y-3 border-y border-white/[0.08] py-6 mb-6">
          <p className="text-white font-bold">{fmtDateFull(confirmed.date)}</p>
          <p className="text-brand-red font-black">{confirmed.time} PT</p>
          <p className="text-gray-500 text-sm">Studio interest: {confirmed.studioName}</p>
          <p className="text-gray-500 text-sm">950 Battery St, San Francisco, CA 94111</p>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed">
          We added the tour to the studio calendar and sent a confirmation. If you need to change the time, reply to the email or message founder@vibeshackstudios.com.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-gray-600 text-xs uppercase tracking-widest mb-5">Pick a tour window</p>
        <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={() => setMonthOffset((value) => Math.max(0, value - 1))}
              disabled={monthOffset === 0}
              className="text-gray-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <p className="text-gray-600 text-xs uppercase tracking-widest">{monthLabel}</p>
            <button
              type="button"
              onClick={() => setMonthOffset((value) => Math.min(months.length - 1, value + 1))}
              disabled={monthOffset >= months.length - 1}
              className="text-gray-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1 mb-7">
            {monthDays.map((date) => {
              const ds = formatDate(date)
              const selected = selectedDate === ds
              return (
                <button
                  key={ds}
                  type="button"
                  onClick={() => selectDate(ds)}
                  className={`flex flex-col items-center rounded-xl py-2.5 transition-colors ${selected ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-white/[0.08]'}`}
                >
                  <span className="text-xs leading-none mb-1 opacity-60">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="text-sm font-black leading-none">{date.getDate()}</span>
                </button>
              )
            })}
          </div>

          {!selectedDate && (
            <div className="flex h-44 items-center justify-center border-t border-white/[0.08]">
              <p className="text-gray-700 text-sm">Select a date to see live tour times.</p>
            </div>
          )}

          {selectedDate && slotsLoading && (
            <div className="flex h-44 items-center justify-center border-t border-white/[0.08]">
              <p className="text-gray-600 text-sm animate-pulse">Checking the studio calendar…</p>
            </div>
          )}

          {selectedDate && !slotsLoading && (
            <div className="border-t border-white/[0.08] pt-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-bold">{fmtDateFull(selectedDate)}</p>
                <p className="text-gray-600 text-xs">30 min</p>
              </div>
              {!availabilityVerified && (
                <div className="mb-4 rounded-xl border border-yellow-900/60 bg-yellow-950/30 px-4 py-3">
                  <p className="text-yellow-300 text-xs font-semibold">Calendar verification is unavailable, so tour booking is paused for this date.</p>
                </div>
              )}
              <div className="grid max-h-[280px] grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3">
                {slots.map((slot) => {
                  const selected = selectedSlot === slot.time
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => slot.available && setSelectedSlot(slot.time)}
                      className={`rounded-xl py-3 text-sm font-semibold transition-colors ${
                        !slot.available ? 'cursor-not-allowed text-gray-800 line-through'
                          : selected ? 'bg-brand-red text-white'
                            : 'text-gray-400 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      {slot.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="text-gray-600 text-xs uppercase tracking-widest mb-5">Your details</p>
        <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-6">
          <div className="hidden">
            <label>
              Company
              <input value={company} onChange={(event) => setCompany(event.target.value)} tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-500 text-xs uppercase tracking-widest mb-3">Studio interest</label>
              <select
                value={studioId}
                onChange={(event) => setStudioId(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white focus:border-white/40 focus:outline-none"
              >
                <option value="">Not sure yet</option>
                {STUDIOS.map((studio) => (
                  <option key={studio.id} value={studio.id} className="bg-black">{studio.name}</option>
                ))}
              </select>
            </div>

            {[
              { label: 'Full name', value: name, set: setName, type: 'text', required: true, placeholder: 'Your name' },
              { label: 'Email', value: email, set: setEmail, type: 'email', required: true, placeholder: 'you@example.com' },
              { label: 'Phone', value: phone, set: setPhone, type: 'tel', required: false, placeholder: '+1 (415) 000-0000' },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-gray-500 text-xs uppercase tracking-widest mb-3">
                  {field.label}{!field.required && <span className="text-gray-700 ml-2 normal-case tracking-normal">optional</span>}
                </label>
                <input
                  type={field.type}
                  required={field.required}
                  value={field.value}
                  onChange={(event) => field.set(event.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-gray-700 focus:border-white/40 focus:outline-none"
                />
              </div>
            ))}

            <div>
              <label className="block text-gray-500 text-xs uppercase tracking-widest mb-3">Anything we should know?</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="What are you trying to create? Any rooms you want to compare?"
                rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder-gray-700 focus:border-white/40 focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="mt-5 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !availabilityVerified}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-bold text-black transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Booking tour…' : 'Book Free Tour'}
          </button>

          <p className="mt-5 text-xs leading-relaxed text-gray-600">
            Tour slots are checked against the live studio calendar before anything is booked. Need a different time? Email founder@vibeshackstudios.com.
          </p>
        </div>
      </div>
    </form>
  )
}

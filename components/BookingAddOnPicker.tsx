'use client'

import React from 'react'
import {
  BOOKING_ADD_ONS,
  REMOTE_PODCAST,
  REMOTE_PLATFORM_MAX_LENGTH,
  priceBookingAddOns,
} from '@/lib/booking/add-ons'
import { formatBookingDuration } from '@/lib/booking/time'

interface BookingAddOnPickerProps {
  selectedIds: string[]
  durationSlots: number
  remotePlatform: string
  onToggle: (id: string) => void
  onPlatformChange: (platform: string) => void
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  })
}

export default function BookingAddOnPicker({ selectedIds, durationSlots, remotePlatform, onToggle, onPlatformChange }: BookingAddOnPickerProps) {
  const duration = formatBookingDuration(durationSlots).toLowerCase()

  return (
    <section aria-labelledby="booking-add-ons-title">
      <div className="mb-6">
        <h3 id="booking-add-ons-title" className="brand-sans text-[22px] font-semibold leading-snug !tracking-[-0.035em] text-white">Optional add-ons</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">Choose what you need. All extras are optional.</p>
      </div>
      <div className="space-y-3">
        {BOOKING_ADD_ONS.map((addOn) => {
          const active = selectedIds.includes(addOn.id)
          const isFree = addOn.hourlyRateCents === 0
          const sessionAmount = priceBookingAddOns([addOn.id], durationSlots)[0].amountCents
          const titleId = `add-on-${addOn.id}-title`
          const descriptionId = `add-on-${addOn.id}-description`
          const priceId = `add-on-${addOn.id}-price`

          return (
            <div key={addOn.id} className={`overflow-hidden rounded-[20px] border motion-safe:transition-colors motion-safe:duration-200 ${active ? 'border-white/[0.45] bg-[#1c1c1e]' : 'border-white/10 bg-[#141416] hover:border-white/25 hover:bg-[#19191b]'}`}>
              <button
                type="button"
                aria-pressed={active}
                aria-labelledby={titleId}
                aria-describedby={`${descriptionId} ${priceId}`}
                onClick={() => onToggle(addOn.id)}
                className="group block w-full rounded-[19px] p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white sm:p-6"
              >
                <span className="flex items-center justify-between gap-4">
                  <span id={titleId} className="min-w-0 text-[17px] font-semibold leading-snug tracking-[-0.025em] text-white sm:text-lg">{addOn.name}</span>
                  <span aria-hidden="true" className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border motion-safe:transition-colors ${active ? 'border-white bg-white text-black' : 'border-white/30 text-zinc-400 group-hover:border-white/50 group-hover:text-white'}`}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {active ? <path d="m5 10 3.2 3.2L15 6.5" /> : <path d="M10 5v10M5 10h10" />}
                    </svg>
                  </span>
                </span>
                <span id={descriptionId} className="mt-2.5 block max-w-[48ch] text-sm leading-relaxed text-zinc-400">{addOn.description}</span>
                <span id={priceId} className="mt-5 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 border-t border-white/[0.08] pt-4">
                  <span className="text-[22px] font-semibold leading-tight tracking-[-0.035em] text-white">
                    {isFree ? 'No charge' : formatPrice(addOn.hourlyRateCents)}
                    {!isFree && <span className="ml-1.5 text-[13px] font-normal tracking-normal text-zinc-400">/ hour</span>}
                  </span>
                  <span className="text-xs leading-relaxed text-zinc-400">{isFree ? 'Included with your session' : `${formatPrice(sessionAmount)} for ${duration}`}</span>
                </span>
              </button>
              {addOn.id === REMOTE_PODCAST.id && active && (
                <div className="mx-5 border-t border-white/10 pb-5 pt-5 sm:mx-6 sm:pb-6">
                  <label htmlFor="remote-podcast-platform" className="flex flex-wrap items-baseline justify-between gap-2 text-sm font-medium text-white">
                    <span>Preferred platform</span>
                    <span className="text-xs font-normal text-zinc-400">Optional</span>
                  </label>
                  <input
                    id="remote-podcast-platform"
                    type="text"
                    value={remotePlatform}
                    onChange={(event) => onPlatformChange(event.target.value)}
                    maxLength={REMOTE_PLATFORM_MAX_LENGTH}
                    placeholder="e.g. Riverside or Zoom"
                    aria-describedby="remote-podcast-platform-help"
                    className="mt-3 min-h-12 w-full min-w-0 rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-base text-white placeholder:text-zinc-500 focus:border-white/60 focus:outline-none focus:ring-1 focus:ring-white/60"
                  />
                  <p id="remote-podcast-platform-help" className="mt-2.5 text-xs leading-relaxed text-zinc-400">You can decide later. We’ll confirm before your session.</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-zinc-400">Hourly add-ons apply to your full session.</p>
    </section>
  )
}

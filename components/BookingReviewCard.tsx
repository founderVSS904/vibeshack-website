import React from 'react'
import Image from 'next/image'
import { type BookingAddOn, bookingAddOnLabel } from '../lib/booking/add-ons'

export function bookingDisplayPrice(amount: number) {
  return amount.toLocaleString('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  })
}

interface BookingReviewCardProps {
  studioName: string
  image: string
  imageAlt: string
  dateLabel: string
  timeRange: string
  durationLabel: string
  hourlyRate: number
  sessionSubtotal: number
  addOns: BookingAddOn[]
  recurringLabel?: string
  discountAmount: number
  total: number
  requiresSetup: boolean
  setupLabel?: string
  disabled: boolean
  onEditTime: () => void
  onEditExtras: () => void
}

const editStyle = 'inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-medium text-zinc-300 underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-wait disabled:opacity-50'

export default function BookingReviewCard(props: BookingReviewCardProps) {
  return (
    <section aria-labelledby="session-summary-heading" className="overflow-hidden rounded-[20px] border border-white/10 bg-[#141416]">
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 id="session-summary-heading" className="brand-sans text-lg font-semibold leading-snug !tracking-[-0.025em] text-white">Your session</h3>
          <button type="button" aria-label="Edit date &amp; time" disabled={props.disabled} onClick={props.onEditTime} className={editStyle}>
            <span className="sm:hidden">Edit</span><span className="hidden sm:inline">Edit date &amp; time</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-black sm:h-20 sm:w-28">
            <Image src={props.image} alt={props.imageAlt} fill sizes="112px" className={props.setupLabel ? 'object-contain' : 'object-cover'} />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl">{props.studioName}</p>
            <p className="mt-1 text-sm text-zinc-400">{bookingDisplayPrice(props.hourlyRate)} per hour</p>
          </div>
        </div>
        <dl className="mt-5 space-y-4 border-t border-white/10 pt-5">
          <div>
            <dt className="text-xs font-medium text-zinc-400">Date</dt>
            <dd className="mt-1 text-[15px] leading-relaxed text-white">{props.dateLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-400">Time</dt>
            <dd className="mt-1 text-[15px] leading-relaxed text-white">{props.timeRange}</dd>
            <dd className="mt-1 text-sm text-zinc-400">{props.durationLabel} · Pacific time</dd>
          </div>
          {props.requiresSetup && (
            <div>
              <dt className="text-xs font-medium text-zinc-400">Studio setup</dt>
              <dd className="mt-1 text-[15px] leading-relaxed text-white">{props.setupLabel || 'Choose a setup'}</dd>
              <dd><button type="button" disabled={props.disabled} onClick={props.onEditExtras} className={editStyle + ' -ml-2'}>Change setup</button></dd>
            </div>
          )}
        </dl>
      </div>
      <div className="border-t border-white/10 px-5 py-4 sm:px-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">Price breakdown</p>
          <button type="button" disabled={props.disabled} onClick={props.onEditExtras} className={editStyle}>Edit extras</button>
        </div>
        <dl className="space-y-4 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="text-zinc-300">Studio · {props.durationLabel}</dt>
            <dd className="shrink-0 tabular-nums text-white">{bookingDisplayPrice(props.sessionSubtotal)}</dd>
          </div>
          {props.addOns.map((addOn) => (
            <div key={addOn.id} className="flex items-start justify-between gap-4">
              <dt className="min-w-0 break-words text-zinc-300">
                {bookingAddOnLabel(addOn)}
                {addOn.hourlyRateCents > 0 && <span className="mt-1 block text-xs text-zinc-400">{addOn.billing === 'session' ? 'One-time session fee' : `${bookingDisplayPrice(addOn.hourlyRateCents / 100)}/hr · ${props.durationLabel}`}</span>}
              </dt>
              <dd className="shrink-0 tabular-nums text-white">{addOn.amountCents === 0 ? 'No charge' : bookingDisplayPrice(addOn.amountCents / 100)}</dd>
            </div>
          ))}
          {props.recurringLabel && (
            <div className="flex items-start justify-between gap-4">
              <dt className="text-zinc-300">{props.recurringLabel}<span className="mt-1 block text-xs text-zinc-400">Studio-time savings</span></dt>
              <dd className="shrink-0 tabular-nums text-white">−{bookingDisplayPrice(props.discountAmount)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-4 border-t border-white/10 pt-5">
            <dt className="font-medium text-white">Session total</dt>
            <dd className="text-2xl font-semibold tracking-tight tabular-nums text-white">{bookingDisplayPrice(props.total)}</dd>
          </div>
        </dl>
        {props.recurringLabel && <p className="mt-3 text-xs leading-relaxed text-zinc-400">Today&apos;s payment covers this session only. Our team will confirm future dates with you separately.</p>}
      </div>
    </section>
  )
}

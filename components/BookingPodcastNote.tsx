import React from 'react'
import { PODCAST_CAMERA_LABEL, PODCAST_CREW_LABEL } from '../lib/booking/podcast-package'

export default function BookingPodcastNote() {
  return (
    <aside aria-labelledby="podcast-session-includes" className="mb-5 rounded-2xl bg-[#141416] p-4 sm:p-5">
      <h3 id="podcast-session-includes" className="brand-sans text-[15px] font-semibold leading-snug text-white">
        Included in your session
      </h3>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-200">
        <li className="flex items-start gap-2.5">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="7" r="3" />
            <path d="M3 21v-2a6 6 0 0 1 12 0v2M16 4a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v2" />
          </svg>
          <span>{PODCAST_CREW_LABEL}</span>
        </li>
        <li className="flex items-start gap-2.5">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="6" width="13" height="12" rx="3" />
            <path d="m16 10 5-3v10l-5-3" />
          </svg>
          <span>{PODCAST_CAMERA_LABEL}</span>
        </li>
      </ul>
      <p className="mt-4 text-[13px] leading-relaxed text-zinc-400">
        One session at a time across all podcast studios.
      </p>
    </aside>
  )
}

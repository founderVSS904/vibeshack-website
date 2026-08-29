'use client'

import { useState } from 'react'
import Link from 'next/link'
import StudioSetupPicker from '@/components/StudioSetupPicker'
import { getStudioSetup, getStudioSetupCollection, type SetupStudioId } from '@/lib/booking/studio-setups'
import { PODCAST_HOURLY_RATES } from '@/lib/booking/podcast-package'

export default function StudioSetupSelector({ studioId }: { studioId: SetupStudioId }) {
  const [setupId, setSetupId] = useState('')
  const collection = getStudioSetupCollection(studioId)!
  const selected = getStudioSetup(studioId, setupId)

  return (
    <section id="choose-setup" className="scroll-mt-24 border-t border-white/10 bg-black py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-brand-red">Your session, your setup</p>
        <StudioSetupPicker id={`${studioId}-page`} studioId={studioId} value={setupId} onChange={setSetupId} wide />
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div aria-live="polite">
            <p className="font-semibold text-white">{selected ? `Selected: ${selected.label}` : 'Choose a photo to get started.'}</p>
            <p className="mt-1 text-sm text-zinc-300">All {collection.countLabel} options use {collection.studioName}&apos;s ${PODCAST_HOURLY_RATES[studioId]}/hr rate.</p>
          </div>
          {selected ? (
            <Link href={`/book/?studio=${studioId}&setup=${selected.id}`} className="inline-flex items-center justify-center gap-3 rounded-lg bg-brand-red px-6 py-4 text-center font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-red-700">
              Book {collection.studioName} with this setup <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <button type="button" disabled className="rounded-lg border border-white/15 bg-white/5 px-6 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-zinc-400 disabled:cursor-not-allowed">Choose a setup to book</button>
          )}
        </div>
      </div>
    </section>
  )
}

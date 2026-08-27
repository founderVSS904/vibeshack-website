'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { STUDIOS, type Studio } from '@/lib/booking/catalog'
import { PODCAST_PACKAGE_SUMMARY } from '@/lib/booking/podcast-package'
import {
  getStudioFinderContactHref,
  getStudioFinderMatches,
  parseOnCameraCount,
  VERIFIED_ON_CAMERA_CAPACITY,
  type StudioFinderAnswers,
  type StudioFinderFormat,
} from '@/lib/booking/studio-finder'

const FORMATS: { id: StudioFinderFormat; label: string }[] = [
  { id: 'podcast', label: 'Podcast or interview' },
  { id: 'video', label: 'Video content or film' },
  { id: 'photo', label: 'Photo shoot' },
  { id: 'greenscreen', label: 'Green screen production' },
  { id: 'notsure', label: 'Not sure yet' },
]

const STUDIO_HREFS: Record<string, string> = {
  'the-executive': '/the-executive/',
  'the-wing': '/the-wing/',
  encore: '/encore/',
  sunset: '/sunset-studio/',
  parlor: '/parlor/',
  horizon: '/horizon/',
  'canvas-podcast': '/canvas-podcast/',
  'green-screen': '/green-screen-studio-sf/',
  'canvas-rental': '/canvas-rental/',
}

const STUDIO_GROUPS = [
  { title: 'Signature Podcast Sets · $400/hr', ids: ['parlor', 'horizon', 'canvas-podcast'] },
  { title: 'Podcast Studios · $300/hr', ids: ['the-executive', 'the-wing', 'encore', 'sunset'] },
  { title: 'Rental Studios · $100/hr', ids: ['green-screen', 'canvas-rental'] },
]

const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'
const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

function StudioCard({ studio, capacityLabel = false }: { studio: Studio; capacityLabel?: boolean }) {
  const capacity = VERIFIED_ON_CAMERA_CAPACITY[studio.id]
  return (
    <a href={STUDIO_HREFS[studio.id]} className="group block overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
      <div className="relative h-[170px] overflow-hidden">
        <Image src={studio.heroImage} alt={studio.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-sm font-bold text-white">{studio.name}</h3>
          <p className="shrink-0 text-sm font-bold text-white">${studio.price}/hr</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-white/65">{studio.description}</p>
        {capacityLabel && capacity !== null && capacity !== undefined && (
          <p className="mt-3 text-xs text-white/75">Verified for up to {capacity} people on camera</p>
        )}
      </div>
    </a>
  )
}

export default function FindYourStudioPage() {
  const [format, setFormat] = useState<StudioFinderFormat | null>(null)
  const [countValue, setCountValue] = useState('')
  const [countUnknown, setCountUnknown] = useState(false)
  const [bringingCrew, setBringingCrew] = useState<boolean | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [done, setDone] = useState(false)
  const [countError, setCountError] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const interactedRef = useRef(false)

  useEffect(() => {
    if (interactedRef.current) headingRef.current?.focus({ preventScroll: true })
  }, [currentQuestion, done])

  function chooseFormat(value: StudioFinderFormat) {
    interactedRef.current = true
    setFormat(value)
    setCountValue('')
    setCountUnknown(false)
    setBringingCrew(null)
    setCountError('')
    setCurrentQuestion(1)
  }

  function submitCount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!format || parseOnCameraCount(countValue, format) === null) {
      setCountError(`Enter a whole number from ${format === 'podcast' ? 1 : 0} to 999, or choose “I’m not sure yet.”`)
      return
    }
    setCountUnknown(false)
    setCountError('')
    setCurrentQuestion(2)
  }

  function chooseCrew(value: boolean) {
    setBringingCrew(value)
    setDone(true)
  }

  function reset() {
    setFormat(null)
    setCountValue('')
    setCountUnknown(false)
    setBringingCrew(null)
    setCountError('')
    setCurrentQuestion(0)
    setDone(false)
  }

  const answers: StudioFinderAnswers | null = done && format && bringingCrew !== null
    ? { format, peopleOnCamera: countUnknown ? null : parseOnCameraCount(countValue, format), bringingCrew }
    : null
  const matches = answers ? getStudioFinderMatches(answers) : []
  const primary = matches[0]
  const otherStudios = matches.slice(1)
  const inquiryHref = answers ? getStudioFinderContactHref(answers) : '/contact/#project-inquiry'
  const photoService = format === 'photo' && bringingCrew === false
  const videoService = format === 'video' && bringingCrew === false
  const question = currentQuestion === 0
    ? 'What are you making?'
    : currentQuestion === 1
      ? 'How many people will be on camera at once?'
      : format === 'photo'
        ? 'Are you bringing your own photographer or crew?'
        : 'Are you bringing your own crew?'

  return (
    <div className="min-h-screen bg-black">
      {!done ? (
        <div className="flex min-h-screen flex-col">
          <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-white/5" aria-hidden="true">
            <div className="h-full w-full origin-left bg-brand-red transition-transform duration-300" style={{ transform: `scaleX(${currentQuestion / 3})` }} />
          </div>
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 pb-20 pt-32 sm:px-10">
            <p className="mb-8 font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-white/55">{currentQuestion + 1} of 3</p>
            <h1 ref={headingRef} tabIndex={-1} className="mb-10 font-black text-white outline-none" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.05 }}>
              {question}
            </h1>

            {currentQuestion === 1 ? (
              <form onSubmit={submitCount} noValidate>
                <p id="people-on-camera-help" className="mb-7 max-w-lg text-sm leading-relaxed text-white/65">
                  Count everyone who will appear in the shot at the same time, including hosts and guests. Do not include crew behind the camera.
                  {format !== 'podcast' && ' Enter 0 for products or scenes without people.'}
                </p>
                <label htmlFor="people-on-camera" className="mb-3 block text-sm font-semibold text-white">People on camera</label>
                <input
                  id="people-on-camera"
                  name="peopleOnCamera"
                  type="number"
                  inputMode="numeric"
                  min={format === 'podcast' ? 1 : 0}
                  max={999}
                  step={1}
                  value={countValue}
                  onChange={(event) => { setCountValue(event.target.value); setCountError('') }}
                  aria-describedby={`people-on-camera-help${countError ? ' people-on-camera-error' : ''}`}
                  aria-invalid={!!countError}
                  className="w-full max-w-[220px] rounded-lg border border-white/30 bg-white/5 px-5 py-4 text-2xl font-bold text-white outline-none focus:border-white"
                  placeholder="e.g. 2"
                />
                {countError && <p id="people-on-camera-error" role="alert" className="mt-3 text-sm text-red-300">{countError}</p>}
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <button type="submit" className={primaryButton}>Continue <span aria-hidden="true">→</span></button>
                  <button type="button" onClick={() => { setCountUnknown(true); setCountError(''); setCurrentQuestion(2) }} className="px-2 py-3 text-sm text-white/65 underline underline-offset-4 hover:text-white">
                    I’m not sure yet
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {currentQuestion === 2 && format === 'podcast' && <p className="mb-8 text-sm leading-relaxed text-white/65">{PODCAST_PACKAGE_SUMMARY} You can still bring your own team.</p>}
                {(currentQuestion === 0 ? FORMATS : [
                  { id: 'yes', label: format === 'photo' ? 'Yes, we have a photographer or crew' : 'Yes, we have crew' },
                  { id: 'no', label: 'No, we need VibeShack' },
                ]).map((option) => (
                  <button
                    key={option.id}
                    onClick={() => currentQuestion === 0 ? chooseFormat(option.id as StudioFinderFormat) : chooseCrew(option.id === 'yes')}
                    className="group flex w-full items-center justify-between gap-4 border-b border-white/15 py-5 text-left first:border-t focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <span className="text-lg font-semibold text-white/80 transition-colors group-hover:text-white">{option.label}</span>
                    <span aria-hidden="true" className="shrink-0 text-white/50 transition-colors group-hover:text-white">→</span>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion > 0 && (
              <button onClick={() => { setCountError(''); setBringingCrew(null); setCurrentQuestion(currentQuestion - 1) }} className="mt-10 w-fit py-2 text-left text-sm text-white/60 transition-colors hover:text-white">
                ← Back
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl px-6 pb-28 pt-32 sm:px-10">
          <div className="mb-10">
            <button onClick={reset} className="mb-6 flex items-center gap-2 py-2 text-sm text-white/60 transition-colors hover:text-white">← Find a different studio</button>
            <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-white/55">{primary ? 'Verified fit' : 'Confirm your setup'}</p>
            <h1 ref={headingRef} tabIndex={-1} className="font-black leading-none text-white outline-none" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
              {primary?.name || (photoService ? 'Let’s plan your photo shoot.' : videoService ? 'Let’s plan your production.' : 'Let’s confirm your setup.')}
            </h1>
            <p className="mt-5 text-sm text-white/65">
              {FORMATS.find((option) => option.id === format)?.label} · {answers?.peopleOnCamera === null ? 'On-camera count to be confirmed' : `${answers?.peopleOnCamera} ${answers?.peopleOnCamera === 1 ? 'person' : 'people'} on camera`}
            </p>
          </div>

          {primary ? (
            <div className="mb-7 overflow-hidden rounded-lg border border-white/10">
              <a href={STUDIO_HREFS[primary.id]} className="group relative block h-[280px] overflow-hidden sm:h-[420px]">
                <Image src={primary.heroImage} alt={primary.name} fill sizes="(min-width: 1024px) 960px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" priority />
              </a>
              <div className="flex flex-col gap-4 bg-white/[0.025] p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
                <div>
                  <p className="font-semibold text-white">Verified for up to {VERIFIED_ON_CAMERA_CAPACITY[primary.id]} people on camera.</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{PODCAST_PACKAGE_SUMMARY}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">For extra off-camera crew, equipment, or a custom layout, confirm the full setup with us first.</p>
                </div>
                <p className="shrink-0 text-2xl font-black text-white">${primary.price}<span className="text-sm font-normal text-white/60">/hr</span></p>
              </div>
            </div>
          ) : (
            <div className="mb-7 max-w-3xl rounded-lg border border-white/15 bg-white/[0.025] p-6 sm:p-8">
              <p className="text-base leading-relaxed text-white/80">
                {photoService || videoService
                  ? 'We’ll match your project with the right studio and production support. Send us your details so we can confirm the setup and space before you book.'
                  : format === 'notsure'
                    ? 'Tell us a little more about the project or come in for a tour. We’ll help you choose a room and confirm its on-camera capacity.'
                    : 'We haven’t verified a room for this on-camera count yet. That doesn’t mean we can’t host your production. Let us confirm the capacity and setup before you book.'}
              </p>
              {format === 'podcast' && <p className="mt-4 text-sm leading-relaxed text-white/65">{PODCAST_PACKAGE_SUMMARY}</p>}
            </div>
          )}

          <div className="mb-14 flex flex-wrap gap-3">
            <a href={primary ? `/book/?studio=${primary.id}` : inquiryHref} className={primaryButton}>
              {primary ? 'Book this studio' : photoService ? 'Start a photo request' : videoService ? 'Start a production request' : 'Confirm my setup'} <span aria-hidden="true">→</span>
            </a>
            <a href={primary ? inquiryHref : '/tour/'} className={secondaryButton}>{primary ? 'Ask about my setup' : 'Book a free tour'}</a>
            <button onClick={reset} className="px-4 py-3.5 text-sm text-white/60 transition-colors hover:text-white">Start over</button>
          </div>

          {otherStudios.length > 0 && (
            <section className="mb-16">
              <h2 className="mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-white/60">Other verified fits</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {otherStudios.map((studio) => <StudioCard key={studio.id} studio={studio} capacityLabel />)}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-white/60">Explore all studios</h2>
            <p className="mb-8 max-w-2xl text-sm leading-relaxed text-white/55">These are all of our spaces, not additional capacity-checked recommendations. Ask us to confirm your setup before choosing a room outside your verified matches.</p>
            {STUDIO_GROUPS.map((group) => (
              <div key={group.title} className="mb-12 last:mb-0">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-white/60">{group.title}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.ids.map((id) => STUDIOS.find((studio) => studio.id === id)).filter((studio): studio is Studio => !!studio).map((studio) => <StudioCard key={studio.id} studio={studio} />)}
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  )
}

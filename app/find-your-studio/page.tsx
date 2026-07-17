'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { STUDIOS as CATALOG_STUDIOS } from '@/lib/booking/catalog'

type Recommendation = { primary: string; others: string[]; reason: string }
type StudioCard = {
  id: string
  name: string
  price: number
  priceLabel?: string
  img: string
  href: string
  desc: string
  series?: string
}

const QUESTIONS = [
  {
    id: 'format',
    question: 'What are you making?',
    options: [
      { id: 'podcast',     label: 'Podcast or interview' },
      { id: 'video',       label: 'Video content or film' },
      { id: 'photo',       label: 'Photo shoot' },
      { id: 'greenscreen', label: 'Green screen production' },
      { id: 'notsure',     label: 'Not sure yet' },
    ],
  },
  {
    id: 'size',
    // Label changes based on format, set dynamically in component
    question: 'How many people are involved?',
    options: [
      { id: 'solo',  label: 'Only me' },
      { id: 'two',   label: 'Two to five' },
      { id: 'small', label: 'Six to twenty' },
      { id: 'large', label: 'More than twenty' },
    ],
  },
  {
    id: 'crew',
    question: 'Are you bringing your own crew?',
    options: [
      { id: 'yes', label: 'Yes, we have crew' },
      { id: 'no',  label: 'No, we need VibeShack' },
    ],
  },
]

const RECOMMENDATIONS: Record<string, Recommendation> = {
  'podcast-solo-no':        { primary: 'sunset',          others: ['encore', 'the-executive'],      reason: 'Best for a solo host who wants a polished look without bringing a production team.' },
  'podcast-two-no':         { primary: 'the-executive',   others: ['the-wing', 'parlor'],           reason: 'A clean two-person interview layout with cameras, audio, lighting, and operator handled.' },
  'podcast-small-no':       { primary: 'canvas-podcast',  others: ['parlor', 'horizon'],            reason: 'A stronger fit when you need more control over layout, backdrop, talent, and camera lanes.' },
  'podcast-large-no':       { primary: 'green-screen',    others: ['canvas-rental', 'canvas-podcast'], reason: 'Large podcast productions need floor space first. Start here, then let us shape the setup.' },
  'podcast-solo-yes':       { primary: 'encore',          others: ['sunset', 'the-executive'],      reason: 'A controlled room for a solo show when your team wants to run the session.' },
  'podcast-two-yes':        { primary: 'the-wing',        others: ['the-executive', 'parlor'],      reason: 'Intimate, focused, and easy for a lean crew to operate around.' },
  'podcast-small-yes':      { primary: 'canvas-podcast',  others: ['parlor', 'horizon'],            reason: 'Flexible enough for extra guests, crew, brand visuals, and a more produced podcast look.' },
  'podcast-large-yes':      { primary: 'canvas-rental',   others: ['green-screen', 'canvas-podcast'], reason: 'The most sensible starting point when your own crew needs space to build a larger setup.' },
  'video-solo-no':          { primary: 'sunset',          others: ['canvas-rental', 'horizon'],     reason: 'Strong on-camera look, simple setup, and VibeShack can handle the production flow.' },
  'video-two-no':           { primary: 'sunset',          others: ['the-executive', 'parlor'],      reason: 'A polished choice for interviews, explainers, social content, and brand videos.' },
  'video-small-no':         { primary: 'horizon',         others: ['canvas-podcast', 'green-screen'], reason: 'Premium visual control with room for a small team and a more intentional production.' },
  'video-large-no':         { primary: 'green-screen',    others: ['sunset'],         reason: 'The 750 sqft floor gives a larger crew space to stage, light, and block.' },
  'video-solo-yes':         { primary: 'canvas-rental',   others: ['green-screen'],   reason: 'A pre-lit room with a seamless white cyc and an overhead lighting grid. Your crew can start shooting on arrival.' },
  'video-two-yes':          { primary: 'canvas-rental',   others: ['green-screen'],   reason: 'A clean two-person setup on the white cyc that your own crew can run without fighting the room.' },
  'video-small-yes':        { primary: 'green-screen',    others: ['canvas-rental'],  reason: 'Room for a small crew and talent to work without resets.' },
  'video-large-yes':        { primary: 'green-screen',    others: ['canvas-rental'],  reason: 'The safest fit for larger crews, wide shots, lighting control, and flexible blocking.' },
  'photo-solo-no':          { primary: 'photo-services',  others: ['canvas-rental'],  reason: 'Start with Photo Services when you need VibeShack to help plan or produce headshots, portraits, product shots, or campaign stills.' },
  'photo-two-no':           { primary: 'photo-services',  others: ['canvas-rental'],  reason: 'A scoped photo request is the right first step when you need help with the shoot, not the room alone.' },
  'photo-small-no':         { primary: 'photo-services',  others: ['canvas-rental'],  reason: 'Photo Services can match the shoot to the right room, lighting plan, and production flow before you book space.' },
  'photo-large-no':         { primary: 'photo-services',  others: ['canvas-rental', 'green-screen'], reason: 'For larger photo productions, start with a scoped request so the room, staging, crew, and shot list fit the real footprint.' },
  'photo-solo-yes':         { primary: 'canvas-rental',   others: ['green-screen'],   reason: 'Bring your photographer into a seamless white cyc that is already lit and ready to shoot.' },
  'photo-two-yes':          { primary: 'canvas-rental',   others: ['green-screen'],   reason: 'The white cyc and overhead lighting grid give you a controlled setup for portraits, product, and two-person shoots.' },
  'photo-small-yes':        { primary: 'canvas-rental',   others: ['green-screen'],   reason: 'More floor space for your photographer, stylist, props, and talent.' },
  'photo-large-yes':        { primary: 'canvas-rental',   others: ['green-screen'],   reason: 'Best for groups, motion, larger sets, and crews that need room to work.' },
  'greenscreen-solo-no':    { primary: 'green-screen',    others: ['canvas-rental'],  reason: 'Full green screen coverage, pre-rigged lighting, and enough space to separate talent from background.' },
  'greenscreen-two-no':     { primary: 'green-screen',    others: ['canvas-rental'],  reason: 'Full wall, lighting grid, and the right setup for clean keying.' },
  'greenscreen-small-no':   { primary: 'green-screen',    others: ['canvas-rental'],  reason: 'Plenty of room for talent, camera, lights, and a compact production team.' },
  'greenscreen-large-no':   { primary: 'green-screen',    others: ['canvas-rental'],  reason: 'The only choice here when you need full green coverage and production space.' },
  'greenscreen-solo-yes':   { primary: 'green-screen',    others: ['canvas-rental'],  reason: 'Your crew gets the full 750 sqft green screen room and pre-rigged lighting grid.' },
  'greenscreen-two-yes':    { primary: 'green-screen',    others: ['canvas-rental'],  reason: 'A clean chroma setup with enough space to operate cameras and lights properly.' },
  'greenscreen-small-yes':  { primary: 'green-screen',    others: ['canvas-rental'],  reason: 'Space for crew, talent, camera lanes, and proper background separation.' },
  'greenscreen-large-yes':  { primary: 'green-screen',    others: ['canvas-rental'],  reason: 'The larger green screen stage leaves room for talent, camera movement, and lighting.' },
  'notsure-solo-no':        { primary: 'the-executive',   others: ['sunset', 'canvas-rental'], reason: 'Start with a tour. We can show you what changes when the goal is podcast, video, or photo.' },
  'notsure-two-no':         { primary: 'the-executive',   others: ['parlor', 'canvas-rental'], reason: 'Start with a tour and we will match the room to your format, crew, and final deliverables.' },
  'notsure-small-no':       { primary: 'canvas-podcast',  others: ['horizon', 'green-screen'], reason: 'Start with a tour because setup choice matters more once guests, crew, and gear increase.' },
  'notsure-large-no':       { primary: 'green-screen',    others: ['canvas-rental', 'canvas-podcast'], reason: 'For larger productions, tour first so the studio choice matches the real footprint.' },
  'notsure-solo-yes':       { primary: 'canvas-rental',   others: ['sunset', 'green-screen'], reason: 'Tour first, then choose between the pre-lit white cyc and a more produced podcast or video set.' },
  'notsure-two-yes':        { primary: 'the-executive',   others: ['canvas-rental'], reason: 'Tour first so your team can compare the controlled rooms against the open rental spaces.' },
  'notsure-small-yes':      { primary: 'canvas-rental',   others: ['green-screen', 'canvas-podcast'], reason: 'A tour will help decide whether you need open floor space or a fully produced room.' },
  'notsure-large-yes':      { primary: 'green-screen',    others: ['canvas-rental'],  reason: 'Tour first. Larger shoots are about space, staging, crew movement, and lighting control.' },
}

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

const STUDIO_ORDER = [
  'the-executive',
  'the-wing',
  'encore',
  'sunset',
  'parlor',
  'horizon',
  'canvas-podcast',
  'green-screen',
  'canvas-rental',
]

const catalogById = CATALOG_STUDIOS.reduce<Record<string, (typeof CATALOG_STUDIOS)[number]>>((acc, studio) => {
  acc[studio.id] = studio
  return acc
}, {})

const STUDIOS = STUDIO_ORDER.reduce<Record<string, StudioCard>>((acc, id) => {
  const studio = catalogById[id]
  if (!studio) return acc
  acc[id] = {
    id,
    name: studio.name,
    price: studio.price,
    img: studio.heroImage,
    href: STUDIO_HREFS[id],
    desc: studio.description,
    series: studio.tag || undefined,
  }
  return acc
}, {})

STUDIOS['photo-services'] = {
  id: 'photo-services',
  name: 'Photo Services',
  price: 0,
  priceLabel: 'Contact us',
  img: '/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260716.jpg',
  href: '/photo-services/',
  desc: 'Photoshoots, headshots, portraits, products, and campaign stills.',
  series: 'Services',
}

const STUDIO_GROUPS = [
  { title: 'Signature Podcast Sets · $400/hr', ids: ['parlor', 'horizon', 'canvas-podcast'] },
  { title: 'Podcast Studios · $300/hr', ids: ['the-executive', 'the-wing', 'encore', 'sunset'] },
  { title: 'Rental Studios · $100/hr', ids: ['green-screen', 'canvas-rental'] },
]

function getQuestionText(currentQ: number, answers: Record<string, string>) {
  if (currentQ === 1 && answers.format === 'podcast') return 'How many people on camera?'
  if (currentQ === 1 && (answers.format === 'photo' || answers.format === 'greenscreen')) return 'How large is your production?'
  if (currentQ === 2 && answers.format === 'podcast') return 'Do you want VibeShack to run the recording?'
  if (currentQ === 2 && answers.format === 'photo') return 'Are you bringing your own photographer or crew?'
  if (currentQ === 2 && answers.format === 'greenscreen') return 'Are you bringing your own production crew?'
  return QUESTIONS[currentQ].question
}

function getQuestionOptions(currentQ: number, answers: Record<string, string>) {
  if (currentQ !== 2) return QUESTIONS[currentQ].options
  if (answers.format === 'podcast' || answers.format === 'video') {
    return [
      { id: 'yes', label: 'Yes, we have crew' },
      { id: 'no', label: 'No, handle it for us' },
    ]
  }
  return QUESTIONS[currentQ].options
}

export default function FindYourStudioPage() {
  const [answers, setAnswers]   = useState<Record<string, string>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [done, setDone]         = useState(false)
  const [selecting, setSelecting] = useState<string | null>(null)

  // Reset quiz state whenever the page is navigated to
  useEffect(() => {
    setAnswers({})
    setCurrentQ(0)
    setDone(false)
    setSelecting(null)
  }, [])

  function answer(questionId: string, optionId: string) {
    setSelecting(optionId)
    setTimeout(() => {
      const newAnswers = { ...answers, [questionId]: optionId }
      setAnswers(newAnswers)
      setSelecting(null)
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1)
      } else {
        setDone(true)
      }
    }, 180)
  }

  function reset() {
    setAnswers({}); setCurrentQ(0); setDone(false); setSelecting(null)
  }

  const recKey = done ? `${answers.format}-${answers.size}-${answers.crew}` : null
  const rec     = recKey ? (RECOMMENDATIONS[recKey] || RECOMMENDATIONS['notsure-solo-no']) : null
  const primary = rec ? STUDIOS[rec.primary] : null
  const questionText = getQuestionText(currentQ, answers)
  const questionOptions = getQuestionOptions(currentQ, answers)
  const otherStudios = rec?.others
    .map((id) => STUDIOS[id])
    .filter((studio): studio is StudioCard => !!studio && studio.id !== primary?.id) ?? []
  const shouldTourFirst = done && answers.format === 'notsure'
  const isPhotoServicesMatch = primary?.id === 'photo-services'
  const primaryCtaHref = isPhotoServicesMatch
    ? '/contact/?service=photo-services'
    : shouldTourFirst
      ? `/tour/?studio=${rec?.primary}`
      : `/book/?studio=${rec?.primary}`

  return (
    <div className="min-h-screen bg-black">

      {!done ? (
        /* ── QUESTION VIEW ── */
        <div className="min-h-screen flex flex-col">

          {/* Thin progress line at very top */}
          <div className="h-[2px] bg-white/5 fixed top-0 left-0 right-0 z-50">
            <div className="h-full w-full origin-left bg-brand-red transition-transform duration-500 ease-out"
              style={{transform: `scaleX(${currentQ / QUESTIONS.length})`}} />
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full px-6 sm:px-10 pt-32 pb-20">

            {/* Step label */}
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-700 mb-8">
              {currentQ + 1} of {QUESTIONS.length}
            </p>

            {/* Question, context-aware label for Q2 */}
            <h1 className="text-white font-black mb-16"
              style={{fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', letterSpacing: 0, lineHeight: 1.05}}>
              {questionText}
            </h1>

            {/* Options: clean text rows, no boxes */}
            <div className="space-y-0">
              {questionOptions.map((opt, i) => (
                <button key={opt.id} onClick={() => answer(QUESTIONS[currentQ].id, opt.id)}
                  className={`w-full text-left py-5 border-b flex items-center justify-between group transition-colors duration-150 ${
                    selecting === opt.id
                      ? 'border-brand-red'
                      : i === 0 ? 'border-t border-b border-white/[0.08]' : 'border-white/[0.08]'
                  }`}>
                  <span className={`font-semibold text-lg transition-colors duration-150 ${
                    selecting === opt.id ? 'text-brand-red' : 'text-gray-300 group-hover:text-white'
                  }`} style={{letterSpacing: 0}}>
                    {opt.label}
                  </span>
                  <span className={`text-sm transition-colors duration-150 flex-shrink-0 ml-4 ${
                    selecting === opt.id ? 'text-brand-red' : 'text-gray-700 group-hover:text-gray-400'
                  }`}>→</span>
                </button>
              ))}
            </div>

            {/* Back */}
            {currentQ > 0 && (
              <button onClick={() => setCurrentQ(currentQ - 1)}
                className="mt-10 text-gray-700 hover:text-white text-sm transition-colors text-left">
                ← Back
              </button>
            )}
          </div>
        </div>

      ) : (
        /* ── RESULT VIEW ── */
        <div className="pt-32 pb-28 max-w-5xl mx-auto px-6 sm:px-10">

          <div className="mb-14">
            <button onClick={reset} className="flex items-center gap-2 text-gray-600 hover:text-white text-sm transition-colors mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              Find a different studio
            </button>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-600 mb-4">Your match</p>
            <h1 className="text-white font-black leading-none"
              style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: 0}}>
              {primary?.name}
            </h1>
          </div>

          {/* Primary studio hero */}
          {primary && (
            <a href={primary.href}
              className="block rounded-lg overflow-hidden mb-4 group relative h-[340px] sm:h-[420px]">
              <Image src={primary.img} alt={primary.name}
                fill sizes="100vw"
                className="object-cover group-hover:scale-[1.035] transition-transform duration-700 ease-out"
                priority />
              <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 50%, transparent 80%)'}} />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-white font-black text-2xl mb-1" style={{letterSpacing: 0}}>{primary.name}</p>
                  <p className="text-gray-400 text-sm">{rec?.reason}</p>
                </div>
                <div className="sm:text-right flex-shrink-0 sm:ml-6">
                  {primary.priceLabel ? (
                    <p className="text-white font-black text-xl" style={{letterSpacing: 0}}>{primary.priceLabel}</p>
                  ) : (
                    <>
                      <p className="text-white font-black text-2xl" style={{letterSpacing: 0}}>${primary.price}</p>
                      <p className="text-gray-500 text-xs">/hr</p>
                    </>
                  )}
                </div>
              </div>
            </a>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-16">
            {primary && (
              <a href={primaryCtaHref}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black font-bold text-sm rounded-lg hover:bg-gray-100 transition-colors">
                {isPhotoServicesMatch ? 'Start a photo request' : shouldTourFirst ? 'Book a free tour' : 'Book this studio'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
            )}
            <a href={isPhotoServicesMatch ? '/photo-services/' : shouldTourFirst ? '/pricing/' : `/tour/?studio=${rec?.primary}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/20 text-white text-sm font-semibold rounded-lg hover:border-white/40 transition-colors">
              {isPhotoServicesMatch ? 'See Photo Services' : shouldTourFirst ? 'View pricing' : 'Book a free tour'}
            </a>
            <button onClick={reset}
              className="px-6 py-3.5 text-gray-600 hover:text-white text-sm transition-colors">
              Start over
            </button>
          </div>

          {otherStudios.length > 0 && (
            <div className="mb-16">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-600 mb-4">Also consider</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherStudios.map((s) => (
                  <a key={s.id} href={s.href}
                    className="block rounded-lg overflow-hidden group">
                    <div className="relative h-[170px]">
                      <Image src={s.img} alt={s.name}
                        fill sizes="100vw"
                        className="object-cover group-hover:scale-[1.035] transition-transform duration-700 ease-out" />
                      <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 62%)'}} />
                      <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-white font-bold text-sm">{s.name}</p>
                          <p className="text-gray-400 text-xs">{s.desc}</p>
                        </div>
                        <p className="text-white font-black text-sm flex-shrink-0">{s.priceLabel || `$${s.price}/hr`}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* All Studios */}
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-600 mb-8">All Studios</p>
            {STUDIO_GROUPS.map((group) => {
              const studios = group.ids
                .map((id) => STUDIOS[id])
                .filter((studio): studio is StudioCard => !!studio && studio.id !== primary?.id)

              if (!studios.length) return null

              return (
                <div key={group.title} className="mb-12 last:mb-0">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">{group.title}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {studios.map((s) => (
                      <a key={s.id} href={s.href}
                        className="block rounded-lg overflow-hidden group">
                        <div className="relative h-[160px]">
                          <Image src={s.img} alt={s.name}
                            fill sizes="100vw"
                            className="object-cover group-hover:scale-[1.035] transition-transform duration-700 ease-out" />
                          <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 55%)'}} />
                          <div className="absolute bottom-0 left-0 right-0 px-5 pb-3">
                            <p className="text-white font-bold text-sm">{s.name}</p>
                            <p className="text-gray-400 text-xs">{s.priceLabel || `$${s.price}/hr`} · {s.desc}</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

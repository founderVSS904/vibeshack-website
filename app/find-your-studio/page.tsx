'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
    // Label changes based on format — set dynamically in component
    question: 'How many people are involved?',
    options: [
      { id: 'solo',  label: 'Just me' },
      { id: 'two',   label: 'Two to five' },
      { id: 'small', label: 'Six to twenty' },
      { id: 'large', label: 'More than twenty' },
    ],
  },
  {
    id: 'crew',
    question: 'Do you have a camera operator?',
    options: [
      { id: 'yes', label: 'Yes, we have crew' },
      { id: 'no',  label: 'No, we need one' },
    ],
  },
]

const RECOMMENDATIONS: Record<string, { primary: string; others: string[]; reason: string }> = {
  'podcast-solo-no':        { primary: 'podcast-sunset',  others: ['podcast-modern'],  reason: 'Solo host, cameraman included. Walk in and start.' },
  'podcast-two-no':         { primary: 'podcast-cozy',    others: ['podcast-sunset'],  reason: 'Intimate layout. Walnut Series. Cameraman handles everything.' },
  'podcast-small-no':       { primary: 'podcast-cozy',    others: ['podcast-modern'],  reason: 'Multiple guests? Intimate layout, cameraman included.' },
  'podcast-large-no':       { primary: 'podcast-cozy',    others: ['podcast-modern'],  reason: 'Our most flexible setup. Cameraman included.' },
  'podcast-solo-yes':       { primary: 'podcast-modern',  others: ['podcast-sunset'],  reason: 'Your crew, our gear. Full 4K setup.' },
  'podcast-two-yes':        { primary: 'podcast-cozy',    others: ['podcast-modern'],  reason: 'Intimate layout. Your crew operates.' },
  'podcast-small-yes':      { primary: 'podcast-cozy',    others: ['podcast-modern'],  reason: 'Flexible layout. Bring your team.' },
  'podcast-large-yes':      { primary: 'podcast-cozy',    others: ['podcast-modern'],  reason: 'Flexible layout. Bring your crew.' },
  'video-solo-no':          { primary: 'photography',     others: ['podcast-sunset'], reason: 'Professional lighting, white backdrop, Hair & Makeup room.' },
  'video-two-no':           { primary: 'photography',     others: ['podcast-sunset'], reason: 'Professional setup. Lighting and backdrop ready.' },
  'video-small-no':         { primary: 'podcast-sunset',  others: ['green-screen'],    reason: 'Multi-camera, cameraman handles production.' },
  'video-large-no':         { primary: 'green-screen',    others: ['podcast-sunset'], reason: '750 sqft gives you room for a larger production.' },
  'video-solo-yes':         { primary: 'photography',     others: ['white-backdrop'],  reason: 'Professional lighting. Your crew operates.' },
  'video-two-yes':          { primary: 'photography',     others: ['white-backdrop'],  reason: 'Clean setup for two. Your crew operates.' },
  'video-small-yes':        { primary: 'green-screen',    others: ['photography'],     reason: 'Room for a small crew and talent.' },
  'video-large-yes':        { primary: 'green-screen',    others: ['photography'],      reason: '750 sqft. Built for productions this size.' },
  'photo-solo-no':          { primary: 'photography',     others: ['white-backdrop'],  reason: 'Professional lighting, white backdrop, Hair & Makeup room.' },
  'photo-two-no':           { primary: 'photography',     others: ['white-backdrop'],  reason: 'Fits two comfortably with full lighting.' },
  'photo-small-no':         { primary: 'photography',     others: ['white-backdrop'],  reason: 'Professional setup for small group shoots.' },
  'photo-large-no':         { primary: 'white-backdrop',  others: ['green-screen'],    reason: 'More space for larger group photography.' },
  'photo-solo-yes':         { primary: 'photography',     others: ['white-backdrop'],  reason: 'Your photographer, our lighting and backdrop.' },
  'photo-two-yes':          { primary: 'photography',     others: ['white-backdrop'],  reason: 'Bring your photographer. Everything else is ready.' },
  'photo-small-yes':        { primary: 'white-backdrop',  others: ['photography'],     reason: 'More open space. Your photographer operates.' },
  'photo-large-yes':        { primary: 'white-backdrop',  others: ['green-screen'],    reason: 'Most space for large group photography.' },
  'greenscreen-solo-no':    { primary: 'green-screen',    others: [],                  reason: '750 sqft floor-to-ceiling. We can assist with operation.' },
  'greenscreen-two-no':     { primary: 'green-screen',    others: [],                  reason: 'Full green screen, full lighting grid.' },
  'greenscreen-small-no':   { primary: 'green-screen',    others: [],                  reason: 'Plenty of room for your team.' },
  'greenscreen-large-no':   { primary: 'green-screen',    others: [],                  reason: '750 sqft built for this.' },
  'greenscreen-solo-yes':   { primary: 'green-screen',    others: [],                  reason: 'Your crew, our 750 sqft green screen.' },
  'greenscreen-two-yes':    { primary: 'green-screen',    others: [],                  reason: 'Full wall, lighting grid, your crew.' },
  'greenscreen-small-yes':  { primary: 'green-screen',    others: [],                  reason: 'Space for crew and talent.' },
  'greenscreen-large-yes':  { primary: 'green-screen',    others: [],                  reason: '750 sqft. Built for productions this size.' },
  'notsure-solo-no':        { primary: 'podcast-premium', others: ['podcast-sunset', 'green-screen'], reason: 'Book a free tour. We\'ll walk you through every studio.' },
  'notsure-two-no':         { primary: 'podcast-premium', others: ['photography', 'green-screen'], reason: 'Book a free tour and we\'ll match you to the right setup.' },
  'notsure-small-no':       { primary: 'podcast-premium', others: ['green-screen'],    reason: 'Book a free tour. We\'ll figure it out together.' },
  'notsure-large-no':       { primary: 'green-screen',    others: ['podcast-sunset'], reason: 'For larger productions, let\'s talk first.' },
  'notsure-solo-yes':       { primary: 'photography',     others: ['green-screen'],    reason: 'Book a free tour and decide on-site.' },
  'notsure-two-yes':        { primary: 'podcast-premium', others: ['photography'],     reason: 'Book a free tour. We\'ll walk you through everything.' },
  'notsure-small-yes':      { primary: 'green-screen',    others: ['photography'],      reason: 'Book a free tour with your team.' },
  'notsure-large-yes':      { primary: 'green-screen',    others: [],                  reason: 'Book a tour for your team. We\'ll plan the right setup.' },
}

const STUDIOS: Record<string, { name: string; price: number; img: string; href: string; desc: string; series?: string }> = {
  'podcast-premium': { name: 'The Executive', price: 300, img: '/studio-images/the-executive-hero.jpg', href: '/the-executive', desc: '3-cam 4K · Cameraman included', series: 'Walnut Series' },
  'podcast-modern':  { name: 'Encore',  price: 300, img: '/studio-images/encore-wide.jpg',    href: '/encore',                desc: '3-cam 4K · Cameraman included', series: 'Vault Series' },
  'podcast-sunset':  { name: 'Sunset',        price: 300, img: '/studio-images/sunset-red.jpg',    href: '/sunset-studio',                   desc: '7-color backdrop · Cameraman included', series: 'Creative Series' },
  'podcast-cozy': { name: 'The Wing',  price: 300, img: '/studio-images/the-wing-hero.jpg', href: '/the-wing',                  desc: '2-cam intimate · Cameraman included', series: 'Walnut Series' },
  'green-screen':    { name: 'Green Screen Studio',    price: 100, img: '/studio-images/greenscreen-shoot-1.jpg', href: '/green-screen-studio-sf',   desc: '750 sqft · Full lighting grid' },
  'photography':     { name: 'Photography Studio',     price: 100, img: '/studio-images/photography-hero.jpg',   href: '/photography-studio-san-francisco', desc: 'Pro ARRI lights · Hair & Makeup room' },
  'white-backdrop':  { name: 'Canvas',  price: 100, img: '/studio-images/podcast-cyc-duo.jpg',    href: '/white-backdrop-studio',         desc: 'White cyc · Bring your crew', series: 'Creative Series' },
  'premier':  { name: 'Premier',  price: 300, img: '/studio-images/premier-hero-v1775084326.jpg',    href: '/premier',         desc: 'Luxury interview · Cameraman included', series: 'Vault Series' },
}

export default function FindYourStudioPage() {
  const [answers, setAnswers]   = useState<Record<string, string>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [done, setDone]         = useState(false)
  const [selecting, setSelecting] = useState<string | null>(null)
  const router = useRouter()

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
  const others  = rec ? rec.others.map(id => STUDIOS[id]).filter(Boolean) : []

  return (
    <div className="min-h-screen bg-black">

      {!done ? (
        /* ── QUESTION VIEW ── */
        <div className="min-h-screen flex flex-col">

          {/* Thin progress line at very top */}
          <div className="h-[2px] bg-white/5 fixed top-0 left-0 right-0 z-50">
            <div className="h-full bg-brand-red transition-all duration-500 ease-out"
              style={{width: `${(currentQ / QUESTIONS.length) * 100}%`}} />
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full px-6 sm:px-10 pt-32 pb-20">

            {/* Step label */}
            <p className="text-gray-700 text-xs tracking-[0.2em] uppercase mb-8">
              {currentQ + 1} of {QUESTIONS.length}
            </p>

            {/* Question — context-aware label for Q2 */}
            <h1 className="text-white font-black mb-16"
              style={{fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', letterSpacing: '-0.04em', lineHeight: 1.05}}>
              {currentQ === 1 && answers.format === 'podcast'
                ? 'How many people on camera?'
                : currentQ === 1 && (answers.format === 'photo' || answers.format === 'greenscreen')
                  ? 'How large is your production?'
                  : QUESTIONS[currentQ].question}
            </h1>

            {/* Options — clean text rows, no boxes */}
            <div className="space-y-0">
              {QUESTIONS[currentQ].options.map((opt, i) => (
                <button key={opt.id} onClick={() => answer(QUESTIONS[currentQ].id, opt.id)}
                  className={`w-full text-left py-5 border-b flex items-center justify-between group transition-all duration-150 ${
                    selecting === opt.id
                      ? 'border-brand-red'
                      : i === 0 ? 'border-t border-b border-white/8' : 'border-white/8'
                  }`}>
                  <span className={`font-semibold text-lg transition-colors duration-150 ${
                    selecting === opt.id ? 'text-brand-red' : 'text-gray-300 group-hover:text-white'
                  }`} style={{letterSpacing: '-0.01em'}}>
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
            <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mb-4">Your match</p>
            <h1 className="text-white font-black leading-none"
              style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.05em'}}>
              {primary?.name}
            </h1>
          </div>

          {/* Primary studio — hero */}
          {primary && (
            <a href={primary.href}
              className="block rounded-2xl overflow-hidden mb-4 group relative"
              style={{height: '420px'}}>
              <Image src={primary.img} alt={primary.name}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                priority />
              <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 50%, transparent 80%)'}} />
              <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
                <div>
                  <p className="text-white font-black text-2xl mb-1" style={{letterSpacing: '-0.03em'}}>{primary.name}</p>
                  <p className="text-gray-400 text-sm">{rec?.reason}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-6">
                  <p className="text-white font-black text-2xl" style={{letterSpacing: '-0.03em'}}>${primary.price}</p>
                  <p className="text-gray-500 text-xs">/hr</p>
                </div>
              </div>
            </a>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-16">
            {primary && (
              <a href={`/book?studio=${rec?.primary}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-100 transition-colors">
                Book This Studio
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
            )}
            <a href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/20 text-white text-sm font-semibold rounded-full hover:border-white/40 transition-colors">
              Book a free tour
            </a>
            <button onClick={reset}
              className="px-6 py-3.5 text-gray-600 hover:text-white text-sm transition-colors">
              Start over
            </button>
          </div>

          {/* All Studios — Apple-style organized grid */}
          <div>
            <p className="text-gray-600 text-xs uppercase tracking-widest mb-8">All Studios</p>
            
            {/* Vault Series ($300/hr — Premium) */}
            <div className="mb-12">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">Vault Series — $300/hr</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[Object.values(STUDIOS).find(s => s.series === 'Vault Series' && s.name !== primary?.name), 
                  Object.values(STUDIOS).find(s => s.series === 'Vault Series' && s !== Object.values(STUDIOS).find(x => x.series === 'Vault Series' && x.name !== primary?.name) && s.name !== primary?.name)].filter(Boolean).map((s, i) => s && (
                  <a key={i} href={s.href}
                    className="block rounded-2xl overflow-hidden group">
                    <div className="relative" style={{height: '180px'}}>
                      <Image src={s.img} alt={s.name}
                        fill
                        className="object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                      <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 50%)'}} />
                      <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                        <p className="text-white font-bold text-sm">{s.name}</p>
                        <p className="text-gray-400 text-xs">{s.desc}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Walnut & Creative Series ($300/hr) */}
            <div className="mb-12">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">Podcast Studios — $300/hr</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                {Object.values(STUDIOS).filter(s => s.price === 300 && s.name !== primary?.name && s.series !== 'Vault Series').map((s, i) => (
                  <a key={i} href={s.href}
                    className="block rounded-2xl overflow-hidden group">
                    <div className="relative" style={{height: '160px'}}>
                      <Image src={s.img} alt={s.name}
                        fill
                        className="object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                      <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 50%)'}} />
                      <div className="absolute bottom-0 left-0 right-0 px-5 pb-3">
                        <p className="text-white font-bold text-sm">{s.name}</p>
                        <p className="text-gray-400 text-xs">{s.desc}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Rental Studios ($100–$150/hr) */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">Rental Studios — $100–$150/hr</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.values(STUDIOS).filter(s => s.price < 300).map((s, i) => (
                  <a key={i} href={s.href}
                    className="block rounded-2xl overflow-hidden group">
                    <div className="relative" style={{height: '160px'}}>
                      <Image src={s.img} alt={s.name}
                        fill
                        className="object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                      <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 50%)'}} />
                      <div className="absolute bottom-0 left-0 right-0 px-5 pb-3">
                        <p className="text-white font-bold text-sm">{s.name}</p>
                        <p className="text-gray-400 text-xs">${s.price}/hr · {s.desc}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useEffect, useRef } from 'react'

type PricingFaq = {
  id: string
  question: string
  answer: string
}

export function faqIdFromHash(hash: string, ids: readonly string[]): string | undefined {
  if (!hash.startsWith('#')) return undefined
  try {
    const id = decodeURIComponent(hash.slice(1))
    return ids.includes(id) ? id : undefined
  } catch {
    return undefined
  }
}

export default function PricingFaqs({ faqs }: { faqs: readonly PricingFaq[] }) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function openLinkedAnswer() {
      const id = faqIdFromHash(window.location.hash, faqs.map((faq) => faq.id))
      if (!id) return
      const details = Array.from(listRef.current?.querySelectorAll('details') || []).find((item) => item.id === id)
      if (!details) return

      details.open = true
      details.scrollIntoView({ block: 'start', behavior: 'auto' })
      details.querySelector('summary')?.focus({ preventScroll: true })
    }

    openLinkedAnswer()
    window.addEventListener('hashchange', openLinkedAnswer)
    return () => window.removeEventListener('hashchange', openLinkedAnswer)
  }, [faqs])

  return (
    <div ref={listRef} className="border-t border-white/10">
      {faqs.map(({ id, question, answer }) => (
        <details key={id} id={id} className="group scroll-mt-32 border-b border-white/10">
          <summary
            aria-controls={`${id}-answer`}
            className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-base font-semibold text-white hover:text-gray-300 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red [&::-webkit-details-marker]:hidden"
          >
            {question}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" focusable="false">
                <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="group-open:hidden" />
              </svg>
            </span>
          </summary>
          <div id={`${id}-answer`} className="max-w-3xl pb-7 pr-2 sm:pr-14">
            <p className="text-sm leading-relaxed text-gray-400">{answer}</p>
            <a
              href={`#${id}`}
              aria-label={`Link to answer: ${question}`}
              className="mt-4 inline-flex min-h-8 items-center text-xs text-gray-400 underline underline-offset-4 hover:text-white focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red"
            >
              Link to this answer
            </a>
          </div>
        </details>
      ))}
    </div>
  )
}

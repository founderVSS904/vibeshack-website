'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { GAEventType, sendGAEvent } from '@/lib/analytics'

export default function AnalyticsPageViews() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)
  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return
    if (sendGAEvent(GAEventType.PAGE_VIEW)) lastPath.current = pathname
  }, [pathname])
  return null
}

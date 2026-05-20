'use client'

import { useEffect } from 'react'

const ATTRIBUTION_COOKIE = 'vbs_attribution'
const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 90

const trackedParams = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'msclkid',
]

function hasCookie(name: string) {
  return document.cookie.split(';').some((cookie) => cookie.trim().startsWith(`${name}=`))
}

export default function AttributionCapture() {
  useEffect(() => {
    const url = new URL(window.location.href)
    const params = Object.fromEntries(
      trackedParams
        .map((key) => [key, url.searchParams.get(key)] as const)
        .filter(([, value]) => Boolean(value)),
    )

    const externalReferrer =
      document.referrer && !document.referrer.includes(window.location.hostname)
        ? document.referrer
        : ''

    if (hasCookie(ATTRIBUTION_COOKIE) && !Object.keys(params).length && !externalReferrer) {
      return
    }

    const attribution = {
      landingPath: `${url.pathname}${url.search}`,
      referrer: externalReferrer,
      params,
      capturedAt: new Date().toISOString(),
    }

    document.cookie = `${ATTRIBUTION_COOKIE}=${encodeURIComponent(JSON.stringify(attribution))}; Path=/; Max-Age=${ATTRIBUTION_MAX_AGE}; SameSite=Lax; Secure`
  }, [])

  return null
}

import { NextRequest, NextResponse } from 'next/server'
import { getAddOnAvailabilityForSlots } from '@/lib/booking/calendar'
import { addOnRequestSlots } from '@/lib/booking/add-on-inventory'
import { rateLimit } from '@/lib/server/request-guards'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { key: 'add-on-availability', max: 120, windowMs: 60_000 })
  if (limited) return limited
  const params = new URL(req.url).searchParams
  const date = params.get('date') || ''
  const slots = addOnRequestSlots(date, params.get('start') || '', Number(params.get('slots')))
  if (!slots) return NextResponse.json({ verified: false, error: 'Valid session required' }, { status: 400 })
  const result = await getAddOnAvailabilityForSlots(date, slots)
  return NextResponse.json(result, { status: result.verified ? 200 : 503, headers: { 'Cache-Control': 'no-store' } })
}

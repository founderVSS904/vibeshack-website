import { NextRequest, NextResponse } from 'next/server'
import { getAvailabilityForDate } from '@/lib/booking/calendar'
import { getStudioById } from '@/lib/booking/catalog'
import { isValidBookingDate } from '@/lib/booking/time'
import { distributedRateLimit } from '@/lib/server/distributed-rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const limited = await distributedRateLimit(req, { key: 'availability', max: 120, windowMs: 60 * 1000 })
  if (limited) return limited

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const studioId = searchParams.get('studio') || undefined

  if (!date || !isValidBookingDate(date)) {
    return NextResponse.json({ error: 'Valid date required', verified: false, slots: [] }, { status: 400 })
  }

  if (studioId && !getStudioById(studioId)) {
    return NextResponse.json({ error: 'Valid studio required', verified: false, slots: [] }, { status: 400 })
  }

  const availability = await getAvailabilityForDate(date, studioId)
  const status = availability.verified ? 200 : 503
  return NextResponse.json(availability, { status })
}

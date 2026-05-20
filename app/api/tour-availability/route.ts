import { NextRequest, NextResponse } from 'next/server'
import { getTourAvailabilityForDate } from '@/lib/booking/calendar'
import { isValidBookingDate } from '@/lib/booking/time'
import { rateLimit } from '@/lib/server/request-guards'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { key: 'tour-availability', max: 120, windowMs: 60 * 1000 })
  if (limited) return limited

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  if (!date || !isValidBookingDate(date)) {
    return NextResponse.json({
      error: 'Valid date required',
      verified: false,
      durationMinutes: 30,
      slots: [],
    }, { status: 400 })
  }

  const availability = await getTourAvailabilityForDate(date)
  const status = availability.verified ? 200 : 503
  return NextResponse.json(availability, { status })
}

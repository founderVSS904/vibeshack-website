import { NextRequest, NextResponse } from 'next/server'
import { getTourAvailabilityForDate } from '@/lib/booking/calendar'
import { isValidBookingDate } from '@/lib/booking/time'
import { distributedRateLimit } from '@/lib/server/distributed-rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const limited = await distributedRateLimit(req, { key: 'tour-availability', max: 120, windowMs: 60 * 1000, fallback: 'local' })
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

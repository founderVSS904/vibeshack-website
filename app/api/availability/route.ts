import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import fs from 'fs'

const SLOT_DURATION_HOURS = 1
const START_HOUR = 0  // 12am (midnight) PT
const END_HOUR = 24   // 12am next day (24hr format)

function getTimeSlotsForDay(date: string): { start: Date; end: Date }[] {
  const slots = []
  const d = new Date(date + 'T00:00:00')
  for (let h = START_HOUR; h < END_HOUR; h++) {
    const start = new Date(d)
    start.setHours(h, 0, 0, 0)
    const end = new Date(start)
    end.setHours(h + SLOT_DURATION_HOURS, 0, 0, 0)
    slots.push({ start, end })
  }
  return slots
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') // YYYY-MM-DD
    const studio = searchParams.get('studio') || ''

    if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

    // Load Google Calendar token
    const tokenPath = process.env.GCAL_TOKEN_PATH || '/root/.openclaw/workspace/scripts/gcal/token.json'
    const calendarId = process.env.GCAL_CALENDAR_ID || 'founder@vibeshackstudios.com'

    let busyTimes: { start: string; end: string }[] = []

    if (fs.existsSync(tokenPath)) {
      const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'))
      const auth = new google.auth.OAuth2(
        tokenData.client_id || process.env.GCAL_CLIENT_ID,
        tokenData.client_secret || process.env.GCAL_CLIENT_SECRET,
      )
      auth.setCredentials(tokenData)

      const calendar = google.calendar({ version: 'v3', auth })
      const dayStart = new Date(date + 'T00:00:00')
      const dayEnd = new Date(date + 'T23:59:59')

      const res = await calendar.freebusy.query({
        requestBody: {
          timeMin: dayStart.toISOString(),
          timeMax: dayEnd.toISOString(),
          items: [{ id: calendarId }],
        },
      })
      busyTimes = (res.data.calendars?.[calendarId]?.busy || []).map(b => ({
        start: b.start || '',
        end: b.end || '',
      }))
    }

    const allSlots = getTimeSlotsForDay(date)
    const now = new Date()

    const slots = allSlots.map(({ start, end }) => {
      const busy = busyTimes.some(b => {
        const bs = new Date(b.start)
        const be = new Date(b.end)
        return start < be && end > bs
      })
      return {
        time: start.toISOString(),
        label: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' }),
        available: !busy && start > now,
      }
    })

    return NextResponse.json({ slots })
  } catch (err) {
    console.error('availability error', err)
    // Return all slots as available if calendar fails
    const date = new URL(req.url).searchParams.get('date') || new Date().toISOString().split('T')[0]
    const allSlots = getTimeSlotsForDay(date)
    return NextResponse.json({
      slots: allSlots.map(({ start }) => ({
        time: start.toISOString(),
        label: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' }),
        available: start > new Date(),
      }))
    })
  }
}

export const BOOKING_TIME_ZONE = 'America/Los_Angeles'
export const SLOT_DURATION_HOURS = 1
export const START_HOUR = 0
export const END_HOUR = 24

export function isValidBookingDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const [year, month, day] = date.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )

  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  )

  return asUtc - date.getTime()
}

export function zonedDateTimeToUtc(date: string, hour: number, minute = 0) {
  if (!isValidBookingDate(date)) {
    throw new Error(`Invalid booking date: ${date}`)
  }

  const [year, month, day] = date.split('-').map(Number)
  const wallClockGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0))
  const firstOffset = getTimeZoneOffsetMs(wallClockGuess, BOOKING_TIME_ZONE)
  const firstUtc = new Date(wallClockGuess.getTime() - firstOffset)
  const secondOffset = getTimeZoneOffsetMs(firstUtc, BOOKING_TIME_ZONE)
  return new Date(wallClockGuess.getTime() - secondOffset)
}

export function zonedDateHourToUtc(date: string, hour: number) {
  return zonedDateTimeToUtc(date, hour)
}

export function getTimeSlotsForDay(date: string) {
  const slots: { start: Date; end: Date }[] = []
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    const start = zonedDateHourToUtc(date, hour)
    const end = new Date(start.getTime() + SLOT_DURATION_HOURS * 60 * 60 * 1000)
    slots.push({ start, end })
  }
  return slots
}

export function formatDateForDisplay(date: string) {
  return zonedDateHourToUtc(date, 12).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: BOOKING_TIME_ZONE,
  })
}

export function formatTimeForDisplay(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: BOOKING_TIME_ZONE,
  })
}

export function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

export function slotIsoSetForDate(date: string) {
  return new Set(getTimeSlotsForDay(date).map(({ start }) => start.toISOString()))
}

export function groupConsecutiveSlotIsos(slots: string[]) {
  const sorted = Array.from(new Set(slots)).sort((a, b) => Date.parse(a) - Date.parse(b))
  const groups: string[][] = []
  let current: string[] = []

  for (const slot of sorted) {
    if (!current.length) {
      current = [slot]
      continue
    }

    const previous = current[current.length - 1]
    const consecutive = Date.parse(slot) - Date.parse(previous) === SLOT_DURATION_HOURS * 60 * 60 * 1000
    if (consecutive) current.push(slot)
    else {
      groups.push(current)
      current = [slot]
    }
  }

  if (current.length) groups.push(current)
  return groups
}

export function describeSlotRanges(slots: string[]) {
  return groupConsecutiveSlotIsos(slots)
    .map((group) => {
      const start = new Date(group[0])
      const end = addHours(new Date(group[group.length - 1]), 1)
      return `${formatTimeForDisplay(start)}-${formatTimeForDisplay(end)}`
    })
    .join(', ')
}

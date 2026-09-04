import { randomUUID } from 'node:crypto'
import { STUDIOS } from './catalog'
import type { BookingCartItem, TourBookingDetails } from './calendar'


export function tourReservationCart(tour: Pick<TourBookingDetails, 'date' | 'slot'>): BookingCartItem[] {
  // A tour currently requires all rooms to be free. Acquiring the exact same
  // room/resource ledgers as paid checkout closes the cross-flow race too.
  return STUDIOS.map((studio) => ({
    studioId: studio.id, studioName: studio.name, date: tour.date,
    slots: [tour.slot], hours: 0.5, price: 0,
  }))
}

export interface TourReservationDependencies {
  acquire: (cart: BookingCartItem[], ref: string, expiresAt: Date) => Promise<{ ok: boolean; status: number; error: string }>
  availability: (date: string, slot: string, excludedRef: string) => Promise<{ ok: boolean; status: number; error: string }>
  insert: (tour: TourBookingDetails) => Promise<void>
  release: (cart: BookingCartItem[], ref: string) => Promise<void>
  exists: (tour: TourBookingDetails) => Promise<boolean>
  now?: () => Date
}

export interface TourReservationResult { ok: boolean; status: number; error: string; alreadyReserved?: boolean }

export async function reserveTour(tour: TourBookingDetails, dependencies: TourReservationDependencies): Promise<TourReservationResult> {
  if (await dependencies.exists(tour)) return { ok: true, status: 200, error: '', alreadyReserved: true }
  const initialAvailability = await dependencies.availability(tour.date, tour.slot, '')
  if (!initialAvailability.ok) return initialAvailability
  const ref = `tour-${randomUUID()}`
  const reservedTour = { ...tour, reservationRef: ref }
  const cart = tourReservationCart(tour)
  const now = dependencies.now?.() || new Date()
  const hold = await dependencies.acquire(cart, ref, new Date(now.getTime() + 30 * 60_000))
  if (!hold.ok) return hold
  const availability = await dependencies.availability(tour.date, tour.slot, ref)
  if (!availability.ok) {
    const alreadyReserved = await dependencies.exists(tour)
    await dependencies.release(cart, ref)
    return alreadyReserved ? { ok: true, status: 200, error: '', alreadyReserved: true } : availability
  }
  try {
    await dependencies.insert(reservedTour)
  } catch (error) {
    // A timed-out insert may have committed. Verify before releasing the hold
    // or telling the visitor the reservation failed.
    if (!(await dependencies.exists(tour))) {
      await dependencies.release(cart, ref)
      throw error
    }
  }
  await dependencies.release(cart, ref)
  return { ok: true, status: 200, error: '' }
}

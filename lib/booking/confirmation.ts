import type Stripe from 'stripe'
import { createHash } from 'node:crypto'
import { hasMatchingBookingAddOnTotal } from './add-ons'
import { hasCompleteBookingCartMetadata, parseBookingCartItems } from './checkout-metadata'
import { describeSlotRanges, formatBookingDuration, formatDateForDisplay } from './time'
import type { BookingConfirmation } from './confirmation-state'
import { bookingNeedsAttention } from './fulfillment-state'
import { bookingSetupDescription } from './studio-setups'

export interface BookingConfirmationDependencies {
  retrieveSession: (sessionId: string) => Promise<Stripe.Checkout.Session>
  verifyManagementToken: (token: string, sessionId: string, bookingRef: string) => boolean
}

function hasTimestamp(value: string | undefined) {
  return Boolean(value) && Number.isFinite(Date.parse(value || ''))
}

export async function getBookingConfirmation(
  sessionId: string | null,
  managementToken: string,
  dependencies: BookingConfirmationDependencies,
): Promise<BookingConfirmation> {
  if (!sessionId) return { status: 'missing' }
  if (sessionId.length > 256 || !/^cs_(?:live|test)_[A-Za-z0-9]+$/.test(sessionId)) {
    return { status: 'unverified' }
  }
  try {
    const session = await dependencies.retrieveSession(sessionId)
    const metadata = session.metadata || {}
    if (session.id !== sessionId || session.mode !== 'payment' || metadata.bookingHoldVersion !== '1' || !metadata.bookingRef) {
      return { status: 'unverified' }
    }
    if (session.status === 'expired') return { status: 'expired' }
    if (session.status !== 'complete' || session.payment_status !== 'paid') return { status: 'not_paid' }

    const cart = parseBookingCartItems(metadata)
    const expectedTotal = Number(metadata.computedTotalCents)
    if (!hasCompleteBookingCartMetadata(metadata, cart)
      || !Number.isSafeInteger(expectedTotal) || expectedTotal <= 0
      || session.amount_total !== expectedTotal || session.currency !== 'usd'
      || !hasMatchingBookingAddOnTotal(metadata, cart)) {
      return { status: 'unverified' }
    }

    const result: BookingConfirmation = {
      status: bookingNeedsAttention(metadata)
        ? 'attention'
        : hasTimestamp(metadata.vbsCalendarSyncedAt) ? 'confirmed' : 'processing',
      emailSent: hasTimestamp(metadata.vbsConfirmationSentAt),
    }
    // A URL alone reveals status only. Details require signed checkout authority.
    if (managementToken && dependencies.verifyManagementToken(managementToken, sessionId, metadata.bookingRef)) {
      if (result.status === 'confirmed' && session.livemode === true) {
        result.purchase = {
          transactionId: `vbs_${createHash('sha256').update(`purchase:${metadata.bookingRef}`).digest('hex').slice(0, 32)}`,
          value: expectedTotal / 100,
          currency: 'USD',
          items: cart.map((item) => ({ itemId: item.studioId, quantity: 1 })),
        }
      }
      result.summary = {
        totalPaid: expectedTotal / 100,
        sessions: cart.map((item) => ({
          studioName: item.studioName,
          date: formatDateForDisplay(item.date),
          time: `${describeSlotRanges(item.slots)} Pacific`,
          duration: formatBookingDuration(item.slots.length),
          ...(bookingSetupDescription(item.studioId, item.setupId) ? { setupDescription: bookingSetupDescription(item.studioId, item.setupId) } : {}),
          addOns: (item.addOns || []).map((addOn) => ({
            name: addOn.name, hourlyRate: addOn.hourlyRateCents / 100, amount: addOn.amountCents / 100,
          })),
        })),
      }
    }
    return result
  } catch {
    // Never expose Stripe errors, identifiers, or customer data.
    return { status: 'error' }
  }
}

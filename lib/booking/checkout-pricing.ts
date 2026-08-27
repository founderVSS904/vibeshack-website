import type { BookingCartItem } from './calendar'
import type Stripe from 'stripe'
import { bookingAddOnTotalCents, priceBookingAddOns } from './add-ons'
import { calculateRecurringDiscountCents, getStudioById } from './catalog'
import { bookingHoursForSlotCount, bookingPriceCents, describeSlotRanges, formatBookingDuration, formatDateForDisplay, hasConsecutiveBookingSlots, isValidBookingDate, slotIsoSetForDate } from './time'
import { stripControlChars } from '../server/sanitize'

export function buildCanonicalBookingCart(rawCart: unknown): BookingCartItem[] {
  if (!Array.isArray(rawCart) || rawCart.length > 20) throw new Error('Invalid cart item')
  return rawCart.map((rawItem) => {
    if (!rawItem || typeof rawItem !== 'object') throw new Error('Invalid cart item')
    const studio = getStudioById(stripControlChars(rawItem.studioId, 80))
    const date = stripControlChars(rawItem.date, 20)
    if (!Array.isArray(rawItem.slots) || !rawItem.slots.every((slot: unknown) => typeof slot === 'string' && Number.isFinite(Date.parse(slot)))) {
      throw new Error('Invalid cart item')
    }
    const slots: string[] = [...rawItem.slots].sort((a: string, b: string) => Date.parse(a) - Date.parse(b))
    if (!studio || !isValidBookingDate(date) || !hasConsecutiveBookingSlots(slots)) {
      throw new Error('Invalid cart item')
    }
    const canonicalSlots = slotIsoSetForDate(date)
    if (!slots.every((slot) => canonicalSlots.has(slot))) throw new Error('Invalid cart item')
    return {
      studioId: studio.id,
      studioName: studio.name,
      date,
      slots,
      hours: bookingHoursForSlotCount(slots.length),
      price: bookingPriceCents(studio.price, slots.length) / 100,
      addOns: priceBookingAddOns(rawItem.addOnIds, slots.length),
    }
  })
}

export function buildBookingCheckoutLineItems(
  cart: BookingCartItem[],
  pricing: ReturnType<typeof calculateBookingCheckoutPricing>,
  imageUrl: string,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.map((item, index) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: `${item.studioName} - VibeShack Studios`,
        description: `${formatDateForDisplay(item.date)} - ${describeSlotRanges(item.slots)} - ${formatBookingDuration(item.slots.length)}${pricing.discountCents ? ' - recurring discount applied' : ''}`,
        images: [imageUrl],
      },
      unit_amount: pricing.discountedSessionAmounts[index],
    },
    quantity: 1,
  }))
  for (const item of cart) {
    for (const addOn of item.addOns || []) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${addOn.name} - ${item.studioName}`,
            description: `$${(addOn.hourlyRateCents / 100).toFixed(2)}/hr for ${formatBookingDuration(item.slots.length)} on ${formatDateForDisplay(item.date)}. Recurring discounts do not apply.`,
          },
          unit_amount: addOn.amountCents,
        },
        quantity: 1,
      })
    }
  }
  return lineItems
}

export function calculateBookingCheckoutPricing(cart: BookingCartItem[], recurring?: string | null) {
  const amounts = cart.map((item) => Math.round(item.price * 100))
  const baseSessionTotalCents = amounts.reduce((sum, amount) => sum + amount, 0)
  const discountCents = calculateRecurringDiscountCents(baseSessionTotalCents, recurring)
  let remaining = Math.min(discountCents, baseSessionTotalCents - amounts.length)
  const discountedSessionAmounts = amounts.map((amount, index) => {
    if (discountCents <= 0) return amount
    const share = index === amounts.length - 1 ? remaining : Math.round(discountCents * amount / baseSessionTotalCents)
    const discount = Math.min(Math.max(share, 0), amount - 1, remaining)
    remaining -= discount
    return amount - discount
  })
  const addOnTotalCents = cart.reduce((sum, item) => sum + bookingAddOnTotalCents(item.addOns), 0)
  return {
    baseSessionTotalCents,
    discountCents,
    discountedSessionAmounts,
    addOnTotalCents,
    computedTotalCents: discountedSessionAmounts.reduce((sum, amount) => sum + amount, 0) + addOnTotalCents,
  }
}

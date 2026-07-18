/**
 * VibeShack GA4 Event Tracking Library
 * Centralized analytics event tracking for conversion funnel
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

// GA4 Event Types
export enum GAEventType {
  // Page & Navigation
  PAGE_VIEW = 'page_view',

  // CTA Button Clicks
  CLICK_BOOK_NOW = 'click_book_now',
  CLICK_LEARN_MORE = 'click_learn_more',
  CLICK_BOOK_SESSION = 'click_book_session',
  CLICK_INQUIRY = 'click_inquiry',

  // Booking Flow
  VIEW_BOOKING_PAGE = 'view_booking_page',
  SELECT_STUDIO = 'select_studio',
  SELECT_DATE = 'select_date',
  SELECT_TIME_SLOT = 'select_time_slot',
  VIEW_CART = 'view_cart',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  CLICK_CHECKOUT = 'click_checkout',

  // Checkout Flow
  BEGIN_CHECKOUT = 'begin_checkout',
  ADD_PAYMENT_INFO = 'add_payment_info',
  PAYMENT_SUCCESS = 'purchase',
  PAYMENT_FAILURE = 'purchase_failed',

  // Form Submissions
  FORM_START_CONTACT = 'form_start_contact',
  FORM_SUBMIT_CONTACT = 'form_submit_contact',
  FORM_SUBMIT_INQUIRY = 'form_submit_inquiry',
  FORM_SUBMIT_TOUR = 'form_submit_tour',

  // Engagement
  FORM_FIELD_FOCUS = 'form_field_focus',
  FORM_FIELD_ERROR = 'form_field_error',
  SCROLL_DEPTH = 'scroll_depth',
  VIEW_STUDIO_DETAILS = 'view_studio_details',

  // Add-ons & Options

  // Guest Entry / Additional Fields
  ADD_GUEST = 'add_guest',
  FILL_GUEST_INFO = 'fill_guest_info',
}

// GTM DataLayer event interface
export interface GAEvent {
  event: string
  [key: string]: string | number | boolean | object | undefined
}

/**
 * Send event to GA4 via gtag
 */
export const sendGAEvent = (eventType: GAEventType | string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventType, {
      timestamp: new Date().toISOString(),
      ...params,
    })
  }
}

/**
 * Track booking flow steps
 */
export const trackBookingStep = (
  step: 'studio_select' | 'date_select' | 'time_select' | 'cart_view' | 'checkout_start' | 'payment_attempt',
  params?: Record<string, unknown>
) => {
  const eventMap = {
    studio_select: GAEventType.SELECT_STUDIO,
    date_select: GAEventType.SELECT_DATE,
    time_select: GAEventType.SELECT_TIME_SLOT,
    cart_view: GAEventType.VIEW_CART,
    checkout_start: GAEventType.BEGIN_CHECKOUT,
    payment_attempt: GAEventType.ADD_PAYMENT_INFO,
  }

  sendGAEvent(eventMap[step], {
    booking_step: step,
    timestamp: new Date().toISOString(),
    ...params,
  })
}

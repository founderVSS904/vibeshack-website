/**
 * VibeShack GA4 Event Tracking Library
 * Centralized analytics event tracking for conversion funnel
 */

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
  SELECT_ADDON = 'select_addon',
  DESELECT_ADDON = 'deselect_addon',
  
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
export const sendGAEvent = (eventType: GAEventType | string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventType, {
      timestamp: new Date().toISOString(),
      ...params,
    })
  }
}

/**
 * Track page views with UTM parameters
 */
export const trackPageView = (pathname: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    let utmParams: Record<string, string | null> = {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    }
    
    try {
      const urlObj: any = new (window as any).URL(window.location.href)
      utmParams = {
        utm_source: urlObj.searchParams.get('utm_source'),
        utm_medium: urlObj.searchParams.get('utm_medium'),
        utm_campaign: urlObj.searchParams.get('utm_campaign'),
        utm_content: urlObj.searchParams.get('utm_content'),
        utm_term: urlObj.searchParams.get('utm_term'),
      }
    } catch (e) {
      // Fallback if URL parsing fails
    }
    
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA4_ID, {
      page_path: pathname,
      page_title: document.title,
      ...utmParams,
    })
  }
}

/**
 * Track conversion (purchase/booking)
 */
export const trackConversion = (
  conversionType: 'booking' | 'inquiry' | 'contact',
  params?: {
    value?: number
    currency?: string
    studioName?: string
    studioId?: string
    [key: string]: any
  }
) => {
  sendGAEvent(GAEventType.PAYMENT_SUCCESS, {
    conversion_type: conversionType,
    transaction_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...params,
  })
}

/**
 * Track CTA button clicks with context
 */
export const trackCTAClick = (
  buttonText: string,
  location: string,
  destination?: string
) => {
  sendGAEvent(GAEventType.CLICK_BOOK_NOW, {
    button_text: buttonText,
    button_location: location,
    destination_url: destination || window.location.pathname,
  })
}

/**
 * Track form interactions
 */
export const trackFormInteraction = (
  formName: string,
  action: 'start' | 'field_focus' | 'field_error' | 'submit',
  fieldName?: string
) => {
  const eventMap = {
    start: GAEventType.FORM_START_CONTACT,
    field_focus: GAEventType.FORM_FIELD_FOCUS,
    field_error: GAEventType.FORM_FIELD_ERROR,
    submit: GAEventType.FORM_SUBMIT_CONTACT,
  }

  sendGAEvent(eventMap[action], {
    form_name: formName,
    field_name: fieldName,
  })
}

/**
 * Track booking flow steps
 */
export const trackBookingStep = (
  step: 'studio_select' | 'date_select' | 'time_select' | 'cart_view' | 'checkout_start' | 'payment_attempt',
  params?: Record<string, any>
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

/**
 * Track scroll depth (for engagement measurement)
 */
export const trackScrollDepth = (percentageScrolled: number) => {
  sendGAEvent(GAEventType.SCROLL_DEPTH, {
    scroll_depth_percent: Math.round(percentageScrolled),
  })
}

export default {
  sendGAEvent,
  trackPageView,
  trackConversion,
  trackCTAClick,
  trackFormInteraction,
  trackBookingStep,
  trackScrollDepth,
}

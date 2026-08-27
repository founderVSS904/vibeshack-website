import { bookingAddOnDescription, type BookingAddOn } from './add-ons'
import { escapeHtml } from '../server/sanitize'

export function bookingAddOnsEmailHtml(
  addOns: BookingAddOn[] = [],
  includePrices = true,
  color = '#cbd5e1',
) {
  return addOns.map((addOn) => {
    const detail = includePrices ? bookingAddOnDescription(addOn) : addOn.name
    return `<p style="color:${escapeHtml(color)};font-size:13px;line-height:1.65;margin:8px 0 0;">Selected add-on: ${escapeHtml(detail)}</p>`
  }).join('')
}

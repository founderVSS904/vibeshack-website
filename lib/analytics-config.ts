export function validMeasurementId(value: string | undefined): value is string {
  return Boolean(value && /^G-[A-Z0-9]{6,20}$/.test(value) && value !== 'G-PLACEHOLDER')
}

export function analyticsLocation(href: string) {
  try {
    const url = new URL(href)
    return /^https?:$/.test(url.protocol) ? `${url.origin}${url.pathname}` : ''
  } catch { return '' }
}

export function analyticsReferrer(href: string) {
  try {
    const url = new URL(href)
    return /^https?:$/.test(url.protocol) ? url.origin : ''
  } catch { return '' }
}

export function analyticsBootstrap(measurementId: string) {
  if (!validMeasurementId(measurementId)) return ''
  return `window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js',new Date());
var referrer='';try{referrer=new URL(document.referrer).origin;}catch(e){}
gtag('config',${JSON.stringify(measurementId)},{send_page_view:false,page_location:window.location.origin+window.location.pathname,page_referrer:referrer,allow_google_signals:false,allow_ad_personalization_signals:false});`
}

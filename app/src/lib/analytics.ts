/**
 * Cloudflare Web Analytics: page views per path (so which projects get
 * opened), no cookies and no personal data. Off unless the build sets
 * VITE_CF_ANALYTICS_TOKEN — the token from the Web Analytics dashboard.
 * `spa: true` counts client-side route changes as page views.
 */
export function startAnalytics() {
  const token = import.meta.env.VITE_CF_ANALYTICS_TOKEN
  if (!token) return
  const script = document.createElement('script')
  script.defer = true
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  script.dataset.cfBeacon = JSON.stringify({ token, spa: true })
  document.head.append(script)
}

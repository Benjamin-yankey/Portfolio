import { useEffect, useRef } from 'react'

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      theme?: 'auto' | 'light' | 'dark'
      callback?: (token: string) => void
      'expired-callback'?: () => void
      'error-callback'?: () => void
    },
  ) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let scriptLoad: Promise<TurnstileApi> | undefined

/** Loads Cloudflare's Turnstile script once, only when a form needs it. */
function loadTurnstile(): Promise<TurnstileApi> {
  scriptLoad ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile missing')))
    script.onerror = () => reject(new Error('turnstile failed to load'))
    document.head.append(script)
  })
  return scriptLoad
}

interface TurnstileWidgetProps {
  siteKey: string
  /** Called with a fresh token, or '' when it expires or fails. */
  onToken: (token: string) => void
}

/** Cloudflare Turnstile spam check — usually invisible, sometimes a checkbox. */
export function TurnstileWidget({ siteKey, onToken }: Readonly<TurnstileWidgetProps>) {
  const container = useRef<HTMLDivElement>(null)
  // Kept in a ref so a new callback identity doesn't re-render the widget.
  const tokenHandler = useRef(onToken)
  useEffect(() => {
    tokenHandler.current = onToken
  })

  useEffect(() => {
    let widgetId: string | undefined
    let cancelled = false
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return
        widgetId = turnstile.render(container.current, {
          sitekey: siteKey,
          theme: 'auto',
          callback: (token) => tokenHandler.current(token),
          'expired-callback': () => tokenHandler.current(''),
          'error-callback': () => tokenHandler.current(''),
        })
      })
      .catch(() => tokenHandler.current(''))
    return () => {
      cancelled = true
      if (widgetId) window.turnstile?.remove(widgetId)
    }
  }, [siteKey])

  return <div ref={container} className="mb-5 min-h-[65px]" />
}

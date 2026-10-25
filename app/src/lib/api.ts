/**
 * Client for the site's small API (worker/ — the contact form and the
 * assistant). The Cloudflare build calls it on the same origin; the GitHub
 * Pages build sets VITE_API_BASE to the Worker's URL. Every caller has an
 * offline fallback, because the API may be missing (local dev without
 * `wrangler dev`) or have a feature switched off.
 */
const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

export interface ApiStatus {
  chat: boolean
  contact: boolean
  turnstileSiteKey: string | null
}

const OFFLINE: ApiStatus = { chat: false, contact: false, turnstileSiteKey: null }

let status: Promise<ApiStatus> | undefined

/** Which API features are switched on — fetched once per visit. */
export function getApiStatus(): Promise<ApiStatus> {
  status ??= fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(4000) })
    .then((response) => (response.ok ? (response.json() as Promise<ApiStatus>) : OFFLINE))
    .catch(() => OFFLINE)
  return status
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, code: string) {
    super(code)
    this.status = status
  }
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  })
  const data = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) throw new ApiError(response.status, data.error ?? 'request-failed')
  return data
}

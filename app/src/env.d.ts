// Build-time settings (all optional; see .env.example).
interface ImportMetaEnv {
  /** Where the API lives. Empty means same origin (the Cloudflare build). */
  readonly VITE_API_BASE?: string
  /** Cloudflare Web Analytics token; analytics are off without it. */
  readonly VITE_CF_ANALYTICS_TOKEN?: string
}

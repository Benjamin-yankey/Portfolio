// Secrets set with `wrangler secret put` (or .dev.vars locally). They aren't
// in wrangler.jsonc, so `wrangler types` can't see them; each is optional
// because its feature reports itself off until the secret exists.
interface Env {
  ANTHROPIC_API_KEY?: string
  RESEND_API_KEY?: string
  TURNSTILE_SECRET_KEY?: string
  // CMS sign-in: a GitHub OAuth app with callback URL <worker>/api/callback.
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
}

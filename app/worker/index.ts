import { handleChat } from './chat'
import { handleContact } from './contact'
import { corsHeaders, isAllowedOrigin, json } from './http'

/**
 * The site's API. Only /api/* reaches this code (run_worker_first in
 * wrangler.jsonc); everything else is static files. Each feature is off
 * until its secret is set, and /api/health tells the site which are on so
 * it can fall back (mailto for the form, keyword answers for the chat).
 */
export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request)

    const cors = corsHeaders(request, env)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

    // CORS stops other sites reading responses, but not their POSTs from
    // running; refuse those outright. Requests with no Origin (curl, tests)
    // still pass, subject to the rate limits.
    const origin = request.headers.get('Origin')
    if (origin && !isAllowedOrigin(origin, env)) return json({ error: 'forbidden-origin' }, 403, cors)

    switch (`${request.method} ${url.pathname}`) {
      case 'GET /api/health':
        return json(
          {
            chat: Boolean(env.ANTHROPIC_API_KEY),
            contact: Boolean(env.RESEND_API_KEY),
            turnstileSiteKey: env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SITE_KEY ? env.TURNSTILE_SITE_KEY : null,
          },
          200,
          cors,
        )
      case 'POST /api/chat':
        return handleChat(request, env, cors)
      case 'POST /api/contact':
        return handleContact(request, env, cors)
      default:
        return json({ error: 'not-found' }, 404, cors)
    }
  },
} satisfies ExportedHandler<Env>

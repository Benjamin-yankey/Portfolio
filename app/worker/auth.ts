/**
 * GitHub sign-in for the CMS at /Portfolio/admin/ (Sveltia CMS, configured
 * with base_url = this Worker and auth_endpoint = api/auth).
 *
 * The CMS opens /api/auth in a popup; that redirects to GitHub, which comes
 * back to /api/callback with a code. The callback swaps the code for a token
 * and hands it to the CMS window with the postMessage handshake Decap-style
 * CMSs expect — but only to an origin in ALLOWED_ORIGINS (or this Worker's
 * own), so no other site can open the popup and collect a token.
 *
 * Needs GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET from a GitHub OAuth app
 * whose callback URL is <this Worker>/api/callback.
 */

const STATE_COOKIE = 'cms-oauth-state'
// GitHub scopes the CMS may ask for; anything else falls back to the default.
const ALLOWED_SCOPES = ['repo', 'public_repo', 'user', 'read:user', 'user:email']
const DEFAULT_SCOPE = 'repo,user'

function trustedOrigins(env: Env, self: string): string[] {
  return [
    self,
    ...env.ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]
}

function scopeFor(requested: string | null): string {
  const scopes = (requested ?? '').split(/[\s,]+/).filter(Boolean)
  return scopes.length > 0 && scopes.every((scope) => ALLOWED_SCOPES.includes(scope))
    ? scopes.join(',')
    : DEFAULT_SCOPE
}

/** JSON for embedding in a <script>, with `<` escaped so it can't end the tag. */
function inlineJson(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}

/**
 * The popup's last page: tells the CMS window it's ready, waits for the CMS
 * to answer, and sends the result back only if the CMS's origin is trusted.
 */
function resultPage(env: Env, self: string, result: { token: string } | { error: string; errorCode: string }): Response {
  const status = 'token' in result ? 'success' : 'error'
  const message = `authorization:github:${status}:${JSON.stringify({ provider: 'github', ...result })}`
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Signing in…</title></head><body><script>
(() => {
  const trusted = ${inlineJson(trustedOrigins(env, self))};
  const message = ${inlineJson(message)};
  window.addEventListener('message', ({ data, origin }) => {
    if (data !== 'authorizing:github' || !trusted.includes(origin)) return;
    window.opener?.postMessage(message, origin);
  });
  window.opener?.postMessage('authorizing:github', '*');
})();
</script></body></html>`
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-store',
      // One use only: clear the state cookie whatever the outcome.
      'Set-Cookie': `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/api/; Max-Age=0`,
    },
  })
}

/** GET /api/auth?provider=github&site_id=…&scope=… — starts the sign-in. */
export function handleAuthStart(request: Request, env: Env): Response {
  const url = new URL(request.url)
  const fail = (error: string, errorCode: string) => resultPage(env, url.origin, { error, errorCode })

  if (url.searchParams.get('provider') !== 'github') {
    return fail('Only GitHub sign-in is supported.', 'UNSUPPORTED_BACKEND')
  }
  // site_id is the hostname of the page running the CMS.
  const site = url.searchParams.get('site_id') ?? ''
  const allowedHosts = trustedOrigins(env, url.origin).map((origin) => new URL(origin).hostname)
  if (!allowedHosts.includes(site)) {
    return fail('This site is not allowed to use this sign-in.', 'UNSUPPORTED_DOMAIN')
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return fail('GitHub sign-in is not set up yet. Sign in with an access token instead.', 'MISCONFIGURED_CLIENT')
  }

  const state = crypto.randomUUID().replaceAll('-', '')
  const authorize = new URL('https://github.com/login/oauth/authorize')
  authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
  authorize.searchParams.set('redirect_uri', `${url.origin}/api/callback`)
  authorize.searchParams.set('scope', scopeFor(url.searchParams.get('scope')))
  authorize.searchParams.set('state', state)

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      'Set-Cookie': `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/; Max-Age=600`,
    },
  })
}

/** GET /api/callback?code=…&state=… — GitHub sends the visitor back here. */
export async function handleAuthCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const fail = (error: string, errorCode: string) => resultPage(env, url.origin, { error, errorCode })

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const expected = request.headers.get('Cookie')?.match(new RegExp(`(?:^|;\\s*)${STATE_COOKIE}=([0-9a-f]{32})`))?.[1]
  if (!code || !state) return fail('GitHub did not send an authorization code. Please try again.', 'AUTH_CODE_REQUEST_FAILED')
  if (!expected || state !== expected) return fail('The sign-in request expired or was tampered with. Please try again.', 'CSRF_DETECTED')
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return fail('GitHub sign-in is not set up yet.', 'MISCONFIGURED_CLIENT')
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/api/callback`,
      }),
    })
    const body: { access_token?: string; error?: string } = await response.json()
    if (!body.access_token) {
      console.error('GitHub token exchange failed', response.status, body.error)
      return fail('GitHub did not issue an access token. Please try again.', 'TOKEN_REQUEST_FAILED')
    }
    return resultPage(env, url.origin, { token: body.access_token })
  } catch (error) {
    console.error('GitHub token exchange errored', error)
    return fail('Could not reach GitHub. Please try again later.', 'TOKEN_REQUEST_FAILED')
  }
}

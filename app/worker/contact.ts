import { clientIp, json, readJson } from './http'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function field(body: Record<string, unknown> | null, name: string, max: number): string {
  const value = body?.[name]
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

async function passesTurnstile(token: string, ip: string, secret: string): Promise<boolean> {
  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  form.append('remoteip', ip)
  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form })
  const outcome: { success?: boolean } = await result.json()
  return outcome.success === true
}

/** Sends a contact-form message to CONTACT_TO through Resend. */
export async function handleContact(request: Request, env: Env, cors: Headers): Promise<Response> {
  if (!env.RESEND_API_KEY) return json({ error: 'not-configured' }, 503, cors)

  const ip = clientIp(request)
  const { success } = await env.CONTACT_LIMITER.limit({ key: ip })
  if (!success) return json({ error: 'rate-limited' }, 429, cors)

  const body = await readJson(request)
  // A hidden field people never see; anything in it came from a bot. Answer
  // as if it worked so the bot learns nothing.
  if (field(body, 'website', 200)) return json({ ok: true }, 200, cors)

  // Single-line fields lose their newlines so they can't reshape the subject line.
  const name = field(body, 'name', 100).replaceAll(/\s+/g, ' ')
  const email = field(body, 'email', 200)
  const subject = field(body, 'subject', 150).replaceAll(/\s+/g, ' ')
  const message = field(body, 'message', 5000)
  if (!name || !EMAIL_PATTERN.test(email) || message.length < 10) {
    return json({ error: 'invalid' }, 400, cors)
  }

  if (env.TURNSTILE_SECRET_KEY && !(await passesTurnstile(field(body, 'token', 2048), ip, env.TURNSTILE_SECRET_KEY))) {
    return json({ error: 'challenge-failed' }, 400, cors)
  }

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: `Portfolio: ${subject || 'New message'} — ${name}`,
      text: `${message}\n\n— ${name} <${email}>\nSent from the portfolio contact form.`,
    }),
  })
  if (!sent.ok) {
    console.error('Resend rejected the message', sent.status, await sent.text())
    return json({ error: 'send-failed' }, 502, cors)
  }
  return json({ ok: true }, 200, cors)
}

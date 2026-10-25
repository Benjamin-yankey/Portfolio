import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from './profile'
import { clientIp, json, readJson } from './http'

/** Messages of history the assistant sees (older ones are dropped). */
const MAX_MESSAGES = 12
const MAX_MESSAGE_CHARS = 1200
const REFUSAL_REPLY =
  "I can't help with that one. Try asking about Benjamin's projects, skills or experience."

type ChatMessage = Anthropic.Beta.BetaMessageParam

/** Keeps only well-formed user/assistant text turns, starting with a user turn. */
function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value)) return null
  const messages: ChatMessage[] = []
  for (const item of value.slice(-MAX_MESSAGES)) {
    if (item === null || typeof item !== 'object') return null
    const { role, content } = item as Record<string, unknown>
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null
    const text = content.trim().slice(0, MAX_MESSAGE_CHARS)
    if (text) messages.push({ role, content: text })
  }
  while (messages[0]?.role === 'assistant') messages.shift()
  return messages.at(-1)?.role === 'user' ? messages : null
}

export async function handleChat(request: Request, env: Env, cors: Headers): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) return json({ error: 'not-configured' }, 503, cors)

  const { success } = await env.CHAT_LIMITER.limit({ key: clientIp(request) })
  if (!success) return json({ error: 'rate-limited' }, 429, cors)

  const body = await readJson(request)
  const messages = parseMessages(body?.messages)
  if (!messages) return json({ error: 'bad-request' }, 400, cors)

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  // Server-side refusal fallback where the model supports it (Haiku has none).
  const fallback = env.CHAT_MODEL.startsWith('claude-haiku')
    ? {}
    : { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }

  try {
    const response = await client.beta.messages.create({
      model: env.CHAT_MODEL,
      // Short conversational answers; the cap bounds what one public
      // request can cost.
      max_tokens: 1500,
      output_config: { effort: 'low' },
      // The whole profile is one stable block, cached across visitors.
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages,
      ...fallback,
    })

    if (response.stop_reason === 'refusal') return json({ reply: REFUSAL_REPLY }, 200, cors)

    const reply = response.content
      .flatMap((block) => (block.type === 'text' ? [block.text] : []))
      .join('')
      .trim()
    if (!reply) return json({ error: 'empty-reply' }, 502, cors)
    return json({ reply }, 200, cors)
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: 'busy' }, 429, cors)
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      console.error('Anthropic credentials rejected', error.status)
      return json({ error: 'not-configured' }, 503, cors)
    }
    if (error instanceof Anthropic.APIError) {
      console.error('Anthropic API error', error.status, error.message)
      return json({ error: 'upstream' }, 502, cors)
    }
    console.error('Chat failed', error)
    return json({ error: 'upstream' }, 502, cors)
  }
}

import { type FormEvent, useEffect, useRef, useState } from 'react'
import { site } from '../data/site'
import { answerQuestion, SUGGESTED_QUESTIONS } from '../lib/faqBot'

interface ChatMessage {
  role: 'bot' | 'user'
  text: string
}

/**
 * A small floating widget, not a real conversation: every reply comes from
 * `answerQuestion`'s keyword match over the site's own CMS data, computed
 * synchronously, so there's no loading state or network round-trip to show.
 */
export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: `Hi! I'm a small assistant for ${site.name}'s portfolio. Ask me about skills, projects, experience, certifications, availability, or how to get in touch.`,
    },
  ])
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function ask(question: string) {
    const trimmed = question.trim()
    if (!trimmed) return
    const answer = answerQuestion(trimmed)
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }, { role: 'bot', text: answer }])
    setInput('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    ask(input)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close chat' : 'Ask a question'}
        className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-cream shadow-[0_12px_28px_rgba(26,26,26,0.28)] transition-transform duration-300 ease-editorial hover:-translate-y-1"
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>

      {isOpen && (
        <div className="fixed right-6 bottom-24 z-50 flex h-[min(520px,70vh)] w-[min(360px,88vw)] flex-col overflow-hidden rounded-2xl border border-line bg-cream shadow-[0_24px_60px_rgba(26,26,26,0.22)]">
          <div className="border-b border-line px-5 py-4">
            <p className="font-serif text-[1.05rem]">Ask about {site.name}</p>
            <p className="text-[0.78rem] text-muted">Answers pulled straight from the site.</p>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={[
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.88rem] leading-[1.5]',
                  message.role === 'user' ? 'ml-auto bg-ink text-cream' : 'bg-white/60 text-ink-soft',
                ].join(' ')}
              >
                {message.text}
              </div>
            ))}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 border-t border-line-soft px-5 py-3">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => ask(question)}
                  className="tag-pill transition-colors duration-300 ease-editorial hover:bg-ink hover:text-cream"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-line p-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question…"
              className="w-full rounded-full border border-line bg-white/60 px-4 py-2.5 text-[0.88rem] outline-none transition-colors duration-300 ease-editorial focus:border-ink"
            />
            <button
              type="submit"
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-cream transition-transform duration-300 ease-editorial hover:-translate-y-0.5"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

function ChatIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <path
        fill="currentColor"
        d="M4 4.5A1.5 1.5 0 0 1 5.5 3h13A1.5 1.5 0 0 1 20 4.5v10a1.5 1.5 0 0 1-1.5 1.5H9l-4 4v-4H5.5A1.5 1.5 0 0 1 4 14.5v-10Z"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <path fill="currentColor" d="M3 11.5 21 3l-8.5 18-2.2-7.3L3 11.5Z" />
    </svg>
  )
}

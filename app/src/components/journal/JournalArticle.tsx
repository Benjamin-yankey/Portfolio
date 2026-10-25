import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { findArticle, journalArticles, loadArticle } from '../../data/journal'
import { site } from '../../data/site'
import { renderMarkdown } from '../../lib/markdown'
import { Reveal } from '../Reveal'

/** "github.com/owner/repo/…" → "repo", for the "originally written in" line. */
function sourceName(href: string): string {
  const match = href.match(/github\.com\/[^/]+\/([^/#?]+)/)
  return match ? match[1] : new URL(href).hostname
}

/** A journal write-up published on the site at /journal/:slug. */
export function JournalArticle() {
  const { slug } = useParams()
  const entry = findArticle(slug)
  const [html, setHtml] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const body = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!entry?.slug) return
    document.title = `${entry.title} — ${site.wordmark}`
    let cancelled = false
    setHtml(null)
    setFailed(false)
    loadArticle(entry.slug)
      .then((source) => {
        if (cancelled) return
        if (source === null) setFailed(true)
        else setHtml(renderMarkdown(source))
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [entry])

  // Links in the write-up point at GitHub: open them in a new tab, and drop
  // anything that isn't an ordinary web, mail or in-page link.
  useEffect(() => {
    body.current?.querySelectorAll('a').forEach((link) => {
      const href = link.getAttribute('href') ?? ''
      if (/^https?:/.test(href)) {
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
      } else if (!/^(mailto:|#)/.test(href)) {
        link.removeAttribute('href')
      }
    })
  }, [html])

  if (!entry) return <Navigate to="/journal" replace />

  const index = journalArticles.indexOf(entry)
  const next = journalArticles[index + 1]

  return (
    <article className="section">
      <div className="container-page">
        {/* A narrower column than other pages: long-form reading. */}
        <div className="max-w-[760px]">
          <Reveal as="div" className="mb-10">
            <Link
              to="/journal"
              className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase transition-colors duration-300 ease-editorial hover:text-ink"
            >
              <span aria-hidden="true">←</span> Journal
            </Link>
          </Reveal>

          <Reveal as="p" className="eyebrow mb-5">
            {entry.date}
          </Reveal>
          <Reveal
            as="h1"
            delay={1}
            className="mb-6 font-serif text-[clamp(2.2rem,5.2vw,3.8rem)] leading-[1.06] tracking-[-0.01em]"
          >
            {entry.title}
          </Reveal>
          <Reveal as="p" delay={2} className="mb-6 text-[clamp(1.05rem,1.6vw,1.2rem)] leading-[1.6] text-ink-soft">
            {entry.excerpt}
          </Reveal>
          <Reveal as="p" delay={2} className="mb-[clamp(40px,6vw,64px)] border-b border-line pb-8 text-[0.88rem] text-muted">
            Originally written in{' '}
            <a
              href={entry.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              {sourceName(entry.href)} on GitHub ↗
            </a>
          </Reveal>

          {failed ? (
            <p className="text-[0.96rem] text-muted">
              This article couldn't be loaded.{' '}
              <a href={entry.href} className="text-ink underline underline-offset-4">
                Read it on GitHub
              </a>
              .
            </p>
          ) : html === null ? (
            <div className="min-h-[50vh]" aria-busy="true" />
          ) : (
            <div ref={body} className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />
          )}

          <nav aria-label="More writing" className="mt-[clamp(56px,8vw,88px)] border-t border-line pt-8">
            {next ? (
              <Link to={`/journal/${next.slug}`} className="group block">
                <span className="eyebrow mb-2 block">
                  Next <span aria-hidden="true">→</span>
                </span>
                <span className="font-serif text-[clamp(1.2rem,2.2vw,1.6rem)] leading-[1.25] transition-opacity duration-300 ease-editorial group-hover:opacity-60">
                  {next.title}
                </span>
              </Link>
            ) : (
              <Link to="/journal" className="eyebrow hover:text-ink">
                <span aria-hidden="true">←</span> All writing
              </Link>
            )}
          </nav>
        </div>
      </div>
    </article>
  )
}

import { Marked } from 'marked'

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

function escapeHtml(text: string): string {
  return text.replaceAll(/[&<>"']/g, (char) => ESCAPES[char])
}

const markdown = new Marked({
  gfm: true,
  renderer: {
    // Raw HTML inside a write-up is shown as text, never injected into the page.
    html: ({ text }) => escapeHtml(text),
  },
})

/** Markdown (GitHub-flavoured: tables, fenced code) to an HTML string. */
export function renderMarkdown(source: string): string {
  return markdown.parse(source, { async: false })
}

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { SEARCH_GROUPS, type SearchItem, searchSite } from '../lib/searchIndex'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

/** ⌘K search across pages, projects, skills, writing, repos and quick actions. */
export function CommandPalette({ isOpen, onClose }: Readonly<CommandPaletteProps>) {
  // Mounted only while open, so every open starts with an empty query.
  return isOpen ? <PaletteDialog onClose={onClose} /> : null
}

function PaletteDialog({ onClose }: Readonly<{ onClose: () => void }>) {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [notice, setNotice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => searchSite(query), [query])
  const activeItem = results[active] as SearchItem | undefined

  // Focus the input on open; hand focus back to whatever opened the
  // palette (usually the search button) when it closes.
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    inputRef.current?.focus()
    return () => previous?.focus()
  }, [])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function titleFor(item: SearchItem) {
    if (item.action.kind === 'toggle-theme') return `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
    return item.title
  }

  function run(item: SearchItem) {
    const { action } = item
    switch (action.kind) {
      case 'navigate':
        onClose()
        navigate(action.to)
        break
      case 'external':
        if (action.href.startsWith('mailto:')) window.location.href = action.href
        else window.open(action.href, '_blank', 'noopener,noreferrer')
        onClose()
        break
      case 'toggle-theme':
        // Stays open so the change is visible behind the palette.
        toggle()
        break
      case 'copy':
        navigator.clipboard
          .writeText(action.text)
          .then(() => setNotice(action.done))
          .catch(() => setNotice(`Couldn't copy — it's ${action.text}`))
        break
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (results.length > 0 && event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (i + 1) % results.length)
    } else if (results.length > 0 && event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (i - 1 + results.length) % results.length)
    } else if (event.key === 'Enter' && activeItem) {
      event.preventDefault()
      run(activeItem)
    } else if (event.key === 'Tab') {
      // The input is the only stop in the dialog; keep focus inside it.
      event.preventDefault()
    }
  }

  const groups = SEARCH_GROUPS.map((group) => ({
    group,
    items: results.map((item, index) => ({ item, index })).filter(({ item }) => item.group === group),
  })).filter((entry) => entry.items.length > 0)

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-panel/45 px-4 pt-[min(14vh,120px)] backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
        className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-line bg-cream shadow-[0_30px_80px_rgba(0,0,0,0.32)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-autocomplete="list"
            aria-activedescendant={activeItem ? `search-${activeItem.id}` : undefined}
            placeholder="Search projects, skills, writing…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
              setNotice('')
            }}
            onKeyDown={handleKeyDown}
            className="h-14 min-w-0 flex-1 bg-transparent text-[1rem] text-ink outline-none placeholder:text-muted"
          />
          <kbd className="rounded-md border border-line px-1.5 py-0.5 font-sans text-[10px] font-semibold tracking-[0.06em] text-muted">
            ESC
          </kbd>
        </div>

        <div
          id="search-results"
          role="listbox"
          ref={listRef}
          aria-label="Results"
          className="max-h-[min(60vh,440px)] overflow-y-auto p-2"
        >
          {groups.length === 0 ? (
            <p className="px-3 py-10 text-center text-[0.92rem] text-muted">
              Nothing matches “{query}”.
            </p>
          ) : (
            groups.map(({ group, items }) => (
              <div key={group} role="group" aria-labelledby={`search-group-${group}`}>
                <p id={`search-group-${group}`} className="eyebrow px-3 pt-3 pb-1.5">
                  {group}
                </p>
                {items.map(({ item, index }) => (
                  <div
                    key={item.id}
                    id={`search-${item.id}`}
                    role="option"
                    aria-selected={index === active}
                    data-index={index}
                    onMouseMove={() => setActive(index)}
                    onClick={() => run(item)}
                    className={[
                      'flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2.5',
                      index === active ? 'bg-surface/70' : '',
                    ].join(' ')}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[0.95rem] text-ink">{titleFor(item)}</span>
                      {item.subtitle && (
                        <span className="block truncate text-[0.8rem] text-muted">{item.subtitle}</span>
                      )}
                    </span>
                    {item.action.kind === 'external' && (
                      <span aria-hidden="true" className="shrink-0 text-[0.8rem] text-muted">
                        ↗
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-2.5 text-[0.75rem] text-muted">
          <span>↑ ↓ to move · Enter to open</span>
          <span aria-live="polite" className="text-ink-soft">
            {notice}
          </span>
        </div>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-muted">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

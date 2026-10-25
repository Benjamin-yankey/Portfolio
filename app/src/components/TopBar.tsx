import { Link } from "react-router-dom";
import { site } from "../data/site";
import { SEARCH_SHORTCUT } from "../hooks/useCommandPalette";
import { ThemeToggle } from "./ThemeToggle";

interface TopBarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSearch: () => void;
}

/** Fixed top bar: wordmark on the left; search, theme and the menu toggle on the right. */
export function TopBar({ isOpen, onToggle, onSearch }: Readonly<TopBarProps>) {
  return (
    <header className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between bg-cream px-6 py-5 sm:px-14 sm:py-6">
      <Link
        to="/home"
        className="font-serif text-xl leading-none tracking-[0.04em]"
        style={{ fontWeight: 500 }}
      >
        {site.wordmark}
      </Link>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <button
          type="button"
          onClick={onSearch}
          aria-label={`Search the site (${SEARCH_SHORTCUT})`}
          className="flex h-10 items-center gap-2.5 rounded-full border border-line px-3 text-ink-soft transition-colors duration-300 ease-editorial hover:border-ink hover:text-ink sm:px-4"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <span className="hidden text-[12px] font-semibold tracking-[0.08em] uppercase sm:inline">Search</span>
          <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted md:inline">
            {SEARCH_SHORTCUT}
          </kbd>
        </button>

        <ThemeToggle />

        <button
          type="button"
          className="flex items-center gap-3 px-2 py-2.5"
          onClick={onToggle}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="overlay-nav"
        >
          <span className="sr-only">
            {isOpen ? "Close navigation menu" : "Open navigation menu"}
          </span>
          <span
            className={[
              "relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-[350ms] ease-editorial",
              isOpen ? "border-ink bg-ink" : "border-ink bg-transparent",
            ].join(" ")}
          >
            <span
              className={[
                "absolute h-[1.5px] w-3.5 transition-all duration-[400ms] ease-editorial",
                isOpen
                  ? "translate-y-0 rotate-45 bg-cream"
                  : "-translate-y-[3px] rotate-0 bg-ink",
              ].join(" ")}
            />
            <span
              className={[
                "absolute h-[1.5px] w-3.5 transition-all duration-[400ms] ease-editorial",
                isOpen
                  ? "translate-y-0 -rotate-45 bg-cream"
                  : "translate-y-[3px] rotate-0 bg-ink",
              ].join(" ")}
            />
          </span>
        </button>
      </div>
    </header>
  );
}

import { Link } from "react-router-dom";
import { site } from "../data/site";

interface TopBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

/** Fixed top bar: wordmark on the left, hamburger/close toggle on the right. */
export function TopBar({ isOpen, onToggle }: Readonly<TopBarProps>) {
  return (
    <header className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between bg-cream px-6 py-5 sm:px-14 sm:py-6">
      <Link
        to="/home"
        className="font-serif text-xl leading-none tracking-[0.04em]"
        style={{ fontWeight: 500 }}
      >
        {site.wordmark}
      </Link>

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
    </header>
  );
}

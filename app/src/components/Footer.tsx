import { site } from '../data/site'
import { GitHubIcon, LinkedInIcon, EmailIcon } from './icons/SocialIcons'

export function Footer() {
  return (
    <footer className="py-[clamp(32px,5vw,48px)]">
      <div className="container-page flex flex-wrap items-center justify-between gap-4">
        <p className="text-[0.82rem] text-muted">{site.footerCopy}</p>
        <div className="flex gap-5">
          <a
            href={site.github}
            aria-label="GitHub"
            className="text-muted transition-colors duration-300 ease-editorial hover:text-ink"
          >
            <GitHubIcon size={16} />
          </a>
          <a
            href={site.linkedin}
            aria-label="LinkedIn"
            className="text-muted transition-colors duration-300 ease-editorial hover:text-ink"
          >
            <LinkedInIcon size={16} />
          </a>
          <a
            href={`mailto:${site.email}`}
            aria-label="Email"
            className="text-muted transition-colors duration-300 ease-editorial hover:text-ink"
          >
            <EmailIcon size={16} />
          </a>
        </div>
      </div>
    </footer>
  )
}

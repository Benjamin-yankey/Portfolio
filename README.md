# Benjamin Yankey — Portfolio

A React + Vite site (`app/`) with a small Cloudflare Worker API (`app/worker/`) for the contact form and the site assistant. Content lives in `app/src/content/` and is editable through Decap CMS at `/Portfolio/admin/`.

It's published in two places:

- **GitHub Pages** — <https://benjamin-yankey.github.io/Portfolio/> (`.github/workflows/deploy.yml`)
- **Cloudflare** — <https://benjamin-yankey-portfolio.hueywork.workers.dev/Portfolio/> (`.github/workflows/deploy-cloudflare.yml`), plus a preview URL for every pull request

## Working on it

All commands run in `app/`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server. For the API too, run `npx wrangler dev` alongside (port 8787). |
| `npm run build` | Type-check, build, and pre-render every route (`scripts/prerender.mjs`). |
| `npm run test:e2e` | Playwright tests against the build (run `npm run build` first). |
| `npm run lint` | oxlint. |
| `npm run deploy:cloudflare` | Build the Cloudflare bundle and deploy it with Wrangler. |
| `npm run sync:github` | Refresh the repo list and GitHub stats (also runs weekly). |
| `node scripts/make-image-variants.mjs` | Make 800px copies of new images in `public/images/projects/` (macOS). |

CI (`.github/workflows/ci.yml`) runs lint, type-checks, the build, the end-to-end tests and Lighthouse on every pull request.

## Switching features on

Everything works without these; each feature falls back until its key exists.

| Feature | Where | What to add |
| --- | --- | --- |
| Automatic Cloudflare deploys and PR previews | GitHub → Settings → Secrets → Actions | `CLOUDFLARE_API_TOKEN` (Cloudflare → My Profile → API Tokens → "Edit Cloudflare Workers" template) |
| AI site assistant | `npx wrangler secret put ANTHROPIC_API_KEY` | An Anthropic API key. Model: `CHAT_MODEL` in `app/wrangler.jsonc`. |
| Contact form email | `npx wrangler secret put RESEND_API_KEY` | A [Resend](https://resend.com) API key. Without a verified domain it only delivers to the Resend account's own address; set `CONTACT_TO` / `CONTACT_FROM` in `app/wrangler.jsonc`. |
| Contact form spam check | `npx wrangler secret put TURNSTILE_SECRET_KEY`, and `TURNSTILE_SITE_KEY` in `app/wrangler.jsonc` | A Cloudflare Turnstile widget's keys. |
| Analytics | GitHub → Settings → Variables → Actions | `CF_ANALYTICS_TOKEN` (Cloudflare → Web Analytics → add site → JS snippet token) |

For local testing of the API, copy `app/.dev.vars.example` to `app/.dev.vars`.

# Benjamin Yankey — Portfolio

A React + Vite site (`app/`) with a small Cloudflare Worker API (`app/worker/`) for the contact form and the site assistant. Content lives in `app/src/content/` and is editable in the browser through [Sveltia CMS](https://github.com/sveltia/sveltia-cms) — see [Editing content](#editing-content).

It's published in two places:

- **GitHub Pages** — <https://benjamin-yankey.github.io/Portfolio/>
- **Cloudflare** — <https://benjamin-yankey-portfolio.hueywork.workers.dev/Portfolio/>, plus a preview URL for every pull request

Both come from one pipeline, `.github/workflows/pipeline.yml`. Every push to `main` and every pull request is checked first — lint, type-check, build, end-to-end tests, Lighthouse — and only if that passes does it deploy: to both sites for `main`, to a Cloudflare preview for a pull request.

## Editing content

Open the editor on either copy of the site:

- <https://benjamin-yankey-portfolio.hueywork.workers.dev/Portfolio/admin/>
- <https://benjamin-yankey.github.io/Portfolio/admin/>

Saving commits to `main`, which runs the pipeline and redeploys both sites a few minutes later. There are three ways in:

- **Sign In with GitHub** — needs the one-time OAuth app setup below.
- **Sign In Using Access Token** — works now. Create a [fine-grained token](https://github.com/settings/personal-access-tokens/new) for `Benjamin-yankey/Portfolio` with **Contents: Read and write** and paste it in.
- **Work with Local Repository** — from `npm run dev` at <http://localhost:5173/Portfolio/admin/>, in Chrome or Edge: edits your local checkout directly, no sign-in.

**Setting up GitHub sign-in (once):** GitHub → Settings → Developer settings → OAuth Apps → New OAuth App, with

- Homepage URL: `https://benjamin-yankey-portfolio.hueywork.workers.dev/Portfolio/`
- Authorization callback URL: `https://benjamin-yankey-portfolio.hueywork.workers.dev/api/callback`

then copy the Client ID, generate a client secret, and in `app/` run `npx wrangler secret put GITHUB_CLIENT_ID` and `npx wrangler secret put GITHUB_CLIENT_SECRET`. The sign-in flow lives in `app/worker/auth.ts`; the editor's fields are defined in `app/public/admin/config.yml`.

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

To rerun the pipeline by hand: GitHub → Actions → Pipeline → Run workflow.

## Switching features on

Everything works without these; each feature falls back until its key exists.

| Feature | Where | What to add |
| --- | --- | --- |
| CMS "Sign In with GitHub" | `npx wrangler secret put GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` | A GitHub OAuth app — see [Editing content](#editing-content). |
| Automatic Cloudflare deploys and PR previews | GitHub → Settings → Secrets → Actions | `CLOUDFLARE_API_TOKEN` (Cloudflare → My Profile → API Tokens → "Edit Cloudflare Workers" template) |
| AI site assistant | `npx wrangler secret put ANTHROPIC_API_KEY` | An Anthropic API key. Model: `CHAT_MODEL` in `app/wrangler.jsonc`. |
| Contact form email | `npx wrangler secret put RESEND_API_KEY` | A [Resend](https://resend.com) API key. Without a verified domain it only delivers to the Resend account's own address; set `CONTACT_TO` / `CONTACT_FROM` in `app/wrangler.jsonc`. |
| Contact form spam check | `npx wrangler secret put TURNSTILE_SECRET_KEY`, and `TURNSTILE_SITE_KEY` in `app/wrangler.jsonc` | A Cloudflare Turnstile widget's keys. |
| Analytics | GitHub → Settings → Variables → Actions | `CF_ANALYTICS_TOKEN` (Cloudflare → Web Analytics → add site → JS snippet token) |

For local testing of the API, copy `app/.dev.vars.example` to `app/.dev.vars`.

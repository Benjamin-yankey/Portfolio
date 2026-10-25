// Assembles the Cloudflare upload from the regular build: the site in
// cf-dist/Portfolio/ (matching the /Portfolio/ base it's built with), plus the
// routing files from cloudflare/ at the root. Run after `vite build`.
import { cpSync, existsSync, rmSync } from 'node:fs'

const OUT = 'cf-dist'

if (!existsSync('dist/index.html')) {
  console.error('No dist/ build found — run `npm run build` first.')
  process.exit(1)
}

// Finder metadata that public/ picks up on macOS; it has no business online.
const skipJunk = (src) => !src.endsWith('.DS_Store')

rmSync(OUT, { recursive: true, force: true })
cpSync('dist', `${OUT}/Portfolio`, { recursive: true, filter: skipJunk })
cpSync('cloudflare', OUT, { recursive: true, filter: skipJunk })

console.log(`Cloudflare bundle ready in ${OUT}/`)

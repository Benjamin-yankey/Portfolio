import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * In `npm run dev`, /Portfolio/admin/ would fall through to the app's
 * index.html; serve the CMS's own page instead, as the static hosts do.
 */
function cmsAdminPage(): Plugin {
  return {
    name: 'cms-admin-page',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url === '/Portfolio/admin' || request.url === '/Portfolio/admin/') {
          request.url = '/Portfolio/admin/index.html'
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/Portfolio/',
  plugins: [react(), tailwindcss(), cmsAdminPage()],
  server: {
    // `npm run dev` talks to a local `npx wrangler dev` (port 8787) for the
    // API; without it, the contact form and assistant use their fallbacks.
    proxy: { '/api': 'http://localhost:8787' },
  },
})

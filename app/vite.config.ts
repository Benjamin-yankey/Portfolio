import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/Portfolio/',
  plugins: [react(), tailwindcss()],
  server: {
    // `npm run dev` talks to a local `npx wrangler dev` (port 8787) for the
    // API; without it, the contact form and assistant use their fallbacks.
    proxy: { '/api': 'http://localhost:8787' },
  },
})

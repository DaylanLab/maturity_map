import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path for GitHub Pages: site is served at https://daylanlab.github.io/maturity_map/
// Local dev still works at root.
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/maturity_map/' : '/',
  plugins: [react()],
  build: {
    // GitHub Pages serves from /docs on the master branch.
    outDir: 'docs',
    emptyOutDir: true,
  },
})

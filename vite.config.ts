import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages project site: https://zev-prog.github.io/rapp-order-form/
  base: process.env.GITHUB_PAGES === '1' ? '/rapp-order-form/' : '/',
})

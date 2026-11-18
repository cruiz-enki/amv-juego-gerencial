/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Base pública del sitio. Por defecto "/" (desarrollo local y Vercel, sin cambios).
// El workflow de GitHub Pages compila con PAGES_BASE=/amv-juego-gerencial/.
const base = process.env.PAGES_BASE || '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
})

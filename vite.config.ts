import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Panel interno: preferimos un único archivo cacheable aunque supere 500 kB.
    chunkSizeWarningLimit: 700,
  },
})

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Cada sección del panel viaja en su propio archivo; el vendor común
    // (React y Supabase) se cachea aparte y no se vuelve a descargar al navegar.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react'
          if (id.includes('node_modules/@supabase')) return 'supabase'
          return undefined
        },
      },
    },
  },
})

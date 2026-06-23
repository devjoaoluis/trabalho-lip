import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '#components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '#lib':        fileURLToPath(new URL('./src/lib',        import.meta.url)),
      '#hooks':      fileURLToPath(new URL('./src/hooks',      import.meta.url)),
      '#pages':      fileURLToPath(new URL('./src/pages',      import.meta.url)),
    },
  },
})

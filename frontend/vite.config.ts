import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Default can bind only to ::1 on Windows; then http://127.0.0.1:5173 refuses.
    host: true,
    port: 5173,
    // Same-origin /api → backend: avoids CORS when the app is opened as 127.0.0.1 vs localhost.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5051',
        changeOrigin: true,
      },
    },
  },
})

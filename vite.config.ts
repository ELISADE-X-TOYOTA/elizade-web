import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://elizade-backend-api-production.up.railway.app',
        changeOrigin: true,
      },
      '/media': {
        target: 'https://elizade-backend-api-production.up.railway.app',
        changeOrigin: true,
      },
    },
  },
})

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
        target: 'https://elizade-backend-api-production-0daa.up.railway.app/api/v1',
        changeOrigin: true,
      },
      '/media': {
        target: 'https://elizade-backend-api-production-0daa.up.railway.app/api/v1',
        changeOrigin: true,
      },
    },
  },
})

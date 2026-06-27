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
        // Backend is published by docker-compose on host port 8002 (8002->8000).
        target: 'http://localhost:8002',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:8002',
        changeOrigin: true,
      },
    },
  },
})

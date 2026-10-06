import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { postsIndexPlugin } from './scripts/posts-index-plugin'
import { feedsPlugin } from './scripts/feeds-plugin'

export default defineConfig({
  plugins: [postsIndexPlugin(), feedsPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    allowedHosts: true,
  }
})

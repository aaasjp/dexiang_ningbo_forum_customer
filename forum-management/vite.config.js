import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0', // 允许通过 IP 访问
    port: 5174,
    proxy: {
      '/api': {
        // target: 'http://220.154.134.61:8000',
        target: 'http://10.129.114.106:8000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})

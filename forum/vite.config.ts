import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/shsqlt/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0', // 允许通过 IP 访问
    port: 5173,
    proxy: {
      '/shsqltApi/api': {
        target: 'http://220.154.134.61:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/shsqltApi/, '')
      }
    }
  },
})

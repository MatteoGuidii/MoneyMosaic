import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: '../public/dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // React vendor chunk
          react: ['react', 'react-dom'],
          // Router chunk
          router: ['react-router-dom'],
          // Charts chunk (likely the largest)
          charts: ['recharts'],
          // Icons chunk
          icons: ['lucide-react'],
          // Utilities chunk
          utils: ['date-fns']
        }
      }
    },
    // Increase chunk size warning limit to 750kb
    chunkSizeWarningLimit: 750
  }
})

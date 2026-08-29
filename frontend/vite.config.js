import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — cached until React itself changes
          'vendor-react': ['react', 'react-dom'],
          // Router — separate from React so navigation updates don't bust react cache
          'vendor-router': ['react-router-dom'],
          // WebSocket / STOMP — only loaded on pages that need live tracking
          'vendor-stomp': ['@stomp/stompjs', 'sockjs-client'],
          // Lucide icons — large icon library, rarely changes
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      ignored: ['**/android/**', '**/dist/**', '**/node_modules/**'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/ws-quickcart': {
        target: 'http://localhost:8081',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/utils/**',
        'src/components/**',
        'src/context/**',
        'src/pages/**',
        'src/hooks/**',
      ],
      exclude: ['src/test/**', 'src/main.jsx'],
      thresholds: {
        lines: 70,
        branches: 60,
        functions: 70,
        statements: 70,
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/utils/**', 'src/components/**', 'src/context/**', 'src/pages/**'],
      exclude: ['src/test/**', 'src/main.jsx'],
      thresholds: {
        lines: 20,
        functions: 15,
        branches: 20,
        statements: 20,
      },
    },
  },
});

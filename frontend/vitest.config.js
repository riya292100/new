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
        lines: 75,
        statements: 75,
        branches: 60,
        functions: 50,
      },
    },
  },
});

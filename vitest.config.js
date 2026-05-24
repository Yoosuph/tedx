import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vitest configuration for the TEDxDutse site.
// - Uses jsdom so React/Testing Library tests can render components.
// - Loads tests/setup.js for jest-dom matchers and per-test mock resets.
// - Globals enabled so test files can use describe/it/expect without imports.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    css: false,
  },
});

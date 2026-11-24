// backend/vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 15000, // real DB calls need more than the 5s default
    hookTimeout: 15000,
  },
});
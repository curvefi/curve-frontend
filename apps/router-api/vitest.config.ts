import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    globals: true,
    exclude: ['dist/**'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
})

import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, '../../packages/primitives/src'),
    },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    globals: true,
    exclude: ['dist/**'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
})

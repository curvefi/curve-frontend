import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@curvefi/api-server': resolve(__dirname, '../../packages/api-server/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    globals: true,
    exclude: ['dist/**'],
  },
})

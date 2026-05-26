import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['../packages/*/src/**/*.{test,spec}.{js,ts}'],
  },
  resolve: {
    alias: [{ find: '@primitives', replacement: resolve(__dirname, '../packages/primitives/src') }],
  },
})

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['../packages/*/src/**/*.{test,spec}.{js,ts}'],
  },
})

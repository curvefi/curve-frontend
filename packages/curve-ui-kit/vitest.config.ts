import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@curvefi/prices-api': resolve(rootDir, '../prices-api/src/index.ts'),
      '@curvefi/prices-api/': `${resolve(rootDir, '../prices-api/src')}/`,
      '@primitives': resolve(rootDir, '../primitives/src'),
      '@ui-kit': resolve(rootDir, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.{ts,tsx}'],
  },
})

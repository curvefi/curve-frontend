import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@curvefi/prices-api': resolve(__dirname, '../prices-api/src'),
      '@primitives': resolve(rootDir, '../primitives/src'),
      '@ui': resolve(rootDir, 'src'),
    },
  },
  test: { environment: 'node', include: ['src/**/*.spec.{ts,tsx}'] },
})

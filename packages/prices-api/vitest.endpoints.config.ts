import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = dirname(fileURLToPath(import.meta.url))

const positiveIntegerFromEnv = (name: string, fallback: number) => {
  const value = Number.parseInt(process.env[name] ?? '', 10)

  return Number.isFinite(value) && value > 0 ? value : fallback
}

const endpointConcurrency = positiveIntegerFromEnv('PRICES_API_TEST_CONCURRENCY', 6)

export default defineConfig({
  resolve: {
    alias: {
      '@primitives': resolve(rootDir, '../primitives/src'),
    },
  },
  test: {
    environment: 'node',
    exclude: ['dist/**'],
    // Keep endpoint modules serial while still allowing `it.concurrent` cases inside each module.
    fileParallelism: false,
    hideSkippedTests: true,
    hookTimeout: 180_000,
    include: ['tests/**/*.test.ts'],
    // Reuse the worker environment so `tests/seeds.ts` once-loaders dedupe live seed calls across endpoint files.
    isolate: false,
    maxConcurrency: endpointConcurrency,
    reporters: ['tree'],
    slowTestThreshold: 500,
    testTimeout: 30_000,
  },
})

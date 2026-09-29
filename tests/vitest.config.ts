import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: [
      '../packages/*/src/**/*.{test,spec}.{js,ts}',
      '../apps/main/src/llamalend/**/*.{test,spec}.ts',
    ],
    // This hook spec imports the wallet connector, which reads `window` at module load.
    // It is not part of the node suite. The position-metric specs above are.
    exclude: ['../apps/main/src/llamalend/hooks/**'],
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, '../apps/main/src') },
      { find: '@primitives', replacement: resolve(__dirname, '../packages/primitives/src') },
      { find: '@evm-ui', replacement: resolve(__dirname, '../packages/evm-ui/src') },
      { find: '@ui', replacement: resolve(__dirname, '../packages/ui/src') },
    ],
  },
})

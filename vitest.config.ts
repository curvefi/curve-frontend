import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/primitives',
      'packages/api-server',
      'packages/ui',
      'packages/evm-ui',
      'apps/merkl-api',
      'apps/router-api',
    ],
  },
})

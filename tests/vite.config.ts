import { resolve } from 'path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: [
      { find: 'next/font/local', replacement: resolve(__dirname, 'cypress/fixtures/next-font-local.ts') },
      { find: '@cy', replacement: resolve(__dirname, './cypress') },
      { find: '@', replacement: resolve(__dirname, '../apps/main/src/') },
      { find: '@ui', replacement: resolve(__dirname, '../packages/ui/src/') },
      { find: '@ui-kit', replacement: resolve(__dirname, '../packages/curve-ui-kit/src') },
      { find: '@external-rewards', replacement: resolve(__dirname, '../packages/external-rewards/src/index.ts') },
      { find: '@curvefi/prices-api', replacement: resolve(__dirname, '../packages/prices-api/src') },
      { find: '@curvefi/prices-api/', replacement: resolve(__dirname, '../packages/prices-api/src/') },
    ],
  },
  define: {
    'process.env.CYPRESS_COMPONENT_TEST': '"true"',
  },
})

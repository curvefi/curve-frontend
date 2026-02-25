import { resolve } from 'path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'

export default defineConfig({
  cacheDir: resolve(__dirname, '../.cache/vite/tests'),
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: [
      { find: '@cy', replacement: resolve(__dirname, './cypress') },
      { find: '@', replacement: resolve(__dirname, '../apps/main/src/') },
      { find: '@ui', replacement: resolve(__dirname, '../packages/ui/src/') },
      { find: '@ui-kit', replacement: resolve(__dirname, '../packages/curve-ui-kit/src') },
      { find: '@external-rewards', replacement: resolve(__dirname, '../packages/external-rewards/src/index.ts') },
      { find: '@primitives', replacement: resolve(__dirname, '../packages/primitives/src') },
      { find: '@curvefi/prices-api', replacement: resolve(__dirname, '../packages/prices-api/src') },
      { find: '@curvefi/prices-api/', replacement: resolve(__dirname, '../packages/prices-api/src/') },
    ],
  },
  define: {
    'process.env.CYPRESS_COMPONENT_TEST': '"true"',
  },
})

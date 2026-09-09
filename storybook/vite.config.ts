import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  cacheDir: resolve(rootDir, '../.cache/vite/storybook'),
  build: { sourcemap: true },
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': resolve(rootDir, '../apps/main/src'),
      '@stellar': resolve(rootDir, '../apps/stellar/src'),
      '@legacy-ui': resolve(rootDir, '../packages/legacy-ui/src'),
      '@evm-ui': resolve(rootDir, '../packages/evm-ui/src'),
      '@ui': resolve(rootDir, '../packages/ui/src'),
      '@external-rewards': resolve(rootDir, '../packages/external-rewards/src/index.ts'),
      '@curvefi/prices-api': resolve(rootDir, '../packages/prices-api/src'),
      '@primitives': resolve(rootDir, '../packages/primitives/src'),
    },
  },
})

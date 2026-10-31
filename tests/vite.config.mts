import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { reactCompiler } from '../react-compiler.config.mts'

export default defineConfig({
  cacheDir: resolve(import.meta.dirname, '../.cache/vite/tests'),
  plugins: [react(), reactCompiler(), svgr()],
  resolve: {
    alias: [
      { find: '@cy', replacement: resolve(import.meta.dirname, './cypress') },
      { find: '@/stellar', replacement: resolve(import.meta.dirname, '../apps/stellar/src') },
      { find: '@', replacement: resolve(import.meta.dirname, '../apps/main/src/') },
      { find: '@legacy-ui', replacement: resolve(import.meta.dirname, '../packages/legacy-ui/src/') },
      { find: '@evm-ui', replacement: resolve(import.meta.dirname, '../packages/evm-ui/src') },
      { find: '@ui', replacement: resolve(import.meta.dirname, '../packages/ui/src') },
      {
        find: '@external-rewards',
        replacement: resolve(import.meta.dirname, '../packages/external-rewards/src/index.ts'),
      },
      { find: '@primitives', replacement: resolve(import.meta.dirname, '../packages/primitives/src') },
      { find: '@curvefi/prices-api', replacement: resolve(import.meta.dirname, '../packages/prices-api/src') },
      { find: '@curvefi/prices-api/', replacement: resolve(import.meta.dirname, '../packages/prices-api/src/') },
    ],
  },
  define: {
    'process.env.CYPRESS_COMPONENT_TEST': '"true"',
    'process.env.TEST_SEED': JSON.stringify(process.env.TEST_SEED ?? ''),
  },
})

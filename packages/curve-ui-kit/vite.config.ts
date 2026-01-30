import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

/** Configuration for Vite (used for storybook) */
export default defineConfig({
  cacheDir: resolve(__dirname, '../../.cache/vite/curve-ui-kit'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../apps/main/src'),
      '@cy': resolve(__dirname, '../../tests/cypress'), // storybook imports eip-6963 helpers from Cypress
      '@ui': resolve(__dirname, '../ui/src'),
      '@ui-kit': resolve(__dirname, './src'),
      '@external-rewards': resolve(__dirname, '../external-rewards/src/index.ts'),
      '@curvefi/prices-api': resolve(__dirname, '../prices-api/src'),
    },
  },
})

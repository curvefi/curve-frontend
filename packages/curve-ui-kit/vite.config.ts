import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

/** Configuration for Vite (used for storybook) */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ui': resolve(__dirname, '../ui/src'),
      '@ui-kit': resolve(__dirname, './src'),
      '@external-rewards': resolve(__dirname, '../external-rewards/src/index.ts'),
      '@curvefi/prices-api': resolve(__dirname, '../prices-api/src'),
    },
  },
})

import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  server: { port: 3000 },
  plugins: [reactRouter({})],
  ssr: {
    noExternal: ['styled-components'],
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, './src') },
      { find: '@ui', replacement: resolve(__dirname, '../../packages/ui/src/') },
      { find: '@ui-kit', replacement: resolve(__dirname, '../../packages/curve-ui-kit/src') },
      { find: '@external-rewards', replacement: resolve(__dirname, '../../packages/external-rewards/src/index.ts') },
      { find: '@curvefi/prices-api', replacement: resolve(__dirname, '../../packages/prices-api/src/index.ts') },
      { find: '@curvefi/prices-api/', replacement: resolve(__dirname, '../../packages/prices-api/src/') },
    ],
  },
})

import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  server: {
    port: 3000,
    hmr: true,
  },
  plugins: [reactRouter()],
  // ssr: {
  //   noExternal: ['styled-components', '@mui/material', '@mui/icons-material'],
  // },
  optimizeDeps: {
    include: ['styled-components', '@mui/material', '@mui/icons-material'],
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
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
}))

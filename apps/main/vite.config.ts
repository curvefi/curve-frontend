import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import vercel from 'vite-plugin-vercel'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  server: {
    port: 3000,
    hmr: true,
  },
  preview: { port: 3000 },
  plugins: [react(), svgr(), vercel()],
  optimizeDeps: {
    include: ['styled-components', '@mui/material', '@mui/icons-material'],
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, './src') },
      { find: '@ui', replacement: resolve(__dirname, '../../packages/ui/src/') },
      { find: '@ui-kit', replacement: resolve(__dirname, '../../packages/curve-ui-kit/src') },
      { find: '@external-rewards', replacement: resolve(__dirname, '../../packages/external-rewards/src/index.ts') },
      { find: '@curvefi/prices-api', replacement: resolve(__dirname, '../../packages/prices-api/src') },
    ],
  },
  define: {
    'process.env.NODE_ENV': command === 'serve' ? '"development"' : '"production"',
  },
  vercel: {
    rewrites: [
      {
        source: '/favicon',
        destination: '/favicon.ico',
      },
      {
        source: '/(.*)',
        destination: '/index.html',
      },
    ],
  },
}))

import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import vercel from 'vite-plugin-vercel'

const { API_PROXY_TARGET = 'http://localhost:3010', VERCEL_ENV } = process.env

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  // the local server starts on port 3000 by default, with hot module reload enabled and /api proxying
  server: {
    port: 3000,
    hmr: true,
    proxy: { '/api': { target: API_PROXY_TARGET, changeOrigin: true } },
    ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/.yarn/**'],
  },
  build: { sourcemap: [mode, VERCEL_ENV].some((target) => ['development', 'preview'].includes(target!)) },
  preview: { port: 3000 },
  cacheDir: resolve(__dirname, '../../.cache/vite/apps-main'),
  plugins: [react(), svgr(), vercel()],
  optimizeDeps: { include: ['styled-components', '@mui/material', '@mui/icons-material'] },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, './src') },
      { find: '@ui', replacement: resolve(__dirname, '../../packages/ui/src/') },
      { find: '@ui-kit', replacement: resolve(__dirname, '../../packages/curve-ui-kit/src') },
      { find: '@external-rewards', replacement: resolve(__dirname, '../../packages/external-rewards/src/index.ts') },
      { find: '@curvefi/prices-api', replacement: resolve(__dirname, '../../packages/prices-api/src') },
      { find: '@primitives', replacement: resolve(__dirname, '../../packages/primitives/src') },
    ],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(command === 'serve' ? 'development' : 'production'),
    'process.env.PUBLIC_MAINTENANCE_MESSAGE': JSON.stringify(process.env.PUBLIC_MAINTENANCE_MESSAGE),
  },
  vercel: {
    buildCommand: 'yarn build',
    rewrites: [
      { source: '/favicon', destination: '/favicon.ico' },
      { source: '/api/(.*)', destination: '/api/router' },
      { source: '/security.txt', destination: '/.well-known/security.txt', statusCode: 308 /* Permanent redirect */ },
      { source: '/(.*)', destination: '/index.html' },
    ],
  },
}))

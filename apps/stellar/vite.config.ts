import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import svgr from 'vite-plugin-svgr'
import vercel from 'vite-plugin-vercel'

const {
  SENTRY_AUTH_TOKEN,
  SENTRY_ORG,
  SENTRY_PROJECT,
  GITHUB_SHA,
  SENTRY_APPLICATION_KEY = 'curve-stellar',
} = process.env

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  server: { port: 3100, hmr: true, ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/.yarn/**'] },
  preview: { port: 3100 },
  build: { sourcemap: true },
  cacheDir: resolve(__dirname, '../../.cache/vite/apps-stellar'),
  plugins: [
    react(),
    svgr(),
    vercel(),
    ...(SENTRY_PROJECT
      ? sentryVitePlugin({
          applicationKey: SENTRY_APPLICATION_KEY,
          authToken: SENTRY_AUTH_TOKEN,
          org: SENTRY_ORG,
          project: SENTRY_PROJECT,
          ...(GITHUB_SHA && { release: { name: GITHUB_SHA } }),
          sourcemaps: { assets: './dist/**' },
          telemetry: false,
        })
      : []),
  ],
  optimizeDeps: { include: ['@mui/material', '@mui/icons-material'] },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, './src') },
      { find: '@ui', replacement: resolve(__dirname, '../../packages/ui/src') },
      { find: '@primitives', replacement: resolve(__dirname, '../../packages/primitives/src') },
    ],
  },
  define: { 'process.env.NODE_ENV': JSON.stringify(command === 'serve' ? 'development' : 'production') },
  vercel: {
    buildCommand: 'yarn build',
    rewrites: [
      { source: '/favicon', destination: '/favicon.ico' },
      { source: '/security.txt', destination: '/.well-known/security.txt', statusCode: 308 /* Permanent redirect */ },
      { source: '/(.*)', destination: '/index.html' },
    ],
  },
}))

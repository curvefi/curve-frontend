import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import svgr from 'vite-plugin-svgr'
import { vercel } from 'vite-plugin-vercel/vite'

const {
  SENTRY_AUTH_TOKEN,
  SENTRY_ORG,
  SENTRY_PROJECT,
  GITHUB_SHA,
  SENTRY_APPLICATION_KEY = 'curve-stellar',
} = process.env
const isVercelDeployment = process.env.VERCEL === '1'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  ...(isVercelDeployment && {
    builder: {
      // the plugin requires us to build the frontend, it only copies the files in dist
      buildApp: async builder => void (await builder.build(builder.environments.client)),
    },
  }),
  server: { port: 3100, hmr: true, ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/.yarn/**'] },
  preview: { port: 3100 },
  build: { sourcemap: true },
  cacheDir: resolve(__dirname, '../../.cache/vite/apps-stellar'),
  plugins: [
    react(),
    svgr(),
    ...(isVercelDeployment
      ? [
          vercel({
            rewrites: [
              { source: '/favicon', destination: '/favicon.ico' },
              { source: '/(.*)', destination: '/index.html', enforce: 'post' },
            ],
            redirects: [{ source: '/security.txt', destination: '/.well-known/security.txt', statusCode: 308 }],
          }),
        ]
      : []),
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
      { find: '@/stellar', replacement: resolve(__dirname, './src') },
      { find: '@ui', replacement: resolve(__dirname, '../../packages/ui/src') },
      { find: '@curvefi/prices-api', replacement: resolve(__dirname, '../../packages/prices-api/src') },
      { find: '@primitives', replacement: resolve(__dirname, '../../packages/primitives/src') },
    ],
  },
  define: { 'process.env.NODE_ENV': JSON.stringify(command === 'serve' ? 'development' : 'production') },
}))

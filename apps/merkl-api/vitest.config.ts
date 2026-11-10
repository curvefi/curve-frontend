import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@api-server': resolve(__dirname, '../../packages/api-server/src') } },
  test: { environment: 'node', include: ['test/**/*.test.ts'], globals: true, exclude: ['dist/**'] },
})

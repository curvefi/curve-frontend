import { type StatsListener, unwatchFile, watchFile } from 'node:fs'
import path from 'node:path'
import { build, type InlineConfig } from 'vite'

const watchers = new Map<string, StatsListener>()

/**
 * Custom Vite-based preprocessor for Cypress e2e. We use Vite instead of webpack to:
 * - avoid the webpack-specific resolution of optional wagmi connector peers
 * - keep bundling light-weight for specs
 * - consistent use of Vite across the monorepo
 */
export const vitePreprocessor = () => async (file: Cypress.FileObject) => {
  const { filePath, outputPath, shouldWatch } = file
  const testSeed = process.env.TEST_SEED ?? ''

  if (shouldWatch && !watchers.has(filePath)) {
    const listener: StatsListener = () => file.emit('rerun')
    watchers.set(filePath, listener)
    watchFile(filePath, { interval: 250, persistent: false }, listener)

    file.on('close', () => {
      if (watchers.get(filePath) !== listener) return
      unwatchFile(filePath, listener)
      watchers.delete(filePath)
    })
  }

  const fileName = path.basename(outputPath)
  const viteConfig = {
    configFile: path.resolve(__dirname, 'vite.config.ts'),
    logLevel: 'error',
    define: {
      // Shim process for browser-only bundles; some deps expect it to exist.
      'process.env': { TEST_SEED: testSeed },
      process: { env: { TEST_SEED: testSeed } },
    },
    build: {
      emptyOutDir: false,
      minify: false,
      outDir: path.dirname(outputPath),
      sourcemap: true,
      watch: null,
      write: true,
      lib: {
        entry: filePath,
        fileName: () => fileName,
        formats: ['umd'],
        name: path.basename(outputPath, path.extname(outputPath)),
      },
    },
  } satisfies InlineConfig

  await build(viteConfig)
  return outputPath
}

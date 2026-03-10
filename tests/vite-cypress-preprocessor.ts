import path from 'node:path'
import { build } from 'vite'

const cache = new Map<string, string>()

/**
 * Custom Vite-based preprocessor for Cypress e2e. We use Vite instead of webpack to:
 * - avoid the webpack-specific resolution of optional wagmi connector peers
 * - keep bundling light-weight for specs
 * - consistent use of Vite across the monorepo
 */
export const vitePreprocessor = () => async (file: Cypress.FileObject) => {
  const { filePath, outputPath, shouldWatch } = file
  if (cache.has(filePath)) return cache.get(filePath)!

  const filename = path.basename(outputPath)
  const filenameBase = path.basename(outputPath, path.extname(outputPath))
  const isHtml = filename.endsWith('.html')

  const viteConfig = {
    logLevel: 'error' as const,
    resolve: {
      alias: [{ find: '@primitives', replacement: path.resolve(__dirname, '../packages/primitives/src') }],
    },
    define: {
      // Shim process for browser-only bundles; some deps expect it to exist.
      'process.env': {},
      process: { env: {} },
    },
    build: {
      emptyOutDir: false, // do not clear between specs
      minify: false, // keep readable output for debugging
      outDir: path.dirname(outputPath),
      sourcemap: true,
      write: true, // emit to disk for Cypress to load
      watch: shouldWatch ? {} : null, // enable watch when interactive runner is used
      ...(isHtml
        ? {
            rollupOptions: {
              input: {
                [filenameBase]: filePath,
              },
            },
          }
        : {
            rollupOptions: {
              input: filePath,
              output: {
                format: 'iife', // avoid top-level imports in the runner
                inlineDynamicImports: true, // force a single bundle per spec
                entryFileNames: filename, // keep original name for Cypress loader
                manualChunks: undefined,
              },
            },
            lib: undefined,
          }),
    },
  }

  const watcher = await build(viteConfig as Record<string, unknown>)

  if (shouldWatch && 'on' in watcher) {
    watcher.on('event', (event: { code: string }) => {
      if (event.code === 'END') file.emit('rerun')
    })
    file.on('close', () => {
      cache.delete(filePath)
      watcher.close?.().catch((e) => {
        console.error('Error closing Vite watcher for Cypress spec:', e)
      })
    })
  }

  cache.set(filePath, outputPath)
  return outputPath
}

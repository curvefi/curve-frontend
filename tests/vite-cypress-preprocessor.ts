import path from 'node:path'
import { build } from 'vite'

type Compilation = { result: ReturnType<typeof Promise.withResolvers<string>>; pending: boolean; initial: boolean }

/**
 * Custom Vite-based preprocessor for Cypress e2e. We use Vite instead of webpack to:
 * - avoid the webpack-specific resolution of optional wagmi connector peers
 * - keep bundling light-weight for specs
 * - consistent use of Vite across the monorepo
 *
 * This bundles E2E specs and support files; component tests use Cypress's Vite dev server separately.
 * The Vite config supplies workspace aliases, and the process shim supplies TEST_SEED.
 *
 * Watched requests wait for the current build to finish writing to disk. Failed builds reject
 * instead of serving a previous bundle, and later edits can recover. Each build replaces its
 * readonly cache entry; closing the file removes that entry and closes its watcher.
 * Without watching, only in-flight builds are shared, so subsequent requests pick up edits.
 */
export const vitePreprocessor = () => {
  // The map is the only mutable state; each build replaces its immutable compilation entry.
  const cache = new Map<string, Compilation>()

  return async (file: Cypress.FileObject) => {
    const { filePath, outputPath, shouldWatch } = file
    const cached = cache.get(filePath)
    if (cached) return cached.result.promise

    const compilation = Promise.withResolvers<string>()
    // A watcher can fail before Cypress requests the rebuilt file; preserve its rejection for that request.
    void compilation.promise.catch(() => undefined)
    cache.set(filePath, { result: compilation, pending: true, initial: true })

    const testSeed = process.env.TEST_SEED ?? ''
    const filename = path.basename(outputPath)
    const filenameBase = path.basename(outputPath, path.extname(outputPath))
    const isHtml = filename.endsWith('.html')

    const viteConfig = {
      logLevel: 'error' as const,
      resolve: {
        alias: [
          { find: '@primitives', replacement: path.resolve(__dirname, '../packages/primitives/src') },
          { find: '@ui', replacement: path.resolve(__dirname, '../packages/ui/src') },
        ],
      },
      define: {
        // Shim process for browser-only bundles; some deps expect it to exist.
        'process.env': { TEST_SEED: testSeed },
        process: { env: { TEST_SEED: testSeed } },
      },
      build: {
        emptyOutDir: false, // do not clear between specs
        minify: false, // keep readable output for debugging
        outDir: path.dirname(outputPath),
        sourcemap: true,
        write: true, // emit to disk for Cypress to load
        watch: shouldWatch ? {} : null, // enable watch when interactive runner is used
        ...(isHtml
          ? { rollupOptions: { input: { [filenameBase]: filePath } } }
          : {
              rollupOptions: {
                input: filePath,
                // ox's Node-only worker import triggers Rolldown's browser-resolution warning panic.
                external: ['node:worker_threads'],
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

    try {
      const watcher = await build(viteConfig as Record<string, unknown>)

      if (shouldWatch && 'on' in watcher) {
        watcher.on('event', event => {
          const current = cache.get(filePath)
          if (!current) return

          if (event.code === 'START' && !current.pending) {
            const next = Promise.withResolvers<string>()
            void next.promise.catch(() => undefined)
            cache.set(filePath, { ...current, result: next, pending: true })
          }
          // Wait for disk output; returning early can serve a bundle from a previous process.
          if (event.code === 'END' && current.pending) {
            current.result.resolve(outputPath)
            cache.set(filePath, { ...current, pending: false, initial: false })
            if (!current.initial) file.emit('rerun')
          }
          if (event.code === 'ERROR') {
            current.result.reject(event.error)
            cache.set(filePath, { ...current, pending: false, initial: false })
            // Rerun requests must receive the build error instead of the old bundle.
            if (!current.initial) file.emit('rerun')
          }
        })
        file.on('close', () => {
          cache.get(filePath)?.result.reject(new Error(`Cypress closed ${filePath} before compilation finished`))
          cache.delete(filePath)
          void watcher.close().catch(e => {
            console.error('Error closing Vite watcher for Cypress spec:', e)
          })
        })
      } else {
        compilation.resolve(outputPath)
        // Without a watcher, only share in-flight builds; later requests must compile again.
        cache.delete(filePath)
      }
    } catch (error) {
      cache.delete(filePath)
      compilation.reject(error)
    }

    return compilation.promise
  }
}

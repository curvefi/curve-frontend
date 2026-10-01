import path from 'node:path'
import { build } from 'vite'

/**
 * Custom Vite-based preprocessor for Cypress e2e. We use Vite instead of webpack to:
 * - avoid the webpack-specific resolution of optional wagmi connector peers
 * - keep bundling light-weight for specs
 * - consistent use of Vite across the monorepo
 */
export const vitePreprocessor = () => {
  const cache = new Map<string, { ready: Promise<string> }>()

  return async (file: Cypress.FileObject) => {
    const { filePath, outputPath, shouldWatch } = file
    const cached = cache.get(filePath)
    if (cached) return cached.ready

    let compilation = Promise.withResolvers<string>()
    const entry = { ready: compilation.promise }
    let settled = false
    let initialBuild = true
    const observeRejection = () => {
      // A watcher can fail before Cypress requests the rebuilt file.
      void entry.ready.catch(() => undefined)
    }
    observeRejection()
    cache.set(filePath, entry)

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
          if (event.code === 'START' && settled) {
            compilation = Promise.withResolvers<string>()
            entry.ready = compilation.promise
            settled = false
            observeRejection()
          }
          // Wait for disk output; returning early can serve a bundle from a previous process.
          if (event.code === 'END' && !settled) {
            compilation.resolve(outputPath)
            settled = true
            if (!initialBuild) file.emit('rerun')
            initialBuild = false
          }
          if (event.code === 'ERROR') {
            compilation.reject(event.error)
            settled = true
            // Rerun requests must receive the build error instead of the old bundle.
            if (!initialBuild) file.emit('rerun')
            initialBuild = false
          }
        })
        file.on('close', () => {
          cache.delete(filePath)
          compilation.reject(new Error(`Cypress closed ${filePath} before compilation finished`))
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

    return entry.ready
  }
}

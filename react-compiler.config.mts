import babel from '@rolldown/plugin-babel'
import { reactCompilerPreset } from '@vitejs/plugin-react'
import reactCompilerPlugin from 'babel-plugin-react-compiler'

const compilerOptions = { compilationMode: 'infer' } as const

export const reactCompiler = () =>
  babel({
    exclude: [
      // Preserve the Babel plugin's default exclusions and skip Vite's dependency cache.
      /[/\\](?:node_modules|\.cache)[/\\]|\0rolldown\/runtime\.js/,
    ],
    presets: [
      {
        ...reactCompilerPreset(compilerOptions),
        // Cypress's CommonJS loader cannot resolve the preset's import.meta.resolve call.
        preset: { plugins: [[reactCompilerPlugin, compilerOptions]] },
      },
    ],
  })

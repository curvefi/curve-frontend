import babel from '@rolldown/plugin-babel'
import { reactCompilerPreset } from '@vitejs/plugin-react'

export const reactCompiler = () =>
  babel({
    exclude: [
      // Preserve the Babel plugin's default exclusions and skip Vite's dependency cache.
      /[/\\](?:node_modules|\.cache)[/\\]|\0rolldown\/runtime\.js/,
    ],
    presets: [reactCompilerPreset({ compilationMode: 'infer' })],
  })

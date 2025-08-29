// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

const config = [
  ...compat.extends('custom'),
  {
    languageOptions: {
      parserOptions: {
        project: ['./apps/*/tsconfig.json', './packages/*/tsconfig.json', './tests/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
  ...storybook.configs['flat/recommended'],
]

export default config

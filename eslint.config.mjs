import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import eslintReact from '@eslint-react/eslint-plugin'
import tanstack from '@tanstack/eslint-plugin-query'
import prettier from 'eslint-config-prettier'
import { importX } from 'eslint-plugin-import-x'
import noOnlyTests from 'eslint-plugin-no-only-tests'
import { reactRefresh } from 'eslint-plugin-react-refresh'
import storybook from 'eslint-plugin-storybook'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'
import { useMaybePatternRule } from './.eslint/use-maybe-pattern.rule.mjs'
import { noDoubleNegativeRule } from './.eslint/no-double-negative.rule.mjs'
import { noRedundantTernaryRule } from './.eslint/no-redundant-ternary.rule.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config = [
  // Global ignores — must be its own object with no `files` key
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/.vercel/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/*.config.mjs',
      '**/storybook-static/**',
      'node_modules/**',
      '**/*.js',
    ],
  },

  // Recommended presets (flat-native)
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...tanstack.configs['flat/recommended'],
  eslintReact.configs['recommended-typescript'],
  reactRefresh.configs.vite(),
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  ...storybook.configs['flat/recommended'],

  // Project-wide rules + plugins
  {
    plugins: {
      'no-only-tests': noOnlyTests,
      'unused-imports': unusedImports,
      local: {
        rules: {
          'use-maybe-pattern': useMaybePatternRule,
          'no-double-negative': noDoubleNegativeRule,
          'no-redundant-ternary': noRedundantTernaryRule,
        },
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        tsconfigRootDir: __dirname,
        projectService: true,
      },
    },
    settings: {
      react: { version: 'detect' },
      'import-x/resolver': {
        typescript: { alwaysTryTypes: true, project: ['./tsconfig.json'] },
      },
      'import-x/internal-regex': '^@(ui|ui-kit|curvefi/prices-api|external-rewards)',
    },
    rules: {
      'local/use-maybe-pattern': 'error',
      'local/no-double-negative': 'error',
      'local/no-redundant-ternary': 'error',

      'object-shorthand': 'warn',
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-parens': ['error', 'as-needed'],
      'no-only-tests/no-only-tests': 'error',
      'unused-imports/no-unused-imports': 'warn',

      'import-x/no-default-export': 'error',
      'import-x/no-restricted-paths': [
        'error',
        {
          basePath: __dirname,
          // this syntax is confusing: 'target' is importing, 'from' is imported
          zones: [
            { from: 'apps', target: 'packages' }, // packages cannot import apps
            ...['dex', 'dao', 'lend', 'loan', 'llamalend', 'bridge'].map((importedApp, index, importingApp) => ({
              target: importingApp
                .filter(
                  // target ==> forbid import all apps except itself. Allow lend/loan apps to import llamalend
                  (importing, i) =>
                    i !== index && !(['loan', 'lend'].includes(importing) && importedApp === 'llamalend'),
                )
                .map(targetApp => `apps/main/src/${targetApp}`),
              from: `apps/main/src/${importedApp}`, // from ==> the app imported
            })),
            // forbid importing from the router-api app in app source code
            { target: ['apps/main/src/**'], from: 'apps/router-api' },
            // forbid `wagmi` external dependency package imports, except from feature
            { target: ['apps/**', 'packages/**', '!packages/curve-ui-kit/src/features/forms/**'], from: 'wagmi' },
          ],
        },
      ],

      'import-x/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          // This will make all @-prefixed external imports come after non-@ imports
          pathGroups: [{ pattern: '@*/**', group: 'external', position: 'after' }],
          pathGroupsExcludedImportTypes: [], // Make sure pathGroups aren't ignored by anything
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'never',
        },
      ],

      'no-restricted-imports': [
        'warn',
        {
          paths: [
            ...['Accordion', 'Tabs', 'Slider', 'Tooltip', 'Select'].map(component => ({
              name: `@mui/material/${component}`,
              message: `Use \`import { ${component} } from '@ui-kit/shared/ui/${component}'\` instead.`,
            })),
            {
              name: '@mui/material/Chip',
              message:
                "Use `import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'` or `import { Badge } from '@ui-kit/shared/ui/Badge'` instead.",
            },
            {
              name: 'react-hook-form',
              message: "Use `'@ui-kit/features/forms'` instead of 'react-hook-form' directly.",
            },
          ],
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/prefer-nullish-coalescing': ['error', { ignorePrimitives: { string: true, number: true } }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      'no-console': [
        'error', // use console.log only for debugging
        { allow: ['warn', 'error', 'info', 'trace', 'assert'] },
      ],
    },
  },

  // Override (replaces legacy `overrides`)
  {
    files: ['**/*.stories.tsx', '**/*.stories.ts', '**/*.d.ts', '**/_api/*.ts'],
    rules: { 'import-x/no-default-export': 'off' },
  },

  // Disables stylistic rules that conflict with Prettier — must be last
  prettier,
]

export default config

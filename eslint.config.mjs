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

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config = [
  // Global ignores — must be its own object with no `files` key
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
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
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
        },
      },
      'import-x/internal-regex': '^@(ui|ui-kit|curvefi/prices-api|external-rewards)',
    },
    rules: {
      // The follow react rules are turned off as they were not enabled or working properly in the old eslint react plugin
      // These rules are new recommended ones that came with the migration from eslint-plugin-react to @eslint-react,
      // and we haven't had the bandwidth to fix all the issues they raise yet.
      // We should create future PRs to re-enable these rules and fix any issues that arise
      '@eslint-react/naming-convention-context-name': 'off',
      '@eslint-react/naming-convention-ref-name': 'off',
      '@eslint-react/naming-convention-id-name': 'off',
      '@eslint-react/component-hook-factories': 'off',
      '@eslint-react/set-state-in-effect': 'off', // painful to disable but we manually disabled it in a shit ton of cases already, requires a huge refactor
      '@eslint-react/purity': 'off',
      '@eslint-react/no-array-index-key': 'off',
      '@eslint-react/no-forward-ref': 'off',
      '@eslint-react/no-clone-element': 'off',
      '@eslint-react/no-use-context': 'off',
      '@eslint-react/no-context-provider': 'off',
      '@eslint-react/no-unnecessary-use-prefix': 'off',
      '@eslint-react/no-children-to-array': 'off',
      '@eslint-react/no-children-map': 'off',
      '@eslint-react/no-nested-component-definitions': 'off',
      '@eslint-react/web-api-no-leaked-timeout': 'off',
      '@eslint-react/dom-no-flush-sync': 'off',
      '@eslint-react/web-api-no-leaked-event-listener': 'off',
      '@eslint-react/use-state': [
        'warn',
        {
          enforceSetterName: false, // we're not really sticking to the 'setX' naming convention in a lot of cases
          enforceLazyInitialization: false, // something we didn't adhere to previously, but should refactor in the future anyway?
        },
      ],

      'object-shorthand': 'warn',
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-parens': ['error', 'as-needed'],
      'no-only-tests/no-only-tests': 'error',
      'unused-imports/no-unused-imports': 'warn',

      'import-x/no-default-export': 'error',
      'import-x/no-named-as-default': 'off',
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
            // forbid `wagmi` external dependency package imports, except from packages/curve-ui-kit/src/features/connect-wallet/lib/wagmi
            {
              target: ['apps/**', 'packages/**', '!packages/curve-ui-kit/src/features/connect-wallet/lib/wagmi/**'],
              from: 'wagmi',
            },
          ],
        },
      ],

      'import-x/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            // This will make all @-prefixed external imports come after non-@ imports
            { pattern: '@*/**', group: 'external', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: [], // Make sure pathGroups aren't ignored by anything
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
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
      '@typescript-eslint/triple-slash-reference': 'off',

      // The following rules come from tseslint.configs.recommendedTypeChecked, but are too large to fix in one go
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/require-await': 'off',

      // And the following ones are from tseslint.configs.stylisticTypeChecked
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      'no-console': [
        'error', // use console.log only for debugging
        {
          allow: ['warn', 'error', 'info', 'trace', 'assert'],
        },
      ],

      'no-restricted-syntax': [
        'error',
        {
          message:
            'Do not call .setValue() directly on react-hook-form values. Use `updateForm` from @ui-kit/utils/react-form.utils.',
          selector:
            "Program:has(TSTypeReference[typeName.name='UseFormReturn']) CallExpression[callee.type='MemberExpression'][callee.property.name='setValue']",
        },
        {
          message:
            'Do not call .trigger() directly on react-hook-form values. Use `updateForm` from @ui-kit/utils/react-form.utils.',
          selector:
            "Program:has(TSTypeReference[typeName.name='UseFormReturn']) CallExpression[callee.type='MemberExpression'][callee.property.name='trigger']",
        },
      ],
    },
  },

  // Override (replaces legacy `overrides`)
  {
    files: ['**/*.stories.tsx', '**/*.stories.ts', '**/*.d.ts', '**/_api/*.ts'],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },

  // Disables stylistic rules that conflict with Prettier — must be last
  prettier,
]

export default config

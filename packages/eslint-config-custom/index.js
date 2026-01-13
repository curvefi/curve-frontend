module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@tanstack/query/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  plugins: ['no-only-tests', 'unused-imports', 'import', '@typescript-eslint', 'react', 'react-hooks', 'react-refresh'],
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    'no-only-tests/no-only-tests': 'error',
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // We use TypeScript
    'unused-imports/no-unused-imports': 'warn',
    'import/no-default-export': 'error',

    // rule to enforce that imports are only allowed from certain paths
    'import/no-restricted-paths': [
      'error',
      {
        basePath: __dirname + '/../..',
        // this syntax is confusing: 'target' is importing, 'from' is imported
        zones: [
          { from: 'apps', target: 'packages' }, // packages cannot import apps
          ...['dex', 'dao', 'lend', 'loan', 'llamalend'].map((importedApp, index, importingApp) => ({
            target: importingApp
              .filter(
                // target ==> forbid import all apps except itself. Allow lend/loan apps to import llamalend
                (importing, i) => i !== index && !(['loan', 'lend'].includes(importing) && importedApp === 'llamalend'),
              )
              .map((targetApp) => `apps/main/src/${targetApp}`),
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
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
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
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/triple-slash-reference': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    'no-console': [
      'error', // use console.log only for debugging
      {
        allow: ['warn', 'error', 'info', 'trace', 'assert'],
      },
    ],
    'import/order': [
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
  },
  parser: '@typescript-eslint/parser',
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json'],
      },
    },
    'import/internal-regex': '^@(ui|ui-kit|curvefi/prices-api|external-rewards)',
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  ignorePatterns: [
    '**/dist/**',
    '**/build/**',
    '**/*.config.js',
    '**/*.config.ts',
    '**/*.config.mjs',
    '**/storybook-static/**',
    'node_modules/**',
    '**/*.js',
  ],
  overrides: [
    {
      files: ['**/*.stories.tsx', '**/*.stories.ts', '**/*.d.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
}

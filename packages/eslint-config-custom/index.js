module.exports = {
  extends: [
    'eslint:recommended',
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

    // rule to enforce that imports are only allowed from certain paths
    'import/no-restricted-paths': [
      'error',
      {
        basePath: __dirname + '/../..',
        // this syntax is confusing: 'target' is importing, 'from' is imported
        zones: [
          { target: 'packages', from: 'apps' },
          ...['dex', 'dao', 'lend', 'loan', 'llamalend']
            .map((app) => [`apps/main/src/${app}`, `apps/main/src/app/${app}`])
            .map((from, index, paths) => ({
              target: paths.filter((_, i) => i !== index).flat(), // target ==> all apps except the one importing from
              from, // from ==> the app importing
            })),
        ],
      },
    ],
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unused-vars': 'off',

    // todo: remove the following rules
    'no-empty-pattern': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/prefer-as-const': 'off',
    '@typescript-eslint/no-wrapper-object-types': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    'react-refresh/only-export-components': ['off', { allowConstantExport: true }],

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
        project: [
          './tsconfig.json',
          './apps/*/tsconfig.json',
          './apps/*/tsconfig.app.json',
          './packages/*/tsconfig.json',
        ],
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
}

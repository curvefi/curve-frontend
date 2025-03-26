module.exports = {
  // "plugin:turbo/recommended" should be renamed to "turbo" after eslint-plugin-turbo v2.4.5 is published. See https://github.com/vercel/turborepo/pull/10105
  extends: ['next', 'plugin:turbo/recommended', 'prettier'],
  plugins: ['no-only-tests', 'unused-imports', 'import'],
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    'no-only-tests/no-only-tests': 'error',
    '@next/next/no-img-element': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'unused-imports/no-unused-imports': 'warn',

    // rule to enforce that imports are only allowed from certain paths
    'import/no-restricted-paths': [
      'error',
      {
        basePath: '../..',
        // this syntax is confusing: 'target' is importing, 'from' is imported
        zones: [
          { target: 'packages', from: 'apps' },
          ...['dex', 'dao', 'lend', 'loan']
            .map((app) => [`apps/main/src/${app}`, `apps/main/src/app/${app}`])
            .map((from, index, paths) => ({
              target: paths.filter((_, i) => i !== index).flat(),
              from,
            })),
        ],
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
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    'import/internal-regex': '^@(ui|ui-kit|curvefi/prices-api|external-rewards)',
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
}

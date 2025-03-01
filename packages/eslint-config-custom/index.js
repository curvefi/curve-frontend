module.exports = {
  extends: ['next', 'turbo', 'prettier'],
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
            .map((from, index, paths) =>
              ({
                target: paths.filter((_, i) => i !== index).flat(),
                from,
              }),
            ),
        ],
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
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
}

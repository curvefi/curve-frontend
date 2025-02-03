module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  plugins: ['no-only-tests', 'unused-imports', 'import'],
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    'no-only-tests/no-only-tests': 'error',
    '@next/next/no-img-element': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'import/no-restricted-paths': [
      'error',
      {
        basePath: '../../apps/main/src',
        zones: ['dex', 'dao', 'lend', 'loan'].map((from, _, targets) => ({
          from,
          target: targets.filter((a) => a !== from),
        })),
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

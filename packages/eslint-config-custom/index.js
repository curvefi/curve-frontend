module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  plugins: ['no-only-tests', 'unused-imports'],
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    'no-only-tests/no-only-tests': 'error',
    '@next/next/no-img-element': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'unused-imports/no-unused-imports': 'warn',
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

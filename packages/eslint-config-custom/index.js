module.exports = {
  extends: ['next', 'turbo', 'prettier', "@feature-sliced"],
  plugins: ['@tanstack/query'],
  rules: {
    '@next/next/no-img-element': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',
    'import/order': 'off', // feature-sliced/import-order
    'import/no-internal-modules': 'off', // feature-sliced/public-api
    'boundaries/element-types': 'off' // feature-sliced/layers-slices
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

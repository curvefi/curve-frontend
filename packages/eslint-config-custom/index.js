const pluginQuery = require('@tanstack/eslint-plugin-query')

module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  plugins: {
    '@tanstack/query': pluginQuery,
  },
  rules: {
    '@next/next/no-img-element': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
}

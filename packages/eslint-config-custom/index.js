module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  plugins: ['@tanstack/query'],
  rules: {
    '@next/next/no-img-element': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',
    '@tanstack/query/exhaustive-deps': 'off',
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
}

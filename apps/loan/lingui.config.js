module.exports = {
  locales: ['en', 'zh-Hans', 'zh-Hant', 'pseudo'],
  pseudoLocale: 'pseudo',
  sourceLocale: 'en',
  fallbackLocales: {
    default: 'en',
  },
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['src/components', 'src/hooks', 'src/layout', 'src/pages', 'src/store', '../../packages/curve-ui-kit'],
    },
  ],
  format: 'po',
}

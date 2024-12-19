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
      include: [
        'src/components',
        'src/entities',
        'src/features',
        'src/hooks',
        'src/layout',
        'src/pages',
        'src/store',
        'src/widgets',
        '../../packages/curve-ui-kit',
        '../../packages/curve-common',
      ],
    },
  ],
  format: 'po',
}

export const defaultCatalog = {
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
  ],
} as const

export const config = {
  locales: ['en', 'zh-Hans', 'zh-Hant', 'pseudo'],
  pseudoLocale: 'pseudo',
  sourceLocale: 'en',
  fallbackLocales: {
    default: 'en',
  },
  format: 'po',
} as const

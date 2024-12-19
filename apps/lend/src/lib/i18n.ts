import type { DefaultStateKeys } from '@/store/createAppSlice'

import { I18n, i18n } from '@lingui/core'
import { en, zh } from 'make-plural/plurals'
import { setStorageValue } from '@/utils/utilsStorage'

export const DEFAULT_LOCALES = [
  { name: 'English', value: 'en', lang: 'en' },
  ...(process.env.NODE_ENV === 'development'
    ? [
        { name: '简体中文', value: 'zh-Hans' as const, lang: 'zh-Hans' },
        { name: '繁體中文', value: 'zh-Hant' as const, lang: 'zh-Hant' },
        { name: 'pseudo', value: 'pseudo' as const, lang: 'en' },
      ]
    : []),
] as const
export type LocaleOption = (typeof DEFAULT_LOCALES)[number]
export type LocaleValue = LocaleOption['value']

export function initTranslation(i18n: I18n, defaultLocale: string): void {
  i18n.loadLocaleData({
    en: { plurals: en },
    'zh-Hans': { plurals: zh },
    'zh-Hant': { plurals: zh },
    pseudo: { plurals: en },
  })
  i18n.load(defaultLocale, {})
  i18n.activate(defaultLocale)
}

export const findLocale = (selectedLocale: string) =>
  DEFAULT_LOCALES.find((l) => {
    // backward compatibility for 'zh'
    const parsedLocale = selectedLocale.toLowerCase() === 'zh' ? 'zh-hant' : selectedLocale.toLowerCase()
    return l.value.toLowerCase() === parsedLocale
  })

export function parseLocale(locale?: string): { parsedLocale: LocaleValue; pathnameLocale: string } {
  if (!locale) return { parsedLocale: 'en', pathnameLocale: '' }
  const foundLocale = findLocale(locale)
  const parsedLocale = foundLocale?.value ?? 'en'
  return {
    parsedLocale: parsedLocale,
    pathnameLocale: parsedLocale === 'en' ? '' : parsedLocale,
  }
}

export async function dynamicActivate(locale: string) {
  const { parsedLocale } = parseLocale(locale)
  let data = await import(`../locales/${parsedLocale}/messages`)
  i18n.load(locale, data.messages)
  i18n.activate(locale)
}

export function updateAppLocale(locale: string, updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => void) {
  updateGlobalStoreByKey('locale', locale)
  setStorageValue('APP_CACHE', { locale })
}

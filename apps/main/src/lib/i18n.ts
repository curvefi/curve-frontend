import type { DefaultStateKeys } from '@/store/createGlobalSlice'

import { I18n, i18n } from '@lingui/core'
import { en, zh } from 'make-plural/plurals'
import { setDayjsLocale } from '@/lib/dayjs'
import { setStorageValue } from '@/utils'
import numbro from 'numbro'
import 'numbro/dist/languages.min.js'

export type Locale = {
  name: string
  value: 'en' | 'zh-Hans' | 'zh-Hant' | 'pseudo'
}

export const DEFAULT_LOCALES: Locale[] = [
  { name: 'English', value: 'en' },
  { name: '简体中文', value: 'zh-Hans' },
  { name: '繁體中文', value: 'zh-Hant' },
  { name: 'pseudo', value: 'pseudo' },
]

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

export function isLocaleInChinese(locale: Locale['value']) {
  return locale === 'zh-Hant' || locale === 'zh-Hans'
}

export function findLocale(selectedLocale: string) {
  return DEFAULT_LOCALES.find((l) => {
    // backward compatibility for 'zh'
    const parsedLocale = selectedLocale.toLowerCase() === 'zh' ? 'zh-hant' : selectedLocale.toLowerCase()
    return l.value.toLowerCase() === parsedLocale
  })
}

export function parseLocale(locale?: string): { parsedLocale: Locale['value']; pathnameLocale: string } {
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
  setDayjsLocale(locale as Locale['value'])

  let numbroLang = ''
  if (locale === 'zh-Hant') numbroLang = 'zh-TW'
  if (locale === 'zh-Hans') numbroLang = 'zh-CN'

  if (numbroLang) {
    // @ts-ignore
    import(`numbro/languages/${numbroLang}`).then((module) => {
      numbro.registerLanguage(module.default)
      numbro.setLanguage(numbroLang)
    })
  }
}

export function parseLocaleFromPathname(pathname: string | undefined) {
  if (pathname) {
    const foundLocale = pathname.split('/').find((p) => {
      return DEFAULT_LOCALES.find((l) => {
        return l.value.toLowerCase() === p.toLowerCase()
      })
    })

    if (foundLocale) {
      return parseLocale(foundLocale)
    }
  }
  return parseLocale('')
}

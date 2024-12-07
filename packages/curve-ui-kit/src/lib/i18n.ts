import { I18n, i18n } from '@lingui/core'
import { en, zh } from 'make-plural/plurals'
import numbro from 'numbro'
import 'numbro/dist/languages.min.js'

import { setDayjsLocale } from './dayjs'

export type Locale = {
  name: string
  value: 'en' | 'zh-Hans' | 'zh-Hant' | 'pseudo'
  lang: string
}

export const DEFAULT_LOCALES: Locale[] = [
  { name: 'English', value: 'en', lang: 'en' },
  { name: '简体中文', value: 'zh-Hans', lang: 'zh-Hans' },
  { name: '繁體中文', value: 'zh-Hant', lang: 'zh-Hant' },
]

if (process.env.NODE_ENV === 'development') {
  DEFAULT_LOCALES.push({ name: 'pseudo', value: 'pseudo', lang: 'en' })
}

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

/**
 * Activates messages data for a dynamically loaded locale.
 *
 * Example:
 * ```ts
 * const messages = await import(`@/locales/en/messages`)
 * dynamicActivate('en', messages)
 * ```
 *
 * Note: The import must be performed by the calling app since the import path
 * is relative to the app's location, not this package. Passing the import path
 * as a parameter (e.g. '@/locales/en/messages') would not work because the path
 * would be resolved relative to this package's directory structure rather than
 * the app's, and thus will not be able to be found.
 *
 * @param locale - The locale identifier (e.g. 'en', 'zh-Hans')
 * @param data - The imported locale messages data
 */
export function dynamicActivate(locale: string, data: { messages: Record<string, string> }) {
  i18n.load(locale, data.messages)
  i18n.activate(locale)
}

export function updateAppLocale(locale: string) {
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

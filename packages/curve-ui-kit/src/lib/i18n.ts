import { setDayjsLocale } from './dayjs'
import { ReactNode } from 'react'

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

export function updateAppLocale(locale: string) {
  setDayjsLocale(locale as Locale['value'])
}

/**
 * Placeholder for a translation function, so that we can introduce a real one later.
 * @param key Key to translate. This is an array if there are variables to interpolate.
 * @param template Variables to interpolate. They are appended to the keys of the same index.
 * @returns The original string, or the string with the variables interpolated.
 */
export const t = (key: string | readonly string[], ...template: unknown[]) =>
  Array.isArray(key) ? key.map((k, i) => (i < template.length ? `${k}${template[i]}` : k)).join('') : (key as string)

/**
 * Placeholder for a translation component, so that we can introduce a real one later.
 * @param children The text to translate.
 */
export const Trans = ({ children }: { children: ReactNode }) => children

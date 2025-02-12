import { ReactNode } from 'react'

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

export const isChinese = () => navigator.languages?.[0]?.startsWith('zh') ?? false

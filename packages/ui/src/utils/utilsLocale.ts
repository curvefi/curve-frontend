import { detect, fromUrl, fromNavigator } from '@lingui/detect-locale'

export function detectLocale() {
  if (typeof window !== 'undefined') {
    const DEFAULT_FALLBACK = () => 'en'
    return detect(fromUrl('lang'), fromNavigator(), DEFAULT_FALLBACK) ?? 'en-US'
  } else {
    return 'en-US'
  }
}

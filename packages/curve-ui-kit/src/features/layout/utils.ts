import { useEffect, useState } from 'react'
import type { PageWidthClassName } from './types'

export function getPageWidthClassName(pageWidth: number): PageWidthClassName {
  if (pageWidth > 1920) {
    return 'page-wide'
  } else if (pageWidth > 1280 && pageWidth <= 1920) {
    return 'page-large'
  } else if (pageWidth > 960 && pageWidth <= 1280) {
    return 'page-medium'
  } else if (pageWidth > 450 && pageWidth <= 960) {
    return 'page-small'
  } else if (pageWidth > 321 && pageWidth <= 450) {
    return 'page-small-x'
  } else {
    return 'page-small-xx'
  }
}

export function useIsDocumentFocused() {
  const [isFocused, setIsFocused] = useState(document.hasFocus()) // only change chains on focused tab, so they don't fight each other
  useEffect(() => {
    const interval = setInterval(() => setIsFocused(document.hasFocus()), 300)
    return () => clearInterval(interval)
  }, [])
  return isFocused
}

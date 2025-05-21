import { MouseEvent } from 'react'

/**
 * Next.js links to the same page with different query params trigger a full SSR refresh.
 * Links are nice for utilizing the browser's fe
 * @param e
 * @param params
 */
export function pushSearchParams(e: MouseEvent<HTMLAnchorElement>, params: Record<string, string | number>) {
  // next links to the same page with different query params trigger a full refresh for some reason
  const url = new URL(window.location.href)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, `${value}`))
  window.history.pushState(null, '', url)
  e.preventDefault()
}

import { MouseEvent } from 'react'

/**
 * Next.js links to the same page with different query params trigger a full SSR refresh.
 * Links are nice for utilizing the browser's features like back/forward buttons, but we want to avoid full refreshes.
 * This function allows us to keep using a link but update the URL without triggering a full refresh.
 */
export function pushSearchParams(e: MouseEvent<HTMLAnchorElement>, params: Record<string, string | number>) {
  // next links to the same page with different query params trigger a full refresh for some reason
  const url = new URL(window.location.href)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, `${value}`))
  window.history.pushState(null, '', url)
  e.preventDefault()
}

import { useCallback, useMemo } from 'react'
import { useSearchParams } from '@ui-kit/hooks/router'

const DEFAULT_SEARCH_KEY = 'search'

/**
 * Manage a global filter (free-text search) synced with the URL query string.
 * Returns the filter value, a setter, and the `globalFilterFn` to pass to `useTable`.
 *
 * @param key URL query param name. Defaults to `"search"`. Override to avoid conflicts.
 * @todo Refactor common route manipulation code together with `useColumnFilters`
 */
export function useGlobalFilter(key = DEFAULT_SEARCH_KEY) {
  const searchParams = useSearchParams()
  const globalFilter = useMemo(() => searchParams.get(key) ?? '', [searchParams, key])

  const onGlobalFilterChange = useCallback(
    (value: string) => {
      const { history, location } = window
      const params = new URLSearchParams(location.search)
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      const search = params.toString()
      history.pushState(null, '', params.size ? `?${search}` : location.pathname)
    },
    [key],
  )

  return { globalFilter, onGlobalFilterChange }
}

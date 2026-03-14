import { useCallback, useMemo } from 'react'
import { OnChangeFn, PaginationState } from '@tanstack/react-table'
import { useSearchParams } from '@ui-kit/hooks/router'

/**
 * Hook to manage pagination state synchronized with the URL query string.
 * The page index is zero-based internally but one-based in the URL.
 * @param pageSize - Number of items per page.
 * @param fieldName - The query string parameter name for the page index. The default is 'page'.
 * @returns A tuple containing the pagination state and an onChange handler.
 */
export function usePageFromQueryString(pageSize: number, fieldName = 'page') {
  const searchParams = useSearchParams()
  const pageIndex = useMemo(
    () => (searchParams.has(fieldName) ? +searchParams.get(fieldName)! - 1 : 0),
    [fieldName, searchParams],
  )
  const onChange: OnChangeFn<PaginationState> = useCallback(
    (newPagination) => {
      const { pageIndex: newPage } =
        typeof newPagination == 'function' ? newPagination({ pageIndex, pageSize }) : newPagination
      const params = new URLSearchParams(searchParams)
      if (newPage > 0) {
        params.set(fieldName, (newPage + 1).toString())
      } else {
        params.delete(fieldName)
      }
      window.history.pushState(null, '', params.size ? `?${params.toString()}` : window.location.pathname)
    },
    [pageIndex, pageSize, searchParams, fieldName],
  )
  return [{ pageSize, pageIndex }, onChange] as const
}

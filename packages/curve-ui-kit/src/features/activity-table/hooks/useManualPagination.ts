import { SetStateAction, useCallback, useMemo, useState } from 'react'
import type { PaginationState } from '@tanstack/react-table'
import { DEFAULT_PAGE_SIZE } from '../constants'

/** Compute page count from total item count and page size */
export const getPageCount = (totalCount: number | undefined, pageSize: number) =>
  totalCount ? Math.ceil(totalCount / pageSize) : 0

/**
 * Hook to manage manual pagination state for TanStack Table.
 * Handles the conversion between 0-based table pagination and 1-based API pagination.
 *
 * @param pageSize - Number of items per page (defaults to DEFAULT_PAGE_SIZE)
 * @returns Pagination state and handlers for TanStack Table
 */
export const useManualPagination = (pageSize = DEFAULT_PAGE_SIZE) => {
  const [pageIndex, setPageIndex] = useState(0)

  const pagination: PaginationState = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize])

  const onPaginationChange = useCallback(
    (updater: SetStateAction<PaginationState>) =>
      setPageIndex((typeof updater === 'function' ? updater(pagination) : updater).pageIndex),
    [pagination],
  )

  return {
    /** Current pagination state for TanStack Table */
    pagination,
    /** Handler for pagination changes */
    onPaginationChange,
    /** API uses 1-based & DataTable uses 0-based pages */
    apiPage: pageIndex + 1,
  }
}

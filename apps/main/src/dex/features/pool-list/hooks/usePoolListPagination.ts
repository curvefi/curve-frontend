import { useCallback } from 'react'
import { useSearchNavigate, useSearchParams } from '@ui-kit/hooks/router'
import { usePageFromQueryString } from '@ui-kit/hooks/usePageFromQueryString'

export const POOL_LIST_PAGE_SIZE = 50

const PAGE_QUERY_FIELD = 'page'

export type PoolListQueryUpdate = Record<string, string | string[] | null>
export type PoolListQueryUpdater = (update: PoolListQueryUpdate) => void

export const usePoolListPagination = () => {
  const searchParams = useSearchParams()
  const searchNavigate = useSearchNavigate(searchParams)
  const [pagination, onPaginationChange] = usePageFromQueryString(POOL_LIST_PAGE_SIZE, PAGE_QUERY_FIELD)

  // Server-side sort/filter/search changes can make the current API page invalid.
  // Clear `page` in the same URL update so navigation is based on one search-param snapshot.
  const updateQueryAndResetPage = useCallback<PoolListQueryUpdater>(
    update => searchNavigate({ ...update, [PAGE_QUERY_FIELD]: null }, { replace: true }),
    [searchNavigate],
  )

  return { onPaginationChange, pagination, updateQueryAndResetPage }
}

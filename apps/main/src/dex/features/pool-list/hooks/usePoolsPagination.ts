import { useCallback } from 'react'
import { useSearchNavigate, useSearchParams } from '@ui-kit/hooks/router'
import { usePageFromQueryString } from '@ui-kit/hooks/usePageFromQueryString'
import type { PoolsQueryUpdater } from '../pools.filter'

export const POOLS_PAGE_SIZE = 50

const PAGE_QUERY_FIELD = 'page'

export const usePoolsPagination = () => {
  const searchParams = useSearchParams()
  const searchNavigate = useSearchNavigate(searchParams)
  const [pagination, onPaginationChange] = usePageFromQueryString(POOLS_PAGE_SIZE, PAGE_QUERY_FIELD)

  // Server-side sort/filter/search changes can make the current API page invalid.
  // Clear `page` in the same URL update so navigation is based on one search-param snapshot.
  const updateQueryAndResetPage = useCallback<PoolsQueryUpdater>(
    update => searchNavigate({ ...update, [PAGE_QUERY_FIELD]: null }, { replace: true }),
    [searchNavigate],
  )

  return { onPaginationChange, pagination, updateQueryAndResetPage }
}

import { useCallback, useMemo } from 'react'
import { maybe, notFalsy, recordValues } from '@primitives/objects.utils'
import { useSearchParams } from '@ui-kit/hooks/router'
import {
  POOL_LIST_CRYPTO_POOL_TYPE_ALIASES,
  POOL_LIST_POOL_TYPE_FILTERS,
  POOL_LIST_POOL_TYPES,
  type PoolListPoolType,
} from '../poolList.constants'
import type { PoolListQueryUpdater } from './usePoolListPagination'

const POOL_TYPE_QUERY_FIELD = 'filter'
const SEARCH_QUERY_FIELD = 'search'

const POOL_TYPE_SET = new Set<string>(POOL_LIST_POOL_TYPES)

const DEFAULT_FILTER_QUERY = { [SEARCH_QUERY_FIELD]: null, [POOL_TYPE_QUERY_FIELD]: null }

const isPoolType = (value: string | null): value is PoolListPoolType => value != null && POOL_TYPE_SET.has(value)

// The API exposes crypto aliases that map back to the single "crypto" UI filter.
export const getPoolTypeFromQuery = (value: string | null): PoolListPoolType | undefined =>
  maybe(value, value =>
    POOL_LIST_CRYPTO_POOL_TYPE_ALIASES.has(value) ? 'crypto' : isPoolType(value) ? value : undefined,
  )

/**
 * Pool list filters are prices API query params, not TanStack column filters.
 * `useFilters` would serialize column/global filter state, while this table needs
 * `search_string`, `pool_type`, API alias normalization, and page reset behavior.
 */
export const usePoolListFilters = (updateQueryAndResetPage: PoolListQueryUpdater) => {
  const searchParams = useSearchParams()
  const searchText = searchParams.get(SEARCH_QUERY_FIELD) ?? ''
  const poolType = getPoolTypeFromQuery(searchParams.get(POOL_TYPE_QUERY_FIELD))
  const activeFilters = useMemo(
    () => ({
      [SEARCH_QUERY_FIELD]: searchText,
      [POOL_TYPE_QUERY_FIELD]: poolType,
    }),
    [poolType, searchText],
  )

  const onSearch = useCallback(
    (value: string) => updateQueryAndResetPage({ [SEARCH_QUERY_FIELD]: value || null }),
    [updateQueryAndResetPage],
  )
  const setPoolType = useCallback(
    (value: PoolListPoolType | null) => updateQueryAndResetPage({ [POOL_TYPE_QUERY_FIELD]: value }),
    [updateQueryAndResetPage],
  )
  const resetFilters = useCallback(() => updateQueryAndResetPage(DEFAULT_FILTER_QUERY), [updateQueryAndResetPage])
  const activeFilterCount = notFalsy(...recordValues(activeFilters)).length

  return {
    activeFilterCount,
    onSearch,
    poolType,
    poolTypeFilters: POOL_LIST_POOL_TYPE_FILTERS,
    resetFilters,
    searchText,
    setPoolType,
  }
}

import { useCallback, useEffect, useMemo } from 'react'
import { isEmpty } from '@primitives/objects.utils'
import { useSearchNavigate, useSearchParams } from '@ui-kit/hooks/router'
import { POOL_LIST_POOL_TYPE_FILTERS, type PoolListFilter, type PoolListPoolType } from '../poolList.constants'
import {
  getPoolListApiParams,
  getPoolListApyRangeUpdate,
  getPoolListFilterQueryState,
  getPoolListPoolTypeUpdate,
  getPoolListResetFiltersUpdate,
  getPoolListSearchUpdate,
  getPoolListTvlRangeUpdate,
  getPoolListVolumeRangeUpdate,
  hasPoolListActiveFilters,
  type PoolListApiParams,
  type PoolListNumberRange,
  type PoolListQueryUpdater,
} from '../poolListFilterQuery'

export { POOL_LIST_DEFAULT_NON_NEGATIVE_RANGE, POOL_LIST_DEFAULT_TVL_MIN } from '../poolListFilterQuery'
export type { PoolListApiParams, PoolListNumberRange } from '../poolListFilterQuery'

export type PoolListFilterProps = {
  apyRange: PoolListNumberRange
  poolType: PoolListPoolType | undefined
  poolTypeFilters: readonly PoolListFilter[]
  setApyRange: (range: PoolListNumberRange) => void
  setPoolType: (poolType: PoolListPoolType | null) => void
  setTvlRange: (range: PoolListNumberRange) => void
  setVolumeRange: (range: PoolListNumberRange) => void
  tvlRange: PoolListNumberRange
  volumeRange: PoolListNumberRange
}

/**
 * Pool list filters are prices API query params, not TanStack column filters.
 * `useFilters` would serialize column/global filter state, while this table needs
 * `search_string`, `pool_type`, API alias normalization, and page reset behavior.
 */
export const usePoolListFilters = (updateQueryAndResetPage: PoolListQueryUpdater) => {
  const searchParams = useSearchParams()
  const searchNavigate = useSearchNavigate(searchParams)
  // URL params are untrusted: users can manually edit or share stale links.
  // Drop invalid filter values here so chips, active counts, and API params all derive from the same valid state.
  const filterQueryState = useMemo(() => getPoolListFilterQueryState(searchParams), [searchParams])
  const { cleanup, poolType, ranges, searchText } = filterQueryState
  const { apy: apyRange, tvl: tvlRange, volume: volumeRange } = ranges

  useEffect(() => {
    if (!isEmpty(cleanup)) {
      // Canonicalize manually edited/bookmarked URLs without pushing history or resetting pagination.
      searchNavigate(cleanup, { replace: true })
    }
  }, [cleanup, searchNavigate])

  const onSearch = useCallback(
    (value: string) => updateQueryAndResetPage(getPoolListSearchUpdate(value)),
    [updateQueryAndResetPage],
  )
  const setPoolType = useCallback(
    (value: PoolListPoolType | null) => updateQueryAndResetPage(getPoolListPoolTypeUpdate(value)),
    [updateQueryAndResetPage],
  )
  const setTvlRange = useCallback(
    (value: PoolListNumberRange) => updateQueryAndResetPage(getPoolListTvlRangeUpdate(value)),
    [updateQueryAndResetPage],
  )
  const setVolumeRange = useCallback(
    (value: PoolListNumberRange) => updateQueryAndResetPage(getPoolListVolumeRangeUpdate(value)),
    [updateQueryAndResetPage],
  )
  const setApyRange = useCallback(
    (value: PoolListNumberRange) => updateQueryAndResetPage(getPoolListApyRangeUpdate(value)),
    [updateQueryAndResetPage],
  )
  const resetFilters = useCallback(
    () => updateQueryAndResetPage(getPoolListResetFiltersUpdate()),
    [updateQueryAndResetPage],
  )
  const hasActiveFilters = hasPoolListActiveFilters(filterQueryState)
  const apiParams: PoolListApiParams = getPoolListApiParams(filterQueryState)
  const filterProps: PoolListFilterProps = {
    apyRange,
    poolType,
    poolTypeFilters: POOL_LIST_POOL_TYPE_FILTERS,
    setApyRange,
    setPoolType,
    setTvlRange,
    setVolumeRange,
    tvlRange,
    volumeRange,
  }

  return {
    apiParams,
    filterProps,
    hasActiveFilters,
    onSearch,
    resetFilters,
    searchText,
  }
}

import { useCallback, useEffect, useMemo } from 'react'
import type { ListPoolsParams } from '@curvefi/prices-api/pools'
import { fromEntries, isEmpty, maybe } from '@primitives/objects.utils'
import { useSearchNavigate, useSearchParams } from '@ui-kit/hooks/router'
import {
  normalizeRangeFilterDefaults,
  serializeRangeFilter,
  type RangeFilterDefaults,
} from '@ui-kit/shared/ui/DataTable/filters'
import {
  isActiveUrlRange,
  parseNumberUrlRange,
  type NumberUrlRange,
  type ParsedUrlRange,
  type UrlRange,
} from '@ui-kit/shared/ui/DataTable/urlFilter.utils'
import {
  POOL_LIST_CRYPTO_POOL_TYPE_ALIASES,
  POOL_LIST_POOL_TYPE_FILTERS,
  POOL_LIST_POOL_TYPES,
  type PoolListFilter,
  type PoolListPoolType,
} from '../poolList.constants'
import type { PoolListQueryUpdate, PoolListQueryUpdater } from './usePoolListPagination'

const POOL_TYPE_QUERY_FIELD = 'filter'
const SEARCH_QUERY_FIELD = 'search'
const TVL_QUERY_FIELD = 'tvl'
const VOLUME_QUERY_FIELD = 'volume'
const APY_QUERY_FIELD = 'apy'
const RANGE_QUERY_FIELDS = [TVL_QUERY_FIELD, VOLUME_QUERY_FIELD, APY_QUERY_FIELD] as const
const FILTER_QUERY_FIELDS = [SEARCH_QUERY_FIELD, POOL_TYPE_QUERY_FIELD, ...RANGE_QUERY_FIELDS] as const
type RangeQueryField = (typeof RANGE_QUERY_FIELDS)[number]
type DefaultNumberRangeQueryField = typeof VOLUME_QUERY_FIELD | typeof APY_QUERY_FIELD

const POOL_TYPE_SET = new Set<string>(POOL_LIST_POOL_TYPES)
// Hide dust pools by default, without treating the default min as an active URL/UI filter on its own.
export const POOL_LIST_DEFAULT_TVL_MIN = 10_000
const POOL_LIST_DEFAULT_TVL_RANGE = [POOL_LIST_DEFAULT_TVL_MIN, null] satisfies RangeFilterDefaults<number>
// Volume is non-negative, so min 0 is the default. APY can be negative, so min 0 is an active filter.
const POOL_LIST_DEFAULT_NUMBER_RANGE = [null, null] satisfies RangeFilterDefaults<number>
export const POOL_LIST_DEFAULT_NON_NEGATIVE_RANGE = [0, null] satisfies RangeFilterDefaults<number>

const DEFAULT_FILTER_QUERY = fromEntries(FILTER_QUERY_FIELDS.map(field => [field, null]))

export type PoolListNumberRange = NumberUrlRange
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
export type PoolListApiParams = Pick<
  ListPoolsParams,
  'poolType' | 'minTvl' | 'maxTvl' | 'minVolume' | 'maxVolume' | 'minApy' | 'maxApy'
>

const isPoolType = (value: string | null): value is PoolListPoolType => value != null && POOL_TYPE_SET.has(value)

// The prices API should always receive the default TVL min even when URL/UI state is empty.
const getApiNumberRangeParams = ({
  apyRange: [minApy, maxApy],
  tvlRange: [minTvl, maxTvl],
  volumeRange: [minVolume, maxVolume],
}: Pick<PoolListFilterProps, 'apyRange' | 'tvlRange' | 'volumeRange'>) => ({
  maxApy: maxApy ?? undefined,
  maxTvl: maxTvl ?? undefined,
  maxVolume: maxVolume ?? undefined,
  minApy: minApy ?? undefined,
  minTvl: minTvl ?? POOL_LIST_DEFAULT_TVL_MIN,
  minVolume: minVolume ?? undefined,
})

const getRangeUpdate = <T extends string | number>(field: RangeQueryField, value: UrlRange<T>) => ({
  [field]: serializeRangeFilter(value),
})

const getNumberRangeUpdate = (
  field: DefaultNumberRangeQueryField,
  value: PoolListNumberRange,
  defaults: RangeFilterDefaults<number>,
) => getRangeUpdate(field, normalizeRangeFilterDefaults(value, defaults))

// Keep `tvl=10000~max` when a max exists so URL consumers can display a complete range.
// Default-min-only stays hidden as no `tvl` param.
const getTvlRangeUrlValue = (range: PoolListNumberRange) => {
  const [minTvl, maxTvl] = normalizeRangeFilterDefaults(range, POOL_LIST_DEFAULT_TVL_RANGE)
  const urlMinTvl = minTvl ?? maybe(maxTvl, () => POOL_LIST_DEFAULT_TVL_MIN) ?? null

  return serializeRangeFilter([urlMinTvl, maxTvl])
}

const getTvlRangeUpdate = (value: PoolListNumberRange) => ({
  [TVL_QUERY_FIELD]: getTvlRangeUrlValue(value),
})

const getRangeUrlCleanupValue = <T extends string | number>({ range, shouldCleanUrl }: ParsedUrlRange<T>) =>
  shouldCleanUrl ? serializeRangeFilter(range) : undefined

const getRangeCleanupUpdate = <T extends string | number>(
  field: RangeQueryField,
  rangeState: ParsedUrlRange<T>,
): PoolListQueryUpdate => {
  const value = getRangeUrlCleanupValue(rangeState)

  return value === undefined ? {} : { [field]: value }
}

const getTvlRangeCleanupUpdate = (
  originalValue: string | null,
  rangeState: ParsedUrlRange<number>,
): PoolListQueryUpdate => {
  if (originalValue == null) return {}

  // Canonicalize shared/bookmarked TVL URLs to the same hidden-default contract used by user edits.
  const value = getTvlRangeUrlValue(rangeState.range)

  return value === originalValue ? {} : { [TVL_QUERY_FIELD]: value }
}

// The API exposes crypto aliases that map back to the single "crypto" UI filter.
const getPoolTypeFromQuery = (value: string | null): PoolListPoolType | undefined =>
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
  const searchNavigate = useSearchNavigate(searchParams)
  const searchText = searchParams.get(SEARCH_QUERY_FIELD) ?? ''
  const poolTypeQueryValue = searchParams.get(POOL_TYPE_QUERY_FIELD)
  const poolType = getPoolTypeFromQuery(poolTypeQueryValue)
  // URL params are untrusted: users can manually edit or share stale links.
  // Drop invalid filter values here so chips, active counts, and API params all derive from the same valid state.
  const tvlRangeState = useMemo(
    () => parseNumberUrlRange(searchParams.get(TVL_QUERY_FIELD), POOL_LIST_DEFAULT_TVL_RANGE),
    [searchParams],
  )
  const volumeRangeState = useMemo(
    () => parseNumberUrlRange(searchParams.get(VOLUME_QUERY_FIELD), POOL_LIST_DEFAULT_NON_NEGATIVE_RANGE),
    [searchParams],
  )
  const apyRangeState = useMemo(
    () => parseNumberUrlRange(searchParams.get(APY_QUERY_FIELD), POOL_LIST_DEFAULT_NUMBER_RANGE),
    [searchParams],
  )
  const tvlRange = tvlRangeState.range
  const volumeRange = volumeRangeState.range
  const apyRange = apyRangeState.range
  const filterUrlCleanup = useMemo(
    () => ({
      ...(poolTypeQueryValue != null && !poolType ? { [POOL_TYPE_QUERY_FIELD]: null } : {}),
      ...getTvlRangeCleanupUpdate(searchParams.get(TVL_QUERY_FIELD), tvlRangeState),
      ...getRangeCleanupUpdate(VOLUME_QUERY_FIELD, volumeRangeState),
      ...getRangeCleanupUpdate(APY_QUERY_FIELD, apyRangeState),
    }),
    [apyRangeState, poolType, poolTypeQueryValue, searchParams, tvlRangeState, volumeRangeState],
  )
  useEffect(() => {
    if (!isEmpty(filterUrlCleanup)) {
      // Canonicalize manually edited/bookmarked URLs without pushing history or resetting pagination.
      searchNavigate(filterUrlCleanup, { replace: true })
    }
  }, [filterUrlCleanup, searchNavigate])

  const onSearch = useCallback(
    (value: string) => updateQueryAndResetPage({ [SEARCH_QUERY_FIELD]: value || null }),
    [updateQueryAndResetPage],
  )
  const setPoolType = useCallback(
    (value: PoolListPoolType | null) => updateQueryAndResetPage({ [POOL_TYPE_QUERY_FIELD]: value }),
    [updateQueryAndResetPage],
  )
  const setTvlRange = useCallback(
    (value: PoolListNumberRange) => updateQueryAndResetPage(getTvlRangeUpdate(value)),
    [updateQueryAndResetPage],
  )
  const setVolumeRange = useCallback(
    (value: PoolListNumberRange) =>
      updateQueryAndResetPage(getNumberRangeUpdate(VOLUME_QUERY_FIELD, value, POOL_LIST_DEFAULT_NON_NEGATIVE_RANGE)),
    [updateQueryAndResetPage],
  )
  const setApyRange = useCallback(
    (value: PoolListNumberRange) =>
      updateQueryAndResetPage(getNumberRangeUpdate(APY_QUERY_FIELD, value, POOL_LIST_DEFAULT_NUMBER_RANGE)),
    [updateQueryAndResetPage],
  )
  const resetFilters = useCallback(() => updateQueryAndResetPage(DEFAULT_FILTER_QUERY), [updateQueryAndResetPage])
  const hasActiveFilters = Boolean(poolType) || [tvlRange, volumeRange, apyRange].some(isActiveUrlRange)
  const apiParams: PoolListApiParams = {
    ...getApiNumberRangeParams({ apyRange, tvlRange, volumeRange }),
    poolType,
  }
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

import type { ListPoolsParams } from '@curvefi/prices-api/pools'
import { fromEntries, maybe } from '@primitives/objects.utils'
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
import { POOL_LIST_CRYPTO_POOL_TYPE_ALIASES, POOL_LIST_POOL_TYPES, type PoolListPoolType } from './poolList.constants'

const POOL_TYPE_SET = new Set<string>(POOL_LIST_POOL_TYPES)

export const POOL_LIST_FILTER_QUERY_FIELDS = {
  search: 'search',
  poolType: 'filter',
  tvl: 'tvl',
  volume: 'volume',
  apy: 'apy',
} as const

const { apy, poolType, search, tvl, volume } = POOL_LIST_FILTER_QUERY_FIELDS
const RANGE_QUERY_FIELDS = [tvl, volume, apy] as const
const FILTER_QUERY_FIELDS = [search, poolType, ...RANGE_QUERY_FIELDS] as const

type RangeQueryField = (typeof RANGE_QUERY_FIELDS)[number]
type DefaultNumberRangeQueryField = typeof volume | typeof apy

// Hide small pools by default, without treating the default min as an active URL/UI filter on its own.
export const POOL_LIST_DEFAULT_TVL_MIN = 10_000
const POOL_LIST_DEFAULT_TVL_RANGE = [POOL_LIST_DEFAULT_TVL_MIN, null] satisfies RangeFilterDefaults<number>
const POOL_LIST_DEFAULT_NUMBER_RANGE = [null, null] satisfies RangeFilterDefaults<number>
// Volume is non-negative, so min 0 is the default. APY can be negative, so min 0 is an active filter.
export const POOL_LIST_DEFAULT_NON_NEGATIVE_RANGE = [0, null] satisfies RangeFilterDefaults<number>

const DEFAULT_FILTER_QUERY = fromEntries(FILTER_QUERY_FIELDS.map(field => [field, null]))

export type PoolListNumberRange = NumberUrlRange
export type PoolListQueryUpdate = Record<string, string | string[] | null>
export type PoolListQueryUpdater = (update: PoolListQueryUpdate) => void
export type PoolListApiParams = Pick<
  ListPoolsParams,
  'poolType' | 'minTvl' | 'maxTvl' | 'minVolume' | 'maxVolume' | 'minApy' | 'maxApy'
>
export type PoolListFilterRanges = Readonly<{
  apy: PoolListNumberRange
  tvl: PoolListNumberRange
  volume: PoolListNumberRange
}>
export type PoolListFilterQueryState = Readonly<{
  cleanup: PoolListQueryUpdate
  poolType: PoolListPoolType | undefined
  ranges: PoolListFilterRanges
  searchText: string
}>

const isPoolType = (value: string | null): value is PoolListPoolType =>
  maybe(value, value => POOL_TYPE_SET.has(value)) ?? false

// The API exposes crypto aliases that map back to the single "crypto" UI filter.
const getPoolTypeFromQuery = (value: string | null): PoolListPoolType | undefined =>
  maybe(value, value =>
    POOL_LIST_CRYPTO_POOL_TYPE_ALIASES.has(value) ? 'crypto' : isPoolType(value) ? value : undefined,
  )

const serializeRangeUpdate = <T extends string | number>(field: RangeQueryField, value: UrlRange<T>) => ({
  [field]: serializeRangeFilter(value),
})

const serializeDefaultNumberRangeUpdate = (
  field: DefaultNumberRangeQueryField,
  value: PoolListNumberRange,
  defaults: RangeFilterDefaults<number>,
) => serializeRangeUpdate(field, normalizeRangeFilterDefaults(value, defaults))

// Keep `tvl=10000~max` when a max exists so URL consumers can display a complete range.
// Default-min-only stays hidden as no `tvl` param.
const serializeTvlRange = (range: PoolListNumberRange) => {
  const [minTvl, maxTvl] = normalizeRangeFilterDefaults(range, POOL_LIST_DEFAULT_TVL_RANGE)
  const urlMinTvl = minTvl ?? maybe(maxTvl, () => POOL_LIST_DEFAULT_TVL_MIN) ?? null

  return serializeRangeFilter([urlMinTvl, maxTvl])
}

const getRangeCleanupUpdate = <T extends string | number>(
  field: RangeQueryField,
  rangeState: ParsedUrlRange<T>,
): PoolListQueryUpdate => (rangeState.shouldCleanUrl ? { [field]: serializeRangeFilter(rangeState.range) } : {})

const getTvlRangeCleanupUpdate = (
  originalValue: string | null,
  rangeState: ParsedUrlRange<number>,
): PoolListQueryUpdate =>
  maybe(originalValue, (originalValue): PoolListQueryUpdate => {
    // Canonicalize shared/bookmarked TVL URLs to the same hidden-default contract used by user edits.
    const value = serializeTvlRange(rangeState.range)

    return value === originalValue ? {} : { [tvl]: value }
  }) ?? {}

export const getPoolListFilterQueryState = (searchParams: URLSearchParams): PoolListFilterQueryState => {
  const poolTypeQueryValue = searchParams.get(poolType)
  const tvlQueryValue = searchParams.get(tvl)
  const volumeQueryValue = searchParams.get(volume)
  const apyQueryValue = searchParams.get(apy)
  const parsedPoolType = getPoolTypeFromQuery(poolTypeQueryValue)
  const tvlRangeState = parseNumberUrlRange(tvlQueryValue, POOL_LIST_DEFAULT_TVL_RANGE)
  const volumeRangeState = parseNumberUrlRange(volumeQueryValue, POOL_LIST_DEFAULT_NON_NEGATIVE_RANGE)
  const apyRangeState = parseNumberUrlRange(apyQueryValue, POOL_LIST_DEFAULT_NUMBER_RANGE)

  return {
    cleanup: {
      ...(poolTypeQueryValue != null && !parsedPoolType ? { [poolType]: null } : {}),
      ...getTvlRangeCleanupUpdate(tvlQueryValue, tvlRangeState),
      ...getRangeCleanupUpdate(volume, volumeRangeState),
      ...getRangeCleanupUpdate(apy, apyRangeState),
    },
    poolType: parsedPoolType,
    ranges: {
      apy: apyRangeState.range,
      tvl: tvlRangeState.range,
      volume: volumeRangeState.range,
    },
    searchText: searchParams.get(search) ?? '',
  }
}

export const getPoolListApiParams = ({
  poolType,
  ranges: {
    apy: [minApy, maxApy],
    tvl: [minTvl, maxTvl],
    volume: [minVolume, maxVolume],
  },
}: PoolListFilterQueryState): PoolListApiParams => ({
  maxApy: maxApy ?? undefined,
  maxTvl: maxTvl ?? undefined,
  maxVolume: maxVolume ?? undefined,
  minApy: minApy ?? undefined,
  minTvl: minTvl ?? POOL_LIST_DEFAULT_TVL_MIN,
  minVolume: minVolume ?? undefined,
  poolType,
})

export const hasPoolListActiveFilters = ({ poolType, ranges }: PoolListFilterQueryState) =>
  Boolean(poolType) || [ranges.tvl, ranges.volume, ranges.apy].some(isActiveUrlRange)

export const getPoolListEditableTvlRange = ([min, max]: PoolListNumberRange): PoolListNumberRange => [
  min ?? POOL_LIST_DEFAULT_TVL_MIN,
  max,
]

export const getPoolListTvlLabelRange = ([min, max]: PoolListNumberRange): PoolListNumberRange => [
  min ?? maybe(max, () => POOL_LIST_DEFAULT_TVL_MIN) ?? null,
  max,
]

export const getPoolListSearchUpdate = (value: string): PoolListQueryUpdate => ({ [search]: value || null })

export const getPoolListPoolTypeUpdate = (value: PoolListPoolType | null): PoolListQueryUpdate => ({
  [poolType]: value,
})

export const getPoolListTvlRangeUpdate = (value: PoolListNumberRange): PoolListQueryUpdate => ({
  [tvl]: serializeTvlRange(value),
})

export const getPoolListVolumeRangeUpdate = (value: PoolListNumberRange): PoolListQueryUpdate =>
  serializeDefaultNumberRangeUpdate(volume, value, POOL_LIST_DEFAULT_NON_NEGATIVE_RANGE)

export const getPoolListApyRangeUpdate = (value: PoolListNumberRange): PoolListQueryUpdate =>
  serializeDefaultNumberRangeUpdate(apy, value, POOL_LIST_DEFAULT_NUMBER_RANGE)

export const getPoolListResetFiltersUpdate = (): PoolListQueryUpdate => ({ ...DEFAULT_FILTER_QUERY })

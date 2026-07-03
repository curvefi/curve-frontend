import type { ListPoolsParams } from '@curvefi/prices-api/pools'
import { maybe, type PartialRecord } from '@primitives/objects.utils'
import { parseRangeFilter } from '@ui-kit/shared/ui/DataTable/filters'
import type { Range } from '@ui-kit/types/util'

export const POOL_LIST_SEARCH_QUERY_FIELD = 'search'

export enum PoolListFilterId {
  PoolType = 'filter',
  Tvl = 'tvl',
  Volume = 'volume',
  Apy = 'apy',
}

export const POOL_LIST_FILTER_CHANGE_UPDATE = { page: null } as const

// Hide small pools by default, without treating the default min as an active UI filter on its own.
export const POOL_LIST_DEFAULT_TVL_MIN = 10_000

type PoolListNumberRange = Range<number | null>
type PoolListColumnFilters = PartialRecord<PoolListFilterId, string>
export type PoolListQueryUpdater = (update: Record<string, string | string[] | null>) => void
export type PoolListApiParams = Pick<
  ListPoolsParams,
  'poolType' | 'minTvl' | 'maxTvl' | 'minVolume' | 'maxVolume' | 'minApy' | 'maxApy'
>

const parseNumberBound = (value: string | undefined) => {
  const trimmedValue = value?.trim()

  return trimmedValue ? Number(trimmedValue) : null
}

// URL params are raw API input. Do not reorder or reject manual ranges here.
const parseApiRangeFilter = (value: string | undefined): PoolListNumberRange => {
  const [min, max] = value?.split('~') ?? []

  return [parseNumberBound(min), parseNumberBound(max)]
}

export const parsePoolListRangeFilter = (value: string | undefined): PoolListNumberRange =>
  parseRangeFilter(value) ?? [null, null]

const isActiveRangeFilter = ([min, max]: PoolListNumberRange, defaultMin: number | null) =>
  max != null || (min != null && min !== defaultMin)

export const getPoolListApiParams = (columnFiltersById: PoolListColumnFilters): PoolListApiParams => {
  const [minApy, maxApy] = parseApiRangeFilter(columnFiltersById[PoolListFilterId.Apy])
  const [minTvl, maxTvl] = parseApiRangeFilter(columnFiltersById[PoolListFilterId.Tvl])
  const [minVolume, maxVolume] = parseApiRangeFilter(columnFiltersById[PoolListFilterId.Volume])

  return {
    maxApy: maxApy ?? undefined,
    maxTvl: maxTvl ?? undefined,
    maxVolume: maxVolume ?? undefined,
    minApy: minApy ?? undefined,
    minTvl: minTvl ?? POOL_LIST_DEFAULT_TVL_MIN,
    minVolume: minVolume ?? undefined,
    poolType: columnFiltersById[PoolListFilterId.PoolType] || undefined,
  }
}

export const hasPoolListActiveFilters = (columnFiltersById: PoolListColumnFilters) =>
  Boolean(columnFiltersById[PoolListFilterId.PoolType]) ||
  isActiveRangeFilter(parsePoolListRangeFilter(columnFiltersById[PoolListFilterId.Tvl]), POOL_LIST_DEFAULT_TVL_MIN) ||
  isActiveRangeFilter(parsePoolListRangeFilter(columnFiltersById[PoolListFilterId.Volume]), 0) ||
  isActiveRangeFilter(parsePoolListRangeFilter(columnFiltersById[PoolListFilterId.Apy]), null)

export const getPoolListTvlLabelRange = ([min, max]: PoolListNumberRange): PoolListNumberRange => [
  min ?? maybe(max, () => POOL_LIST_DEFAULT_TVL_MIN) ?? null,
  max,
]

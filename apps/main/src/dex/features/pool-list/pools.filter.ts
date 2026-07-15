import type { ListPoolsParams } from '@curvefi/prices-api/pools'
import { maybe, type PartialRecord } from '@primitives/objects.utils'
import { parseRangeFilter } from '@ui-kit/shared/ui/DataTable/filters'
import type { Range } from '@ui-kit/types/util'

export const POOL_LIST_SEARCH_QUERY_FIELD = 'search'

export enum PoolFilterId {
  PoolType = 'filter',
  Tvl = 'tvl',
  Volume = 'volume',
  Apy = 'apy',
}

// Hide small pools by default, without treating the default min as an active UI filter on its own.
export const POOL_DEFAULT_TVL_MIN = 10_000

type PoolsNumberRange = Range<number | null>
type PoolsColumnFilters = PartialRecord<PoolFilterId, string>
export type PoolsQueryUpdater = (update: Record<string, string | string[] | null>) => void
export type PoolsApiParams = Pick<
  ListPoolsParams,
  'poolType' | 'minTvl' | 'maxTvl' | 'minVolume' | 'maxVolume' | 'minApy' | 'maxApy'
>

export const parsePoolsRangeFilter = (value: string | undefined): PoolsNumberRange =>
  parseRangeFilter(value) ?? [null, null]

export const getPoolsApiParams = (columnFiltersById: PoolsColumnFilters): PoolsApiParams => {
  const [minApy, maxApy] = parsePoolsRangeFilter(columnFiltersById[PoolFilterId.Apy])
  const [minTvl, maxTvl] = parsePoolsRangeFilter(columnFiltersById[PoolFilterId.Tvl])
  const [minVolume, maxVolume] = parsePoolsRangeFilter(columnFiltersById[PoolFilterId.Volume])

  return {
    maxApy: maxApy ?? undefined,
    maxTvl: maxTvl ?? undefined,
    maxVolume: maxVolume ?? undefined,
    minApy: minApy ?? undefined,
    minTvl: minTvl ?? POOL_DEFAULT_TVL_MIN,
    minVolume: minVolume ?? undefined,
    poolType: columnFiltersById[PoolFilterId.PoolType] || undefined,
  }
}

export const getPoolsTvlLabelRange = ([min, max]: PoolsNumberRange): PoolsNumberRange => [
  min ?? maybe(max, () => POOL_DEFAULT_TVL_MIN) ?? null,
  max,
]

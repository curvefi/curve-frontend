import type { ListPoolsParams, V2PoolFilterType } from '@curvefi/prices-api/pools'
import { t } from '@evm-ui/lib/i18n'
import { parseRangeFilter } from '@evm-ui/shared/ui/DataTable/filters'
import type { Range } from '@evm-ui/types/util'
import { maybe } from '@primitives/objects.utils'

// Omitted "main" and "factory" from available filters.
export const POOL_TYPE_FILTERS = [
  { key: 'stableswapng', label: t`Stable NG` },
  { key: 'crvusd', label: t`crvUSD` },
  { key: 'crypto', label: t`Twocrypto` },
  { key: 'factory_tricrypto', label: t`Tricrypto` },
] as const satisfies readonly { key: V2PoolFilterType; label: string }[]

export enum PoolFilterId {
  PoolType = 'filter',
  Tvl = 'tvl',
  Volume = 'volume',
  Apy = 'apy',
}

// Hide small pools by default, without treating the default min as an active UI filter on its own.
export const POOL_DEFAULT_TVL_MIN = 10_000

export type PoolsNumberRange = Range<number | null>
export type PoolsQueryUpdater = (update: Record<string, string | string[] | null>) => void
export type PoolsApiParams = Pick<
  ListPoolsParams,
  'poolType' | 'minTvl' | 'maxTvl' | 'minVolume' | 'maxVolume' | 'minApy' | 'maxApy'
>

export const parsePoolsRangeFilter = (value: string | undefined): PoolsNumberRange =>
  parseRangeFilter(value) ?? [null, null]

export const getPoolsTvlLabelRange = ([min, max]: PoolsNumberRange): PoolsNumberRange => [
  min ?? maybe(max, () => POOL_DEFAULT_TVL_MIN) ?? null,
  max,
]

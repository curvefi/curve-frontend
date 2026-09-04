import type { ListPoolsParams, V2PoolFilterType } from '@curvefi/prices-api/pools'
import { parseRangeFilter } from '@evm-ui/shared/ui/DataTable/filters'
import { maybe } from '@primitives/objects.utils'
import type { Range } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

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

/**
 * Hide small pools by default, without treating the default min as an active UI filter on its own.
 * Used to be $10k but has been set to 0 as it's not immediately obvious to users why some pools are missing.
 * Tutti is working on an alternative approach, in the menatime the TVL filter should not block the release of the new pools list.
 * Besides, we have pagination now anyway so do we really need this filter to begin with?
 */
export const POOL_DEFAULT_TVL_MIN = 0

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

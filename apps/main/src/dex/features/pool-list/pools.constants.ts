import type { V2PoolFilterType, V2PoolSortField } from '@curvefi/prices-api/pools'
import { t } from '@ui-kit/lib/i18n'
import { PoolColumnId } from './columns/columns.enum'

// Omitted "main" and "factory" from available filters.
export const POOL_TYPE_FILTERS = [
  { key: 'stableswapng', label: t`Stable NG` },
  { key: 'crvusd', label: t`crvUSD` },
  { key: 'crypto', label: t`Twocrypto` },
  { key: 'factory_tricrypto', label: t`Tricrypto` },
] as const satisfies readonly { key: V2PoolFilterType; label: string }[]

type PoolsFilter = (typeof POOL_TYPE_FILTERS)[number]
export type PoolType = PoolsFilter['key']

export const POOL_TYPES = POOL_TYPE_FILTERS.map(({ key }) => key) satisfies readonly PoolType[]

// The API bundles factory_crypto and twocryptong pools under the "crypto" filter.
export const CRYPTO_POOL_TYPE_ALIASES: ReadonlySet<string> = new Set(['factory_crypto', 'twocryptong'])

export type PoolSortableColumn =
  PoolColumnId.PoolName | PoolColumnId.RewardsBase | PoolColumnId.Volume | PoolColumnId.Tvl

export const POOL_SORT_BY = {
  [PoolColumnId.PoolName]: 'name',
  [PoolColumnId.RewardsBase]: 'base_daily_apr',
  [PoolColumnId.Volume]: 'volume',
  [PoolColumnId.Tvl]: 'tvl',
} as const satisfies Record<PoolSortableColumn, V2PoolSortField>

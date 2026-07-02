import type { V2PoolFilterType, V2PoolSortField } from '@curvefi/prices-api/pools'
import { recordValues } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { PoolListColumnId } from './columns/column.enum'

// Omitted "main" and "factory" from available filters.
export const POOL_LIST_POOL_TYPE_FILTERS = [
  { key: 'stableswapng', label: t`Stable NG` },
  { key: 'crvusd', label: t`crvUSD` },
  { key: 'crypto', label: t`Twocrypto` },
  { key: 'factory_tricrypto', label: t`Tricrypto` },
] as const satisfies readonly { key: V2PoolFilterType; label: string }[]

type PoolListFilter = (typeof POOL_LIST_POOL_TYPE_FILTERS)[number]
export type PoolListPoolType = PoolListFilter['key']

export const POOL_LIST_POOL_TYPES = POOL_LIST_POOL_TYPE_FILTERS.map(
  ({ key }) => key,
) satisfies readonly PoolListPoolType[]

// The API bundles factory_crypto and twocryptong pools under the "crypto" filter.
export const POOL_LIST_CRYPTO_POOL_TYPE_ALIASES: ReadonlySet<string> = new Set(['factory_crypto', 'twocryptong'])

export type PoolListSortableColumn =
  | PoolListColumnId.PoolName
  | PoolListColumnId.RewardsBase
  | PoolListColumnId.Volume
  | PoolListColumnId.Tvl

export const POOL_LIST_SORT_BY = {
  [PoolListColumnId.PoolName]: 'name',
  [PoolListColumnId.RewardsBase]: 'base_daily_apr',
  [PoolListColumnId.Volume]: 'volume',
  [PoolListColumnId.Tvl]: 'tvl',
} as const satisfies Record<PoolListSortableColumn, V2PoolSortField>

export const POOL_LIST_SORT_FIELDS = recordValues(POOL_LIST_SORT_BY)

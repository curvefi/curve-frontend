import type { Pool } from '@/dex/types/main.types'
import type { DeepKeys } from '@tanstack/table-core'
import { filterByText } from '@ui-kit/shared/ui/DataTable/filters'
import type { PoolListItem } from './types'

export const POOL_TEXT_FIELDS = [
  'pool.wrappedCoins',
  'pool.wrappedCoinAddresses',
  'pool.underlyingCoins',
  'pool.underlyingCoinAddresses',
  'pool.name',
  'pool.address',
  'pool.gauge.address',
  'pool.lpToken',
] satisfies DeepKeys<{ pool: Pool }>[]

export const poolsGlobalFilterFn = filterByText<PoolListItem>(...POOL_TEXT_FIELDS)

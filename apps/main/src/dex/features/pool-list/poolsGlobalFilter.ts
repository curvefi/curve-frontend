import type { Pool } from '@/dex/types/main.types'
import type { DeepKeys } from '@tanstack/table-core'
import { useFuzzyFilterFn } from '@ui-kit/shared/ui/DataTable/hooks/useFuzzyFilterFn'
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

const TEXT_KEYS: DeepKeys<PoolListItem>[] = ['pool.name', 'pool.wrappedCoins', 'pool.underlyingCoins']
const ADDRESS_KEYS: DeepKeys<PoolListItem>[] = [
  'pool.wrappedCoinAddresses',
  'pool.underlyingCoinAddresses',
  'pool.address',
  'pool.gauge.address',
  'pool.lpToken',
]

/** Search filter for pools lists */
export const usePoolsGlobalFilterFn = (data: readonly PoolListItem[], filterValue: string) =>
  useFuzzyFilterFn(data, filterValue, TEXT_KEYS, ADDRESS_KEYS)

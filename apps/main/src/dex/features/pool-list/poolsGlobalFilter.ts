import type { Pool } from '@/dex/types/main.types'
import type { DeepKeys } from '@tanstack/table-core'
import { useFuzzyFilterFn } from '@ui-kit/hooks/useFuzzySearch'
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

const POOL_KEYS: DeepKeys<PoolListItem>[] = [
  'pool.name',
  'pool.wrappedCoins',
  'pool.underlyingCoins',
  'pool.wrappedCoinAddresses',
  'pool.underlyingCoinAddresses',
  'pool.address',
  'pool.gauge.address',
  'pool.lpToken',
]

/** Search filter for pools lists */
export const usePoolsGlobalFilterFn = (data: readonly PoolListItem[], filterValue: string) =>
  useFuzzyFilterFn(data, filterValue, POOL_KEYS)

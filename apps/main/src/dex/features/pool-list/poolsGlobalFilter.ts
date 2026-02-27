import type { DeepKeys } from '@tanstack/table-core'
import { useFuzzyFilterFn } from '@ui-kit/hooks/useFuzzySearch'
import type { PoolListItem } from './types'

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

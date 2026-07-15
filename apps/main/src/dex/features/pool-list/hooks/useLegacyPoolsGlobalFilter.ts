import type { DeepKeys } from '@tanstack/table-core'
import { useFuzzyFilterFn } from '@ui-kit/hooks/useFuzzySearch'
import type { LegacyPoolListItem } from '../legacy-pools.types'

const POOL_KEYS: DeepKeys<LegacyPoolListItem>[] = [
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
export const useLegacyPoolsGlobalFilterFn = (data: readonly LegacyPoolListItem[], filterValue: string) =>
  useFuzzyFilterFn(data, filterValue, POOL_KEYS)

import type { DeepKeys } from '@tanstack/table-core'
import { useFuzzyFilterFn } from '@ui-kit/hooks/useFuzzySearch'
import type { LegacyPoolRow } from '../types'

const POOL_KEYS: DeepKeys<LegacyPoolRow>[] = [
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
export const useLegacyPoolsGlobalFilterFn = (data: readonly LegacyPoolRow[], filterValue: string) =>
  useFuzzyFilterFn(data, filterValue, POOL_KEYS)

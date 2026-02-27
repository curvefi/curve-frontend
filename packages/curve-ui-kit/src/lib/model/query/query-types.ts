import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

export type QueryTimingConfig = {
  staleTime: number // consider data fresh for this long, and don't trigger background refetches or show loading states
  gcTime: number // cache is cleaned up after this long, and we don't show loading states
  refetchInterval?: number // trigger background refetches every this long
}

const [minute, fiveMin, tenMin, day] = [
  REFRESH_INTERVAL['1m'],
  REFRESH_INTERVAL['5m'],
  REFRESH_INTERVAL['10m'],
  REFRESH_INTERVAL['1d'],
]

const actionableData: QueryTimingConfig = { staleTime: fiveMin, gcTime: tenMin, refetchInterval: minute }
const informativeData: QueryTimingConfig = { staleTime: fiveMin, gcTime: tenMin, refetchInterval: fiveMin }
const noRefresh: QueryTimingConfig = { staleTime: day, gcTime: day }

/**
 * Category → timing settings mapping.
 * Categories are intentionally broad; individual query authors should not need to tweak timing.
 */
export const QUERY_TYPES = {
  user: actionableData,
  table: informativeData,
  form: actionableData,
  marketDetail: actionableData,
  static: noRefresh,
} as const

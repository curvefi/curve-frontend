import { REFRESH_INTERVAL } from '@ui-kit/lib/model/time'

export type QueryTimingConfig = {
  staleTime: number
  gcTime: number
  refetchInterval?: number
}

const [minute, fiveMin, tenMin, hour, day] = [
  REFRESH_INTERVAL['1m'],
  REFRESH_INTERVAL['5m'],
  REFRESH_INTERVAL['10m'],
  REFRESH_INTERVAL['1h'],
  REFRESH_INTERVAL['1d'],
]

const actionableData = { staleTime: fiveMin, gcTime: tenMin, refetchInterval: minute }
const informativeData = { staleTime: fiveMin, gcTime: tenMin, refetchInterval: fiveMin }
const semiStaticData: QueryTimingConfig = { staleTime: hour, gcTime: day }

/**
 * Category → timing settings mapping.
 * Categories are intentionally broad; individual query authors should not need to tweak timing.
 */
export const QUERY_CATEGORIES = {
  user: actionableData,
  table: informativeData,
  detail: actionableData,
  static: semiStaticData,
} as const satisfies Record<string, QueryTimingConfig>

export type QueryCategory = keyof typeof QUERY_CATEGORIES

import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

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

const actionableData: QueryTimingConfig = { staleTime: fiveMin, gcTime: tenMin, refetchInterval: minute }
const informativeData: QueryTimingConfig = { staleTime: fiveMin, gcTime: tenMin, refetchInterval: fiveMin }
const semiStaticData: QueryTimingConfig = { staleTime: hour, gcTime: day, refetchInterval: hour }
const staticData: QueryTimingConfig = { staleTime: day, gcTime: day }

/**
 * Category → timing settings mapping.
 * Categories are intentionally broad; individual query authors should not need to tweak timing.
 */
export const QUERY_TYPES = {
  user: actionableData,
  table: informativeData,
  form: actionableData,
  marketDetail: actionableData,
  semiStatic: semiStaticData,
  static: staticData,
} as const

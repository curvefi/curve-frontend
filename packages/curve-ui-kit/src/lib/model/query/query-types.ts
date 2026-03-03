import { REFRESH_INTERVAL } from '../time'

/**
 * First level, we try to pick only a few different `REFRESH_INTERVAL` options for all queries.
 */
const [block, minute, fiveMin, tenMin, day] = [
  REFRESH_INTERVAL['15s'],
  REFRESH_INTERVAL['1m'],
  REFRESH_INTERVAL['5m'],
  REFRESH_INTERVAL['10m'],
  REFRESH_INTERVAL['1d'],
]

/**
 * Second level, we try to pick only a few different `timing` options for all queries.
 */
const { urgent, actionable, informative, dontRefetch } = {
  urgent: { staleTime: minute, gcTime: tenMin, refetchInterval: block },
  actionable: { staleTime: fiveMin, gcTime: tenMin, refetchInterval: minute },
  informative: { staleTime: fiveMin, gcTime: tenMin, refetchInterval: fiveMin },
  dontRefetch: { staleTime: day, gcTime: day },
} satisfies Record<
  string,
  /** Timing settings for each query category. We could extend this further to support other react-query options. */
  {
    staleTime: number // consider data fresh for this long, and don't trigger background refetches or show loading states
    gcTime: number // cache is cleaned up after this long, and we don't show loading states
    refetchInterval?: number // trigger background refetches every this long
  }
>

/**
 * Third level, the query types define which timing config to use for each type of query.
 */
export const QUERY_TYPES = {
  user: actionable,
  table: informative,
  form: actionable,
  marketDetail: actionable,
  static: dontRefetch,
  urgent,
} as const

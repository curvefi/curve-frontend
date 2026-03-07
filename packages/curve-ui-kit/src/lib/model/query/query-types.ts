import { Duration } from '@ui-kit/themes/design/0_primitives'

/**
 * First level, we try to pick only a few different intervals for all queries.
 */
const { Urgent, Actionable, Informative, DontShowAfter, SemiStatic } = Duration.DataRefresh

/**
 * Second level, we try to pick only a few different `timing` options for all queries.
 */
const { urgent, actionable, informative, dontRefetch } = {
  urgent: { staleTime: Actionable, gcTime: DontShowAfter, refetchInterval: Urgent },
  actionable: { staleTime: Informative, gcTime: DontShowAfter, refetchInterval: Actionable },
  informative: { staleTime: Informative, gcTime: DontShowAfter, refetchInterval: Informative },
  dontRefetch: { staleTime: SemiStatic, gcTime: SemiStatic },
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

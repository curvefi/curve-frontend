import type { Suite } from 'vest'
import { CB } from 'vest-utils'
import { FetchError } from '@primitives/fetch.utils'
import { isEmpty, notFalsy } from '@primitives/objects.utils'
import {
  type DefaultError,
  keepPreviousData,
  type QueryExecuteOptions,
  QueryFunctionContext,
  type QueryKey,
  queryOptions,
  useQuery,
} from '@tanstack/react-query'
import { QUERY_CATEGORIES, type QueryCategory } from '@ui/features/queries/query-categories'
import { queryClient } from '@ui/features/queries/query-client'
import type { DeepPartial } from '@ui/features/queries/util'
import { logError, logQuery, logSuccess } from '@ui/lib/logging'
import { formatTimeDiff } from '@ui/lib/time'
import { validate } from '@ui/lib/validation/lib'
import { FieldName, FieldsOf } from '@ui/lib/validation/types'

/** Scope and query-specific properties identifying a query. */
type QueryKeyObject = Readonly<Record<string, unknown> & { name: string }>

/** The one-object key shape passed to TanStack Query. */
type NormalizedQueryKey<TKey extends QueryKeyObject = QueryKeyObject> = readonly [TKey]

/** Specific class of errors thrown from inside queryFn to skip query retries on failure */
export class NoRetryError extends Error {
  constructor(message: string) {
    super(message)
  }

  /**
   * When we receive 404's from t
   * @param run
   */
  static async catch404<T>(run: () => Promise<T>) {
    try {
      return await run()
    } catch (error) {
      if (error instanceof FetchError && error.status === 404) {
        throw new NoRetryError(error.message)
      }
      throw error
    }
  }
}

async function runQuery<TData, TQuery>(
  queryKey: NormalizedQueryKey,
  queryFn: (params: TQuery) => Promise<TData>,
  disableLog: true | undefined,
) {
  try {
    const start = new Date()
    if (!disableLog) logQuery(queryKey)
    const data = await queryFn(queryKey[0] as TQuery)
    if (!disableLog) logSuccess(queryKey, formatTimeDiff(start), notFalsy(data))
    return data
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
    logError(queryKey, error, error.message)
    throw error
  }
}

export function queryFactory<
  TQuery extends object,
  const TKey extends QueryKeyObject,
  TData,
  TParams extends FieldsOf<DeepPartial<TQuery>> = FieldsOf<TQuery>,
  TField extends string = FieldName<TQuery>,
  TCallback extends CB = CB<TQuery, TField[]>,
>({
  queryFn,
  queryKey,
  category,
  validationSuite,
  dependencies,
  disableLog,
  keepPreviousData: shouldKeepPreviousData,
  ...options
}: {
  queryKey: (params: TParams) => TKey
  validationSuite: Suite<TField, string, TCallback>
  queryFn: (params: TQuery) => Promise<TData>
  category: QueryCategory
  dependencies?: (params: TParams) => QueryKey[]
  refetchOnWindowFocus?: 'always'
  refetchOnMount?: 'always'
  disableLog?: true
  keepPreviousData?: boolean
}) {
  const getQueryKey = (params: TParams): NormalizedQueryKey<TKey> => [queryKey(params)]
  const getQueryOptions = (params: TParams, enabled = true) =>
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryOptions({
      ...QUERY_CATEGORIES[category],
      queryKey: getQueryKey(params),
      queryFn: async ({ queryKey }: QueryFunctionContext<NormalizedQueryKey<TKey>>) =>
        await runQuery(queryKey, queryFn, disableLog),
      enabled:
        enabled &&
        isEmpty(validate<TParams, typeof validationSuite>(validationSuite, params)) &&
        !dependencies?.(params).some(key => queryClient.getQueryData(key) === undefined),
      retry: (failureCount, error) =>
        !(error instanceof NoRetryError) && // Don't retry queries specifically marked as such
        !(error instanceof FetchError && error.status === 404) && // Or 404 FetchErrors (from @curvefi/primitives)
        failureCount < 3,
      ...(shouldKeepPreviousData && { placeholderData: keepPreviousData }),
      ...options,
    })

  return {
    queryKey: getQueryKey,
    getQueryOptions,
    getQueryData: (params: TParams): TData | undefined => queryClient.getQueryData(getQueryKey(params)),
    setQueryData: (params: TParams, data: TData) => queryClient.setQueryData<TData>(getQueryKey(params), data),
    fetchQuery: (
      params: TParams,
      options?: Partial<QueryExecuteOptions<TData, DefaultError, TData, TData, NormalizedQueryKey<TKey>>>,
    ) =>
      queryClient.query<TData, DefaultError, TData, TData, NormalizedQueryKey<TKey>>({
        ...getQueryOptions(params),
        ...options,
      }),
    /**
     * Function that is like fetchQuery, but sets staleTime to 0 to ensure fresh data is fetched.
     * Primary use case is for Zustand stores where want to both use queries and ensure freshness.
     * I suspect this will be the only case, and once Zustand refactoring to Tanstack is complete, we may delete this.
     */
    refetchQuery: (params: TParams) =>
      queryClient.query<TData, DefaultError, TData, TData, NormalizedQueryKey<TKey>>({
        ...getQueryOptions(params),
        ...options,
        staleTime: 0,
      }),
    useQuery: (params: TParams, condition?: boolean) => useQuery(getQueryOptions(params, condition)),
    /** Invalidates the cache for the query, marking it as stale and triggering a refetch if needed **/
    invalidate: (params: TParams) => queryClient.invalidateQueries({ queryKey: getQueryKey(params) }),
    /** Removes all the cached data for the query **/
    reset: (params: TParams) => queryClient.resetQueries({ queryKey: getQueryKey(params) }),
  } as const
}

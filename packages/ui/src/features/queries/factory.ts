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

/** One scope or query-specific part of a query key. */
type QueryKeyPart = Readonly<Record<string, unknown>>

/** Source key parts, which are merged into one cache-key object. */
type QueryKeyParts = readonly [QueryKeyPart, ...QueryKeyPart[]]

/** The one-object key shape passed to TanStack Query. */
type NormalizedQueryKey = readonly [QueryKeyPart]

type DuplicateKey<Parts extends readonly QueryKeyPart[], Seen extends PropertyKey = never> = Parts extends readonly [
  infer First extends QueryKeyPart,
  ...infer Rest extends QueryKeyPart[],
]
  ? Extract<keyof First, Seen> | DuplicateKey<Rest, Seen | keyof First>
  : never

type UniqueQueryKeyParts<Parts extends QueryKeyParts> = DuplicateKey<Parts> extends never ? Parts : never

type PartKeys<Parts extends QueryKeyParts> = Parts[number] extends infer Part
  ? Part extends QueryKeyPart
    ? keyof Part
    : never
  : never

type ValidQueryKeyParts<Parts extends QueryKeyParts> =
  UniqueQueryKeyParts<Parts> extends never ? never : 'name' extends PartKeys<Parts> ? Parts : never

const mergeQueryKey = (parts: QueryKeyParts): NormalizedQueryKey => [Object.assign({}, ...parts)]

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
  const TKeyParts extends QueryKeyParts,
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
  queryKey: (params: TParams) => ValidQueryKeyParts<TKeyParts>
  validationSuite: Suite<TField, string, TCallback>
  queryFn: (params: TQuery) => Promise<TData>
  category: QueryCategory
  dependencies?: (params: TParams) => QueryKey[]
  refetchOnWindowFocus?: 'always'
  refetchOnMount?: 'always'
  disableLog?: true
  keepPreviousData?: boolean
}) {
  const getQueryKey = (params: TParams) => mergeQueryKey(queryKey(params))
  const getQueryOptions = (params: TParams, enabled = true) =>
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryOptions({
      ...QUERY_CATEGORIES[category],
      queryKey: getQueryKey(params),
      queryFn: async ({ queryKey }: QueryFunctionContext<NormalizedQueryKey>) =>
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
      options?: Partial<QueryExecuteOptions<TData, DefaultError, TData, TData, NormalizedQueryKey>>,
    ) =>
      queryClient.query<TData, DefaultError, TData, TData, NormalizedQueryKey>({
        ...getQueryOptions(params),
        ...options,
      }),
    /**
     * Function that is like fetchQuery, but sets staleTime to 0 to ensure fresh data is fetched.
     * Primary use case is for Zustand stores where want to both use queries and ensure freshness.
     * I suspect this will be the only case, and once Zustand refactoring to Tanstack is complete, we may delete this.
     */
    refetchQuery: (params: TParams) =>
      queryClient.query<TData, DefaultError, TData, TData, NormalizedQueryKey>({
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

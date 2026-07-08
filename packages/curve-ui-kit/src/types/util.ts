import { useMemo } from 'react'
import { maybe, objectKeys } from '@primitives/objects.utils'
import type { UseQueryResult } from '@tanstack/react-query'

export type Range<T> = [T, T]

type DotPathPrefix<TPrefix extends string, TKey extends string> = TPrefix extends '' ? TKey : `${TPrefix}.${TKey}`

/** Builds a union of dot-paths in T whose resolved leaf value extends TValue. */
export type DotPathByValue<T, TValue, TPrefix extends string = ''> = {
  [TKey in keyof T & string]: T[TKey] extends TValue
    ? DotPathPrefix<TPrefix, TKey>
    : T[TKey] extends Record<string, unknown>
      ? DotPathByValue<T[TKey], TValue, DotPathPrefix<TPrefix, TKey>>
      : never
}[keyof T & string]

/**
 * Creates a deep partial type that makes all properties optional recursively,
 * while preserving function types as-is
 *
 * @template T - The type to make deeply partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? (T[P] extends (...args: never[]) => unknown ? T[P] : DeepPartial<T[P]>) : T[P]
}

/**
 * A utility type that makes specific properties of a type optional while keeping all other properties required.
 *
 * @template T - The original type to modify
 * @template K - The keys from T that should be made optional
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 *
 * // Make 'email' optional
 * type UserWithOptionalEmail = MakeOptional<User, 'email'>;
 * // Result: { id: string; name: string; email?: string }
 *
 * // Make multiple properties optional
 * type UserWithOptionalFields = MakeOptional<User, 'name' | 'email'>;
 * // Result: { id: string; name?: string; email?: string }
 * ```
 */
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type AllowUndefined<T> = { [P in keyof T]: T[P] | undefined }

/**
 * A generic type representing the result of a query operation.
 * @template T - The type of the data returned by the query.
 */
export type Query<T> = Pick<UseQueryResult<T>, 'data' | 'isLoading' | 'error'>

/** Branded {@link Query} to enforce it's been wrapped with `q()` or `mapQuery()`, stripping it of unserializable properties and reduce re-renders. */
export type QueryProp<T> = Query<T> & { readonly __brand: 'QueryProp' }
export type QueryOrValue<T> = QueryProp<T> | T

/**
 * Helper to extract only the relevant fields from a UseQueryResult into the Query type.
 * This is necessary because passing UseQueryResult to any react component will crash the rendering due to
 * react trying to serialize the react-query proxy object.
 */
export const q = <T>({ data, isLoading, error }: Query<T>) =>
  ({
    data,
    isLoading,
    error,
  }) as QueryProp<T>

type QueryData<TQuery> = TQuery extends Query<infer TData> ? TData : never

/**
 * Takes the first query with data, then the first query with an error, then the first query that is loading,
 * and finally the first query in the list. Use the disabled query property to ignore a query and use the fallback.
 */
export const fallbackQ = <const TQueries extends readonly QueryProp<unknown>[]>(...queries: TQueries) =>
  (queries.find(q => q.data != null) ??
    queries.find(q => q.error) ??
    queries.find(q => q.isLoading) ??
    queries[0]) as QueryProp<QueryData<TQueries[number]>>

/**
 * Maps a Query type to extract partial data from it.
 * Preserves error and loading states while transforming the data.
 */
export const mapQuery = <TSource, TResult>(
  { data, isLoading, error }: Query<TSource>,
  selector: (data: TSource) => TResult | undefined,
) =>
  q({
    isLoading,
    // eslint-disable-next-line local/use-maybe-pattern -- queries may return null, but not undefined
    data: data === undefined ? undefined : selector(data),
    error,
  })

/** Creates a QueryProp constant data, no loading or error state. */
export const constQ = <T>(data: T) => q({ data, isLoading: false, error: null })

/**
 * A disabled query without any data. Currently used because ActionInfo requires some query and doesn't accept undefined.
 * TODO: Get rid of this and create `type MaybeQuery<T> = T | QueryProp<T>`
 */
export const DISABLED_Q = constQ(undefined)

/**
 * Creates a fake query that assumes the data is loading when null or undefined.
 * Avoid this when possible, prefer real queries instead!
 **/
export const fakeLoadingQ = <T>(data: T | undefined) => q({ data, isLoading: data == null, error: null })

/** Hook similar to mapQuery for queries that need memoization */
export const useMappedQuery = <TSource, TResult>(
  { isLoading, error, data }: Query<TSource | null>,
  transform: (data: TSource) => TResult,
): QueryProp<TResult> =>
  q({
    isLoading,
    data: useMemo(() => maybe(data, data => transform(data) ?? undefined), [data, transform]),
    error,
  })

/** a list of keys for query objects, i.e., data, isLoading, error */
const queryObjectKeys = objectKeys(DISABLED_Q)

/** Checks if a value is a query. */
export const isQuery = <T>(value: unknown): value is QueryProp<T> =>
  value != null && typeof value === 'object' && queryObjectKeys.every(key => key in value)

export const toQuery = <T>(
  value: QueryOrValue<T>,
  { isLoading = false, error = null }: { isLoading?: boolean; error?: Error | null } = {},
): QueryProp<T> => (isQuery(value) ? value : q({ data: value, isLoading, error }))

export const toValue = <T>(value: QueryOrValue<T>): T | undefined => (isQuery(value) ? value.data : value)

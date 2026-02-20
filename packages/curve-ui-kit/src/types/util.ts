import type { UseQueryResult } from '@tanstack/react-query'

export type Range<T> = [T, T]

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

/**
 * A generic type representing the result of a query operation.
 * @template T - The type of the data returned by the query.
 */
export type Query<T> = Pick<UseQueryResult<T>, 'data' | 'isLoading' | 'error'>

/** Branded {@link Query} to enforce it's been wrapped with `q()` or `mapQuery()`, stripping it of unserializable properties and reduce re-renders. */
export type QueryProp<T> = Query<T> & {
  readonly __brand: 'QueryProp'
}

/**
 * Helper to extract only the relevant fields from a UseQueryResult into the Query type.
 * This is necessary because passing UseQueryResult to any react component will crash the rendering due to
 * react trying to serialize the react-query proxy object.
 */
export const q = <T>({ data, isLoading, error }: Query<T>) => ({ data, isLoading, error }) as QueryProp<T>

/**
 * Maps a Query type to extract partial data from it.
 * Preserves error and loading states while transforming the data.
 */
export const mapQuery = <TSource, TResult>(
  { data, isLoading, error }: Query<TSource>,
  selector: (data: TSource) => TResult | null | undefined,
) =>
  q({
    isLoading,
    data: data == null ? undefined : (selector(data) ?? undefined),
    error,
  })

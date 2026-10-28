import type { CB } from 'vest-utils'
import { useCurve } from '@evm-ui/features/connect-wallet'
import type { UseQueryResult } from '@tanstack/react-query'
import { queryFactory, type QueryKeyObject } from '@ui/features/queries/factory'
import { type DeepPartial, DISABLED_Q } from '@ui/features/queries/util'
import type { FieldName, FieldsOf } from '@ui/lib/validation/types'

/** Some queries require a hydrated instance of curve-js, which we'll gate through the `enabled` property with `isHydrated`. */
const useHydratedQuery = <TParams, TData>(
  useQuery: (params: TParams, enabled: boolean) => UseQueryResult<TData>,
  params: TParams,
  enabled = true,
) => {
  const { isHydrated, error: initializationError } = useCurve()
  const { data, error, isLoading, isPending, isFetching } = useQuery(params, isHydrated && enabled)
  return isHydrated
    ? { data, error, isLoading, isPending, isFetching }
    : // Cached results can belong to the previous Curve instance while hydration is in progress.
      { ...DISABLED_Q, error: initializationError ?? null, isPending: !initializationError, isFetching: false }
}

/** Creates a query whose hook waits for hydration, preserving the imperative query helpers. */
export const hydratedQueryFactory = <
  TQuery extends object,
  const TKey extends QueryKeyObject,
  TData,
  TParams extends FieldsOf<DeepPartial<TQuery>> = FieldsOf<TQuery>,
  TField extends string = FieldName<TQuery>,
  TCallback extends CB = CB<TQuery, TField[]>,
>(
  options: Parameters<typeof queryFactory<TQuery, TKey, TData, TParams, TField, TCallback>>[0],
) => {
  const { useQuery, ...helpers } = queryFactory(options)
  return { ...helpers, useQuery: (params: TParams, enabled?: boolean) => useHydratedQuery(useQuery, params, enabled) }
}

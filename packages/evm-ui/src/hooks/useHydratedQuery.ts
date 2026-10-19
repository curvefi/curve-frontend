import { useCurve } from '@evm-ui/features/connect-wallet'
import { queryFactory } from '@ui/features/queries/factory'

/** Some queries require a hydrated instance of curve-js, which we'll gate through the `enabled` property with `isHydrated`. */
export const useHydratedQuery = <TParams, TResult>(
  useQuery: (params: TParams, enabled: boolean) => TResult,
  params: TParams,
  enabled = true,
): TResult => {
  const { isHydrated } = useCurve()
  return useQuery(params, isHydrated && enabled)
}

/** Creates a query whose hook waits for hydration, preserving the imperative query helpers. */
export const hydratedQueryFactory: typeof queryFactory = options => {
  const { useQuery, ...query } = queryFactory(options)
  return { ...query, useQuery: (params, enabled) => useHydratedQuery(useQuery, params, enabled) }
}

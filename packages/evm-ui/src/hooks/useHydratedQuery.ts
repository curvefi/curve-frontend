import { useCurve } from '@evm-ui/features/connect-wallet'

/** Some queries require a hydrated instance of curve-js, which we'll gate through the `enabled` property with `isHydrated`. */
export const useHydratedQuery = <TParams, TResult>(
  useQuery: (params: TParams, enabled: boolean) => TResult,
  params: TParams,
  enabled = true,
): TResult => {
  const { isHydrated } = useCurve()
  return useQuery(params, isHydrated && enabled)
}

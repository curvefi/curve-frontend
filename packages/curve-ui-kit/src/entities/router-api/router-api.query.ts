import { useCallback, useMemo } from 'react'
import { enforce, test } from 'vest'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { toArray } from '@primitives/array.utils'
import { fetchJson } from '@primitives/fetch.utils'
import { assert, notFalsy, maybe } from '@primitives/objects.utils'
import { type RouteProvider, RouteProviders, type RouterRouteResponse } from '@primitives/router.utils'
import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query'
import { createHash } from '@ui-kit/entities/router-api/router-api.utils'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { NoRetryError } from '@ui-kit/lib/model/query/factory'
import { q } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import type { RouteQueries, RouteQuery, RouteResponse, RoutesParams, RoutesQuery } from './router-api.types'
import { routerApiValidation } from './router-api.validation'

interface RouteByIdQuery {
  routeId: string
}
type RouteByIdParams = FieldsOf<RouteByIdQuery>

const { getQueryData: getRouteQueryData, setQueryData: setRouteQueryData } = queryFactory({
  queryKey: ({ routeId }: RouteByIdParams) => ['router-api', 'v1/routes', { routeId }] as const,
  queryFn: async (_params: RouteByIdQuery): Promise<RouteResponse> => {
    throw new NoRetryError('router route-by-id cache is write-through only')
  },
  validationSuite: createValidationSuite(({ routeId }: RouteByIdQuery) => {
    test('routeId', 'Route ID is required', () => {
      enforce(routeId).isString().isNotEmpty()
    })
  }),
  disableLog: true,
  category: 'global.routerApi',
})

/**
 * Returns a previously fetched router route from a local query-cache entry keyed by `routeId`.
 *
 * Why this exists:
 * - LlamaLend zapV2 queries keep query keys stable by storing only `routeId` (not full calldata/route payload).
 * - React Query indexes by query key, not by item IDs inside a `RouteResponse[]`, so route lookup by ID needs
 *   its own cache entry.
 * - We populate this cache as a write-through side effect when `useRouterApi` fetches routes.
 *
 * This is intentionally a pure cache read (no fetch fallback) and throws when the route is missing because zapV2
 * call sites must only parse routes that were already selected/fetched by the form.
 */
export const getRouteById = (routeId: string | undefined) =>
  assert(
    getRouteQueryData({
      routeId: assert(routeId, 'No route for zapv2, please validate the arguments before calling this query.'),
    }),
    'routeId is required for zapV2',
  )

const { useQuery: useRouterApi, fetchQuery: fetchApiRoutes } = queryFactory({
  queryKey: ({ chainId, tokenIn, tokenOut, amountIn, amountOut, router, userAddress, slippage }: RoutesParams) =>
    [
      'router-api',
      'v1/routes',
      { chainId },
      { tokenIn },
      { tokenOut },
      { amountIn },
      { amountOut },
      { router },
      { userAddress },
      { slippage },
    ] as const,
  queryFn: async ({
    chainId,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    router,
    userAddress,
    slippage,
  }: RoutesQuery): Promise<RouteResponse[]> => {
    const query = new URLSearchParams(
      notFalsy(
        ['chainId', `${chainId}`],
        ['tokenIn', tokenIn],
        ['tokenOut', tokenOut],
        amountIn && ['amountIn', `${amountIn}`],
        amountOut && ['amountOut', `${amountOut}`],
        userAddress && ['userAddress', userAddress],
        slippage && ['slippage', `${slippage}`],
      ),
    )

    toArray(router).forEach(router => query.append('router', router))
    const routes = await fetchJson<RouterRouteResponse[]>(`/api/router/v1/routes?${query}`)
    return await Promise.all(
      routes.map(async response => {
        const { amountOut, tx, router } = response
        const id = `${router}:${await createHash([
          chainId,
          tokenIn,
          tokenOut,
          amountIn,
          slippage,
          userAddress,
          amountOut,
          tx?.data,
        ])}`
        const route = { ...response, id }
        setRouteQueryData({ routeId: id }, route)
        return route
      }),
    )
  },
  validationSuite: routerApiValidation,
  category: 'global.routerApi',
})

function useRouterQuery(params: Omit<RoutesParams, 'router'>, router: RouteProvider, enabled?: boolean): RouteQuery {
  const { data, isLoading, error, isFetching } = useRouterApi({ ...params, router }, enabled)
  const route = maybe(data, ([route = null]) => route)
  return useMemo(() => ({ ...q({ isLoading, data: route, error }), isFetching }), [isLoading, route, error, isFetching])
}

export type GetGasCallback<TData extends TGas | null = TGas, TKey extends QueryKey = QueryKey> = (
  routeId: string | undefined,
) => UseQueryOptions<TData, Error, TData, TKey>

/**
 * Calls the route providers in parallel, returning the first route of each.
 */
export const useRouterQueries = <TData extends TGas | null, TKey extends QueryKey>(
  params: Omit<RoutesParams, 'router'>,
  getRouteGasOptions: GetGasCallback<TData, TKey>,
  enabled?: boolean,
) => {
  const curveRoutes = useRouterQuery(params, 'curve', enabled)
  const { data: gas } = useQuery({
    ...getRouteGasOptions(curveRoutes.data?.id),
    enabled: !!curveRoutes.data && enabled,
  })
  return {
    queries: {
      curve: useMemo(
        (): RouteQuery =>
          gas && curveRoutes.data
            ? {
                ...curveRoutes,
                data: { ...curveRoutes.data, gas: decimal(toArray(gas)[0]) ?? null },
              }
            : curveRoutes,
        [curveRoutes, gas],
      ),
      enso: useRouterQuery(params, 'enso', enabled),
      odos: useRouterQuery(params, 'odos', enabled),
    } satisfies RouteQueries,
    onRefresh: useCallback(
      () => Promise.all(RouteProviders.map(router => fetchApiRoutes({ ...params, router }))),
      [params],
    ),
  }
}

export { useRouterApi, fetchApiRoutes }

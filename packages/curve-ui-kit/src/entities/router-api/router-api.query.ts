import { useCallback, useMemo } from 'react'
import { enforce, test } from 'vest'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import { toArray } from '@primitives/array.utils'
import { fetchJson } from '@primitives/fetch.utils'
import { assert, notFalsy, maybe } from '@primitives/objects.utils'
import { type RouteProvider, RouteProviders, type RouterRouteResponse } from '@primitives/router.utils'
import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query'
import { createHash } from '@ui-kit/entities/router-api/router-api.utils'
import { use0xRouter } from '@ui-kit/hooks/useFeatureFlags'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { NoRetryError } from '@ui-kit/lib/model/query/factory'
import { q } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import type { RouteQueries, RouteQuery, RouteResponse, RoutesParams, RoutesQuery } from './router-api.types'
import { routerApiValidation } from './router-api.validation'

type RouteByIdQuery = { routeId: string }
type RouteByIdParams = FieldsOf<RouteByIdQuery>

const {
  getQueryData: getRouteQueryData,
  setQueryData: setRouteQueryData,
  useQuery: useRouteByIdQuery,
} = queryFactory({
  queryKey: ({ routeId }: RouteByIdParams) => ['router-api', 'v1/routes', { routeId }] as const,
  // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
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
 * Keeps the selected route-by-id cache entry active while a form references it.
 * The route-by-id query is write-through only, so this hook must never enable fetching.
 * A disabled useQuery still creates/subscribes an observer for that queryKey; it just does not auto-fetch.
 */
export const usePinRouteById = (routeId: string | undefined) => useRouteByIdQuery({ routeId }, false)

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
  queryKey: ({
    chainId,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    blacklist,
    router,
    userAddress,
    slippage,
  }: RoutesParams) =>
    [
      'router-api',
      'v1/routes',
      { chainId },
      { tokenIn },
      { tokenOut },
      { amountIn },
      { amountOut },
      { blacklist },
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
    blacklist,
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

    toArray(blacklist).forEach(address => query.append('blacklist', address))
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
          toArray(blacklist),
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

function useRouterQuery(params: Omit<RoutesParams, 'router'>, router: RouteProvider, enabled = true): RouteQuery {
  const { data, isLoading, error, isFetching } = useRouterApi({ ...params, router }, enabled)
  const route = maybe(data, ([route = null]) => route)
  return useMemo(
    () => ({ ...q({ isLoading, data: route, error }), isFetching, enabled }),
    [isLoading, route, error, isFetching, enabled],
  )
}

export type GetGasCallback<TData extends TGas | null = TGas, TKey extends QueryKey = QueryKey> = (
  routeId: string | undefined,
) => UseQueryOptions<TData, Error, TData, TKey>

/**
 * Calls the route providers in parallel, returning the first route of each.
 */
export const useRouterQueries = <TData extends TGas | null, TKey extends QueryKey>(
  { zapAddress, ...params }: Omit<RoutesParams, 'router'> & { zapAddress: Address | undefined },
  getRouteGasOptions: GetGasCallback<TData, TKey>,
  enabled?: boolean,
): {
  queries: RouteQueries
  onRefresh: () => Promise<RouteResponse[][]>
} => {
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
      'curve-solver': useRouterQuery({ ...params, userAddress: zapAddress }, 'curve-solver', enabled),
      enso: useRouterQuery({ ...params, userAddress: zapAddress }, 'enso', !!zapAddress && enabled),
      odos: useRouterQuery({ ...params, userAddress: zapAddress }, 'odos', !!zapAddress && enabled),
      '0x': useRouterQuery({ ...params, userAddress: zapAddress }, '0x', use0xRouter() && enabled),
    },
    onRefresh: useCallback(
      () => Promise.all(RouteProviders.map(router => fetchApiRoutes({ ...params, router }))),
      [params],
    ),
  }
}

export { useRouterApi, fetchApiRoutes }

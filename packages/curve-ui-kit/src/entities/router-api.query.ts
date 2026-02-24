import { enforce, test } from 'vest'
import type { Hex } from 'viem'
import { fetchJson } from '@curvefi/prices-api/fetch'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { NoRetryError } from '@ui-kit/lib/model/query/factory'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { Address, Decimal, toArray } from '@ui-kit/utils'
import { type RouteProvider } from '@ui-kit/widgets/RouteProvider'

export type RoutesQuery = {
  chainId: number
  tokenIn: Address
  tokenOut: Address
  amountIn?: Decimal
  amountOut?: Decimal
  router?: RouteProvider | readonly RouteProvider[]
  userAddress?: Address
  slippage?: Decimal
}

export type RoutesParams = FieldsOf<RoutesQuery>
type RouteByIdQuery = { routeId: string }
type RouteByIdParams = FieldsOf<RouteByIdQuery>

export type RouteResponse = {
  id: string
  router: RouteProvider
  amountIn: [Decimal]
  amountOut: [Decimal]
  priceImpact: number | null
  createdAt: number
  warnings: ('high-slippage' | 'low-exchange-rate')[]
  route: {
    name: string
    tokenIn: [Address]
    tokenOut: [Address]
    protocol: 'curve' | string
    action: 'swap' | string
    args?: Record<string, unknown>
    chainId: number
  }[]
  isStableswapRoute?: boolean
  tx?: { data: Hex; to: Address; from: Address; value: Decimal }
}

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
export const getRouteById = (routeId: string | null | undefined) =>
  assert(
    getRouteQueryData({
      routeId: assert(routeId, 'No route for zapv2, please validate the arguments before calling this query.'),
    }),
    'routeId is required for zapV2',
  )

export const routerApiValidation = createValidationSuite(
  ({ chainId, tokenIn, tokenOut, amountIn, amountOut, userAddress }: RoutesQuery) => {
    test('chainId', 'Invalid chainId', () => {
      enforce(chainId).isNumber().greaterThan(0)
    })
    test('tokenIn', 'Invalid tokenIn address', () => {
      enforce(tokenIn).isAddress()
    })
    test('tokenOut', 'Invalid tokenOut address', () => {
      enforce(tokenOut).isAddress()
    })
    test('amount', 'Provide either amountIn or amountOut (not both)', () => {
      enforce(!!Number(amountIn) !== !!Number(amountOut)).isTruthy()
    })
    userAddressValidationGroup({ userAddress, required: false })
  },
)
export const { useQuery: useRouterApi } = queryFactory({
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

    toArray(router).forEach((router) => query.append('router', router))
    const routes = await fetchJson<RouteResponse[]>(`/api/router/v1/routes?${query}`)
    routes.forEach((route) => setRouteQueryData({ routeId: route.id }, route))
    return routes
  },
  staleTime: '1m',
  refetchInterval: '15s',
  validationSuite: routerApiValidation,
})

/**
 * This function can be used as a callback for llamalend.js zapV2 methods.
 */
export const getExpectedFn =
  ({
    chainId,
    router,
    userAddress,
    slippage,
  }: Pick<RoutesQuery, 'chainId' | 'router' | 'slippage' | 'userAddress'>): GetExpectedFn =>
  async (tokenIn, tokenOut, amountIn) => {
    const routes = await fetchApiRoutes({
      chainId,
      tokenIn: tokenIn as Address,
      tokenOut: tokenOut as Address,
      amountIn: `${amountIn}` as Decimal,
      router,
      slippage,
      userAddress,
    })
    const route = assert(routes?.[0], 'No route available')
    return parseRoute(route.id).quote
  }

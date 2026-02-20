import { enforce, test } from 'vest'
import type { Hex } from 'viem'
import type { IRouteStep } from '@curvefi/api/lib/interfaces'
import type { GetExpectedFn } from '@curvefi/llamalend-api/src/interfaces'
import { fetchJson } from '@curvefi/prices-api/fetch'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { Address, assert, Decimal, toArray } from '@ui-kit/utils'
import type { RouteProvider } from '@ui-kit/widgets/RouteProvider'

// todo: move this to api?
const generateRandomSecureId = () => crypto.getRandomValues(new Uint32Array(4)).join('')

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

type RouterApiRouteStep = {
  name: string
  args: Omit<IRouteStep, 'inputCoinAddress' | 'outputCoinAddress' | 'poolId'> & { poolId?: string }
  tokenIn: [Address]
  tokenOut: [Address]
}

type RouterApiResponse = {
  amountIn: Decimal
  amountOut: Decimal
  priceImpact: number | null
  createdAt: number
  isStableswapRoute: boolean
  warnings: ('high-slippage' | 'low-exchange-rate')[]
  route: RouterApiRouteStep[]
  router: RouteProvider
  tx?: { to: Address; data: Hex }
}

export type Route = RouterApiResponse & { id: string }

export const { useQuery: useRouterApi, fetchQuery: fetchApiRoutes } = queryFactory({
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
  }: RoutesQuery): Promise<Route[]> => {
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
    const routes = await fetchJson<RouterApiResponse[]>(`/api/router/v1/routes?${query}`)
    return routes.map((route) => ({ ...route, id: generateRandomSecureId() }))
  },
  staleTime: '1m',
  refetchInterval: '15s',
  validationSuite: createValidationSuite(({ chainId, tokenIn, tokenOut, amountIn, amountOut }: RoutesQuery) => {
    test('chainId', 'Invalid chainId', () => {
      enforce(chainId).isNumber().greaterThan(0)
    })
    test('tokenIn', 'Invalid tokenIn address', () => {
      enforce(tokenIn).isAddress()
    })
    test('tokenOut', 'Invalid tokenOut address', () => {
      enforce(tokenOut).isAddress()
    })
    test(
      'amount',
      'Provide either amountIn or amountOut (not both)' +
        `${amountIn} ${amountOut} ${!!Number(amountIn)} ${!!Number(amountOut)}`,
      () => {
        enforce(!!Number(amountIn) !== !!Number(amountOut)).isTruthy()
      },
    )
  }),
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
  }: Pick<RoutesQuery, 'chainId' | 'router' | 'slippage' | 'userAddress'> & {
    fromToken: { address: Address; decimals: number }
    toToken: { address: Address; decimals: number }
  }): GetExpectedFn =>
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
    const { amountOut, priceImpact } = assert(routes?.[0], 'No route available')
    return { outAmount: amountOut, priceImpact: priceImpact ?? 0 }
  }

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

export type OptimalRouteQuery = {
  chainId: number
  tokenIn: Address
  tokenOut: Address
  amountIn?: Decimal
  amountOut?: Decimal
  router?: RouteProvider | readonly RouteProvider[]
  fromAddress?: Address
  slippage?: Decimal
}

export type OptimalRouteParams = FieldsOf<OptimalRouteQuery>

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
  queryKey: ({ chainId, tokenIn, tokenOut, amountIn, amountOut, router, fromAddress, slippage }: OptimalRouteParams) =>
    [
      'router-api',
      'optimal-route',
      { chainId },
      { tokenIn },
      { tokenOut },
      { amountIn },
      { amountOut },
      { router },
      { fromAddress },
      { slippage },
    ] as const,
  queryFn: async ({
    chainId,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    router,
    fromAddress,
    slippage,
  }: OptimalRouteQuery): Promise<Route[]> => {
    const query = new URLSearchParams(
      notFalsy(
        ['chainId', `${chainId}`],
        ['tokenIn', tokenIn],
        ['tokenOut', tokenOut],
        amountIn && ['amountIn', `${amountIn}`],
        amountOut && ['amountOut', `${amountOut}`],
        fromAddress && ['fromAddress', fromAddress],
        slippage && ['slippage', `${slippage}`],
      ),
    )

    toArray(router).forEach((router) => query.append('router', router))
    const routes = await fetchJson<RouterApiResponse[]>(`/api/router/optimal-route?${query}`)
    return routes.map((route) => ({ ...route, id: generateRandomSecureId() }))
  },
  staleTime: '1m',
  refetchInterval: '15s',
  validationSuite: createValidationSuite(({ chainId, tokenIn, tokenOut, amountIn, amountOut }: OptimalRouteQuery) => {
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

export const getExpectedFn =
  ({
    chainId,
    router,
    fromAddress,
    slippage,
  }: Pick<OptimalRouteQuery, 'chainId' | 'router' | 'fromAddress' | 'slippage'>): GetExpectedFn =>
  async (fromToken, toToken, amountIn) => {
    const routes = await fetchApiRoutes({
      chainId,
      tokenIn: fromToken as `0x${string}`,
      tokenOut: toToken as `0x${string}`,
      amountIn: `${amountIn}` as Decimal,
      router,
      slippage,
      fromAddress,
    })
    const { amountOut, priceImpact } = assert(routes?.[0], 'No route available')
    return { outAmount: amountOut, priceImpact: priceImpact ?? 0 }
  }

import { enforce, test } from 'vest'
import { httpFetcher } from '@/dex/lib/utils'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { createValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { Address, Decimal } from '@ui-kit/utils'

export type OptimalRouteQuery = {
  chainId: number
  tokenIn: Address
  tokenOut: Address
  amountIn?: Decimal
  amountOut?: Decimal
}

export type RouterApiRouteStep = {
  args: {
    poolId: string
    poolAddress: Address
    swapAddress: Address
    swapParams: number[] | [number, number, number, Decimal, Decimal]
    [key: string]: unknown
  }
}

export type RouterApiResponse = {
  amountIn: Decimal
  amountOut: Decimal
  priceImpact: number | null
  createdAt: number
  isStableswapRoute: boolean
  warnings: ('high-slippage' | 'low-exchange-rate')[]
  route: RouterApiRouteStep[]
}[]

export const { useQuery: useOptimalRoute } = queryFactory({
  queryKey: ({ chainId, tokenIn, tokenOut, amountIn, amountOut }: OptimalRouteQuery) =>
    ['router-api', 'optimal-route', { chainId }, { tokenIn }, { tokenOut }, { amountIn }, { amountOut }] as const,
  queryFn: ({ chainId, tokenIn, tokenOut, amountIn, amountOut }: OptimalRouteQuery): Promise<RouterApiResponse> =>
    httpFetcher(
      `/api/router/optimal-route?${new URLSearchParams(
        notFalsy(
          ['chainId', `${chainId}`],
          ['tokenIn', tokenIn],
          ['tokenOut', tokenOut],
          amountIn && ['amountIn', `${amountIn}`],
          amountOut && ['amountOut', `${amountOut}`],
        ),
      )}`,
    ),
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
    test('amount', 'Provide either amountIn or amountOut (not both)', () => {
      enforce(!!amountIn !== !!amountOut).isTruthy()
    })
  }),
})

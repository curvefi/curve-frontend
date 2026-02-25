import { enforce, test } from 'vest'
import type { Address } from '@primitives/address.utils'
import { toArray } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fetchJson } from '@primitives/fetch.utils'
import { notFalsy } from '@primitives/objects.utils'
import type { RouteProvider, RouteResponse } from '@primitives/router.utils'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'

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
    return fetchJson<RouteResponse[]>(`/api/router/v1/routes?${query}`)
  },
  staleTime: '1m',
  refetchInterval: '15s',
  validationSuite: routerApiValidation,
})

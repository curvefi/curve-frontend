import { enforce, skipWhen, test } from 'vest'
import { toArray } from '@primitives/array.utils'
import { type RouteProvider, RouteProviders } from '@primitives/router.utils'
import { createValidationSuite, validateSlippage } from '@ui-kit/lib'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import type { RoutesQuery } from './router-api.types'

export const validateRouter = (
  router: RouteProvider | readonly RouteProvider[] | null | undefined,
  { isRequired = false }: { isRequired?: boolean } = {},
) => {
  skipWhen(!isRequired && !router, () => {
    test('router', 'Router is required', () => {
      enforce(router).isTruthy()
    })
  })
  skipWhen(!router, () => {
    const routers = toArray(router)
    test('router', `Router must be one of ${RouteProviders.join(', ')}`, () => {
      enforce(routers).isArray().isNotEmpty()
      enforce(routers.length).isPositive().message(`At least one router must be provided.`)
      routers.forEach((r) => enforce(RouteProviders.includes(r)).message(`${r} is not a valid router`).isTruthy())
    })
  })
}

export const routerApiValidation = createValidationSuite(
  ({ chainId, tokenIn, tokenOut, amountIn, amountOut, userAddress, slippage, router }: RoutesQuery) => {
    test('chainId', 'Invalid chainId', () => {
      enforce(chainId).isNumber().greaterThan(0)
    })
    test('tokenIn', 'Invalid tokenIn address', () => {
      enforce(tokenIn).isAddress()
    })
    test('tokenOut', 'Invalid tokenOut address', () => {
      enforce(tokenOut).isAddress()
    })
    test('amount', 'Provide either amountIn or amountOut (not both)' + ` Got ${amountIn} and ${amountOut}`, () => {
      enforce(!!Number(amountIn) !== !!Number(amountOut)).isTruthy()
    })
    userAddressValidationGroup({ userAddress, required: false })
    skipWhen(slippage == null, () => {
      validateSlippage(slippage)
    })
    validateRouter(router)
  },
)

import { skipWhen, test } from 'vest'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { evmAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import type { Address } from '@primitives/address.utils'
import { toArray } from '@primitives/array.utils'
import type { Nullish } from '@primitives/objects.utils'
import { type RouteProvider, RouteProviders } from '@primitives/router.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'
import type { RoutesQuery } from './router-api.types'

const validateRouter = ({
  router,
  isRequired,
}: {
  router: RouteProvider | readonly RouteProvider[] | Nullish
  isRequired: boolean
}) => {
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
      routers.forEach(r => enforce(RouteProviders.includes(r)).message(`${r} is not a valid router`).isTruthy())
    })
  })
}

const validateAddressList = ({
  addresses,
  fieldName,
}: {
  addresses: readonly Address[] | Nullish
  fieldName: string
}) =>
  skipWhen(!addresses, () => {
    test(fieldName, `${fieldName} must contain valid EVM addresses`, () => {
      enforce(addresses).isArray().isNotEmpty()
      addresses?.forEach(address => enforce(address).isAddress())
    })
  })

export const routerApiValidation = createValidationSuite(
  ({
    chainId,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    blacklist,
    userAddress,
    zapAddress,
    slippage,
    router,
  }: RoutesQuery) => {
    chainValidationGroup({ chainId })
    test('tokenIn', 'Invalid tokenIn address', () => {
      enforce(tokenIn).isAddress()
    })
    test('tokenOut', 'Invalid tokenOut address', () => {
      enforce(tokenOut).isAddress()
    })
    test('amount', 'Provide either amountIn or amountOut (not both)' + ` Got ${amountIn} and ${amountOut}`, () => {
      enforce(!!Number(amountIn) !== !!Number(amountOut)).isTruthy()
    })
    validateAddressList({ addresses: blacklist, fieldName: 'blacklist' })
    evmAddressValidationGroup({ evmAddress: userAddress, required: false })
    evmAddressValidationGroup({ evmAddress: zapAddress, required: false })
    validateSlippage({ slippage, required: false })
    validateRouter({ router, isRequired: false })
  },
)

import { enforce, skipWhen, test } from 'vest'
import type { Address } from '@primitives/address.utils'
import { toArray } from '@primitives/array.utils'
import { type RouteProvider, RouteProviders } from '@primitives/router.utils'
import { createValidationSuite } from '@ui-kit/lib'
import { validateSlippage } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { evmAddressValidationGroup } from '@ui-kit/lib/model/query/evm-address-validation'
import type { RoutesQuery } from './router-api.types'

const validateRouter = ({
  router,
  isRequired,
}: {
  router: RouteProvider | readonly RouteProvider[] | null | undefined
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
  addresses: readonly Address[] | null | undefined
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

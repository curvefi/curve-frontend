import { createValidationSuite } from '@ui-kit/lib/validation'
import { chainValidationGroup } from './chain-validation'
import { llamaApiValidationGroup } from './curve-api-validation'
import { marketIdValidationGroup } from './market-id-validation'
import type { UserMarketParams } from './root-keys'
import { userAddressValidationGroup } from './user-address-validation'

export const userMarketValidationSuite = createValidationSuite(
  <TAddress extends string>(params: UserMarketParams<TAddress>) => {
    chainValidationGroup(params)
    llamaApiValidationGroup(params)
    marketIdValidationGroup(params)
    userAddressValidationGroup(params)
  },
)

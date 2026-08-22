import { createValidationSuite } from '@ui-kit/lib/validation'
import { chainValidationGroup } from './chain-validation'
import { llamaApiValidationGroup } from './curve-api-validation'
import { evmAddressValidationGroup } from './evm-address-validation'
import { marketIdValidationGroup } from './market-id-validation'
import type { UserMarketParams } from './root-keys'

export const userMarketValidationSuite = createValidationSuite(
  <TChain extends number, TAddress extends string>(params: UserMarketParams<TChain, TAddress>) => {
    chainValidationGroup(params)
    llamaApiValidationGroup(params)
    marketIdValidationGroup(params)
    evmAddressValidationGroup({ evmAddress: params.userAddress })
  },
)

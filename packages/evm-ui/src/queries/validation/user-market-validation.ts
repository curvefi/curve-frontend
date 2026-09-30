import type { UserMarketParams } from '@evm-ui/queries/root-keys'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { chainValidationGroup } from './chain-validation'
import { llamaApiValidationGroup } from './curve-api-validation'
import { evmAddressValidationGroup } from './evm-address-validation'
import { marketIdValidationGroup } from './market-id-validation'

export const userMarketValidationSuite = createValidationSuite(
  <TChain extends number, TAddress extends string>(params: UserMarketParams<TChain, TAddress>) => {
    chainValidationGroup(params)
    llamaApiValidationGroup(params)
    marketIdValidationGroup(params)
    evmAddressValidationGroup({ evmAddress: params.userAddress })
  },
)

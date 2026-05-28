import { createValidationSuite } from '@ui-kit/lib/validation'
import { evmAddressValidationGroup } from './evm-address-validation'
import { poolValidationGroup } from './pool-validation'
import type { UserPoolParams } from './root-keys'

export const userPoolValidationSuite = createValidationSuite(
  <TChain extends number, TAddress extends string>(params: UserPoolParams<TChain, TAddress>) => {
    poolValidationGroup(params)
    evmAddressValidationGroup({ evmAddress: params.userAddress })
  },
)

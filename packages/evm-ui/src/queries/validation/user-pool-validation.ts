import type { UserPoolParams } from '@evm-ui/queries/query-types'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { evmAddressValidationGroup } from './evm-address-validation'
import { poolValidationGroup } from './pool-validation'

export const userPoolValidationSuite = createValidationSuite(
  <TChain extends number, TAddress extends string>(params: UserPoolParams<TChain, TAddress>) => {
    poolValidationGroup(params)
    evmAddressValidationGroup({ evmAddress: params.userAddress })
  },
)

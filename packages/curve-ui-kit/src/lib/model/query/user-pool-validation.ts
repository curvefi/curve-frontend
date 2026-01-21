import { createValidationSuite } from '@ui-kit/lib/validation'
import { poolValidationGroup } from './pool-validation'
import type { UserPoolParams } from './root-keys'
import { userAddressValidationGroup } from './user-address-validation'

export const userPoolValidationSuite = createValidationSuite(
  <TChain extends number, TAddress extends string>(params: UserPoolParams<TChain, TAddress>) => {
    poolValidationGroup(params)
    userAddressValidationGroup(params)
  },
)

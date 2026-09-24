import { type ContractParams, type ContractQuery, UserParams, type UserQuery } from '@evm-ui/queries/root-keys'
import { contractValidationGroup } from '@evm-ui/queries/validation/contract-validation'
import { evmAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { createValidationSuite } from '@ui/lib/validation/lib'

export type UserContractParams = UserParams & ContractParams
export type UserContractQuery = UserQuery & ContractQuery

export const userContractValidationSuite = createValidationSuite((params: UserContractParams) => {
  contractValidationGroup(params)
  evmAddressValidationGroup({ evmAddress: params.userAddress })
})

import { contractValidationGroup } from '@evm-ui/lib/model/query/contract-validation'
import { evmAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { type ContractParams, type ContractQuery, UserParams, type UserQuery } from '@evm-ui/queries/root-keys'
import { createValidationSuite } from '@ui/lib/validation/lib'

export type UserContractParams = UserParams & ContractParams
export type UserContractQuery = UserQuery & ContractQuery

export const userContractValidationSuite = createValidationSuite((params: UserContractParams) => {
  contractValidationGroup(params)
  evmAddressValidationGroup({ evmAddress: params.userAddress })
})

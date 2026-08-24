import { createValidationSuite } from '@evm-ui/lib'
import { type ContractParams, type ContractQuery, UserParams, type UserQuery } from '@evm-ui/lib/model'
import { contractValidationGroup } from '@evm-ui/lib/model/query/contract-validation'
import { evmAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'

export type UserContractParams = UserParams & ContractParams
export type UserContractQuery = UserQuery & ContractQuery

export const userContractValidationSuite = createValidationSuite((params: UserContractParams) => {
  contractValidationGroup(params)
  evmAddressValidationGroup({ evmAddress: params.userAddress })
})

import { createValidationSuite } from '@ui-kit/lib'
import { type ContractParams, type ContractQuery, UserParams, type UserQuery } from '@ui-kit/lib/model'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'
import { evmAddressValidationGroup } from '@ui-kit/lib/model/query/evm-address-validation'

export type UserContractParams = UserParams & ContractParams
export type UserContractQuery = UserQuery & ContractQuery

export const userContractValidationSuite = createValidationSuite((params: UserContractParams) => {
  contractValidationGroup(params)
  evmAddressValidationGroup({ evmAddress: params.userAddress })
})

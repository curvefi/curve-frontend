import { createValidationSuite } from '@ui-kit/lib'
import { type ContractParams, type ContractQuery, UserParams, type UserQuery } from '@ui-kit/lib/model'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'
import { userAddressValidationSuite } from '@ui-kit/lib/model/query/user-address-validation'

export type UserContractParams = UserParams & ContractParams
export type UserContractQuery = UserQuery & ContractQuery

export const userContractValidationSuite = createValidationSuite((params) => {
  contractValidationGroup(params)
  userAddressValidationSuite(params)
})

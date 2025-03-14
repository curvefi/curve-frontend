import { createValidationSuite } from '@ui-kit/lib'
import { type ContractParams, type ContractQuery, UserParams, type UserQuery } from '@ui-kit/lib/model'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'
import { userValidationSuite } from '@ui-kit/lib/model/query/user-validation'

export type UserContractParams = UserParams & ContractParams

export type UserContractQuery = UserQuery & ContractQuery

export const userContractValidationSuite = createValidationSuite((params) => {
  contractValidationGroup(params)
  userValidationSuite(params)
})

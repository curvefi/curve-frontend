import { getUserVaultEvents } from '@curvefi/prices-api/llamalend'
import { type UserContractQuery } from '@evm-ui/lib/model/query'
import { queryFactory } from '@ui/features/queries/factory'
import type { FieldsOf } from '@ui/lib/validation/types'
import { userCollateralEventsValidationSuite } from './validation/user-collateral-events-validation'

export const { useQuery: useUserVaultEventsQuery, invalidate: invalidateUserVaultEventsQuery } = queryFactory({
  queryKey: ({ blockchainId, userAddress, contractAddress }: FieldsOf<UserContractQuery>) =>
    ['userVaultEvents', { blockchainId }, { userAddress }, { contractAddress }] as const,
  queryFn: ({ blockchainId, userAddress, contractAddress }: UserContractQuery) =>
    getUserVaultEvents(userAddress, blockchainId, contractAddress),
  category: 'llamalend.user',
  validationSuite: userCollateralEventsValidationSuite,
})

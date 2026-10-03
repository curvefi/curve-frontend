import { getMarket } from '@/llamalend/llama.utils'
import type { UserMarketQuery } from '@evm-ui/queries/query-types'
import { userMarketValidationSuite } from '@evm-ui/queries/validation/user-market-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { FieldsOf } from '@ui/lib/validation/types'
import { getRepayImplementationType, type RepayFormFields } from './repay-query.helpers'

export const { useQuery: useRepayControllerApproval, fetchQuery: fetchRepayControllerApproval } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
  }: FieldsOf<UserMarketQuery & RepayFormFields>) => ({
    name: 'repayIsControllerApproved',
    chainId,
    marketId,
    userAddress,
    // The repayment implementation depends on which sources are used, not their amounts.
    stateCollateral: +(stateCollateral ?? '0') ? '1' : '0',
    userCollateral: +(userCollateral ?? '0') ? '1' : '0',
    userBorrowed: +(userBorrowed ?? '0') ? '1' : '0',
  }),
  queryFn: async ({
    marketId,
    userAddress,
    stateCollateral,
    userCollateral,
    userBorrowed,
  }: UserMarketQuery & RepayFormFields) =>
    getRepayImplementationType(marketId, { stateCollateral, userCollateral, userBorrowed }) !== 'zapV2' ||
    (await getMarket(marketId).leverageZapV2.isControllerApproved(userAddress)),
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})

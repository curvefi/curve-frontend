import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { DepositParams, DepositQuery, depositValidationSuite, requireVault } from '../validation/supply.validation'

export const { useQuery: useDepositIsApproved, fetchQuery: fetchDepositIsApproved } = queryFactory({
  queryKey: ({ chainId, marketId, depositAmount }: DepositParams) =>
    [...rootKeys.market({ chainId, marketId }), 'depositIsApproved', { depositAmount }] as const,
  queryFn: async ({ marketId, depositAmount }: DepositQuery) =>
    await requireVault(marketId).vault.depositIsApproved(depositAmount),
  validationSuite: depositValidationSuite,
})

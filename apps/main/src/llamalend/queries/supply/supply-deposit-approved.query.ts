import { rootKeys } from '@evm-ui/queries/root-keys'
import { queryFactory } from '@ui/features/queries/factory'
import { DepositParams, DepositQuery, depositValidationSuite, requireVault } from '../validation/supply.validation'

export const { useQuery: useDepositIsApproved, fetchQuery: fetchDepositIsApproved } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, depositAmount }: DepositParams) => ({
    name: 'depositIsApproved',
    ...rootKeys.userMarket({ chainId, marketId, userAddress }),
    depositAmount,
  }),
  queryFn: async ({ marketId, depositAmount }: DepositQuery) =>
    await requireVault(marketId).vault.depositIsApproved(depositAmount),
  category: 'llamalend.supply',
  validationSuite: depositValidationSuite,
})

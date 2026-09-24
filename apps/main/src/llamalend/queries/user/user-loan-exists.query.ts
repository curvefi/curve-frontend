import { getMarket } from '@/llamalend/llama.utils'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { userMarketValidationSuite } from '@evm-ui/lib/model/query/user-market-validation'
import { rootKeys, type UserMarketParams, type UserMarketQuery } from '@evm-ui/queries/root-keys'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useLoanExists } = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'loanExists'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const market = getMarket(marketId)
    return market instanceof MintMarketTemplate
      ? market.loanExists(userAddress)
      : market.userPosition.userLoanExists(userAddress)
  },
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})
